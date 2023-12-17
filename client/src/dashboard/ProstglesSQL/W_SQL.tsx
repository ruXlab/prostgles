import {
  mdiKeyboard,
} from "@mdi/js";
import { AnyObject, SocketSQLStreamHandlers, SQLResultInfo } from "prostgles-types";

import React, { useEffect } from "react";
import Loading from "../../components/Loading";
import { PageSize, Table, TableColumn, TableProps } from "../../components/Table/Table";
import { OnAddChart, Query, WindowData, WindowSyncItem } from "../Dashboard/dashboardUtils";

import Popup, { PopupProps } from "../../components/Popup/Popup";

import RTComp, { DeltaOf } from "../RTComp";
import { getFuncs } from "../SQLEditor/SQLCompletion/getPGObjects";
import SQLEditor, { MonacoError, SQLEditorRef } from "../SQLEditor/SQLEditor";

import { SingleSyncHandles, SyncDataItem } from "prostgles-client/dist/SyncedTable";
import { DBEventHandles, ValidatedColumnInfo } from "prostgles-types/lib";
import Btn from "../../components/Btn";
import ErrorComponent from "../../components/ErrorComponent";
import { ColumnSort } from "../W_Table/ColumnMenu/ColumnMenu";

import Icon from "@mdi/react";
import { useIsMounted } from "prostgles-client/dist/react-hooks";
import CodeEditor from "../CodeEditor";
import { CommonWindowProps, DashboardState } from "../Dashboard/Dashboard";
import { createReactiveState } from "../ProstglesMethod/hooks";
import { ProstglesQuickMenuProps } from "../ProstglesQuickMenu";
import { onRenderColumn } from "../W_Table/tableUtils/onRenderColumn";
import Window from "../Window";
import { getSqlRowsAsCSV } from "./CopyResultBtn";
import { runSQL } from "./runSQL";
import { SQLHotkeys } from "./SQLHotkeys";
import { W_SQLBottomBar } from "./W_SQLBottomBar";
import { ProstglesSQLMenu } from "./W_SQLMenu";
 

type P = Omit<CommonWindowProps, "w"> & {
  w: WindowSyncItem<"sql">;
  filter?: any;
  onAddChart?: OnAddChart;
  titleIcon?: React.ReactNode;
  activeRowStyle?: React.CSSProperties;

  suggestions?: DashboardState["suggestions"];
  setLinkMenu: ProstglesQuickMenuProps["setLinkMenu"];
}

export const SQL_NOT_ALLOWED = "Your prostgles account is not allowed to run SQL";

export type ProstglesColumn = TableColumn & { computed: boolean } & Pick<ValidatedColumnInfo, "name" | "tsDataType" | "label" | "udt_name" | "filter">  // ValidatedColumnInfo & 

export type ProstglesSQLState = {
  table?: TableProps & Query;
  sort: ColumnSort[];
  loading: boolean;
  isSelect: boolean;

  rows?: string[][];
  filter: any;
  pos?: { x: number; y: number };
  size?: { w: number; h: number };
  popup?: {
    positioning: PopupProps["positioning"];
    anchorEl: Element;
    content: React.ReactNode;
    style: React.CSSProperties;
  };
  cols?: Required<P>["w"]["options"]["sqlResultCols"];
  handler?: SocketSQLStreamHandlers;
  activeQuery: undefined | {
    hashedSQL: string;
    trimmedSql: string;
    started: Date;
    stopped?: {
      date: Date;
      type: "terminate" | "cancel";
    }
  } & ({
    state: "running";
  } | {
    state: "ended";
    commandResult?: string;  
    rowCount: number;  
    ended: Date;
    info: SQLResultInfo | undefined;
  } | {
    state: "error";
    ended: Date;
    error?: MonacoError;
  });
  joins: string[]; 
  error?: any;
  w?: SyncDataItem<WindowData>;
  hideTable?: boolean;
  sql: string;
  sqlResult?: boolean;
  rowPanel?: {
    type: "insert" | "update";
    data: any;
  };
  rowDelta?: any;
  onRowClick: any;
  filterPopup?: boolean;
  notifEventSub?: ReturnType<DBEventHandles["addListener"]>;
  noticeSub?: ReturnType<DBEventHandles["addListener"]>;
  notices?: {
    length: number;
    message: string;
    name: string;
    severity: string;
    code: string;
    where: string;
    file: string;
    line: string;
    routine: string;
    received: string;
  }[];
  selected_sql?: string;
  columns?: ValidatedColumnInfo[];
  /**
   * Stringified joinFilter that is set after the data has been downloaded.
   * Used in setting activeRow styles to all rows adequately
   */
  joinFilterStr?: string;

  queryEnded?: number;
  page: number;
  pageSize: PageSize;
  loadingSuggestions: boolean;
}

