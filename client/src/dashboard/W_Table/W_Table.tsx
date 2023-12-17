import {
  mdiAlertOutline,
  mdiPlus,
} from "@mdi/js";
import Icon from "@mdi/react";
import { AnyObject, ParsedJoinPath, getKeys } from "prostgles-types";

import React from "react";
import Loading from "../../components/Loading";
import { PAGE_SIZES, Table, TableColumn, TableProps, closest } from "../../components/Table/Table";
import { OnAddChart, Query, WindowData, WindowSyncItem, WorkspaceSyncItem } from "../Dashboard/dashboardUtils";
import "./ProstglesTable.css";

import type { MonacoError } from "../SQLEditor/SQLEditor";

import RTComp, { DeltaOf, DeltaOfData } from "../RTComp";

import { SingleSyncHandles } from "prostgles-client/dist/SyncedTable";
import { ValidatedColumnInfo } from "prostgles-types/lib"; //   TS_DATA_TYPE, 
import Btn from "../../components/Btn";
import ErrorComponent from "../../components/ErrorComponent";
import { ColumnConfig, ColumnMenu, ColumnSort } from "./ColumnMenu/ColumnMenu";

import { DetailedFilterBase, SmartGroupFilter } from '../../../../commonTypes/filterUtils';
import { PaginationProps } from "../../components/Table/Pagination";
import CodeEditor from "../CodeEditor";
import { CommonWindowProps } from "../Dashboard/Dashboard";
import { createReactiveState } from "../ProstglesMethod/hooks";
import { ProstglesQuickMenuProps } from "../ProstglesQuickMenu";
import SmartFilterBar from "../SmartFilter/SmartFilterBar";
import Window from "../Window";
import { CardView } from "./CardView";
import { NodeCountChecker } from "./NodeCountChecker";
import { RowCard, RowPanelProps } from "./RowCard";
import { W_TableMenu } from "./TableMenu/W_TableMenu";
import { TooManyColumnsWarning } from "./TooManyColumnsWarning";
import { getTableData } from "./getTableData";
import { OnClickEditRow, RowSiblingData } from "./tableUtils/getEditColumn";
import { ProstglesTableColumn, getTableCols } from "./tableUtils/getTableCols";
import { getTableSelect } from "./tableUtils/getTableSelect";
import { prepareColsForRender } from "./tableUtils/prepareColsForRender";
import { getFullColumnConfig, getSort, updateWCols } from "./tableUtils/tableUtils";
import { isDefined } from "../../utils";


export type W_TableProps = Omit<CommonWindowProps, "w"> & {
  w: WindowSyncItem<"table">;
  setLinkMenu: ProstglesQuickMenuProps["setLinkMenu"];

  onLinkTable?: (tableName: string, path: ParsedJoinPath[]) => any | void;
  onClickRow?: TableProps["onRowClick"];
  filter?: any;
  joinFilter?: AnyObject;
  externalFilters: AnyObject[];
  activeRow?: ActiveRow;
  onAddChart?: OnAddChart;
  activeRowColor?: React.CSSProperties["color"];

  workspace: WorkspaceSyncItem; //SyncDataItem<Workspace>;
  onAddTable: (args: { name: string, table_name: string, options?:  WindowData<"table">["options"] }, filters: SmartGroupFilter) => void;
}
export type ActiveRow = {
  window_id: string;
  table_name: string;
  row_filter: { [key: string]: any };
  timeChart?: {
    min: Date;
    max: Date;
    center: Date;
  }
}

export type MinMax<T = number> = {
  min: T;
  max: T;
}
/**
 * Used for cell timechart and barchart
 */
export type MinMaxVals = Record<string, MinMax>

export function getFilter(filter: any = {}, activeRow?: ActiveRow): any {
  return {
    $and: [
      filter,
      !activeRow ? undefined :
        {
          $existsJoined: {
            // [`**.${activeRow.table_name}`]: activeRow.row_filter
            path: ["**",activeRow.table_name], 
            filter: activeRow.row_filter
          }
        }
    ].filter(f => f)
  }
}

export type ProstglesColumn = TableColumn & { computed?: boolean } & Pick<ValidatedColumnInfo, "name" | "tsDataType" | "udt_name" | "filter"> 

