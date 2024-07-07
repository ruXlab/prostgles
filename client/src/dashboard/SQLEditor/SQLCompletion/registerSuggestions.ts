
import type { SQLHandler } from "prostgles-types";
import type { editor, IDisposable, Monaco, Position, languages } from "../../W_SQL/monacoEditorTypes";
import { getFormattedSql } from "../getFormattedSql";
import type { SQLSuggestion } from "../SQLEditor";
import { LANG } from "../SQLEditor";
import { getKeywordDocumentation } from "../SQLEditorSuggestions";
import type { CodeBlock } from "./completionUtils/getCodeBlock";
import { getCurrentCodeBlock } from "./completionUtils/getCodeBlock";
import { getMatch } from "./getMatch";
import { isObject } from "../../../../../commonTypes/publishUtils";
import { isDefined } from "../../../utils";

/**
 * Mobile devices can't press Ctrl + Space. Use space instead
 */
export const triggerCharacters = [".", " ", "/", "?", "\\" ] as const;

export type MonacoSuggestion = PRGLMetaInfo & languages.CompletionItem & Pick<SQLSuggestion, "dataTypeInfo">;
export type ParsedSQLSuggestion = MonacoSuggestion & Omit<SQLSuggestion, "documentation">;

export type SQLMatchContext = {
  cb: CodeBlock;
  ss: ParsedSQLSuggestion[]; 
  setS: ParsedSQLSuggestion[]; 
  sql: SQLHandler | undefined;
}
export type GetKind = (type: SQLSuggestion["type"]) => number;
export type SuggestionItem = languages.CompletionItem | MonacoSuggestion | ParsedSQLSuggestion;
export type SQLMatcherResultType = { 
  suggestions: SuggestionItem[] 
};
export type SQLMatcherResultArgs = SQLMatchContext & {
  /** Used for lateral join subquery which can use columns from previous tables */
  parentCb?: CodeBlock;
  options?: {
    MatchSelect?: {
      excludeInto?: boolean;
    }
  }
};
export type SQLMatcher = {
  match: (cb: CodeBlock) => boolean;
  result: (args: SQLMatcherResultArgs) => Promise<SQLMatcherResultType>
}

type PRGLMetaInfo = {
  escapedParentName?: string;
  schema?: string;
}



type Kind = {
  Class: number;
  Color: number;
  Constant: number;
  Constructor: number;
  Customcolor: number;
  Enum: number;
  EnumMember: number;
  Event: number;
  Field: number;
  File: number;
  Folder: number;
  Function: number;
  Interface: number;
  Issue: number;
  Keyword: number;
  Method: number;
  Module: number;
  Operator: number;
  Property: number;
  Reference: number;
  Snippet: number;
  Struct: number;
  Text: number;
  TypeParameter: number;
  Unit: number;
  User: number;
  Value: number;
  Variable: number;
}
 
let sqlHoverProvider: IDisposable | undefined;

/**
 * Used to ensure connecting to other databases will show the correct suggestions
 */
let sqlCompletionProvider: IDisposable | undefined;
let sqlFormattingProvider: IDisposable | undefined;
type Args = { 
  suggestions: SQLSuggestion[]; 
  settingSuggestions: SQLSuggestion[]; 
  sql?: SQLHandler, editor: editor.IStandaloneCodeEditor;
  monaco: Monaco;
};


export let KNDS: Kind = {} as any;

