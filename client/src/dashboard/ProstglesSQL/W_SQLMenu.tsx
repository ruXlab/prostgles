import {
  mdiChartBoxPlusOutline,
  mdiCog,
  mdiContentSave,
  mdiDelete,
  mdiDownload,
  mdiFileUploadOutline,
  mdiKeyboard,
  mdiPlay,
  mdiUpload,
} from "@mdi/js";
import { DBHandlerClient } from 'prostgles-client/dist/prostgles';
import React from 'react';
import Btn from "../../components/Btn";
import FormField from "../../components/FormField/FormField";
import Tabs, { TabsProps } from '../../components/Tabs';
import RTComp from '../RTComp';

import { CommonWindowProps } from '../Dashboard/Dashboard';
import { DBSchemaTablesWJoins, OnAddChart, WindowSyncItem } from '../Dashboard/dashboardUtils';

import { getJSONBSchemaAsJSONSchema } from "prostgles-types";
import ErrorComponent from '../../components/ErrorComponent';
import { Icon } from "../../components/Icon/Icon";
import { InfoRow } from "../../components/InfoRow";
import { SECOND } from "../Charts";
import CodeEditor from "../CodeEditor";
import { DBS } from "../Dashboard/DBS";
import AddChartMenu from '../W_Table/TableMenu/AddChartMenu';
import { getChartColsV2 } from '../W_Table/TableMenu/getChartCols';
import { DemoSQL } from "./DemoSQL";
import { SQLHotkeys } from "./SQLHotkeys";
import { download } from './W_SQL';


type ColumnsConfig = {
  name: string;
  show: boolean;
  computed: boolean;
}[];
 
type P = {
  tableName?: string;
  db: DBHandlerClient; 
  dbs: DBS; 
  onAddChart?: OnAddChart;
  w: WindowSyncItem<"sql">;
  joins: string[];
  dbsTables: CommonWindowProps["tables"];
  tables: DBSchemaTablesWJoins;
  onClose: VoidFunction;
};

const REFRESH_OPTIONS = ["Realtime", "Custom", "None"] as const;
export type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export type RefreshOptions = {
  autoRefreshSeconds?: number;
  refreshType?: typeof REFRESH_OPTIONS[number];
};


type S = {
  indexes?: {
    indexdef: string;
    indexname: string;
    schemaname: string;
    tablename: string;
  }[];
  query?: {
    hint?: string;
    label?: string; 
    sql: string 
  };
  l1Key?: string;
  l2Key?: string;
  running?: boolean;
  error?: any;
  initError?: any;
  hint?: string;
  columnsConfig?: ColumnsConfig;
  infoQuery?: {
    label: string;
    query: string;
  }
  autoRefreshSeconds?: number;
  newOptions?: P["w"]["sql_options"];
}

type D = {
  w?: P["w"];
}

export class ProstglesSQLMenu extends RTComp<P, S, D> {


  state: S = {
    // joins: [],
    l1Key: undefined,
    l2Key: undefined,
    query: undefined,
    running: undefined,
    error: undefined,
    initError: undefined,
    hint: undefined,
    indexes: undefined,
    columnsConfig: undefined,
    infoQuery: undefined,
    autoRefreshSeconds: undefined,
  }

  // d: D = {
  //   w: undefined
  // }

  onUnmount = async () => {
    if(this.wSub) await this.wSub.$unsync();
  }


  wSub?: ReturnType<P["w"]["$cloneSync"]>;
  autoRefresh: any;
  loading = false;
  onDelta = async (dP?: Partial<P>, dS?: Partial<S>, dD?) => {
    // const w = this.d.w || this.props.w;

    // if(w?.$cloneSync && !this.loading){
    //   this.loading = true;
    //   this.wSub = await w.$cloneSync((w, delta)=> {
    //     this.setData({ w }, { w: delta });
    //   });
    // }


    if(dS && ("query" in dS)){
      this.setState({ error: undefined })
    }

    if(dP?.w?.sql_options && JSON.stringify(this.props.w.sql_options) === JSON.stringify(this.state.newOptions)){
      this.setState({ newOptions: undefined })
    }
  }

  saveQuery = async () => {
    const w = this.props.w
    const sql = w.$get().sql || ""
    const fileName  = (w.$get().name || `Query_${await sha256(sql)}`) + ".sql";
    
    download(sql, fileName, "text/sql");
  }