type D = {
  w?: WindowSyncItem<"sql">;
  dataAge?: number;
  wSync?: SingleSyncHandles;
}

export default class W_SQL extends RTComp<P, ProstglesSQLState, D> {

  refHeader?: HTMLDivElement;
  refResize?: HTMLElement;
  ref?: HTMLElement;

  rowPanelData: any;
  state: ProstglesSQLState = { 
    sql: "",
    loading: false,
    page: 1,
    pageSize: 100,
    activeQuery: undefined,
    isSelect: false,
    sort: [],
    joins: [],
    filter: {},
    error: "",
    hideTable: true,
    onRowClick: null,
    loadingSuggestions: true,
  }
  d: D = {
    w: undefined,
    dataAge: 0,
    wSync: undefined,
  }

  calculatedColWidths = false;


  async onMount() {
    const { w } = this.props;

    if (!this.d.wSync) {

      const wSync = w.$cloneSync((w, delta) => {
        this.setData({ w }, { w: delta });
      });
      
      this.setData({ wSync })
    }

    /* Add save hotkey */
    window.addEventListener("keydown", this.saveFunc, false)
  }

  saveFunc = e => {
    if (e.key === "s" && e.ctrlKey && document.activeElement && this.editorContainer && this.editorContainer.contains(document.activeElement)) {
      e.preventDefault();
      this.saveQuery();
    }
  }

  streamData = createReactiveState({ rows: [] } as { rows: any[] }, newState => {
    if(newState.rows.length < this.state.pageSize){
      this.setState({ rows: newState.rows });
    }
  });

  async onUnmount() {
    window.removeEventListener("keydown", this.saveFunc, false)

    this.d.wSync?.$unsync();
    
    const { notifEventSub, noticeSub, handler } = this.state;
    notifEventSub?.removeListener();
    noticeSub?.removeListener();
    await handler?.stop(true);
    await this.dataSub?.unsubscribe?.();
  }

  editorContainer?: HTMLDivElement;
  saveQuery() {
    if (this.d.w && this.d.w.sql.trim()) {
      // window.open('data:text/csv;charset=utf-8,' + w.sql);
      download(this.d.w.sql, `${this.d.w.name || "Query"}.sql`, "text/sql")
    }
  }

  /**
   * To reduce the number of unnecessary data requests let's save the query signature and allow new queries only if different
   */
  currentDataRequestSignature = "";
  static getDataRequestSignature(args: {
    select?: AnyObject;
    filter?: AnyObject;
    orderBy?: AnyObject;
    limit?: number;
    offset?: number;
  } | { sql: string }) {
    if ("sql" in args) return args.sql;

    const { filter, select, limit, offset } = args;
    return JSON.stringify({ filter, select, limit, offset });
  }

  dataSub?: any;
  dataSubFilter?: any;
  dataAge?: number = 0;
  autoRefresh?: any;
  onDelta = async (dp: DeltaOf<P>, ds: DeltaOf<ProstglesSQLState>, dd: DeltaOf<D>) => {
    const delta = ({ ...dp, ...ds, ...dd });
    const { w } = this.d;
    if (!w) return;

    if(delta?.w?.limit !== undefined){
      this.state.handler?.stop();
      this.setState({ handler: undefined })
    }

    const shouldReRender = delta.w?.sql_options || ("hideTable" in (delta.w?.options ?? {})) || "limit" in (delta.w || {}) || delta.w?.sql && !(delta.w.options as any)?.sqlChanged
    if(shouldReRender){
      this.setState({});
    }
  }