export function registerSuggestions(args: Args) {
  const { suggestions, settingSuggestions, sql, monaco } = args;
  const s = suggestions;
  KNDS = monaco.languages.CompletionItemKind;

  const provideCompletionItems = async (model: editor.ITextModel, position: Position, context: languages.CompletionContext): Promise<{ suggestions: (MonacoSuggestion | languages.CompletionItem)[] }> => {

    /* TODO Add type checking within for func arg types && table cols && func return types*/
    function parseSuggestions(sugests: SQLSuggestion[]): ParsedSQLSuggestion[] {
      return sugests.map((s, i) => {

        const res: ParsedSQLSuggestion = {
          ...s,
          range: undefined as any,
          kind: getKind(s.type),
          insertText: (s.insertText || s.name), // + (s.type === "function" ? " " : ""),
          detail: s.detail || `(${s.type})`,
          type: s.type,
          escapedParentName: s.escapedParentName,
          documentation: {
            value: s.documentation || `${s.type} ${s.detail || ""}`,
          },
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }


        const info = getKeywordDocumentation(s.name);
        if (info) {
          res.documentation = {
            value: info
          }
        }

        return res;
      });
    }
    const ss = parseSuggestions(s);

    const setS = parseSuggestions(settingSuggestions);
    
    const cBlock = await getCurrentCodeBlock(model, position);
    const isFormattingCode = context.triggerCharacter === "\n" && cBlock.thisLineLC.length > 0;
    const isCommenting = cBlock.currToken?.type === "comment.sql"
    if(isFormattingCode || isCommenting){
      return { suggestions: [] };
    }

    const { firstTry, match } = await getMatch({ cb: cBlock, ss, setS, sql });
    if(firstTry){
      return firstTry
    } else if(match) {
      const res = await match.result({ cb: cBlock, ss, setS, sql });
      return res
    }

    const suggestions = ss.filter(s => s.topKwd?.start_kwd)
      .map(s => ({
        ...s,
        sortText: `a${s.topKwd!.priority ?? 99}`
      }));
    
    return {
      suggestions
    }

  }

  sqlFormattingProvider?.dispose();
  sqlFormattingProvider = monaco.languages.registerDocumentFormattingEditProvider(LANG, {
    displayName: "SQL",
    provideDocumentFormattingEdits: async (model) => {
      const newText = await getFormattedSql(model);
      return [{
        range: model.getFullModelRange(),
        text: newText
      }]
    }
  });

  sqlHoverProvider?.dispose();
  sqlHoverProvider = monaco.languages.registerHoverProvider(LANG, {
    provideHover: async function (model, position, token, context) {
      const curWord = model.getWordAtPosition(position);

      if(curWord && s.length){
        const startOfWordPosition = new monaco.Position(position.lineNumber, curWord.startColumn);
        const justAfterStartOfWordPosition = new monaco.Position(position.lineNumber, curWord.startColumn + 1);
        const offset = model.getOffsetAt(startOfWordPosition);
        const modelValue = model.getValue();
        /* set current word to empty string to get all suggestions */
        const val = modelValue.slice(0, offset) + " " + modelValue.slice(offset + curWord.word.length);
        const newModel = monaco.editor.createModel(val, LANG);
        const { suggestions } = await provideCompletionItems(
          newModel, 
          justAfterStartOfWordPosition, 
          { triggerKind: monaco.languages.CompletionTriggerKind.Invoke, triggerCharacter: " " }
        );
        const [_matchingSuggestion, other] = suggestions.filter(s => 
          s.insertText === curWord.word || 
          s.insertText.toLowerCase() === curWord.word.toLowerCase() ||
          (s as ParsedSQLSuggestion).escapedIdentifier === curWord.word
        );
        const matchingSuggestion = !other? _matchingSuggestion : undefined;
        const sm = matchingSuggestion ?? s
          .find(s => s.type === "keyword" && s.name === curWord.word.toUpperCase());

        if(sm){
          const detail = "detail" in sm? sm.detail : "";
          const documentationText = isObject(sm.documentation)? sm.documentation.value : typeof sm.documentation === "string"? sm.documentation : "";
          return {
            range: new monaco.Range(position.lineNumber, curWord.startColumn, position.lineNumber, curWord.endColumn),
            contents: [
              !detail? undefined : { value: `**${detail}**` },
              { value: documentationText },
              // { value: '![my image](https://fdvsdfffdgdgdfg.com/favicon.ico)' }
            ].filter(isDefined)
          }
        }

        return {
          contents: []
        }
      }
    }
  });

  sqlCompletionProvider?.dispose();
  sqlCompletionProvider = monaco.languages.registerCompletionItemProvider(LANG, {
    triggerCharacters: triggerCharacters.slice(0),
    provideCompletionItems: async (model, position, context): Promise<{ suggestions: (MonacoSuggestion | languages.CompletionItem)[] }> => {
      return provideCompletionItems(model, position, context);
    }
  });
}
export const getKind = (type: SQLSuggestion["type"]): number => {
  // return KNDS.Text
  if (type === "function") {
    return KNDS.Function
  } else if (type === "column") {
    return KNDS.Field
  } else if (type === "table") {
      return KNDS.EnumMember
  } else if (type === "view" || type === "mview") {
    return KNDS.Value // return KNDS.Constant
  } else if (type === "dataType") {
    return KNDS.Variable
  } else if (type === "operator") {
    return KNDS.Operator
  } else if (type === "keyword") {
    return KNDS.Keyword
  } else if (type === "extension") {
    return KNDS.Module
  } else if (type === "schema") {
    return KNDS.Folder
  } else if (type === "setting") {
    return KNDS.Property
  } else if (type === "folder") {
    return KNDS.Folder
  } else if (type === "file") {
    return KNDS.File
  } else if (type === "snippet") {
    return KNDS.Snippet
  } else if (type === "database") {
    return KNDS.Struct
  } else if (type === "role" || type === "policy") {
    return KNDS.User
  } else if (type === "trigger" || type === "eventTrigger") {
    return KNDS.Event
  }
  return KNDS.Keyword
}
 
export function isUpperCase(str) {
  return str == str.toUpperCase() && str != str.toLowerCase();
}