
import { Express } from "express";
import { authenticator } from "otplib";
import path from "path";
import { Auth, AuthClientRequest, BasicSession, LoginClientInfo } from 'prostgles-server/dist/AuthHandler';
import { DBOFullyTyped } from "prostgles-server/dist/DBSchemaBuilder";
import { DB } from "prostgles-server/dist/Prostgles";
import { omitKeys } from "prostgles-types";
import { DBSchemaGenerated } from "../../commonTypes/DBoGenerated";
import { DBSSchema } from "../../commonTypes/publishUtils";
import { BKP_PREFFIX } from "./BackupManager/BackupManager";
import { actualRootDir, getElectronConfig } from "./electronConfig";
import { PROSTGLES_STRICT_COOKIE } from "./envVars";
import { API_PATH, DBS, MEDIA_ROUTE_PREFIX, Users, connectionChecker, log } from "./index";
import { initBackupManager } from "./startProstgles";

export const HOUR = 3600e3;
export const YEAR = 365 * HOUR * 24;

let authCookieOpts = (process.env.PROSTGLES_STRICT_COOKIE || PROSTGLES_STRICT_COOKIE)? {} : {
  secure: false,
  sameSite: "lax"    //  "none"
};

/**
 * Used to prevent ip addresses from authentication for 1 hour after 3 failed attempts
 */
type AuthAttepmt = 
| { auth_type: "login", username: string; }
| { auth_type: "magic-link", magic_link_id: string; }
| { auth_type: "session-id", sid: string; }
const loginAttempt = async ({ db, ip_address, user_agent, ...attempt}: { db: DBOFullyTyped<DBSchemaGenerated>; } & LoginClientInfo & AuthAttepmt) => {

  try {
    const lastHour = (new Date(Date.now() - 1 * HOUR)).toISOString()
    const previousFails = await db.login_attempts.find({ ip_address, failed: true, "created.>=": lastHour })
    if(previousFails.length > 3){
      throw "Too many failed attempts within the last hour";
    }
  } catch(err) {
    console.error(err);
  }

  /** In case of a bad sid do not log it multiple times */
  if(attempt.auth_type === "session-id"){
    const prevFailOnSameSid = await db.login_attempts.findOne({ ip_address, failed: true, sid: attempt.sid }, { orderBy: { created: false } });
    if(prevFailOnSameSid){
      return {
        onSuccess: async () => { }
      }
    }
  }

  const loginAttempt = await db.login_attempts.insert({ ip_address, failed: true, user_agent, ...attempt }, { returning: { id: 1 } });

  return { 
    onSuccess: async () => { 
      await db.login_attempts.update({ id: loginAttempt.id }, { failed: false })
    }
  }
}

export type Sessions = DBSSchema["sessions"]
const parseAsBasicSession = (s: Sessions): BasicSession => {
  return { ...s, sid: s.id, expires: +s.expires, onExpiration: s.type === "api_token"? "show_error" : "redirect" };
}

export const makeSession = async (user: Users | undefined, client: Pick<Sessions, "user_agent" | "ip_address" | "type"> & { sid?: string }, dbo: DBOFullyTyped<DBSchemaGenerated> , expires: number = 0): Promise<BasicSession> => {

  if(user){

    /** Disable all other web sessions for user */
    await dbo.sessions.update({ user_id: user.id, type: "web" }, { type: "web", active: false });

    const session = await dbo.sessions.insert({ 
      ...(client.sid && { id: client.sid }),
      user_id: user.id, 
      user_type: user.type, 
      expires, 
      type: client.type,
      ip_address: client.ip_address,
      user_agent: client.user_agent,
    }, { returning: "*" });
    

    return parseAsBasicSession(session); //60*60*60 }; 
  } else {
    throw "Invalid user";
  }
}

export type SUser = {
  sid: string;
  user: Users;
  clientUser: { 
    sid: string;
    uid: string; 
    state_db_id?: string;
    has_2fa: boolean;
  } & Omit<Users, "password"| "2fa">
}
export const sidKeyName = "sid_token" as const;

type AuthType = 
| { type: "session-id"; filter: { id: string; }; client: AuthClientRequest & LoginClientInfo }
| { type: "login-success"; filter: { user_id: string; } };

const getActiveSession = async (db: DBS, authType: AuthType) => {
  if(Object.values(authType.filter).some(v => typeof v !== "string" || !v)){
    throw `Must provide a valid session filter`;
  }
  let validSession = await db.sessions.findOne({ ...authType.filter,  "expires.>": Date.now(), active: true });

  /**
   * Always maintain a valid session for passwordless admin
   */
  const pwdlessUser = connectionChecker.noPasswordAdmin;
  if(pwdlessUser && !validSession){
    const oldSession = await db.sessions.findOne({ user_id: pwdlessUser.id });
    if(oldSession){
      return db.sessions.update({ id: oldSession.id }, { active: true, expires: Date.now() + 1 * YEAR }, { returning: "*", multi: false })
    }
  }

  if(!pwdlessUser && authType.type === "session-id" && !validSession){
    const expiredSession = await db.sessions.findOne({ ...authType.filter });
    if(!expiredSession){
      const { ip_address, ip_address_remote, user_agent, x_real_ip } = authType.client;
      await loginAttempt({ db, auth_type: "session-id", sid: authType.filter.id, ip_address, ip_address_remote, user_agent, x_real_ip })
    } 
  }

  return validSession;
}

