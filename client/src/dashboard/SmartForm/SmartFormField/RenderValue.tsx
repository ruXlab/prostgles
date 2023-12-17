import React from "react"
import { sliceText } from "../../SmartFilter/SmartFilter";
import { ShorterText } from "../../../components/ShorterText";
import { getColumnDataColor } from "./SmartFormField";
import { renderInterval } from "../../ProstglesSQL/customRenderers";
import { dateAsYMD_Time } from "../../Charts";
import { ValidatedColumnInfo, isObject, _PG_date } from "prostgles-types";

type P = {
  column: Pick<ValidatedColumnInfo, "udt_name" | "tsDataType"> | undefined;
  value: any; 
  showTitle?: boolean;
  maxLength?: number;
  maximumFractionDigits?: number;
  style?: React.CSSProperties;
}
export const RenderValue = ({ column: c, value, showTitle = true, maxLength, style, maximumFractionDigits = 3 }: P): JSX.Element => {
  const renderNull = (v: any) => {
    if ([null, undefined].includes(v)) {
      return <i style={style} className="text-gray-400  noselect" title={showTitle ? "NULL" : undefined}>NULL</i>;
    }

    return null;
  }
  const nullRender = renderNull(value);
  if(nullRender) return nullRender;

  const getSliced = (v: string | null | undefined, _maxLength?: number) => {
    const nullRender = renderNull(v);
    if(nullRender) return nullRender;
    if(maxLength) return sliceText(v?.toString(), _maxLength ?? maxLength);

    return v;
  }

  if(c?.udt_name === "uuid" && value){ 
    return <ShorterText style={style} value={value} column={c} /> 
  }
  if(c?.tsDataType === "number" && value !== undefined && value !== null){
    const countDecimals = (num: number) => {
      if(Math.floor(num.valueOf()) === num.valueOf()) return 0;
      return num.toString().split(".")[1]?.length || 0; 
    }
    const maxDecimals = (+value < 1 && +value > -1) ? countDecimals(+value) + 1 : maximumFractionDigits;
    const slicedValue = getSliced(
      (+value).toLocaleString(undefined, { 
        minimumFractionDigits: Math.min(maxDecimals, countDecimals(+value)) 
      })
    );
    return <span style={{color: getColumnDataColor(c),  ...style }}>{slicedValue}</span>
  }
  if(c?.udt_name === "interval"){
    return <>{renderInterval(value)}</>
  }
  
  if (value && ["geography", "geometry"].includes(c?.udt_name ?? "")) {
    if(typeof value === "object" && !Array.isArray(value)){
      return <>{getSliced(JSON.stringify(value))}</>
    }
    return <ShorterText style={style} value={value} column={c} /> 
  }

  if (value && _PG_date.some(v => v === c?.udt_name)) {
    let val = value; 

    if(c?.udt_name !== "timestamp"){
      try {
        
        const date = new Date(value);
        val = dateAsYMD_Time(date) + "." + date.getMilliseconds().toString().padStart(3, "0");

      } catch (e) {
        console.error(e);
      }
    }

    return <span style={{ color: getColumnDataColor(c), ...style }}>{val}</span>
  }

  if (value && (c?.udt_name.startsWith("json") || isObject(value))) {
    return <span style={{ color: getColumnDataColor(c), ...style, }}>{getSliced(JSON.stringify(value))}</span> 
  }

  if (typeof value === "boolean") {
    return <span style={{ color: getColumnDataColor({ ...c, tsDataType: "boolean", udt_name: "bool" }),  ...style }}>{value.toString()}</span>
  }
  if (typeof value === "string") {
    if (value === "") return <i style={style} className="text-gray-400 noselect" title={showTitle ? "&quot;&quot;" : undefined}>Empty String</i>
    return <>{getSliced(value)}</>
  }

  if(Array.isArray(value)){
    return <div className="flex-row-wrap gap-p25">
      {value.map((v, i) => (
        <span key={i} className="chip gray font-14" style={style}>{getSliced(v)}</span>
      ))}
    </div> 
  }

  return <>{getSliced(value)}</>;
}