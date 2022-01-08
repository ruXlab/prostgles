/* This file was generated by Prostgles 
*/ 

 

import { ViewHandler, TableHandler, JoinMaker } from "prostgles-types";

export type TxCB = {
    (t: DBObj): (any | void | Promise<(any | void)>)
};


/* SCHEMA DEFINITON. Table names have been altered to work with Typescript */
export type BATXBT_46csv = { 
  "c1"?: string;
  "c2"?: string;
  "c3"?: string;
}
export type EOSXBT_46csv = { 
  "c1"?: string;
  "c2"?: string;
  "c3"?: string;
}
export type XDGUSD_46csv = { 
  "c1"?: string;
  "c2"?: string;
  "c3"?: string;
}
export type Connections = { 
  "created"?: Date;
  "db_conn"?: string;
  "db_host"?: string;
  "db_name"?: string;
  "db_pass"?: string;
  "db_port"?: number;
  "db_ssl"?: string;
  "db_user"?: string;
  "db_watch_shema"?: boolean;
  "id"?: string;
  "last_updated"?: number;
  "name"?: string;
  "prgl_params"?: Object;
  "prgl_url"?: string;
  "type"?: string;
  "user_id"?: string;
}
export type Geography_columns = { 
  "coord_dimension"?: number;
  "f_geography_column"?: string;
  "f_table_catalog"?: string;
  "f_table_name"?: string;
  "f_table_schema"?: string;
  "srid"?: number;
  "type"?: string;
}
export type Geometry_columns = { 
  "coord_dimension"?: number;
  "f_geometry_column"?: string;
  "f_table_catalog"?: string;
  "f_table_name"?: string;
  "f_table_schema"?: string;
  "srid"?: number;
  "type"?: string;
}
export type Links = { 
  "closed"?: boolean;
  "created"?: Date;
  "deleted"?: boolean;
  "id"?: string;
  "last_updated"?: number;
  "options"?: Object;
  "user_id"?: string;
  "w1_id"?: string;
  "w2_id"?: string;
  "workspace_id"?: string;
}
export type Magic_links = { 
  "expires"?: number;
  "id"?: string;
  "magic_link"?: string;
  "magic_link_used"?: Date;
  "user_id"?: string;
}
export type Sessions = { 
  "active"?: boolean;
  "created"?: Date;
  "expires"?: number;
  "id"?: string;
  "is_mobile"?: boolean;
  "project_id"?: string;
  "type"?: string;
  "user_id"?: string;
  "user_type"?: string;
}
export type Spatial_ref_sys = { 
  "auth_name"?: string;
  "auth_srid"?: number;
  "proj4text"?: string;
  "srid"?: number;
  "srtext"?: string;
}
export type Users = { 
  "created"?: Date;
  "id"?: string;
  "last_updated"?: number;
  "password"?: string;
  "status"?: string;
  "type"?: string;
  "username"?: string;
}
export type Windows = { 
  "closed"?: boolean;
  "columns"?: Object;
  "created"?: Date;
  "deleted"?: boolean;
  "filter"?: Object;
  "fullscreen"?: boolean;
  "id"?: string;
  "last_updated"?: number;
  "layout"?: Object;
  "limit"?: number;
  "name"?: string;
  "nested_tables"?: Object;
  "options"?: Object;
  "selected_sql"?: string;
  "show_menu"?: boolean;
  "sort"?: Object;
  "sql"?: string;
  "table_name"?: string;
  "table_oid"?: number;
  "type"?: string;
  "user_id"?: string;
  "workspace_id"?: string;
}
export type Workspaces = { 
  "active_row"?: Object;
  "created"?: Date;
  "id"?: string;
  "last_updated"?: number;
  "layout"?: Object;
  "name"?: string;
  "options"?: Object;
  "user_id"?: string;
}

export type JoinMakerTables = {
 "connections": JoinMaker<Connections>;
 "links": JoinMaker<Links>;
 "users": JoinMaker<Users>;
 "windows": JoinMaker<Windows>;
 "workspaces": JoinMaker<Workspaces>;
};

/* DBO Definition. Isomorphic */
export type DBObj = {
  "BATXBT.csv": TableHandler<BATXBT_46csv> 
  "EOSXBT.csv": TableHandler<EOSXBT_46csv> 
  "XDGUSD.csv": TableHandler<XDGUSD_46csv> 
  "connections": TableHandler<Connections> 
  "geography_columns": ViewHandler<Geography_columns> 
  "geometry_columns": ViewHandler<Geometry_columns> 
  "links": TableHandler<Links> 
  "magic_links": TableHandler<Magic_links> 
  "sessions": TableHandler<Sessions> 
  "spatial_ref_sys": TableHandler<Spatial_ref_sys> 
  "users": TableHandler<Users> 
  "windows": TableHandler<Windows> 
  "workspaces": TableHandler<Workspaces> 
  leftJoin: JoinMakerTables;
  innerJoin: JoinMakerTables;
  leftJoinOne: JoinMakerTables;
  innerJoinOne: JoinMakerTables;
 tx: (t: TxCB) => Promise<any | void> ;
};

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]>; }; 
export type I18N_DBO_CONFIG<LANG_IDS = { en: 1, fr: 1 }> = { 
  fallbackLang: keyof LANG_IDS; 
  column_labels?: DeepPartial<{ 
    "BATXBT.csv": { 
      [key in "c1" | "c2" | "c3"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "EOSXBT.csv": { 
      [key in "c1" | "c2" | "c3"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "XDGUSD.csv": { 
      [key in "c1" | "c2" | "c3"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "connections": { 
      [key in "created" | "db_conn" | "db_host" | "db_name" | "db_pass" | "db_port" | "db_ssl" | "db_user" | "db_watch_shema" | "id" | "last_updated" | "name" | "prgl_params" | "prgl_url" | "type" | "user_id"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "geography_columns": { 
      [key in "coord_dimension" | "f_geography_column" | "f_table_catalog" | "f_table_name" | "f_table_schema" | "srid" | "type"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "geometry_columns": { 
      [key in "coord_dimension" | "f_geometry_column" | "f_table_catalog" | "f_table_name" | "f_table_schema" | "srid" | "type"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "links": { 
      [key in "closed" | "created" | "deleted" | "id" | "last_updated" | "options" | "user_id" | "w1_id" | "w2_id" | "workspace_id"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "magic_links": { 
      [key in "expires" | "id" | "magic_link" | "magic_link_used" | "user_id"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "sessions": { 
      [key in "active" | "created" | "expires" | "id" | "is_mobile" | "project_id" | "type" | "user_id" | "user_type"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "spatial_ref_sys": { 
      [key in "auth_name" | "auth_srid" | "proj4text" | "srid" | "srtext"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "users": { 
      [key in "created" | "id" | "last_updated" | "password" | "status" | "type" | "username"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "windows": { 
      [key in "closed" | "columns" | "created" | "deleted" | "filter" | "fullscreen" | "id" | "last_updated" | "layout" | "limit" | "name" | "nested_tables" | "options" | "selected_sql" | "show_menu" | "sort" | "sql" | "table_name" | "table_oid" | "type" | "user_id" | "workspace_id"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
    "workspaces": { 
      [key in "active_row" | "created" | "id" | "last_updated" | "layout" | "name" | "options" | "user_id"]: { [lang_id in keyof LANG_IDS]: string }; 
    }; 
  }> 
} 