export const getAuth = (app: Express) => {
  
  const auth = {
    sidKeyName,
    getUser: async (sid, db, _db: DB, client) => {
      // log("getUser", sid);

      if(!sid) return undefined;

      const s = await getActiveSession(db, { type: "session-id", client, filter: { id: sid }});
      if(!s) return undefined;

      const user = await db.users.findOne({ id: s.user_id });
      if(!user) return undefined;

      const state_db = await db.connections.findOne({ is_state_db: true });
      if(!state_db) throw "Internal error: Statedb missing ";

      const suser: SUser = {
        sid: s.id, 
        user,
        clientUser: { 
          sid: s.id, 
          uid: user.id, 
          
          /** For security reasons provide state_db_id only to admin users */
          state_db_id: user.type === "admin"? state_db?.id : undefined,

          has_2fa: !!user["2fa"]?.enabled,
          ...omitKeys(user, ["password", "2fa"])
        }
      }

      return suser;
    },

    login: async ({ username = null, password = null, totp_token = null, totp_recovery_code = null } = {}, db, _db: DB, { ip_address, ip_address_remote, user_agent, x_real_ip }) => {
      let u: Users | undefined;
      log("login", username);
      
      if(password.length > 400){
        throw "Password is too long";
      }
      const { onSuccess } = await loginAttempt({ db, username, ip_address, ip_address_remote, user_agent, x_real_ip, auth_type: "login" })
      try {
        u = await _db.one("SELECT * FROM users WHERE username = ${username} AND password = crypt(${password}, id::text);", { username, password });
      } catch(e){
        throw "no match";
      }
      if(!u) {
        throw "something went wrong: " + JSON.stringify({ username, password });
      }
      if(u && u.status !== "active") {
        throw "inactive";
      }

      if(u["2fa"]?.enabled){
        if(totp_recovery_code && typeof totp_recovery_code === "string"){
          const areMatching = await _db.any("SELECT * FROM users WHERE id = ${id} AND \"2fa\"->>'recoveryCode' = crypt(${code}, id::text) ", { id: u.id, code: totp_recovery_code.trim() });
          if(!areMatching.length){
            throw "Invalid token"
          }
        } else if(totp_token && typeof totp_token === "string"){

          if(!authenticator.verify({ secret: u["2fa"].secret, token: totp_token })){
            throw "Invalid token";
          }
        } else {
          throw "Token missing";
        }
      }

      await onSuccess();

      const activeSession = await getActiveSession(db, { type: "login-success", filter: { user_id: u.id }});
      if(!activeSession){
        const globalSettings = await db.global_settings.findOne();
        const DAY = 24 * 60 * 60 * 1000;
        const expires = Date.now() + (globalSettings?.session_max_age_days ?? 1) * DAY;
        return makeSession(u, { ip_address, user_agent: user_agent || null, type: getElectronConfig()?.isElectron? "desktop" : "web" }, db, expires)
      }
      await db.sessions.update({ id: activeSession.id }, { last_used: new Date() });
      return parseAsBasicSession(activeSession);

    },

    logout: async (sid, db, _db: DB) => {
      if(!sid) throw "err";
      const s = await db.sessions.findOne({ id: sid });
      if(!s) throw "err";
      const u = await db.users.findOne({ id: s.user_id });

      if(u?.passwordless_admin){
        throw `Passwordless admin cannot logout`
      }
      
      await db.sessions.update({ id: sid }, { active: false });
      // await db.sessions.delete({ id: sid });
      /** Keep last 20 sessions */

      return true; 
    },

    cacheSession: {
      getSession: async (sid, db) => {
        let s = await db.sessions.findOne({ id: sid });
        if(s) return parseAsBasicSession(s)
        // throw "dwada"
        return undefined as any;
      }
    },

    expressConfig:  {
      app,
      // userRoutes: ["/", "/connection", "/connections", "/profile", "/jobs", "/chats", "/chat", "/account", "/dashboard", "/registrations"],
      use: connectionChecker.onUse,
      publicRoutes: ["/manifest.json", "/favicon.ico", API_PATH],
      onGetRequestOK: async (req, res, { getUser, db, dbo: dbs }) => {
        // log("onGetRequestOK", req.path);

        if(req.path.startsWith(BKP_PREFFIX)){
          const userData = await getUser();
          await(await initBackupManager(db, dbs)).onRequestBackupFile(res, !userData?.user? undefined : userData, req);
          
        } else if(req.path.startsWith(MEDIA_ROUTE_PREFIX)){
          req.next?.();

        /* Must be socket io reconnecting */
        } else if(req.query.transport === "polling"){
          req.next?.()

        } else {
          res.sendFile(path.resolve(actualRootDir + '/../client/build/index.html'));
        }
      },
      cookieOptions: authCookieOpts,
      magicLinks: {
        check: async (id, dbo, db, { ip_address, ip_address_remote, user_agent, x_real_ip }) => {

          const onLoginAttempt = await loginAttempt({ db: dbo, magic_link_id: id, ip_address, ip_address_remote, user_agent, x_real_ip, auth_type: "magic-link" });
          const mlink = await dbo.magic_links.findOne({ id });
          
          if(mlink){
            if(mlink.expires < Date.now()) {
              throw "Expired magic link";
            }
            if(mlink.magic_link_used){
              throw "Magic link already used";
            }
          } else {
            throw new Error("Magic link not found");
          }

          const user = await dbo.users.findOne({ id: mlink.user_id });
          if(!user){
            throw new Error("User from Magic link not found");
          }

          const usedMagicLink = await dbo.magic_links.update({ id: mlink.id, magic_link_used: null }, { magic_link_used: new Date() }, { returning: "*" });
          if(!usedMagicLink){
            throw new Error("Magic link already used");
          }
          const session = await makeSession(user, { ip_address, user_agent: user_agent || null, type: getElectronConfig()?.isElectron? "desktop" : "web" }, dbo , mlink.expires);
          await onLoginAttempt.onSuccess();
          return session;
        }
      }
    }
  } satisfies Auth<DBSchemaGenerated, SUser>
  return auth;
};
