
import { usePromise } from "prostgles-client/dist/react-hooks";
import { DBSchemaTable } from "prostgles-types";
import React from "react";
import FileInput, { Media } from "../../components/FileInput/FileInput";
import { SmartFormProps } from "./SmartForm";


type P = {
  table: DBSchemaTable;
  mediaId: string | undefined | null;
} & Pick<SmartFormProps, "db">;

export const SmartFormFieldFileSection = ({ db, table, mediaId }: P) => {
 
  const { fileTableName } = table.info;
  const tableName = table.name;
  let media: Media[] | undefined = usePromise(async () => {
    if(!fileTableName || !mediaId) return undefined;
    const mediaItems = await db[fileTableName]?.find?.({ id: mediaId });
    return mediaItems as Media[]
  }, [mediaId, db, fileTableName, table]);

  return <FileInput
    key={tableName}
    className={"mt-p5 f-0 "}
    media={media}
    minSize={450}
    maxFileCount={1}
  />;
}