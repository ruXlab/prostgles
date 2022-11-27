"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIf = exports.is = exports.publishMethods = void 0;
const index_1 = require("./index");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto = __importStar(require("crypto"));
const preset_default_1 = require("@otplib/preset-default");
const Prostgles_1 = require("prostgles-server/dist/Prostgles");
const ConnectionManager_1 = require("./ConnectionManager");
const DboBuilder_1 = require("prostgles-server/dist/DboBuilder");
const PubSubManager_1 = require("prostgles-server/dist/PubSubManager");
const testDBConnection_1 = require("./connectionUtils/testDBConnection");
const validateConnection_1 = require("./connectionUtils/validateConnection");
const ConnectionChecker_1 = require("./ConnectionChecker");
const filterUtils_1 = require("../../commonTypes/filterUtils");
const publishMethods = async (params) => {
    const { dbo: dbs, socket, db: _dbs } = params;
    const ip_address = socket.conn.remoteAddress;
    const user = params.user;
    const bkpManager = (0, index_1.getBackupManager)();
    if (!user || !user.id) {
        return {};
    }
    const reStartConnection = async (conId) => {
        return index_1.connMgr.startConnection(conId, dbs, _dbs, socket, true);
    };
    const adminMethods = {
        disablePasswordless: async (newAdmin) => {
            const noPwdAdmin = await (0, ConnectionChecker_1.ADMIN_ACCESS_WITHOUT_PASSWORD)(dbs);
            if (!noPwdAdmin)
                throw "No passwordless admin found";
            await (0, ConnectionChecker_1.insertUser)(dbs, _dbs, { username: newAdmin.username, password: newAdmin.password, type: "admin" });
            await dbs.users.update({ id: noPwdAdmin.id }, { status: "disabled" });
            await dbs.sessions.delete({});
        },
        getConnectionDBTypes: (conId) => {
            const c = index_1.connMgr.getConnection(conId);
            if (c) {
                return c.prgl?.getTSSchema();
            }
            console.error(`Not found`);
            return undefined;
        },
        getMyIP: () => {
            return index_1.connectionChecker.checkClientIP({ socket });
        },
        getConnectedIds: async () => {
            return Object.keys(index_1.connMgr.getConnections());
        },
        getDBSize: async (conId) => {
            const db = index_1.connMgr.getConnection(conId);
            const size = await db?.prgl?.db?.sql?.("SELECT pg_size_pretty( pg_database_size(current_database()) ) ", {}, { returnType: "value" });
            return size;
        },
        getIsSuperUser: async (conId) => {
            const db = index_1.connMgr.getConnection(conId);
            if (!db?.prgl?._db)
                throw "Connection instance not found";
            return (0, Prostgles_1.isSuperUser)(db.prgl._db);
        },
        getFileFolderSizeInBytes: (conId) => {
            const dirSize = async (directory) => {
                if (!fs_1.default.existsSync(directory))
                    return 0;
                const files = fs_1.default.readdirSync(directory);
                const stats = files.map(file => fs_1.default.statSync(path_1.default.join(directory, file)));
                return stats.reduce((accumulator, { size }) => accumulator + size, 0);
            };
            if (conId && (typeof conId !== "string" || !index_1.connMgr.getConnection(conId))) {
                throw "Invalid/Inexisting connection id provided";
            }
            const dir = index_1.connMgr.getFileFolderPath(conId);
            return dirSize(dir);
        },
        testDBConnection: testDBConnection_1.testDBConnection,
        validateConnection: async (c) => {
            const connection = (0, validateConnection_1.validateConnection)(c);
            let warn = "";
            if (connection.db_ssl) {
                warn = "";
            }
            return { connection, warn };
        },
        createConnection: async (con) => {
            return (0, index_1.upsertConnection)(con, user.id, dbs);
        },
        deleteConnection: async (id, opts) => {
            try {
                return dbs.tx(async (t) => {
                    const con = await t.connections.findOne({ id });
                    if (con?.is_state_db)
                        throw "Cannot delete a prostgles state database connection";
                    const conFilter = { connection_id: id };
                    await t.workspaces.delete(conFilter);
                    await t.access_control.delete(conFilter);
                    if (opts?.keepBackups) {
                        await t.backups.update(conFilter, { connection_id: null });
                    }
                    else {
                        const bkps = await t.backups.find(conFilter);
                        for await (const b of bkps) {
                            await bkpManager.bkpDelete(b.id);
                        }
                        await t.backups.delete(conFilter);
                    }
                    const result = await t.connections.delete({ id }, { returning: "*" });
                    return result;
                });
            }
            catch (err) {
                return Promise.reject(err);
            }
        },
        reStartConnection,
        disconnect: async (conId) => {
            return index_1.connMgr.disconnect(conId);
        },
        pgDump: bkpManager.pgDump,
        pgRestore: async (arg1, opts) => bkpManager.pgRestore(arg1, undefined, opts),
        bkpDelete: bkpManager.bkpDelete,
        streamBackupFile: async (c, id, conId, chunk, sizeBytes, restore_options) => {
            // socket.on("stream", console.log)
            // console.log(arguments);
            if (c === "start" && id && conId && sizeBytes) {
                const s = bkpManager.getTempFileStream(id, user.id);
                await bkpManager.pgRestoreStream(id, conId, s.stream, sizeBytes, restore_options);
                // s.stream.on("close", () => console.log(1232132));
                return s.streamId;
            }
            else if (c === "chunk" && id && chunk) {
                return new Promise((resolve, reject) => {
                    bkpManager.pushToStream(id, chunk, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(1);
                        }
                    });
                });
            }
            else if (c === "end" && id) {
                bkpManager.closeStream(id);
            }
            else
                throw new Error("Not expected");
        },
        setFileStorage: async (connId, tableConfig, opts) => {
            (0, exports.checkIf)({ connId }, "connId", "string");
            const c = await dbs.connections.findOne({ id: connId });
            if (!c)
                throw "Connection not found";
            const db = index_1.connMgr.getConnectionDb(connId);
            if (!db)
                throw "db missing";
            /** Enable file storage */
            if (tableConfig) {
                (0, exports.checkIf)(tableConfig, "referencedTables", "object");
                if (tableConfig.referencedTables && Object.keys(tableConfig).length === 1) {
                    if (!c.table_config)
                        throw "Must enable file storage first";
                    await dbs.connections.update({ id: connId }, { table_config: { ...c.table_config, ...tableConfig } });
                }
                else {
                    (0, exports.checkIf)(tableConfig, "fileTable", "string");
                    (0, exports.checkIf)(tableConfig, "storageType", "object");
                    const { storageType } = tableConfig;
                    (0, exports.checkIf)(storageType, "type", "oneOf", ["local", "S3"]);
                    if (storageType?.type === "S3") {
                        if (!(await dbs.credentials.findOne({ id: storageType.credential_id }))) {
                            throw "Invalid credential_id provided";
                        }
                    }
                    const KEYS = ["fileTable", "storageType"];
                    if (c.table_config && JSON.stringify((0, PubSubManager_1.pickKeys)(c.table_config, KEYS)) !== JSON.stringify((0, PubSubManager_1.pickKeys)(tableConfig, KEYS))) {
                        throw "Cannot update " + KEYS.join("or");
                    }
                    await dbs.connections.update({ id: connId }, { table_config: tableConfig });
                }
                /** Disable current file storage */
            }
            else {
                const fileTable = c.table_config?.fileTable;
                if (!fileTable)
                    throw "Unexpected: fileTable already disabled";
                await db[ConnectionManager_1.DB_TRANSACTION_KEY](async (dbTX) => {
                    const fileTableHandler = dbTX[fileTable];
                    if (!fileTableHandler)
                        throw "Unexpected: fileTable table handler missing";
                    if (c.table_config?.fileTable && (c.table_config.storageType.type === "local" || c.table_config.storageType.type === "S3" && !opts?.keepS3Data)) {
                        if (!fileTable || !fileTableHandler.delete) {
                            throw "Unexpected error. fileTable handler not found";
                        }
                        await fileTableHandler?.delete({});
                    }
                    if (!opts?.keepFileTable) {
                        await dbTX.sql("DROP TABLE ${fileTable:name} CASCADE", { fileTable });
                    }
                });
                await dbs.connections.update({ id: connId }, { table_config: null });
            }
            await index_1.connMgr.reloadFileStorage(connId);
            // await reStartConnection?.(connId);
        },
        deleteAccessRule: (id) => {
            return dbs.access_control.delete({ id });
        },
        upsertAccessRule: (ac) => {
            if (!ac)
                return dbs.access_control.insert(ac);
            return dbs.access_control.update({ id: ac.id }, ac);
        }
    };
    const userMethods = !user.id ? {} : {
        generateToken: async (days) => {
            if (!Number.isInteger(days)) {
                throw "Expecting an integer days but got: " + days;
            }
            const session = await dbs.sessions.insert({
                expires: Date.now() + days * 24 * 3600 * 1000,
                user_id: user.id,
                user_type: user.type,
                type: "api_token",
                ip_address
            }, { returning: "*" });
            return session.id;
        },
        create2FA: async () => {
            const userName = user.username;
            const service = 'Prostgles UI';
            const secret = preset_default_1.authenticator.generateSecret();
            const otpauth = preset_default_1.authenticator.keyuri(userName, service, secret);
            const recoveryCode = crypto.randomBytes(26).toString("hex");
            const hashedRecoveryCode = await dbs.sql("SELECT crypt(${recoveryCode}, ${uid}::text)", { uid: user.id, recoveryCode }, { returnType: "value" });
            await dbs.users.update({ id: user.id }, { "2fa": { secret, recoveryCode: hashedRecoveryCode, enabled: false } });
            return {
                url: otpauth,
                secret,
                recoveryCode
            };
        },
        enable2FA: async (token) => {
            const latestUser = await dbs.users.findOne({ id: user.id });
            const secret = latestUser?.["2fa"]?.secret;
            if (!secret)
                throw "Secret not found";
            //totp.verify({ secret, token }) -> Does not work.
            const isValid = preset_default_1.authenticator.check(token, secret);
            if (!isValid)
                throw "Invalid code";
            await dbs.users.update({ id: user.id }, { "2fa": { ...latestUser["2fa"], enabled: true } });
            return "ok";
        },
        disable2FA: () => {
            return dbs.users.update({ id: user.id }, { "2fa": null });
        },
        getAPITSDefinitions: () => {
            /** Must install them into the server folder! */
            const clientNodeModules = path_1.default.resolve(__dirname + "/../../../../client/node_modules/");
            const prostglesTypes = path_1.default.resolve(clientNodeModules + "/prostgles-types/dist");
            const prostglesClient = path_1.default.resolve(clientNodeModules + "/prostgles-client/dist");
            return [
                ...getTSFiles(prostglesClient).map(l => ({ ...l, name: "prostgles-client" })),
                ...getTSFiles(prostglesTypes).map(l => ({ ...l, name: "prostgles-types" })),
            ];
        }
    };
    return {
        ...userMethods,
        ...(user.type === "admin" ? adminMethods : undefined),
        startConnection: async (con_id) => {
            return index_1.connMgr.startConnection(con_id, dbs, _dbs, socket);
        }
    };
};
exports.publishMethods = publishMethods;
function getTSFiles(dirPath) {
    return fs_1.default.readdirSync(dirPath).map(path => {
        if (path.endsWith(".d.ts")) {
            const content = fs_1.default.readFileSync(dirPath + "/" + path, { encoding: "utf8" });
            console.log(path, content);
            return { path, content };
        }
    }).filter(filterUtils_1.isDefined);
}
process.on("exit", code => {
    console.log(code);
});
exports.is = {
    string: (v, notEmtpy = true) => typeof v === "string" && (notEmtpy ? !!v.length : true),
    integer: (v) => Number.isInteger(v),
    number: (v) => Number.isFinite(v),
    object: (v) => (0, DboBuilder_1.isPojoObject)(v),
    oneOf: (v, vals) => vals.includes(v),
};
const checkIf = (obj, key, isType, arg1) => {
    const isOk = exports.is[isType](obj[key], arg1);
    if (!isOk)
        throw `${key} is not of type ${isType}${isType === "oneOf" ? `(${arg1})` : ""}. Source object: ${JSON.stringify(obj, null, 2)}`;
    return true;
};
exports.checkIf = checkIf;
//# sourceMappingURL=publishMethods.js.map