import { isDefined } from "prostgles-types";
import { CodeBlock, getCurrentNestingOffsetLimits } from "./completionUtils/getCodeBlock";
import { SQLSuggestion } from "../SQLEditor";
import { MinimalSnippet, suggestSnippets } from "./CommonMatchImports";
import { getExpected } from "./getExpected";
import { GetKind, ParsedSQLSuggestion } from "./registerSuggestions";

type ExpectString = SQLSuggestion["type"] | "condition" | "number" | "string";
export type KWD = { 
  kwd: string;
  expects?: ExpectString | `(${ExpectString})` | readonly ExpectString[];
  options?: readonly MinimalSnippet[] | readonly string[] | ((ss: ParsedSQLSuggestion[]) => ParsedSQLSuggestion[]);

  justAfter?: readonly string[];
  /**
   * Will only show exactly after the specified token text
   */
  exactlyAfter?: readonly string[];
  
  excludeIf?: readonly string[] | ((cb: CodeBlock) => boolean);
  /**
   * Will only show if prevText contains this text with spaces on each side
   */
  dependsOn?: string;

  /**
   * Will only show if nextText contains this text with spaces on each side
   */
  dependsOnAfter?: string;
  docs?: string;
  canRepeat?: boolean;

  include?: (cb: CodeBlock) => boolean;

  /**
   * If true will show a label text with "optional"
   */
  optional?: boolean;
}

type Opts = {
  notOrdered?: boolean;
  /** Keyword where prevText starts from */
  topResetKwd?: string;
}

