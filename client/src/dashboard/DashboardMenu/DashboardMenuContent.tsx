import { mdiFile, mdiFunction, mdiScriptTextPlay, mdiTable, mdiTableEdit } from "@mdi/js";
import type { MethodFullDef } from "prostgles-types";
import { isObject } from "prostgles-types";
import React, { useRef, useState } from "react";
import { dataCommand } from "../../Testing";
import { FlexCol, FlexRowWrap } from "../../components/Flex";
import { Icon } from "../../components/Icon/Icon";
import { InfoRow } from "../../components/InfoRow";
import Popup from "../../components/Popup/Popup";
import SearchList from "../../components/SearchList/SearchList";
import { getIsPinnedMenu } from "../Dashboard/Dashboard";
import { SchemaGraph } from "../SchemaGraph/SchemaGraph";
import { useLocalSettings } from "../localSettings";
import type { DashboardMenuProps, DashboardMenuState } from "./DashboardMenu";
import { DashboardMenuHeader } from "./DashboardMenuHeader";
import { DashboardMenuResizer } from "./DashboardMenuResizer";
import { NewTableMenu } from "./NewTableMenu";
import type { TablesWithInfo } from "./useTableSizeInfo";

type P = DashboardMenuProps & {
  onClose: undefined | VoidFunction;
  onClickSearchAll: VoidFunction;
  tablesWithInfo: TablesWithInfo
} & Pick<DashboardMenuState, "queries">;

export const DashboardMenuContent = (props: P) => {

  const { 
    tables, loadTable, 
    workspace, 
    prgl, queries, onClose, onClickSearchAll, tablesWithInfo
  } = props;
  const { db, methods, theme } = prgl;
  const closedQueries = queries.filter(q => q.closed);

  const smallScreen = window.innerHeight < 1200;
  const pinnedMenu = getIsPinnedMenu(workspace);

  const { centeredLayout } = useLocalSettings();
  const maxWidth = centeredLayout?.enabled? ((window.innerWidth - centeredLayout.maxWidth)/2) + "px" : "50vw";

  const detailedMethods: (MethodFullDef & { name: string; })[] = Object.keys(methods).filter(n => {
    const m = methods[n]
    return m && typeof m !== "function" && isObject(m) && m.run 
  }).map(methodName => ({
    name: methodName,
    ...methods[methodName] as MethodFullDef
  }));

  const [showSchemaDiagram, setShowSchemaDiagram] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
 
  const ensureFadeDoesNotShowForOneItem = { minHeight: "40px" };
  const bgColorClass = (theme === "light" || !pinnedMenu)? "bg-color-0" : "bg-color-1"
  return <FlexCol 
    className={"DashboardMenuContent relative f-1 min-h-0 " + bgColorClass + (window.isMobileDevice? " p-p25 " : " p-1  " )}
    ref={ref}
    style={{
      ...(pinnedMenu && { 
        minWidth: "200px",
        maxWidth,
        width: workspace.options.pinnedMenuWidth? `${workspace.options.pinnedMenuWidth}px` : "fit-content",
        height: "100%", 
      })
    }}
    onKeyDown={e => {
      if(e.key === "Escape"){
        onClose?.()
      }
    }}
  > {showSchemaDiagram && <Popup 
      title="Schema diagram"
      positioning="top-center" 
      onClose={() => setShowSchemaDiagram(false)}
    >
      <SchemaGraph 
        db={db} 
        onClickTable={table => {
          loadTable({ type: "table", table, name: table })
          setShowSchemaDiagram(false);
        }}
      /> 
    </Popup>}
    <DashboardMenuResizer 
      dashboardMenuRef={ref.current} 
      workspace={workspace} 
    />
    
    {pinnedMenu && <DashboardMenuHeader 
      { ...props }
      onClickSearchAll={onClickSearchAll}
      onClose={onClose}
    />}
    
    {!closedQueries.length? null : 
      <SearchList
        id="search-list-queries"
        className={" b-t f-1 min-h-0 " + smallScreen? " mt-p5 " : " mt-1 "}
        style={{ ...ensureFadeDoesNotShowForOneItem, maxHeight: "30vh" }}
        placeholder={`${closedQueries.length} saved queries`} 
        noSearchLimit={3}
        items={closedQueries.sort((a, b) => +b.last_updated - +a.last_updated).map((t, i)=> ({
          key: i,
          contentLeft: (
            <div className="flex-col ai-start f-0 mr-p5 text-1">
              <Icon path={mdiScriptTextPlay} size={1} /> 
            </div>
          ),
          label: t.name,
          contentRight: (<span className="text-2 ml-auto italic">{t.sql.trim().slice(0, 10)}...</span>),
          onPress: () => {
            t.$update?.({ closed: false, workspace_id: workspace.id })
            onClose?.();
          }
        }))}
      />
    }
    
    {!tables.length? <div className="text-1p5 p-1">0 tables/views</div> : 
      <SearchList
        limit={100}
        style={ensureFadeDoesNotShowForOneItem}
        noSearchLimit={0}
        data-command="dashboard.menu.tablesSearchList"
        inputProps={dataCommand("dashboard.menu.tablesSearchListInput")}
        className={"search-list-tables b-t min-h-0 " + (smallScreen? " mt-p5 " : " mt-1 ")}
        placeholder={`${tables.length} tables/views`} 
        items={tablesWithInfo.map((t, i)=> ({
            contentLeft: (
              <div className="flex-col ai-start f-0 mr-p5 text-1"
                { ...(t.info.isFileTable? dataCommand("dashboard.menu.fileTable") : {})}
              >
                <Icon path={t.info.isFileTable? mdiFile : db[t.name]?.insert? mdiTableEdit : mdiTable} size={1} />
              </div>
            ),
            key: t.name,
            label: t.name,
            contentRight: t.endText.length > 0 && (
              <span title={t.endTitle} className="text-2 ml-auto">
                {t.endText}
              </span>
            ),
            onPress: () => {
              loadTable({ type: "table", table: t.name });
              onClose?.();
            }
          }))
        }
      />
    }
    {detailedMethods.length > 0 && <SearchList
      limit={100}
      noSearchLimit={0} 
      className={"search-list-functions b-t f-1 min-h-0 " + (smallScreen? " mt-p5 " : " mt-1 ")}
      style={ensureFadeDoesNotShowForOneItem} 
      placeholder={"Search " + detailedMethods.length + " functions"} 
      items={detailedMethods.map((t, i)=> ({ 
        contentLeft: (
          <div className="flex-col ai-start f-0 mr-p5 text-1">
            <Icon path={mdiFunction} size={1} />
          </div>
        ),
        key: t.name,
        label: t.name,
        onPress: () => {
          loadTable({ type: "method", method_name: t.name });
          onClose?.();
        }
      }))}
    />}
    <FlexRowWrap className="f-0 ml-1 my-p5">
      {!tables.length && !db.sql && 
        <InfoRow>
          You have not been granted any permissions. <br></br> Check with system administrator 
        </InfoRow>
      }

      <NewTableMenu 
        {...props} 
        loadTable={args => {
          onClose?.();
          return loadTable(args);
        }} 
      />

      {/* {tables.length > 1 && 
        <Btn iconPath={mdiRelationManyToMany}
          className="fit "
          style={{ opacity: 0.05 }}
          title="Show schema diagram"
          data-command="schema-diagram"
          variant="outline"
          onClick={() => {
            setShowSchemaDiagram(true);
            onClose?.();
          }}
        >
          Schema diagram
        </Btn>
      } */}

    </FlexRowWrap>
  </FlexCol>
}