  _queryHashAlias?: string;
  killQuery = async (terminate: boolean) => {
    if(this.state.activeQuery?.state !== "running") return;
    this.setState({
      activeQuery: {
        ...this.state.activeQuery,
        stopped: { 
          date: new Date(),
          type: terminate? "terminate" : "cancel"
        },
      }
    });
    this.state.handler?.stop(terminate);
    return true;
  }

  noticeEventListener = (notice: any) => {
    const { notices = [] } = this.state;
    this.setState({
      notices: [
        { ...notice, received: (new Date()).toISOString().replace("T", " ") },
        ...notices
      ]
    })
  }

  notifEventListener = (payload: string) => {
    const { rows = [] } = this.state;
    this.setState({
      rows: [
        [payload,  (new Date()).toISOString().replace("T", " ")],
        ...rows
      ]
    })
  };
  hashedSQL?: string;
  sort?: ColumnSort[];
  runSQL = runSQL.bind(this);

  sqlRef?: SQLEditorRef;

  render() {
    const {
      loading, 
      rows = [], joins, cols: _cols, popup, sqlResult
      , sort, isSelect, page, pageSize,
      notifEventSub, notices, error, activeQuery
    } = this.state;
    const { w } = this.d;
    const { 
      onAddChart, suggestions, tables, setLinkMenu, prgl: { db, dbs, dbsTables, user }
    } = this.props;

    if (loading || !w) return <Loading className='m-auto' />;

    const cols = _cols || [];

    const o: WindowData<"sql">["options"] = w.options;

    const updateOptions = (newOpts: Partial<WindowData<"sql">["options"]>, otherData: Partial<WindowData<"sql">> = {}) => {
      const options: WindowData["options"] = { 
        ...(this.d.w?.$get()?.options || {}),
        ...newOpts
      };
      w.$update({ ...otherData, options }, { deepMerge: true });
    }
    
    const { commandResult = undefined, rowCount = undefined, info = undefined } = this.state.activeQuery?.state === "ended"? this.state.activeQuery : {};
    let infoPlaceholder: React.ReactNode = null;
    if(user && !user.options?.viewedSQLTips && !window.isMobileDevice){
      infoPlaceholder = <div className="p-2 flex-col ai-center jc-center gap-1 absolute " 
        style={{ 
          inset: 0, 
          background: "#00000040",
          zIndex: 1 
        }}
      >
        
        <div className="SQLHotkeysWrapper min-s-0 bg-0 p-1 rounded max-s-fit flex-col gap-1">
          <div color="info" className="bg-0 o-auto">
            <h4 className="flex-row ai-center gap-1 font-16 mt-0">
              <Icon path={mdiKeyboard} size={1}></Icon> Hotkeys:
            </h4>
            <SQLHotkeys />
          </div>
          <Btn
            color="action" 
            variant="filled"
            onClick={async () => { 
              const newOptions = { ...user.options, viewedSQLTips: true };
              await dbs.users.update({ id: user.id }, { options: newOptions });
            }} 
          >
            Ok, don't show again
          </Btn>
        </div>

      </div>
    }
    const sqlError = (activeQuery?.state === "error" && !activeQuery.stopped)? activeQuery.error : undefined;
    const content =  <>
      <div className={"ProstglesSQL flex-col f-1 min-h-0 min-w-0 relative "} 
        ref={r => {
          if (r) {
            this.ref = r;
            //@ts-ignore 
            r.sqlRef = this.sqlRef; 
          }
        }}
      >
        {infoPlaceholder}
        <div ref={r => {
          if (r) {
            this.editorContainer = r;
          }
        }}
          className="f-1 min-h-0 min-w-0 flex-col relative"
        >
          {error &&  <ErrorComponent error={error} className="m-2" />}
          <SQLEditor
            value={this.d.w?.sql ?? ""}
            sql={db.sql!}
            suggestions={{ 
              ...suggestions!,
              onLoaded: () => {
                this.setState({ loadingSuggestions: false })
              }
            }}
            onMount={sqlRef => {
              this.sqlRef = sqlRef;
            }}
            onUnmount={(editor, cursorPosition) => {
              updateOptions({ cursorPosition })
            }}
            cursorPosition={this.d.w?.options.cursorPosition}
            onChange={(code, cursorPosition) => {
              if(!this.d.w) throw new Error("this.d.w missing");
              
              const newData: Partial<WindowData<"sql">> = { sql: code };
              let opts: WindowData<"sql">["options"] = this.d.w.options;
              if (!opts.sqlChanged) {
                opts.sqlChanged = true;
              }
              opts = { ...opts, cursorPosition };
              newData.options = opts;
              this.d.w.$update(newData, { deepMerge: true });
              /** Clear error on type */
              if (this.state.activeQuery?.state === "error") {
                this.setState({ 
                  activeQuery: {
                    ...this.state.activeQuery,
                    error: undefined,
                  } 
                });
              }
            }}
            onRun={async (sql, isSelected) => {
              
              this.setState({ selected_sql: isSelected? sql : "" })
              await this.runSQL();
            }}
            onStopQuery={this.killQuery}
            error={sqlError}
            getFuncDef={!db.sql? undefined : ((name, minArgs) => {
              return getFuncs({ db: db as any, name, minArgs });
            })}
            sqlOptions={{
              ...w.sql_options,
            }}
          />
          {this.d.w && <W_SQLBottomBar 
            { ...this.state }
            w={this.d.w}
            onChangeState={newState => this.setState(newState)}
            db={db}
            streamData={this.streamData}
            killQuery={this.killQuery}
            noticeEventListener={this.noticeEventListener}
            runSQL={this.runSQL}
            notifEventSub={this.state.notifEventSub}
          />}
        </div> 

        <div className={
          "Results flex-col oy-auto relative bt b-gray-300 " + 
          (commandResult? " f-0 " : " f-1 ") + 
          ((o.hideTable && !notices && !notifEventSub || (!rows.length && !sqlResult)) ? " hidden " : "") 
        }> 
          {notices ? <div className="p-1 ws-pre text-gray-600">{notices.slice(0).map(n => JSON.stringify(n, null, 2)).join("\n")}</div> :
            commandResult ? <div className="p-1 ">{commandResult}</div> :
            w.sql_options.renderMode === "csv"?
              <CodeEditor 
                language="csv" 
                value={!cols.length? "" : getSqlRowsAsCSV(rows, cols.map(c => c.name))}
                // value={rows.map(rowValues => rowValues.join(",")).join("\n")} 
              /> :
              w.sql_options.renderMode === "JSON"?
              <CodeEditor 
                language="json" 
                value={JSON.stringify(rows.map(rowValues => cols.reduce((a, v, i) => ({ ...a, [v.name]: rowValues[i] }), {})), null, 2)} 
              /> :
              <Table
                maxCharsPerCell={w.sql_options.maxCharsPerCell || 1000}
                sort={sort}
                onSort={(sort) => { 
                  this.runSQL(sort);
                }}
                showSubLabel={true}
                cols={cols
                  .map((c, i)=> ({
                    ...c,
                    key: i,
                    label: c.name,
                    filter: false,
                    /* Align numbers to right for an easier read */
                    headerClassname: c.tsDataType === "number" ? " jc-end  " : " ",
                    className: c.tsDataType === "number" ? " ta-right " : " ",
                    onRender: onRenderColumn({ 
                      c: { ...c, name: i.toString(), format: undefined }, 
                      table: undefined,
                      tables, 
                      barchartVals: undefined,
                      maxCellChars: w.sql_options.maxCharsPerCell || 1000,
                      maximumFractionDigits: 12,
                    }),
                    onResize: async (width) => {

                      const newCols = cols.map(_c => {
                        if (_c.key === c.key) {
                          _c.width = width;
                        }
                        return _c;
                      });
                      this.setState({ cols: newCols })
                    }
                  }))
                }
                rows={rows.slice(page * pageSize, (page + 1) * pageSize)}
                style={{ flex: 1, boxShadow: "unset" }}
                tableStyle={{ borderRadius: "unset", border: "unset", ...(info?.command?.toLowerCase() === "explain"? { whiteSpace: "pre" } : {} ) }}
                pagination={!isSelect? undefined : {
                  page,
                  pageSize,
                  totalRows: rowCount,
                  onPageChange: (newPage) => {
                    this.setState({ page: newPage })
                  },
                  onPageSizeChange: (pageSize) => {
                    this.setState({ pageSize });
                    if(this.d.w?.limit && pageSize > this.d.w.limit){
                      w.$update({ limit: pageSize });
                    }
                  }
                }}
              />
          }
        </div>

      </div>

      {!popup ? null :
        <Popup
          rootStyle={popup.style}
          anchorEl={popup.anchorEl}
          positioning={popup.positioning}
          clickCatchStyle={{ opacity: 0 }}
          onClose={() => { this.setState({ popup: undefined }) }} 
          contentClassName=""
        >
          {popup.content}
        </Popup>
      }

    </>;

    return <Window 
      w={w} 
      quickMenuProps={{
        dbs,
        onAddChart,
        tables,
        setLinkMenu,
      }}
      getMenu={(w, onClose) => (
        <ProstglesSQLMenu
          tables={tables}
          db={db}
          dbs={dbs}
          onAddChart={onAddChart}
          w={w}
          dbsTables={dbsTables}
          joins={joins}
          onClose={onClose}
        />
      )} 
    >{content}</Window>;
  }
}

