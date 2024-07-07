import type { DBOFullyTyped } from "prostgles-server/dist/DBSchemaBuilder";
import type { DBSchemaGenerated } from "../../commonTypes/DBoGenerated";
import { ConnectionChecker } from "./ConnectionChecker";
import { ConnectionManager } from "./ConnectionManager/ConnectionManager";
import type { OnServerReadyCallback } from "./electronConfig";
export declare const API_PATH = "/api";
export type BareConnectionDetails = Pick<Connections, "type" | "db_conn" | "db_host" | "db_name" | "db_pass" | "db_port" | "db_user" | "db_ssl" | "ssl_certificate">;
export type DBS = DBOFullyTyped<DBSchemaGenerated>;
export type Users = Required<DBSchemaGenerated["users"]["columns"]>;
export type Connections = Required<DBSchemaGenerated["connections"]["columns"]>;
export type DatabaseConfigs = Required<DBSchemaGenerated["database_configs"]["columns"]>;
export declare const log: (msg: string, extra?: any) => void;
export declare const MEDIA_ROUTE_PREFIX = "/prostgles_media";
export declare const connectionChecker: ConnectionChecker;
export declare const connMgr: ConnectionManager;
export declare const onServerReady: (cb: OnServerReadyCallback) => Promise<void>;
export declare function restartProc(cb?: Function): void;
export declare const tout: (timeout: number) => Promise<unknown>;
//# sourceMappingURL=index.d.ts.map