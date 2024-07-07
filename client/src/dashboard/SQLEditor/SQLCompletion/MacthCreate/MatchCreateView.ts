import {
  suggestSnippets,
  type MinimalSnippet
} from "../CommonMatchImports";
import { MatchSelect } from "../MatchSelect";
import { ENCODINGS } from "../PSQL";
import type { SQLMatcherResultArgs } from "../registerSuggestions";
import { withKWDs, type KWD } from "../withKWDs";

export const matchCreateView = async (args: SQLMatcherResultArgs) => { 
  const {cb, ss, setS, sql } = args;

  if(cb.prevTokens.some(t => t.textLC === "select")){
    return MatchSelect.result({cb, ss, setS, sql });
  }
  if(cb.prevLC.endsWith(" as") && cb.prevTokens.length < 5){
    return suggestSnippets([{ label: "SELECT" }]);
  }

  const withOptions = [
    { label: "check_option", 
      options: [
        { 
          label: "=cascaded",
          docs: `New rows are checked against the conditions of the view and all underlying base views. If the CHECK OPTION is specified, and neither LOCAL nor CASCADED is specified, then CASCADED is assumed.`
        }, 
        { 
          label: "=local",
          docs: `New rows are only checked against the conditions defined directly in the view itself. Any conditions defined on underlying base views are not checked (unless they also specify the CHECK OPTION).`
        }
      ], 
      docs: "Specifies the level of checking to be done on data changes to the view. The options are LOCAL and CASCADED." 
    },
    { label: "security_barrier", options: [{ label: "=true" }, { label: "=false" }], docs: `This should be used if the view is intended to provide row-level security` },
    { label: "security_invoker", options: [{ label: "=true" }, { label: "=false" }], docs: `This option causes the underlying base relations to be checked against the privileges of the user of the view rather than the view owner. See the notes below for full details.`},
  ] satisfies readonly (MinimalSnippet & { options: MinimalSnippet[] })[];

  if(cb.currNestingFunc?.textLC === "with" && cb.currNestingId.length === 1){
    const tokensBeforeWith = cb.tokens.filter(t => t.offset < cb.currNestingFunc!.offset);
    if(tokensBeforeWith.at(-2)?.textLC === "view" && tokensBeforeWith.length < 5){
      return withKWDs(
        withOptions.map(o => ({
          kwd: o.label,
          options: o.options,
          docs: o.docs
        })), 
        { sql, cb, ss, setS }, 
      ).getSuggestion(",");
    }
  }
  if(cb.l1token?.textLC === "view"){
    const res = await withKWDs(
      [
        { kwd: "AS", docs: "The SELECT statement that will be used to create the view." }, 
        { 
          kwd: "WITH", 
          docs: "This clause specifies optional parameters for a view",
          options: withOptions
        }
      ] satisfies KWD[], 
      { sql, cb, ss, setS, opts: { notOrdered: true } }
    ).getSuggestion();
    return res;
  } 
} 