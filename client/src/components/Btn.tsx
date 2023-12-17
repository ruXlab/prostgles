import React, { useState } from 'react';
import { omitKeys } from "../utils";
import Loading from "./Loading";
import "./Btn.css";
import RTComp from '../dashboard/RTComp';
import ErrorComponent from "./ErrorComponent";
import { generateUniqueID } from "./FileInput/FileInput";
import { NavLink } from "react-router-dom";
import { mdiAlert, mdiCheck, mdiUpload } from "@mdi/js";
import { IconProps } from "@mdi/react/dist/IconProps";
import { Icon } from "./Icon/Icon";
import Chip from "./Chip";
import { classOverride } from "./Flex";
import { TestSelectors } from '../Testing';

type ClickMessage = (
  { err: any } | 
  { ok: React.ReactNode, replace?: boolean; } | 
  { loading: 1 | 0, delay?: number; }
) & { duration?: number; };
type ClickMessageArgs = (
  msg: ClickMessage,
  onEnd?: () => void
) => void;

type BtnCustomProps = {
  iconPath?: string;
  iconStyle?: React.CSSProperties;
  iconProps?: IconProps;
  iconClassname?: string;
  iconPosition?: "left" | "right";

  /**
   * If provided then the button is disabled and will display a tooltip with this message
   */
  disabledInfo?: string;
  disabledVariant?: "no-fade";
  loading?: boolean; 
  fadeIn?: boolean;
  _ref?: any;

  /**
   * If provided will override existing top classname
   */
  exactClassName?: string;
  size?: "large" | "medium" | "small" | "micro";
  variant?: "outline" | "filled" | "faded" | "icon" | "text" | "default";
  color?: "danger" | "warn" | "action" | "inherit" | "transparent" | "white" | "green" | "indigo" | "default";
  
  "data-id"?: string;
} & (
  {
    onClickMessage?: (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
      showMessage: ClickMessageArgs
    ) => void;
  } | {
    onClickPromise?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<any>;
  }
);

type OmmitedKeys = keyof BtnCustomProps | "children" | "ref" | "onClick" | "style" | "title";
const CUSTOM_ATTRS: OmmitedKeys[] = [
  "iconPath", "children", "disabledInfo", "title", "disabledVariant",
  "onClick", "loading", "color", "fadeIn", 
  "_ref", "ref", "style", "size", "exactClassName", "iconProps", "iconPosition", "iconClassname",
  "onClickMessage" as any, "onClickPromise" as any, "asNavLink" as any, "iconStyle"
]

export type BtnProps<HREF extends string | void = void> = TestSelectors & BtnCustomProps & {

  /**
   * If provided then will render as an anchor
   */
  href?: HREF;
  target?: string;
  asNavLink?: boolean;
  download?: boolean;
  
} & (
  React.HTMLAttributes<HTMLButtonElement>
) & {
  value?: string;
  type?: "button" | "submit";
}


type BtnState = {
  show: boolean;
  clickMessage?: {
    type: "err" | "ok" | "loading",
    msg: React.ReactNode;
    replace?: boolean;
  }
}

export default class Btn<HREF extends string | void = void> extends RTComp<BtnProps<HREF>, BtnState> {

  state: BtnState = {
    show: true
  } 

  timeOut?: NodeJS.Timeout;
  loadingTimeOut?: NodeJS.Timeout;

  latestMsg?: ClickMessage;
  clickMessage: ClickMessageArgs = (msg, onEnd) => {
    if(!this.mounted) return;
    this.latestMsg = msg;
    const hasErr = "err" in msg;
    if(this.loadingTimeOut) clearTimeout(this.loadingTimeOut);
    if(this.timeOut) clearTimeout(this.timeOut);

    if(hasErr){
      this.setState({ clickMessage: { type: "err", msg: ErrorComponent.parsedError(msg.err, true) } })
    } else if("ok" in msg){
      this.setState({ clickMessage: { type: "ok", msg: msg.ok, replace: msg.replace } })
    } else if("loading" in msg){

      if(!msg.loading){
        this.setState({ clickMessage: undefined }, onEnd);
      } else {
        this.loadingTimeOut = setTimeout(() => {
          /** Check if msg is stale */
          if(this.mounted && JSON.stringify(this.latestMsg) === JSON.stringify(msg)){
            this.setState({ clickMessage: { type: "loading", msg: "" } });
          }
        }, msg.delay ?? 750);
      }

      return;
    }

    this.timeOut = setTimeout(() => {
      if(this.mounted){
        this.setState({ clickMessage: undefined }, onEnd)
      }
    }, msg.duration ?? (hasErr? 5000: 2000))
  }


