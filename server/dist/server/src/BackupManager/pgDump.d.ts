import { PGDumpParams } from "../../../commonTypes/utils";
import BackupManager from "./BackupManager";
export declare function pgDump(this: BackupManager, conId: string, credId: number | null, { options: o, destination, credentialID, initiator }: PGDumpParams): Promise<string | undefined>;
//# sourceMappingURL=pgDump.d.ts.map