export type W_TableState = {
  rowCount: number;
  rowsLoaded: number;
  table?: TableProps & Query | any;
  sort?: ColumnSort[]; 
  loading: boolean;

  rows?: AnyObject[];
  filter: any;
  pos?: { x: number; y: number };
  size?: { w: number; h: number };
  joins: string[];
  runningQuery: boolean;
  error?: string;
  duration: number;
  hideTable?: boolean;
  sql: string;
  rowPanel?: {
    type: "insert";
  } | {
    type: "update";
    rowIndex: number;
    filter: DetailedFilterBase[];
    siblingData: RowSiblingData;
    fixedUpdateData?: AnyObject;
  };
  rowDelta?: any;
  onRowClick?: TableProps["onRowClick"];
  
  filterPopup?: boolean;
  
  dataAge?: number;
  barchartVals?: MinMaxVals;
  columns?: ValidatedColumnInfo[];
  totalRows?: number;
  /**
   * Stringified joinFilter that is set after the data has been downloaded.
   * Used in setting activeRow styles to all rows adequately
   */
  joinFilterStr?: string;
  localCols?: ColumnConfigWInfo[];
  tooManyColumnsWarningWasShown?: boolean;
}

export type ProstglesTableD = {
  w?: WindowSyncItem<"table">;
  pageSize: Required<PaginationProps>["pageSize"];
  page: number;
  dataAge?: number;
  wSync?: SingleSyncHandles;
}
// const COLUMN_SAVEABLE_KEYS = ["name", "computedConfig", "format", "width"] as const;

export type ColumnConfigWInfo = ColumnConfig & ({ info?: ValidatedColumnInfo;  });

export default class W_Table extends RTComp<W_TableProps, W_TableState, ProstglesTableD> {

  refHeader?: HTMLDivElement;
  refResize?: HTMLElement;
  ref?: HTMLElement;
  refRowCount?: HTMLElement;

  rowPanelData: any;
  state: W_TableState = {
    barchartVals: {},
    rowsLoaded: 0,
    runningQuery: false,
    sql: "",
    loading: false,
    // page: 0,

    // pageSize: 10,
    // minimised: false,
    // fullScreen: false,
    totalRows: 0,
    // rows: [],
    sort: [],
    joins: [],
    filter: {},
    rowCount: 0,
    duration: 0,
    error: "",
    hideTable: true,
    rowDelta: null,
    filterPopup: false,
    joinFilterStr: undefined,
  }
  d: ProstglesTableD = {
    page: 1,
    pageSize: closest(Math.round(1.2 * window.innerHeight / 55) || 25, PAGE_SIZES) ?? 25,
    w: undefined,
    dataAge: 0,
    wSync: undefined,
  }

  calculatedColWidths = false;

  async onMount() {
    const { w } = this.props;

    if(!Array.isArray(w.filter)){
      w.$update({ filter: [] })
    }
    if(!this.d.wSync) {

      const wSync = w.$cloneSync((w, delta) => {
        // if (w.table_name && !w.columns && !this.d.w) {
        //   TableMenu.getWCols(db[w.table_name] as TableHandlerClient, w, true)
        // } else {
          this.setData({ w }, { w: delta });
        // }
      });
      
      this.setData({ wSync })
    }
  }

  async onUnmount() {
    await this.dataSub?.unsubscribe?.();
  }


  /**
   * To reduce the number of unnecessary data requests let's save the query signature and allow new queries only if different
   */
  currentDataRequestSignature = "";
  static getDataRequestSignature(
    args: {
      select?: AnyObject | any;
      filter?: AnyObject | any;
      barchartVals?: AnyObject;
      joinFilter?: AnyObject;
      externalFilters?: any;
      orderBy?: AnyObject | any;
      limit?: number | null;
      offset?: number;
    } | { sql: string }, 
    dataAge: number, 
    dependencies: any[] = []
  ) {

    const argKeyObj: typeof args & { dataAge: number, dependencies: any[] } = { 
      ...args, dataAge, dependencies
    }; 
    const sigData = {};
    Object.keys(argKeyObj).sort().forEach(key => {
      sigData[key] = argKeyObj[key];
    })
    
    return JSON.stringify(sigData);
  }

  onClickEditRow: OnClickEditRow = (filter, siblingData, rowIndex, fixedUpdateData) => {
    this.rowPanelRState.set({
      type: "update", 
      rowIndex,
      filter, 
      siblingData ,
      fixedUpdateData
    });
  }

