import { DBSSchema } from "./publishUtils";

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const MONTH = DAY * 30;
export const YEAR = DAY * 365;

export type AGE = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export const QUERY_WATCH_IGNORE = "prostgles internal query that should be excluded from schema watch ";


export const getAge = <ReturnALL extends boolean = false>(date1: number, date2: number, returnAll?: ReturnALL): ReturnALL extends true? Required<AGE> : AGE => {
  
  const diff = +date2 - +date1;
  const roundFunc = diff > 0 ? Math.floor : Math.ceil;
  const years = roundFunc(diff/YEAR);
  const months = roundFunc(diff/MONTH);
  const days = roundFunc(diff/DAY);
  const hours = roundFunc(diff/HOUR);
  const minutes = roundFunc(diff/MINUTE);
  const seconds = roundFunc(diff/SECOND);

  if(returnAll && returnAll === true){
    const diffInMs = diff;
  
    const years = roundFunc(diffInMs / YEAR);
    const months = roundFunc((diffInMs % YEAR) / MONTH);
    const days = roundFunc((diffInMs % MONTH) / DAY);
    const hours = roundFunc((diffInMs % DAY) / HOUR);
    const minutes = roundFunc((diffInMs % HOUR) / MINUTE);
    const seconds = roundFunc((diffInMs % MINUTE) / SECOND);
    const milliseconds = diffInMs % SECOND;

    return { years, months, days, hours, minutes, seconds, milliseconds };
  }

  if(years >= 1){
    return { years, months } as any;
  } else if(months >= 1){
    return { months, days } as any;
  } else if(days >= 1){
    return { days, hours } as any;
  } else if(hours >= 1){
    return { hours, minutes } as any;
  } else {
    return { minutes, seconds } as any;
  }
}

export const DESTINATIONS = [
  { key: "Local", subLabel: "Saved locally (server in address bar)" },
  { key: "Cloud", subLabel: "Saved to Amazon S3" }
] as const;

export type DumpOpts = DBSSchema["backups"]["options"]; 

export type PGDumpParams = { 
  options: DumpOpts; 
  credentialID?: DBSSchema["backups"]["credential_id"];
  destination: typeof DESTINATIONS[number]["key"];
  initiator?: string; 
};

export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
type AnyObject = Record<string, any>;

export type WithUndef<T extends AnyObject | undefined> = T extends AnyObject?  {
  [K in keyof T]: T[K] | undefined;
} : T;

export type GetElementType<T extends any[] | readonly any[]> = T extends (infer U)[] ? U : never;
 
export type OmitDistributive<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type PG_STAT_ACTIVITY = { 
  datid: number | null;
  datname: string | null;
  pid: number;
  usesysid: number | null;
  usename: string | null;
  application_name: string;
  client_addr: string | null;
  client_hostname: string | null;
  client_port: number | null;
  backend_start: string;
  xact_start: string | null;
  query_start: string | null;
  state_change: string | null;
  wait_event_type: string | null;
  wait_event: string | null;
  state: string | null;
  backend_xid: any | null;
  backend_xmin: any | null;
  query: string;
  backend_type: string;
  blocked_by: number[]; 
  running_time: AnyObject;
}

export type PG_STAT_DATABASE = { 
  datid: number;
  datname: string;
  numbackends: number;
  xact_commit: number;
  xact_rollback: number;
  blks_read: number;
  blks_hit: number;
  tup_returned: number;
  tup_fetched: number;
  tup_inserted: number;
  tup_updated: number;
  tup_deleted: number;
  conflicts: number;
  temp_files: number;
  temp_bytes: number;
  deadlocks: number;
  checksum_failures: number | null;
  checksum_last_failure: string | null;
  blk_read_time: number;
  blk_write_time: number;
  stats_reset: string;
}

export type ServerStatus = {
  clock_ticks: number;
  total_memoryKb: number;
  free_memoryKb: number;
  uptimeSeconds: number;
  cpu_model: string;
  cpu_cores_mhz: string;
  cpu_mhz: string;
  disk_space: string;
}

export type ConnectionStatus = { 
  queries: PG_STAT_ACTIVITY[]; 
  topQueries: AnyObject[]; 
  blockedQueries: AnyObject[];
  connections: PG_STAT_DATABASE[];
  maxConnections: number;
  noBash: boolean;
  serverStatus?: ServerStatus;
}