  setPromise = async (promise: Promise<any>) => {
    this.clickMessage({ loading: 1 })
    try {
      await promise;
      this.clickMessage({ ok: "" })
    } catch(err){
      this.clickMessage({ err })
    }
  }

  render(){
    const { 
      iconPath, iconPosition = "left", className = "", style = {}, iconStyle = {}, disabledInfo, disabledVariant = "", title, 
      fadeIn, exactClassName, variant = "default", iconProps, iconClassname = "", ...otherProps
    } = this.props;
    const { clickMessage } = this.state;
    let extraStyle: React.CSSProperties = {};

    const color = (clickMessage?.type === "err"? "danger"  : clickMessage?.type === "ok"? "action" : this.props.color) ?? "default";
    const loading = clickMessage?.type === "loading"? true : this.props.loading ?? false;
    const children = clickMessage?.msg || this.props.children;

    if(clickMessage?.replace) return clickMessage.msg;

    const isDisabled = disabledInfo || loading;
    let _className = exactClassName || "";
    const { size = window.isLowWidthScreen? "small" : undefined } = this.props;
        
    if(!exactClassName){
      const hasBgClassname = (className + "").includes("bg-")
      _className = " f-0 flex-row gap-p5 ai-center  " + 
        // (hasBgClassname? "" :  "  bg-transparent " ) + 
        ("href" in this.props? " button-css " : "  ") + 
        (variant === "outline"? " b ":  "");

      if(children){
        if(variant === "outline"){
          if(!hasBgClassname) _className = _className.replace("bg-transparent", "") + " bg-0 "
          extraStyle = {
            // border: "1px solid",
            borderColor: "currentcolor",
            // paddingRight: "14px",
          }
        } 

        if(!size){
          extraStyle.padding = (iconPath || loading)? `${iconPath? 8 : 8}px 12px` : "12px";
        }
        
        if(size === "small"){
          extraStyle.padding = "5px 8px"
        }

        if(size === "large"){
          extraStyle.padding = "12px 16px"
        } 

        if(variant === "text"){
          extraStyle.paddingLeft = 0;
        }
  
      /** Is icon Btn */
      } else {
        extraStyle = {
          padding: "8px"
        };
        
        if(variant === "outline"){
          // _className += `b${colorPart}`
        }

        if(variant === "icon" || variant === "outline"){
          extraStyle.padding = "0.5em";
        }
        if(size === "small"){
          extraStyle.padding = "4px"
        }
      }
  
      // _className += ` ${variant === "filled"? "text-white bg" : "text"}${colorPart} `;  

    }
    
    _className += (fadeIn? " fade-in " : "") + 
      ((iconPath && !children)? "  " : "rounded") + // round
      (isDisabled? ` disabled ${disabledVariant} ` : " ");

    _className = classOverride(_className, className);

    const iconSize = size === "micro"? .5 : size === "small"? .75 : size === "medium"? .85 : 1;
    const loadingSize = !size? 18 : size === "small"? 12 : 24
    const childrenContent = (children === undefined || children === null || children === "")? null : 
      loading? <div 
        className="min-w-0 ws-nowrap text-ellipsis f-1 o-hidden" 
        style={{ opacity: .5 }}
      >
        {children}
      </div> : 
      children;
    
    const content = <>
      {iconPosition === "right" && childrenContent}

      {(!(iconPath || iconProps?.path) || loading)? null : 
        <Icon 
          path={clickMessage?.type === "err"? mdiAlert : clickMessage?.type === "ok"? mdiCheck : (iconPath ?? iconProps!.path)} 
          size={iconSize} 
          className={iconClassname + " f-0 " } 
          style={iconStyle}
          { ...iconProps }
        />
      }
      
      {loading? <Loading 
        style={{ margin: "3px 6px 3px 0px"}} 
        sizePx={loadingSize} 
        delay={0} 
        colorAnimation={false} 
      /> : null}

      {iconPosition === "left" && childrenContent}
    </>;
    // text${variant === "filled"? "-white" : colorPart}

    type PropsOf<E> = React.HTMLAttributes<E> & { ref?: React.Ref<E> };

    let onClick = this.props.onClick as any;
    if("onClickPromise" in this.props && this.props.onClickPromise){
      const { onClickPromise } = this.props;
      onClick = e => {
        this.setPromise(onClickPromise(e));
      }
    } 
    if("onClickMessage" in this.props && this.props.onClickMessage){
      const { onClickMessage } = this.props;
      onClick = e => {
        onClickMessage(e, this.clickMessage)
      }
    }


    if(size === "small"){
      extraStyle.minHeight = "32px"
      extraStyle.minWidth = "32px"
    }

    const FontSizeMap: Record<Required<BtnCustomProps>["size"], string> = {
      large: "16px",
      medium: "16px",
      small: "14px",
      micro: "12px",
    }
    
    const finalProps: PropsOf<HTMLAnchorElement> | PropsOf<HTMLButtonElement> = {
      ...omitKeys(this.props, CUSTOM_ATTRS as any),
      onClick: disabledInfo? (
        !window.isMobileDevice? undefined : 
          () => alert(disabledInfo)
        ) : (loading)? undefined : 
        onClick,
      title: disabledInfo || title,
      style: { ...extraStyle, display: "flex", lineHeight: "1em", width: "fit-content", ...style, fontSize: FontSizeMap[size ?? "medium"] },
      onMouseDown: e => e.preventDefault(),
      className: `${_className} btn btn-${variant} btn-size-${size} btn-color-${color} ws-nowrap w-fit `,
      ref: this.props._ref,
      ...({"data-id": otherProps["data-id"] as any}),
    }

    if("href" in this.props && this.props.href){
      if(this.props.asNavLink){
        return <NavLink 
          { ...(finalProps) as PropsOf<HTMLAnchorElement> }
          onClick={!disabledInfo? undefined : e => {
            e.preventDefault();
          }}
          to={this.props.href} 
          tabIndex={-1} 
        >
          {content}
        </NavLink>
      }
      return (
        <a { ...finalProps as PropsOf<HTMLAnchorElement> } 
          target={this.props.target} 
          onClick={disabledInfo? undefined : () => false} {...(this.props.download && { download: true })
        }>
          {content}
        </a>
      );
    }

    return (
      <button { ...finalProps as PropsOf<HTMLButtonElement> } disabled={disabledInfo? true : undefined}  >{content}</button>
    );

  }
}