  dataSub?: any;
  dataSubFilter?: any;
  dataAge?: number = 0;
  autoRefresh?: any;
  activeRowStr?: string;
  onDelta = async (dp: DeltaOf<W_TableProps>, ds: DeltaOf<W_TableState>, dd: DeltaOfData<ProstglesTableD>) => {
    const delta = ({ ...dp, ...ds, ...dd }); 
    const { prgl: { db }, onClose, workspace } = this.props;
    const { w } = this.d;
    const { table_name: tableName, table_oid } = w || {};
    // let filter = { ...rawFilter };

    let ns: Partial<W_TableState> | undefined;
    if (!w || !tableName) return;

    // const _deltaW = Object.keys(delta.w || {});
    // const _delta = Object.keys(delta);
    // console.log(_delta, _deltaW, delta)

    const tableHandler = db[tableName];


    /** Show count if user requires it  */
    const showCounts = !!(!workspace.options.hideCounts && !w.options.hideCount || workspace.options.hideCounts && w.options.hideCount === false);

    /* Table was renamed. Replace from oid or fail gracefully */
    if (tableName && !tableHandler) {
      if (table_oid) {
        const tableInfos: { name: string; oid: number }[] = [];
        await Promise.all(Object.keys(db).map(async k => {
          if ((db[k] as any).getInfo) {
            tableInfos.push({
              name: k,
              ...(await (db[k] as any).getInfo())
            });
          }
        }));

        const match = tableInfos.find(ti => ti.oid === table_oid);
        if (match) {
          await w.$update({ table_name: match.name });
          return;
        }

      } else {
        alert("Table not found. Removing...");
        onClose(undefined);
        return;
      }
    }
 
    if(!tableHandler) return;
    
    if(delta.w && "filter" in delta.w){
      this.props.onForceUpdate();
    }

    // if (delta.db) console.log(Object.keys(delta.db))
    // if(delta.cols) console.log(delta.cols);

    /* Simply re-render */
    if(["showSubLabel", "maxRowHeight"].some(key => delta.w?.options && key in delta.w.options)){
      ns = ns || {} as any
    }

    /** This is done to prevent errors due to renamed/altered columns */
    if(delta.w?.columns?.length && w.sort?.some(({ key }) => !delta.w?.columns?.some(c => c.name === key || c.nested && c.nested.columns.some(nc => `${key}`.startsWith(`${c.nested!.path.at(-1)?.table}.${nc.name}`))))){
      w.$update({ sort: [] })
    }
    
    /** This is done to prevent errors due to renamed/altered columns */
    if(
      (delta.w?.filter && !delta.w.id) && 
      !w.options.showFilters
    ){
      w.$update({ options: { showFilters: true } }, { deepMerge: true })
    }
    
    /** This is done to prevent empty result due to page offset */
    if(delta.w?.filter){
      this.setData({ page: 1 });
    }

    /** Trigger count on hideCount toggle */
    if(delta.w?.options && "hideCount" in delta.w.options && this.state.rows?.length){
      ns = {
        ...ns,
        dataAge: Date.now()
      }
    }
    
    const changedOpts = getKeys(delta.w?.options || {});

    /**
     * Get data
     */
    getTableData.bind(this)(dp, ds, dd, { showCounts });

    /** Force update */
    const rerenderOPTS: (keyof typeof w.options)[] = ["viewAs", "hideEditRow", "showFilters"];
    if (
      !ns && 
      (
        delta.w?.columns ||
        changedOpts.length && 
        rerenderOPTS.some(k => changedOpts.includes(k)) 
      )
    ) {
      ns ??= {} as any
    }
    
    if (ns) {
      this.setState(ns as W_TableState);
    }
  }

  getWCols = () => {
    const { w } = this.d;
    const { tables } = this.props;
    const { rows } = this.state;
    return !w? [] : getFullColumnConfig(tables, w, rows, this.ref?.offsetWidth);
  }

  getPaginationProps = (): PaginationProps => {
    const { page, pageSize } = this.d;

    const { rowCount } = this.state;

    return {
      page,
      pageSize,
      totalRows: rowCount,
      onPageChange: (newPage) => {
        this.setData({ page: newPage })
      },
      onPageSizeChange: (pageSize) => {
        this.setData({ pageSize })
      }
    }
  }

  getPagination() {
    const { pageSize, page } = this.d;
    return {
      limit: pageSize,
      offset: this.props.joinFilter? 0 : (page - 1) * pageSize,
    }
  }

  getMenu = (w, onClose) => {

    const { 
      prgl, 
      onLinkTable, 
      onAddChart, 
    } = this.props;
    
    const cols = w.columns

    if(!cols) return null; 

    return <W_TableMenu
      prgl={prgl}
      workspace={this.props.workspace}
      cols={cols.filter(c => !c.computed)} 
      onAddChart={onAddChart}
      w={w}
      onLinkTable={onLinkTable}
      suggestions={this.props.suggestions}
      onClose={onClose}
      externalFilters={this.props.externalFilters}
      joinFilter={this.props.joinFilter}
    />
  }

