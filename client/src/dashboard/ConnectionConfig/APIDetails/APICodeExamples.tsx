import { mdiDownload } from "@mdi/js";
import React from "react";
import Btn from "../../../components/Btn";
import { FlexCol } from "../../../components/Flex";
import Tabs from "../../../components/Tabs";
import { Zip } from "../../API/zip";
import CodeExample from "../../CodeExample";
import { download } from "../../ProstglesSQL/W_SQL";

export const APICodeExamples = ({ token, projectPath, dbSchemaTypes }: { token: string; projectPath: string; dbSchemaTypes: string | undefined; }) => {

  const { htmlExample } = getCodeSamples({ token, projectPath }, false)
  const { tsExample } = getCodeSamples({ token, projectPath }, true);

  const DownloadCodeSample = (isTS = false) => <Btn 
    variant="filled" 
    className="mb-p5 ml-auto" 
    iconPath={mdiDownload} 
    color="action" 
    onClick={() => { 
      if(isTS){
        const zip = new Zip("prostgles-api-example");
        const folder = ""
        zip.str2zip("index.ts", tsExample, folder);
        zip.str2zip("package.json", JSON.stringify(packageJson, null, 2), folder);
        zip.str2zip("tsconfig.json", JSON.stringify(tsconfigJson, null, 2), folder);
        zip.str2zip("README.md", readme, folder);
        zip.str2zip("DBoGenerated.d.ts", dbSchemaTypes ?? "export type DBSchemaGenerated = any;", folder);
        zip.makeZip();

      } else {

        download(htmlExample, "index.html", "text/html"); 
      }
    }}
  >Download code sample</Btn>

  return <FlexCol>
    <Tabs
      variant={"horizontal"}
      defaultActiveKey="Typescript" 
      contentClass="pt-2 f-0"
      className="f-0"
      items={{
        Typescript: {
          content: (
            <FlexCol>
              <CodeExample 
                key="t"
                value={tsExample} 
                language="javascript"  
                style={{ minHeight: "400px"}} 
              />
             {DownloadCodeSample(true)}
            </FlexCol>
          )
        },
        'Vanilla JS': {
          content: (
            <FlexCol>
              <CodeExample 
                key="h"
                value={htmlExample}  
                language="html"  
                style={{ minHeight: "400px"}}  
              />
              {DownloadCodeSample()}
            </FlexCol>
          )
        }
      }}
    />
  </FlexCol>
}



function getCodeSamples({ token, projectPath }: { token?: string; projectPath?: string; }, forServer: boolean){
  
  const authStr = !token? "" : `auth: { sid_token: ${JSON.stringify(token)} },`

  const initLogic = `const socket = io(${JSON.stringify(window.location.origin)}, { 
  ${authStr}
  path: ${JSON.stringify(projectPath)} 
});` 
const commonLogic = `${initLogic}

prostgles({
  socket,
  onReload: () => {},
  onReady: async (db, methods, tableSchema, auth) => {
    console.log(db);
    ${forServer? "" : "document.body.append(JSON.stringify({ db, methods, auth }, null, 2))"}
  },
});`;

const clientLogic = forServer? "" : `
if(typeof document !== 'undefined'){
  console.log(typeof document)
  document.body.append(info)
} else {
  console.log(info)
}`


const tsExample= `
import prostgles from "prostgles-client";
import io from "socket.io-client";
import type { DBSchemaGenerated } from "./DBoGenerated.d.ts";

${initLogic}

prostgles<DBSchemaGenerated>({
  socket,
  onReload: () => {},
  onReady: async (db, methods, tableSchema, auth) => {
    const info = JSON.stringify({ 
      tableHandlers: Object.keys(db), 
      methods, 
      auth 
    }, null, 2);
    console.log(info);
    ${clientLogic}
  },
});

`

const htmlExample = `
<!DOCTYPE html>
<html>
	<head>
		<title> Prostgles </title>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<script src="https://unpkg.com/socket.io-client@latest/dist/socket.io.min.js" type="text/javascript"></script>
		<script src="https://unpkg.com/prostgles-client@latest/dist/index.js" type="text/javascript"></script>	
	</head>
	<body style="white-space: pre">

		<script>

    ${commonLogic.split("\n").map((v, i) => !i? (`  ` + v) : (`      ` + v)).join("\n")}

		</script>
		
	</body>
</html>`;

  return { htmlExample, tsExample}
}

const packageJson = {
  "name": "prostgles-api-example",
  "version": "1.0.0",
  "description": "Example server-side usage of the Prostgles API",
  "main": "index.ts",
  "scripts": {
    "start": "npm i && tsc-watch --onSuccess \"node --inspect index.js\""
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.6.5",
    "tsc-watch": "^6.0.4",
    "typescript": "^5.2.2"
  },
  "dependencies": {
    "prostgles-client": "^4.0.21",
    "socket.io-client": "^4.7.2"
  }
};

const tsconfigJson = {
	"files": ["./index.ts"],
	"compilerOptions": {
		"outDir": ".",
		"target": "ES2022",
		"lib": [ "ES2017", "es2019", "ES2021.String", "ES2022" ],
		"esModuleInterop" : true,
		"allowSyntheticDefaultImports": true,
		"allowJs": true,
		"module": "commonjs",
		"sourceMap": true,
		"moduleResolution": "node",
		"declaration": true,
		"declarationMap": true,
		"keyofStringsOnly": true,
		"ignoreDeprecations": "5.0",
		"strict": true,
		"skipLibCheck": true,
	},
	"exclude": [
		"dist",
		"DBoGenerated.ts",
		"*.conf"
	],
};

const readme = `
After ensuring nodejs is installed run this in your terminal: 
    \`npm start\`
`