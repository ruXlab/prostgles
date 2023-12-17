import { mdiCellphone, mdiDelete, mdiLaptop } from "@mdi/js";
import React from 'react'; 
import Btn from "../components/Btn";
import { InfoRow } from "../components/InfoRow";
import PopupMenu from "../components/PopupMenu"; 
import { renderInterval, StyledInterval } from "../dashboard/ProstglesSQL/customRenderers";
import SmartCardList from "../dashboard/SmartCard/SmartCardList"; 
import { FullExtraProps } from "./Project"; 
import { AnyObject } from "prostgles-types";
import { DivProps, classOverride } from "../components/Flex";


type SessionsProps = Pick<FullExtraProps, "dbs" | "dbsTables" | "user" | "dbsMethods" | "theme"> & {
  displayType: "web_session" | "api_token";
  className?: string;
}

export const getActiveTokensFilter = (type: SessionsProps["displayType"], user_id: string | undefined) => ({ 
  user_id,
  type: type === "api_token"? "api_token" : "web",
  $filter: [{ "$ageNow": ["expires"] } , "<", "0" ], 
  active: true, 
}) as AnyObject

export const Sessions = ({ dbs, dbsTables, user, displayType, className = "", dbsMethods, theme }: SessionsProps) => {

  if(!user) return null;

  const tokenMode = displayType === "api_token"
  const sessionLabel = tokenMode? "API tokens" : "Sessions"

  return <SmartCardList
    title={tokenMode? undefined : ({ count }) => `${sessionLabel} ${count}`}
    db={dbs as any} 
    theme={theme}
    methods={dbsMethods}
    tableName="sessions" 
    tables={dbsTables} 
    filter={getActiveTokensFilter(displayType, user.id) as AnyObject}
    realtime={true}
    style={{
      maxHeight: "40vh",
    }}
    className={"min-h-0 f-1 " + className}
    noDataComponent={
      <InfoRow color="info" style={{ alignItems: "center" }}>
        No active {sessionLabel}
      </InfoRow>
    }
    noDataComponentMode="hide-all"
    orderBy={{
      id_num: false
    }}
    limit={10}
    showEdit={false}
    fieldConfigs={[
      { name: "is_connected", hide: true },
      { 
        name: "active", 
        label: " ",
        render: v => <StatusDotCircleIcon 
          className="my-p5"
          title={v? "Active" : "Not active"} 
          color={v? "green" : "red"} 
        />
      },
      { 
        name: "user_agent", 
        hide: displayType === "api_token",
        render: (v, row) => <PopupMenu 
          title="User agent"
          button={
            <Btn 
              title={row.is_connected? "User is connected" : "User is offline"} 
              style={{ color: row.is_connected? "green" : undefined }} 
              iconPath={isMobileUserAgent(v)? mdiCellphone : mdiLaptop} 
            />
          }
          render={() => <div className="">{v}</div>}
        /> 
    
      }, 
      { 
        name: "last_usedd", 
        select: { $ageNow: ["last_used", null, "second"] },
        label: "Last used",
        renderValue: value => <StyledInterval value={value} /> 
      }, 
      { name: "ip_address", hide: displayType === "api_token" },
      { 
        name: "createdd",  
        select: { $ageNow: ["created", null, "second"] },
        label: "Created",
        renderValue: v => renderInterval(v, true, true) 
      }, 
      { 
        name: "expiress",  
        select: { $ageNow: ["expires", null, "hour"] },
        label: "Expires",
        hideIf: (_, row) => !row.active,
        renderValue: v => {
          return renderInterval(v, true, true); 
        }
      }, 
      { 
        name: "id_num",
        label: " ", 
        style: { marginLeft: "auto" },
        render: v => !!v && <Btn 
          title="Disable" 
          variant="faded" 
          color="danger" 
          iconPath={mdiDelete} 
          onClickPromise={() => {
            // return dbs.sessions.update({ id_num: v }, { active: false })
            return dbs.sessions.delete({ id_num: v })
          }} 
        /> 
      }, 

    ]}
  />
}

function isMobileUserAgent(v: string) {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ];
  
  return toMatch.some((toMatchItem) => {
    return v.match(toMatchItem);
  });
}

type StatusDotCircleIconProps = {
  title?: string;
  color: "green" | "red" | "gray";
} & Pick<DivProps, "className" | "style">
export const StatusDotCircleIcon = ({ title, color, style = {}, className = "" }: StatusDotCircleIconProps) => {
  return <div  title={title}
    className={classOverride("shadow", className)} 
    style={{ 
      borderRadius: "100%", 
      width: "12px", 
      height: "12px", 
      background: `var(--${color}-500)`,
      ...style,
    }}
  /> 
}