  render(){
    const {
      onAddChart,
      w,
      dbs,
      dbsTables,
      tables,
      onClose,
    } = this.props;


    const {
      l1Key,
      initError, 
      error,
      newOptions,
    } = this.state;

    if(initError){
      return <div className="p-1">
        <ErrorComponent error={initError} />
        
      </div>
    }

    const sqlOptsValue = JSON.stringify(newOptions || w.sql_options, null, 2);

    const table = dbsTables.find(t => t.name === "windows");
    const sqlOptionsCol = table?.columns.find(c => c.name === "sql_options");

    if(!table){
      return <div>dbs.windows table schema not found</div>
    }
    // const cCols = getChartCols(w, tables); 
    const cCols = getChartColsV2(w, tables); 
    const chartMenuItem = { 
      leftIconPath: mdiChartBoxPlusOutline,
      disabledText: (!cCols.dateCols.length && !cCols.geoCols.length)? "No date or geo columns to chart" : undefined,
      content: <div className="text-gray-800 noselect flex-row ai-center">
        {!onAddChart? <InfoRow>Not allowed</InfoRow> : <AddChartMenu 
          w={w} 
          tables={tables} 
          onAddChart={args => { 
            onAddChart(args);
            this.props.w.$update({ show_menu: false });
          }} 
        />}
      </div> 
    };
    
    const l1Opts: TabsProps["items"] = {
      "General": {
        leftIconPath: mdiFileUploadOutline,
        content: (
          <div className="flex-col ai-start gap-1">

            <FormField label="Query name" value={w.name} asColumn={true} type="text" 
              onChange={newVal => {
                w.$update({ name: newVal, options: { sqlWasSaved: true } }, { deepMerge: true })
              }}
            />

            <FormField
              label="Result display mode"
              fullOptions={[
                { key: "table", label: "Table" },
                { key: "csv", label: "CSV" },
                { key: "JSON", label: "JSON" },
              ]} 
              value={w.sql_options.renderMode ?? "table"}  
              onChange={renderMode => w.$update({ sql_options: { renderMode } }, { deepMerge: true })}  
            /> 

            <Btn 
              title="Save query as file" 
              iconPath={mdiDownload} 
              onClick={this.saveQuery}
              variant="faded"
            >
              Download query
            </Btn>

            <label title="Open SQL file" 
              htmlFor="sql-open" 
              className="btn btn-default btn-color-default f-0 bg-gray-200 text-gray-400  rounded pointer flex-row ai-center"
              style={{
                padding: "8px 12px"
              }}
            >
              <Icon className="text-gray-800" size={1} path={mdiUpload} />
              <input id="sql-open" name="sql-open" title="Open query from file" type="file" accept='text/*, .sql, .txt'
                style={{ display: "none" }}
                onChange={e => {
                if (e.currentTarget.files && e.currentTarget.files[0]) {
                  const myFile = e.currentTarget.files[0];
                  getFileText(myFile).then(sql => {
                    w.$update({ sql, show_menu: false })
                  });
                } 
              }}/>
              <div className=" text-gray-800  ml-p5" style={{
                fontWeight: 500,
                fontSize: ".875rem"
              }}>Open SQL file</div>
            </label>

            <Btn title="Delete this query"
              color="danger" 
              variant="faded"
              iconPath={mdiDelete} 
              onClick={() => {
                w.$update({ closed: true, deleted: true })
              }}
            >
              Delete query
            </Btn>


            <Btn variant="faded"
              iconPath={mdiPlay}
              onClick={() => {
                onClose();
                setTimeout(() => {
                  DemoSQL(w);
                }, SECOND)
              }}
            >DEMO</Btn>
          </div>
        )
      },
      "Add chart": chartMenuItem,

      "Editor options": {

        leftIconPath: mdiCog,
        content: (
          <div 
            className="flex-col ai-start gap-1"
            key={JSON.stringify(w.sql_options)} 
          >
            <div>SQL Editor settings</div>
            <CodeEditor language="json" 
              className="b b-gray-400"
              style={{ 
                minHeight: "200px",
                minWidth: "400px",
                // border: "1px solid var(--gray-100)",
                flex: 1, 
                resize: "vertical", 
                overflow: "auto",
                width: "100%",
              }}
              value={sqlOptsValue} 
              onChange={v => {
                try {
                  this.setState({ newOptions: JSON.parse(v) })
                } catch(err){

                }
              }}
              jsonSchemas={[
                {
                  id: "sql_options",
                  schema: getJSONBSchemaAsJSONSchema(table.name, "sql_options", sqlOptionsCol?.jsonbSchema ?? {})
                }
              ]}
            />
            <InfoRow color="info">Press <strong>ctrl</strong> + <strong>space</strong> to get a list of possible options</InfoRow> 
            {!!error && <ErrorComponent error={error} />}
            <Btn color="action"
              variant="filled"
              iconPath={mdiContentSave}
              disabledInfo={error? "Cannot save due to error" : !newOptions || JSON.stringify(newOptions) === JSON.stringify(w.sql_options)? "Nothing to update" : undefined}
              onClickPromise={async () => {
                const _newOpts = { ...newOptions! };
                this.setState({ error: undefined });
                try {
                  await dbs.windows.update({ id: w.id }, { sql_options: _newOpts });
                } catch(error){
                  this.setState({ error, newOptions: _newOpts })
                }
              }}
            >
              Update options
            </Btn>
          </div>
        )

      },
      "Hotkeys": {

        leftIconPath: mdiKeyboard,
        content: <SQLHotkeys />
      },
        
    }

    return (
      <div className="table-menu c--fit flex-row" style={{maxHeight: "100vh", maxWidth: "100vw"}}>
        <Tabs
          variant="vertical"
          contentClass={" o-auto min-h-0 max-h-100v " + (l1Key === "Alter"? " " : " p-1")}
          items={l1Opts}
          compactMode={window.isMobileDevice}
          // defaultActiveKey={"General"}
        />
      </div>
    )
  }
}

export function getFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
  
    reader.addEventListener('load', function (e) {
      if(e.target) resolve(e.target.result as string);
      else reject("e.target is null");
    });
  
    reader.readAsBinaryString(file);
  });
}


export async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);                    

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}