export const withKWDs = <KWDD extends KWD>(
  kwds: readonly KWDD[], 
  cb: CodeBlock,
  getKind: GetKind,
  ss: ParsedSQLSuggestion[],
  opts?: Opts
): {
  suggestKWD: (vals: string[], sortText?: string) => {
    suggestions: ParsedSQLSuggestion[];
  },
  prevKWD: KWDD | undefined;
  prevIdentifiers: string[];
  remainingKWDS: (KWDD & { docs?: string; sortText: string; })[];
  getSuggestion: (delimiter?: string, excludeIf?: string[]) => {
    suggestions: ParsedSQLSuggestion[];
  };
} => {
  const { notOrdered = false, topResetKwd } = opts ?? {};
 
  const currNestingId = cb.currNestingId;
  const currNestLimits = getCurrentNestingOffsetLimits(cb);
  const currNestingTokens = cb.tokens.filter(t => 
    currNestLimits?.isEmpty === false? ( t.offset >= currNestLimits.limits[0] && t.end <= currNestLimits.limits[1] ) : 
    currNestingId === t.nestingId
  );
  const startIndex = !topResetKwd? 0 : currNestingTokens.slice(0).map((t, idx) => ({ ...t, idx }))
    .findLast(t => t.offset <= cb.offset && t.textLC === topResetKwd.toLowerCase())?.idx;

  let usedKeywords = kwds.flatMap((kwd, kwdIdx) => {
    const kwdWords = kwd.kwd.split(" ");
    const matchedStartingIndexes: number[] = [];
    currNestingTokens.forEach((t, i) => {
      if(kwdWords.every((kWord, kWordIdx) => {
        return currNestingTokens[i + kWordIdx]?.text.toUpperCase() === kWord;
      })){
        matchedStartingIndexes.push(i);
      }
    })
    
    return matchedStartingIndexes.map(startingTokenIdx => {
      const startingToken = currNestingTokens[startingTokenIdx];
      if(!startingToken) return undefined;
      const inputTokens = cb.tokens.filter(t => t.offset > startingToken.offset + kwd.kwd.length);
      const start = startingToken.offset;
      const end = startingToken.offset + kwd.kwd.length;
      return {
        kwd,
        kwdIdx,
        startingToken,
        inputTokens,
        start,
        end,
        length: kwd.kwd.length
      }
    });
  }).filter(isDefined);
  
  /** Remove smaller overlapping kwds (JOIN vs LEFT JOIN) */
  usedKeywords = usedKeywords.filter(k => {
    return !usedKeywords.some(longerOverlapping => 
      k.start < longerOverlapping.end && 
      longerOverlapping.start < k.end && 
      longerOverlapping.length > k.length  
    );
  }).sort((a, b) => a.start - b.start);
  const prevKWDTokens = usedKeywords.filter(k => k.startingToken.offset <= cb.offset);
  
  const prevTokens = cb.tokens.slice(startIndex).filter(t => t.offset < cb.offset && currNestingId === t.nestingId);
  const nextTokens = cb.tokens.filter(t => t.offset >= cb.offset && currNestingId === t.nestingId);

  const prevKWDFull = prevKWDTokens.at(-1);
  const prevKWD = prevKWDFull?.kwd
  const prevKWDToken = prevKWDTokens.at(-1)?.startingToken;

  const prevKWDTokenIdx = prevTokens.findIndex(t => t.offset === prevKWDToken?.offset);
  const prevIdentifiers = prevTokens.slice(prevKWDTokenIdx).filter(t => t.type === "identifier.sql").map(t => t.text);


  const prevText = prevTokens.map(t => t.text).join(" "); 
  
  const prevUsedKwd = usedKeywords.findLast(uk => uk.startingToken.offset <= cb.offset && !uk.kwd.canRepeat);
  const nextUsedKwd = usedKeywords.find(uk => uk.startingToken.offset > cb.offset && !uk.kwd.canRepeat);
  let _remainingKWDS = (notOrdered? kwds.slice(0) : kwds.slice((prevUsedKwd?.kwdIdx ?? -1) + 1, nextUsedKwd?.kwd? nextUsedKwd.kwdIdx : kwds.length));
  
  _remainingKWDS = _remainingKWDS.filter(k => {
    const show = k.canRepeat || !usedKeywords.some(({ kwd })=> k.kwd === kwd.kwd)
    return show;
  });
  _remainingKWDS = _remainingKWDS.filter(k => {
    let show = true as boolean;
    if(k.justAfter){
      show = show && prevTokens.some(t => k.justAfter?.includes(t.text.toUpperCase() as never))
    }
    const prevTextIncludes = (v: string) => ` ${prevText.toLowerCase()} `.includes(` ${v.toLowerCase()} `) || prevText.toLowerCase().startsWith(`${v.toLowerCase()} `)
    if(k.dependsOn){
      show = show && prevTextIncludes(k.dependsOn);
    }
    if(k.dependsOnAfter){
      show = show && prevTextIncludes(k.dependsOnAfter);
    }

    if(k.excludeIf){
      const { excludeIf } = k;
      show = show && !(typeof excludeIf === "function"? excludeIf(cb) : prevTokens.some(t => excludeIf.includes(t.text)))
    }

    if(k.exactlyAfter?.length){
      show = cb.ltoken?.textLC === k.kwd.toLowerCase();
    }

    if(k.include){
      show = k.include(cb);
    }

    return show;
  });
  if(_remainingKWDS.some(k =>  prevKWD?.kwd && k.justAfter?.includes(prevKWD.kwd as never))){
    _remainingKWDS = _remainingKWDS.filter(k => 
      k.justAfter && 
      /** Remove used matching justAfter */
      !prevKWDTokens.some(pkwd => pkwd.kwd.justAfter?.some(pja => k.justAfter?.includes(pja)) )
    );
  }

  const remainingKWDS = _remainingKWDS.map(rk => ({
    ...rk,
    sortText: kwds.findIndex(_k => _k.kwd === rk.kwd).toString().padStart(2, "0"),
    docs: rk.docs || ss.find(s => s.name === rk.kwd && s.documentation)?.documentation
  }))

  return {
    suggestKWD: (vals, sortText) => suggestKWD(getKind, vals, sortText),
    prevKWD,
    prevIdentifiers,
    remainingKWDS,
    getSuggestion: (delimiter?: string, excludeIf?: string[]): {
      suggestions: ParsedSQLSuggestion[];
    } => {

      if(cb.currToken?.text === ";"){
        return { suggestions: [] };
      }

      const [firstInputToken] = (prevKWDFull?.inputTokens ?? []).filter(t => t.type !== "delimiter.parenthesis.sql" && t.end <= cb.currOffset);
      const prevKWDMissingInput = prevKWD && (!firstInputToken || kwds.some(k => k.kwd.toLowerCase() === firstInputToken.textLC) || cb.currToken)
      if((prevKWD?.expects || prevKWD?.options) && prevKWDMissingInput){
        
        let firstSuggestions: ParsedSQLSuggestion[] = [];
        if(prevKWD.options){
          const { options } = prevKWD;
          if(Array.isArray(options)){
            const options1 = options.map(o => typeof o === "string"? ({ label: o }) : o);
            const minimalSnippets = options1.filter(o => !o.type)
            const parsedSuggestions = options1.filter(o => o.type)
            firstSuggestions = suggestSnippets(minimalSnippets).suggestions.concat(parsedSuggestions);
          } else if(typeof options === "function") {
            firstSuggestions = options(ss);
          }
        }

        const expectedSuggestions = !prevKWD.expects? [] : getExpected(prevKWD.expects, cb, ss).suggestions;
        if(firstSuggestions.length || expectedSuggestions.length){

          return {
            suggestions: [
              ...firstSuggestions.map(s => ({ ...s, sortText: "0" })),
              ...expectedSuggestions.map(s => ({
                ...s,
                sortText: (cb.prevTokens.some(prevT => s.insertText === prevT.text )? "b" : "a") + (s.sortText ?? ""),
              }))
            ]
          };
        }
      }

      return suggestSnippets(remainingKWDS.map(k => {
        const insertText = (
          delimiter && 
          ![...(excludeIf ?? []), delimiter]
            .some(t => cb.ltoken?.text.trim().endsWith(t))? delimiter : "") + 
            k.kwd;

        return { 
          label: { label: k.kwd, detail: k.optional? " (optional)" : undefined }, 
          docs: k.docs || ss.find(s => s.name === k.kwd && s.documentation)?.documentation, 
          insertText,
          kind: getKind("keyword"),
          sortText: k.sortText
        }
      }));
    }
  }
}


export const suggestKWD = (getKind: GetKind, vals: string[], sortText?: string) => suggestSnippets(vals.map((label, idx) => ({ 
  label, 
  sortText: sortText ?? (idx + ""), 
  insertText: label, 
  kind: getKind("keyword"),
  // docs: ss?.find(s => s.name === label && s.documentation)?.documentation 
})));
