import { mdiClose, mdiFullscreen, mdiFullscreenExit, mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from "@mdi/js";
import React from "react";
import Btn from "../../components/Btn";
import { SilverGridChildProps } from "./SilverGridChild"; 
import { dataCommand } from "../../Testing";
export const GridHeaderClassname = "silver-grid-item-header--title" as const;

type P = SilverGridChildProps & {
  fullscreen: boolean;
  height: number; 
  minimized: boolean | undefined;
  onClickClose: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSetMinimized: (newValue: boolean) => void;
  onClickFullscreen: VoidFunction;
  onSetHeaderRef: (ref: HTMLDivElement) => void;
}

export const SilverGridChildHeader = (props: P) => {

  const { 
    headerIcon, minimize, hideButtons = {}, onClose, 
    height, minimized, onSetHeaderRef, fullscreen, onSetMinimized,
    onClickFullscreen, onClickClose, siblingTabs, onClickSibling, activeTabKey
  } = props;
  const lineHeight = window.isMobileDevice? 16 : 24;

  const tabs = siblingTabs?.length? siblingTabs : [props.layout];
  return <div className="silver-grid-item-header flex-row  bg-0p5 pointer f-0 noselect relative ai-center shadow">
            
    <div className="silver-grid-item-header--icon flex-row f-0 o-hidden f-1 ai-center" style={{ maxWidth: "fit-content" }}>
      {headerIcon}
    </div>

    <div 
      className=" flex-row f-1 min-w-0 ws-nowrap ai-center text-ellipsiss ml-p25 o-auto  no-scroll-bar" 
      style={{ gap: "2px" }}
      onWheel={e => {
        e.currentTarget.scrollLeft += e.deltaY;
      }}
    >

      {tabs.map(tab => {
        
        if(tab.id !== activeTabKey){
          const title = tab.title || tab.id;

          return (
            <div key={tab.id}
              onClick={() => {
                onClickSibling?.(tab.id!)
              }}
              style={{
                height: "37px",
                marginTop: "4px",
                padding: ".5em .75em",
                lineHeight: "21px",
                maxWidth: "40%",
              }}
              title={title + ""}
              className="f-0 min-w-0 ws-nowrap text-ellipsis bg-gray-200 p-p5  "
            >
              {title}
            </div>
          )
        }

        return <div key={tab.id}
          ref={r => { 
            if(r){ 
              onSetHeaderRef(r); 
            }  
          }} 
          className={`${GridHeaderClassname} p-p5 f-0 max-w-fit text-ellipsis bg-1 noselect `}
          style={{
            height: `${height}px`,
            lineHeight: `${lineHeight + 2}px`,
            marginTop: "2px",
            maxWidth: "max(300px, 40%)",
            // ...(!!siblingTabs?.length && {maxWidth: "60%"}),
          }}
        >
          {tab.title}
        </div>
      })}
    </div>


    {!hideButtons.minimize && 
      <Btn 
      { ...dataCommand("dashboard.window.collapse")}
        className="f-0" 
        iconPath={!minimized? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal} 
        disabledInfo={fullscreen? "Must exit fullscreen" : undefined}
        onClick={e => {
          if(minimize){
            minimize.toggle()
          } else {
            onSetMinimized(!minimized);  
          }
        }}
      />
    }

    {!hideButtons.fullScreen && 
      <Btn 
        { ...dataCommand("dashboard.window.fullscreen")}
        className="f-0" 
        iconPath={!fullscreen? mdiFullscreen : mdiFullscreenExit} 
        onClick={onClickFullscreen}
      />
    }
    {onClose && !hideButtons.close && 
      <Btn 
        { ...dataCommand("dashboard.window.close")}
        className="f-0" 
        iconPath={mdiClose} 
        onClick={e => onClickClose(e)} 
      />
    }

  </div>
}