  onSort =  async (sort: ColumnSort[]) => { 
    const { tables, db } = this.props.prgl;
    const { w } = this.d;
    if(!w) return null;
    const { table_name: tableName } = w;
    const tableHandler = db[tableName];

    try {
      const orderBy = getSort(tables, { ...w, sort }) as any;
      /** Ensure the sort is valid */
      const { select } = await getTableSelect(w, tables, db, {}, true)
      await tableHandler?.find!({}, { select, limit: 0, orderBy })
      w.$update({ sort });

    } catch(error: any){
      this.setState({ error });
    }
  }

  rowPanelRState = createReactiveState<RowPanelProps | undefined>();

  onColumnReorder = (newCols: ProstglesColumn[]) => {
    const { w } = this.d;
    if(!w) return null;
    const nIdxes = newCols.filter(c => !(c.computed && c.key === "edit_row")).map(c => c.name);
    const columns = this.d.w?.columns?.slice(0).sort((a, b) => nIdxes.indexOf(a.name) - nIdxes.indexOf(b.name));
    updateWCols(w, columns);
  }

  columnMenuState = createReactiveState<{ column: string; clientX: number; clientY: number } | undefined>()

  render() {

    const {
      loading,  
      rows, 
      // cols, 
      runningQuery, 
      error,
    } = this.state;

    const { w } = this.d;
    if(!w) return null;

    const { 
      setLinkMenu, 
      joinFilter, activeRow, onAddChart, 
      activeRowColor, prgl
    } = this.props;
    const { tables, db, dbs } = prgl;
    const activeRowStyle: React.CSSProperties = this.activeRowStr === JSON.stringify(joinFilter || {})? { background: activeRowColor } : {};

    // const canPrevOrNext = rowPanel?.type === "update" && Object.values(rowPanel.siblingData).some(v => v);
    const cardOpts = w.options.viewAs?.type === "card"? w.options.viewAs : undefined; 
    let content: React.ReactNode = null;
    if (w.table_name && !db[w.table_name]) {
      content = <div className=" p-2 flex-row ai-center text-red-700">
        <Icon path={mdiAlertOutline} size={1} className="mr-p5 " />
        Table {JSON.stringify(w.table_name)} not found
      </div>

    } else if(loading || w.table_name && (!db[w.table_name])){
      content = <div className="flex-col f-1 jc-center ai-center">
        <Loading className='m-auto absolute' />
      </div>;
      
    } else {

      if(!rows) return null;

      const cols = getTableCols({ 
        data: this.state.rows,
        windowWidth: this.ref?.getBoundingClientRect().width,
        prgl: this.props.prgl,
        w: this.d.w,
        onClickEditRow: this.onClickEditRow,
        barchartVals: this.state.barchartVals,
        suggestions: this.props.suggestions,
        columnMenuState: this.columnMenuState,
      });

      /** Update w columns if schema changes */
      if(w.columns?.length !== cols.length){ 
        updateWCols(w, cols);
      }
  
      const { table_name: tableName } = w;
      
      let activeRowIndex = -1;
      if (activeRow?.row_filter) {
        activeRowIndex = rows.findIndex(r => matchObj(activeRow.row_filter, r))
      }
  
      const tableHandler = db[tableName];
      const canInsert = Boolean(tableHandler?.insert);
      const pkeys = cols.map(c => c.show && c.info?.is_pkey? c.info.name : undefined).filter(isDefined);
      const rowKeys = pkeys.length? pkeys : undefined
      content = <>
        <div className={`flex-col f-1 min-h-0 min-w-0 relative`} 
          ref={r => {
            if (r) this.ref = r;
          }}
        >
          <ColumnMenu
            prgl={prgl}
            db={db}
            dbs={dbs}
            tableName={tableName}
            columnMenuState={this.columnMenuState}
            tables={tables}
            suggestions={this.props.suggestions}
            w={w}
          />
          {cols.length > 50 && !this.state.tooManyColumnsWarningWasShown && 
            <TooManyColumnsWarning 
              w={w} 
              onHide={ () => {  
                this.setState({ tooManyColumnsWarningWasShown: true }); 
              }} 
            />
          }
          <NodeCountChecker  parentNode={this.ref} dataAge={this.state.rowsLoaded} />

          {!!w.options.showFilters && 
            <div className=" ai-center p-p5 bg-0p5"  
              title="Edit filters"
            >
              <SmartFilterBar
                { ...prgl}
                methods={prgl.methods}
                w={this.d.w ?? this.props.w}
                rowCount={this.state.rowCount}
                className="" 
                extraFilters={this.props.externalFilters}
                hideSort={!cardOpts}
                showInsertUpdateDelete={{
                  onSuccess: () => {
                    this.setState({ dataAge: Date.now() })
                  }
                }}
              />
            </div>
          }
  
          <div 
            className={"flex-col oy-auto f-1 relative "} 
            style={{ 
              /* ensure the header bottom shadow is visible */
              marginTop: "2px" 
            }}
          >
            {(runningQuery) ? <Loading variant="cover" delay={500} /> : null}
            {error && <ErrorComponent withIcon={true} style={{ flex: "unset", padding: "2em" }} error={error} />}
            {cardOpts? 
              <CardView 
                key={`${cardOpts.cardGroupBy}-${cardOpts.cardOrderBy}-${this.state.dataAge}`}
                cols={cols}
                state={this.state} 
                props={this.props} 
                w={this.d.w} 
                paginationProps={{ ...this.getPaginationProps() }} 
                onEditClickRow={this.onClickEditRow}
                onDataChanged={() => {
                  this.setState({ dataAge: Date.now() })
                }}
              /> : 
            w.options.viewAs?.type === "json"?
              <CodeEditor language="json" value={JSON.stringify(rows, null, 2)} /> :
              <Table
                style={{ 
                  flex: 1, 
                  boxShadow: "unset"
                }}
                // bodyClass={(joinFilter? " active-brush " : "") + (!rows.length? "  " : "")}
                // rowClass={((joinFilter && JSON.stringify(joinFilter) === joinFilterStr) ? " active-brush " : "") + (!rows.length ? "  " : "")}
                
                maxCharsPerCell={w.options.maxCellChars ?? 500}
                maxRowHeight={w.options.maxRowHeight}
                rowStyle={joinFilter? activeRowStyle : {}}
                onSort={this.onSort}
                onColumnReorder={this.onColumnReorder}
                cols={prepareColsForRender(cols, this.getWCols, w)}
                rows={rows}
                rowKeys={rowKeys}
                sort={w.sort || undefined}
                tableStyle={{ borderRadius: "unset", border: "unset" }}
                pagination={this.getPaginationProps()}
                showSubLabel={w.options.showSubLabel}

                activeRowStyle={activeRowStyle}
                activeRowIndex={activeRowIndex}
                onRowClick={this.state.onRowClick}
              />
            }

            {canInsert && <Btn iconPath={mdiPlus}
                data-command="dashboard.window.rowInsert"
                data-key={w.table_name}
                title="Insert row"
                className="shadow w-fit h-fit bg-0"
                color="action"
                variant="outline"
                style={{ position: "absolute", right: "15px", bottom: "15px" }} //, background: "white"
                onClick={async () => {
                  this.rowPanelRState.set({ type: "insert" });
                }}
              />
            }
          </div>
  
        </div>
  
        {tableHandler && 
          <RowCard 
            showR={this.rowPanelRState}
            rows={rows}
            prgl={prgl}
            tableName={tableName}
            tableHandler={tableHandler}
            onPrevOrNext={newRowPanel => {
              this.rowPanelRState.set(newRowPanel)
            }}
            onSuccess={() => {
              this.setState({ dataAge: Date.now() })
            }}
          /> 
        }
      </>; 
    }

    return <Window 
      w={w} 
      quickMenuProps={{
        tables, 
        dbs, 
        setLinkMenu,
        onAddChart
      }} 
      getMenu={this.getMenu}  
    >{content}</Window>
  }
}


export function kFormatter(num: number) {
  const abs = Math.abs(num);
  if (abs > 1e12 - 1) return Math.sign(num) * (+(Math.abs(num) / 1e12).toFixed(1)) + 'T';
  if (abs > 1e9 - 1) return Math.sign(num) * (+(Math.abs(num) / 1e9).toFixed(1)) + 'B';
  if (abs > 1e6 - 1) return Math.sign(num) * (+(Math.abs(num) / 1e6).toFixed(1)) + 'm';
  if (abs > 999) return Math.sign(num) * (+(Math.abs(num) / 1000).toFixed(1)) + 'k';
  return num;
}


export function matchObj(obj1: AnyObject | undefined, obj2: AnyObject | undefined): boolean {
  if (obj1 && obj2) {
    return !Object.keys(obj1).some(k => obj1[k] !== obj2[k])
  }
  return false;
}