type FileBtnProps = { 
  iconPath?: string; 
  children: React.ReactChild; 
}

export const FileBtn = React.forwardRef<HTMLInputElement, FileBtnProps & React.HTMLProps<HTMLInputElement>>(({ 
  iconPath = mdiUpload, 
  onChange,
  children = "Choose file", 
  id = generateUniqueID(), 
  style = {}, 
  className = "",
  ...inputProps
}, ref) => {
  const [files, setFiles] = useState<FileList | null>(null)

  // return (<label htmlFor={id} className={"text-1p5 f-1 flex-row pointer gap-p25 ai-center px-p5 py-p25 " + className} style={style}>
  //   {iconPath && <Icon path={iconPath} size={1} title="Add files" className="  "/>}
  //   {children}
  //   <Btn></Btn>
  //   <div className="flex-row-wrap gap-p5">
  //     {!files?.length? "No file chosen" : Array.from(files).map(f => <Chip>{f.name}</Chip>)}
  //   </div>
  //   <input id={id}
  //     ref={ref}
  //     style={{ width: 0, height: 0 }}
  //     {...inputProps}
  //     onChange={e => {
  //       setFiles(e.target.files);
  //       onChange?.(e);
  //     }}
  //     type="file"
  //   />
  // </label>)


  return (<div className={"flex-row  gap-p25 ai-center " + className} style={style}>
    <Btn title="Choose file" 
      color="action" 
      data-command="FileBtn"
      iconPath={iconPath} 
      style={{ borderRadius: 0 }}
      onClick={e => { e.currentTarget.querySelector("input")?.click(); }}
    >
      {children}
      <input id={id}
        ref={ref} 
        type="file"
        autoCapitalize="off"
        style={{ width: 0, height: 0, position: "absolute" }}
        {...inputProps}
        onChange={e => {
          setFiles(e.target.files);
          onChange?.(e);
        }}
      />
    </Btn>
    <div className="flex-row-wrap gap-p5 text-1p5 px-1">
      {!files?.length? "No file chosen" : Array.from(files).map(f => <Chip>{f.name}</Chip>)}
    </div>
  </div>)
});