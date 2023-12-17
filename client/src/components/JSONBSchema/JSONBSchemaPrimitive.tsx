import { JSONB, ValidatedColumnInfo } from "prostgles-types";
import React from "react";
import SmartFormField from "../../dashboard/SmartForm/SmartFormField/SmartFormField";
import FormField, { FormFieldProps } from "../FormField/FormField";
import { FullOption } from "../Select/Select";
import { JSONBSchemaCommonProps } from "./JSONBSchema";
import { isCompleteJSONB } from "./isCompleteJSONB";
import { type } from "os";


type Schema = JSONB.BasicType | JSONB.EnumType; 
type P = JSONBSchemaCommonProps & {
  className?: string;
  style?: React.CSSProperties;
  schema: Schema;
  value: JSONB.GetType<Schema>
  onChange: (newValue: JSONB.GetType<Schema>) => void;
}
export const JSONBSchemaPrimitiveMatch = (s: JSONB.JSONBSchema): s is JSONB.BasicType | JSONB.EnumType => !s.lookup && (!!s.enum?.length || !s.allowedValues?.length && typeof s.type === "string");
export const JSONBSchemaPrimitive = ({ value, schema, onChange, showErrors } : P) => {

  let fullOptions: FullOption[] | undefined = undefined;
  if(schema.enum?.length || schema.allowedValues?.length){
    fullOptions = (schema.enum || schema.allowedValues!).map(key => ({ key }));
  }

  const schemaTypeToColType: Record<Required<typeof schema>["type"], Pick<ValidatedColumnInfo, "udt_name" | "tsDataType">> = {
    "Date": {
      tsDataType: "string",
      udt_name: "date",
    },
    "Date[]": {
      tsDataType: "string",
      udt_name: "date",
    },
    "boolean": {
      tsDataType: "boolean",
      udt_name: "bool",
    },
    "boolean[]": {
      tsDataType: "boolean[]",
      udt_name: "bool",
    },
    "integer": {
      tsDataType: "number",
      udt_name: "int4",
    },
    "integer[]": {
      tsDataType: "number[]",
      udt_name: "int4",
    },
    "time": {
      tsDataType: "string",
      udt_name: "time",
    },
    "time[]": {
      tsDataType: "string[]",
      udt_name: "time",
    },
    "timestamp": {
      tsDataType: "string",
      udt_name: "timestamp"
    },
    "timestamp[]": {
      tsDataType: "string[]",
      udt_name: "timestamp"
    },
    "string": {
      tsDataType: "string",
      udt_name: "text"
    },
    "string[]": {
      tsDataType: "string[]",
      udt_name: "text"
    },
    "number": {
      tsDataType: "number",
      udt_name: "numeric",
    },
    "number[]": {
      tsDataType: "number[]",
      udt_name: "numeric",
    },
    "any": {
      tsDataType: "any",
      udt_name: "text",
    },
    "any[]": {
      tsDataType: "any",
      udt_name: "text",
    }
  };

  const transformedType = {
    ...(schemaTypeToColType[schema.type as any] ?? {
      tsDataType: "string", 
      udt_name: "text", 
    })
  }


  let arrayType: FormFieldProps["arrayType"];
  if(schema.type?.endsWith("[]")){
    const tsDataType = schema.type.slice(0, -2) as any
    arrayType = {
      ...(schemaTypeToColType[tsDataType!] ?? {
        tsDataType: "string", 
        udt_name: "text", 
      })
    }
  }

  const inputType = SmartFormField.getInputType({ 
    ...transformedType,
    name: schema.title ?? "text" 
  });

  
  const error = showErrors && !isCompleteJSONB(value, schema)? "Required" : undefined;
 
  return <FormField 
    name={schema.title} 
    label={{ children: schema.title, info: schema.description }} 
    value={value}
    className={"JSONBSchemaPrimitive"}
    type={inputType}
    nullable={schema.nullable}
    optional={schema.optional}
    arrayType={arrayType}
    inputProps={schema.type === "integer"? { step: 1 } : undefined}  
    fullOptions={fullOptions}
    multiSelect={!!schema.allowedValues?.length && schema.type.endsWith("[]")}
    onChange={newVal => {
      if(schema.type === "number" && newVal && Number.isFinite(+newVal) && (+newVal.trim()).toString() === newVal.trim()){
        onChange(+newVal);
        return
      }
      onChange(newVal)
    }}
    error={error}
  />;
}