// Function to download data to a file
export function download(data, filename: string, type: string) {
  const file = new Blob([data], { type });
  const navigator = window.navigator as any;
  if (navigator.msSaveOrOpenBlob) {
    // IE10+
    navigator.msSaveOrOpenBlob(file, filename);
  } else {
    // Others
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}


export function matchObj(obj1: AnyObject | undefined, obj2: AnyObject | undefined): boolean {
  if (obj1 && obj2) {
    return !Object.keys(obj1).some(k => obj1[k] !== obj2[k])
  }
  return false;
}


type CounterProps = {
  from: Date; 
  className?: string; 
  title?: string;
}
export const Counter  = ({ from, className, title }: CounterProps) => {
  
  const [{ seconds, minutes }, setElapsed] = React.useState({ seconds: 0, minutes: 0 });
  const intervalId = React.useRef<any>(undefined);
  const getIsMounted = useIsMounted();
  useEffect(() => {
    clearInterval(intervalId.current);
    intervalId.current = setInterval(() => {
      if(!getIsMounted()){
        clearInterval(intervalId.current);
        return;
      }
      const totalSeconds = Math.round((Date.now() - +from) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds - minutes * 60;
      setElapsed({ seconds: seconds, minutes })
    }, 1000);
  }, [from, setElapsed, getIsMounted]);

  return (
    <div title={title} className={"text-gray-400 " + className}>{[minutes, seconds].map(v => `${v}`.padStart(2, "0")).join(":")}</div>
  )
  
}





/**
 * Not worth it -> sql editor innerHTML is ~ 1mb
 */
let observer: MutationObserver;
function recordChanges(element: HTMLDivElement, onChange) {
  observer.disconnect();
 
  const changes: { html: string; timeOffset: number; }[] = [];
  const start = Date.now();
  let prevInnerHTML = element.innerHTML;
  let prevStyle = getComputedStyle(element);

  function checkChanges() {
    const currInnerHTML = element.innerHTML;
    const currStyle = getComputedStyle(element);
    
    if (currInnerHTML !== prevInnerHTML || currStyle.cssText !== prevStyle.cssText) {
      const elementStyles = Array.from(element.querySelectorAll('*')).map(el => getComputedStyle(el));
      
      const clonedElement = element.cloneNode(true) as HTMLDivElement;
      const clonedElements = Array.from(clonedElement.querySelectorAll('*'));
      clonedElements.forEach((el, i) => {
        const computedStyle = elementStyles[i]!;
        Array.from(computedStyle).forEach(key => {
          const value = computedStyle.getPropertyValue(key);
          if(!value) return;
          
          (el as any).style.setProperty(
            key, 
            value, 
            computedStyle.getPropertyPriority(key)
          )
        });
      });
      
      changes.push({ html: clonedElement.innerHTML, timeOffset: Date.now() - start });
      prevInnerHTML = currInnerHTML;
      prevStyle = currStyle;
      onChange(changes);
    }
  }

  observer = new MutationObserver(checkChanges);
  observer.observe(element, { childList: true, subtree: true });
}