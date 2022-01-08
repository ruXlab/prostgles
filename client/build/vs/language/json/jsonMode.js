/*! For license information please see jsonMode.js.LICENSE.txt */
define("vs/language/json/jsonMode",[],(()=>(()=>{var e,t,n=Object.create,r=Object.defineProperty,i=Object.getOwnPropertyDescriptor,o=Object.getOwnPropertyNames,a=Object.getPrototypeOf,s=Object.prototype.hasOwnProperty,c=e=>r(e,"__esModule",{value:!0}),u=(e,t,n)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let a of o(t))!s.call(e,a)&&"default"!==a&&r(e,a,{get:()=>t[a],enumerable:!(n=i(t,a))||n.enumerable});return e},d=(e=(e,t)=>{t.exports=self.monaco},()=>(t||e(t={exports:{}},t),t.exports)),l={};((e,t)=>{for(var n in c(e),t)r(e,n,{get:t[n],enumerable:!0})})(l,{setupMode:()=>tt});var g,f,h,p,m,v,b,k,C,_,w,y,E,x,A,I,S,T,j,O,L,M,R,P,F,D,N={};c(N),u(N,(e=>u(c(r(null!=e?n(a(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e))(d())),function(e){e.MIN_VALUE=-2147483648,e.MAX_VALUE=2147483647}(g||(g={})),function(e){e.MIN_VALUE=0,e.MAX_VALUE=2147483647}(f||(f={})),function(e){e.create=function(e,t){return e===Number.MAX_VALUE&&(e=f.MAX_VALUE),t===Number.MAX_VALUE&&(t=f.MAX_VALUE),{line:e,character:t}},e.is=function(e){var t=e;return be.objectLiteral(t)&&be.uinteger(t.line)&&be.uinteger(t.character)}}(h||(h={})),function(e){e.create=function(e,t,n,r){if(be.uinteger(e)&&be.uinteger(t)&&be.uinteger(n)&&be.uinteger(r))return{start:h.create(e,t),end:h.create(n,r)};if(h.is(e)&&h.is(t))return{start:e,end:t};throw new Error("Range#create called with invalid arguments["+e+", "+t+", "+n+", "+r+"]")},e.is=function(e){var t=e;return be.objectLiteral(t)&&h.is(t.start)&&h.is(t.end)}}(p||(p={})),function(e){e.create=function(e,t){return{uri:e,range:t}},e.is=function(e){var t=e;return be.defined(t)&&p.is(t.range)&&(be.string(t.uri)||be.undefined(t.uri))}}(m||(m={})),function(e){e.create=function(e,t,n,r){return{targetUri:e,targetRange:t,targetSelectionRange:n,originSelectionRange:r}},e.is=function(e){var t=e;return be.defined(t)&&p.is(t.targetRange)&&be.string(t.targetUri)&&(p.is(t.targetSelectionRange)||be.undefined(t.targetSelectionRange))&&(p.is(t.originSelectionRange)||be.undefined(t.originSelectionRange))}}(v||(v={})),function(e){e.create=function(e,t,n,r){return{red:e,green:t,blue:n,alpha:r}},e.is=function(e){var t=e;return be.numberRange(t.red,0,1)&&be.numberRange(t.green,0,1)&&be.numberRange(t.blue,0,1)&&be.numberRange(t.alpha,0,1)}}(b||(b={})),function(e){e.create=function(e,t){return{range:e,color:t}},e.is=function(e){var t=e;return p.is(t.range)&&b.is(t.color)}}(k||(k={})),function(e){e.create=function(e,t,n){return{label:e,textEdit:t,additionalTextEdits:n}},e.is=function(e){var t=e;return be.string(t.label)&&(be.undefined(t.textEdit)||T.is(t))&&(be.undefined(t.additionalTextEdits)||be.typedArray(t.additionalTextEdits,T.is))}}(C||(C={})),function(e){e.Comment="comment",e.Imports="imports",e.Region="region"}(_||(_={})),function(e){e.create=function(e,t,n,r,i){var o={startLine:e,endLine:t};return be.defined(n)&&(o.startCharacter=n),be.defined(r)&&(o.endCharacter=r),be.defined(i)&&(o.kind=i),o},e.is=function(e){var t=e;return be.uinteger(t.startLine)&&be.uinteger(t.startLine)&&(be.undefined(t.startCharacter)||be.uinteger(t.startCharacter))&&(be.undefined(t.endCharacter)||be.uinteger(t.endCharacter))&&(be.undefined(t.kind)||be.string(t.kind))}}(w||(w={})),function(e){e.create=function(e,t){return{location:e,message:t}},e.is=function(e){var t=e;return be.defined(t)&&m.is(t.location)&&be.string(t.message)}}(y||(y={})),function(e){e.Error=1,e.Warning=2,e.Information=3,e.Hint=4}(E||(E={})),function(e){e.Unnecessary=1,e.Deprecated=2}(x||(x={})),function(e){e.is=function(e){var t=e;return null!=t&&be.string(t.href)}}(A||(A={})),function(e){e.create=function(e,t,n,r,i,o){var a={range:e,message:t};return be.defined(n)&&(a.severity=n),be.defined(r)&&(a.code=r),be.defined(i)&&(a.source=i),be.defined(o)&&(a.relatedInformation=o),a},e.is=function(e){var t,n=e;return be.defined(n)&&p.is(n.range)&&be.string(n.message)&&(be.number(n.severity)||be.undefined(n.severity))&&(be.integer(n.code)||be.string(n.code)||be.undefined(n.code))&&(be.undefined(n.codeDescription)||be.string(null===(t=n.codeDescription)||void 0===t?void 0:t.href))&&(be.string(n.source)||be.undefined(n.source))&&(be.undefined(n.relatedInformation)||be.typedArray(n.relatedInformation,y.is))}}(I||(I={})),function(e){e.create=function(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var i={title:e,command:t};return be.defined(n)&&n.length>0&&(i.arguments=n),i},e.is=function(e){var t=e;return be.defined(t)&&be.string(t.title)&&be.string(t.command)}}(S||(S={})),function(e){e.replace=function(e,t){return{range:e,newText:t}},e.insert=function(e,t){return{range:{start:e,end:e},newText:t}},e.del=function(e){return{range:e,newText:""}},e.is=function(e){var t=e;return be.objectLiteral(t)&&be.string(t.newText)&&p.is(t.range)}}(T||(T={})),function(e){e.create=function(e,t,n){var r={label:e};return void 0!==t&&(r.needsConfirmation=t),void 0!==n&&(r.description=n),r},e.is=function(e){var t=e;return void 0!==t&&be.objectLiteral(t)&&be.string(t.label)&&(be.boolean(t.needsConfirmation)||void 0===t.needsConfirmation)&&(be.string(t.description)||void 0===t.description)}}(j||(j={})),function(e){e.is=function(e){return"string"==typeof e}}(O||(O={})),function(e){e.replace=function(e,t,n){return{range:e,newText:t,annotationId:n}},e.insert=function(e,t,n){return{range:{start:e,end:e},newText:t,annotationId:n}},e.del=function(e,t){return{range:e,newText:"",annotationId:t}},e.is=function(e){var t=e;return T.is(t)&&(j.is(t.annotationId)||O.is(t.annotationId))}}(L||(L={})),function(e){e.create=function(e,t){return{textDocument:e,edits:t}},e.is=function(e){var t=e;return be.defined(t)&&V.is(t.textDocument)&&Array.isArray(t.edits)}}(M||(M={})),function(e){e.create=function(e,t,n){var r={kind:"create",uri:e};return void 0!==t&&(void 0!==t.overwrite||void 0!==t.ignoreIfExists)&&(r.options=t),void 0!==n&&(r.annotationId=n),r},e.is=function(e){var t=e;return t&&"create"===t.kind&&be.string(t.uri)&&(void 0===t.options||(void 0===t.options.overwrite||be.boolean(t.options.overwrite))&&(void 0===t.options.ignoreIfExists||be.boolean(t.options.ignoreIfExists)))&&(void 0===t.annotationId||O.is(t.annotationId))}}(R||(R={})),function(e){e.create=function(e,t,n,r){var i={kind:"rename",oldUri:e,newUri:t};return void 0!==n&&(void 0!==n.overwrite||void 0!==n.ignoreIfExists)&&(i.options=n),void 0!==r&&(i.annotationId=r),i},e.is=function(e){var t=e;return t&&"rename"===t.kind&&be.string(t.oldUri)&&be.string(t.newUri)&&(void 0===t.options||(void 0===t.options.overwrite||be.boolean(t.options.overwrite))&&(void 0===t.options.ignoreIfExists||be.boolean(t.options.ignoreIfExists)))&&(void 0===t.annotationId||O.is(t.annotationId))}}(P||(P={})),function(e){e.create=function(e,t,n){var r={kind:"delete",uri:e};return void 0!==t&&(void 0!==t.recursive||void 0!==t.ignoreIfNotExists)&&(r.options=t),void 0!==n&&(r.annotationId=n),r},e.is=function(e){var t=e;return t&&"delete"===t.kind&&be.string(t.uri)&&(void 0===t.options||(void 0===t.options.recursive||be.boolean(t.options.recursive))&&(void 0===t.options.ignoreIfNotExists||be.boolean(t.options.ignoreIfNotExists)))&&(void 0===t.annotationId||O.is(t.annotationId))}}(F||(F={})),function(e){e.is=function(e){var t=e;return t&&(void 0!==t.changes||void 0!==t.documentChanges)&&(void 0===t.documentChanges||t.documentChanges.every((function(e){return be.string(e.kind)?R.is(e)||P.is(e)||F.is(e):M.is(e)})))}}(D||(D={}));var U,W,V,B,K,z,q,H,X,$,Q,G,J,Y,Z,ee,te,ne,re,ie,oe,ae,se,ce,ue,de,le,ge,fe,he,pe,me=function(){function e(e,t){this.edits=e,this.changeAnnotations=t}return e.prototype.insert=function(e,t,n){var r,i;if(void 0===n?r=T.insert(e,t):O.is(n)?(i=n,r=L.insert(e,t,n)):(this.assertChangeAnnotations(this.changeAnnotations),i=this.changeAnnotations.manage(n),r=L.insert(e,t,i)),this.edits.push(r),void 0!==i)return i},e.prototype.replace=function(e,t,n){var r,i;if(void 0===n?r=T.replace(e,t):O.is(n)?(i=n,r=L.replace(e,t,n)):(this.assertChangeAnnotations(this.changeAnnotations),i=this.changeAnnotations.manage(n),r=L.replace(e,t,i)),this.edits.push(r),void 0!==i)return i},e.prototype.delete=function(e,t){var n,r;if(void 0===t?n=T.del(e):O.is(t)?(r=t,n=L.del(e,t)):(this.assertChangeAnnotations(this.changeAnnotations),r=this.changeAnnotations.manage(t),n=L.del(e,r)),this.edits.push(n),void 0!==r)return r},e.prototype.add=function(e){this.edits.push(e)},e.prototype.all=function(){return this.edits},e.prototype.clear=function(){this.edits.splice(0,this.edits.length)},e.prototype.assertChangeAnnotations=function(e){if(void 0===e)throw new Error("Text edit change is not configured to manage change annotations.")},e}(),ve=function(){function e(e){this._annotations=void 0===e?Object.create(null):e,this._counter=0,this._size=0}return e.prototype.all=function(){return this._annotations},Object.defineProperty(e.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),e.prototype.manage=function(e,t){var n;if(O.is(e)?n=e:(n=this.nextId(),t=e),void 0!==this._annotations[n])throw new Error("Id "+n+" is already in use.");if(void 0===t)throw new Error("No annotation provided for id "+n);return this._annotations[n]=t,this._size++,n},e.prototype.nextId=function(){return this._counter++,this._counter.toString()},e}();!function(){function e(e){var t=this;this._textEditChanges=Object.create(null),void 0!==e?(this._workspaceEdit=e,e.documentChanges?(this._changeAnnotations=new ve(e.changeAnnotations),e.changeAnnotations=this._changeAnnotations.all(),e.documentChanges.forEach((function(e){if(M.is(e)){var n=new me(e.edits,t._changeAnnotations);t._textEditChanges[e.textDocument.uri]=n}}))):e.changes&&Object.keys(e.changes).forEach((function(n){var r=new me(e.changes[n]);t._textEditChanges[n]=r}))):this._workspaceEdit={}}Object.defineProperty(e.prototype,"edit",{get:function(){return this.initDocumentChanges(),void 0!==this._changeAnnotations&&(0===this._changeAnnotations.size?this._workspaceEdit.changeAnnotations=void 0:this._workspaceEdit.changeAnnotations=this._changeAnnotations.all()),this._workspaceEdit},enumerable:!1,configurable:!0}),e.prototype.getTextEditChange=function(e){if(V.is(e)){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var t={uri:e.uri,version:e.version};if(!(r=this._textEditChanges[t.uri])){var n={textDocument:t,edits:i=[]};this._workspaceEdit.documentChanges.push(n),r=new me(i,this._changeAnnotations),this._textEditChanges[t.uri]=r}return r}if(this.initChanges(),void 0===this._workspaceEdit.changes)throw new Error("Workspace edit is not configured for normal text edit changes.");var r;if(!(r=this._textEditChanges[e])){var i=[];this._workspaceEdit.changes[e]=i,r=new me(i),this._textEditChanges[e]=r}return r},e.prototype.initDocumentChanges=function(){void 0===this._workspaceEdit.documentChanges&&void 0===this._workspaceEdit.changes&&(this._changeAnnotations=new ve,this._workspaceEdit.documentChanges=[],this._workspaceEdit.changeAnnotations=this._changeAnnotations.all())},e.prototype.initChanges=function(){void 0===this._workspaceEdit.documentChanges&&void 0===this._workspaceEdit.changes&&(this._workspaceEdit.changes=Object.create(null))},e.prototype.createFile=function(e,t,n){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var r,i,o;if(j.is(t)||O.is(t)?r=t:n=t,void 0===r?i=R.create(e,n):(o=O.is(r)?r:this._changeAnnotations.manage(r),i=R.create(e,n,o)),this._workspaceEdit.documentChanges.push(i),void 0!==o)return o},e.prototype.renameFile=function(e,t,n,r){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var i,o,a;if(j.is(n)||O.is(n)?i=n:r=n,void 0===i?o=P.create(e,t,r):(a=O.is(i)?i:this._changeAnnotations.manage(i),o=P.create(e,t,r,a)),this._workspaceEdit.documentChanges.push(o),void 0!==a)return a},e.prototype.deleteFile=function(e,t,n){if(this.initDocumentChanges(),void 0===this._workspaceEdit.documentChanges)throw new Error("Workspace edit is not configured for document changes.");var r,i,o;if(j.is(t)||O.is(t)?r=t:n=t,void 0===r?i=F.create(e,n):(o=O.is(r)?r:this._changeAnnotations.manage(r),i=F.create(e,n,o)),this._workspaceEdit.documentChanges.push(i),void 0!==o)return o}}(),function(e){e.create=function(e){return{uri:e}},e.is=function(e){var t=e;return be.defined(t)&&be.string(t.uri)}}(U||(U={})),function(e){e.create=function(e,t){return{uri:e,version:t}},e.is=function(e){var t=e;return be.defined(t)&&be.string(t.uri)&&be.integer(t.version)}}(W||(W={})),function(e){e.create=function(e,t){return{uri:e,version:t}},e.is=function(e){var t=e;return be.defined(t)&&be.string(t.uri)&&(null===t.version||be.integer(t.version))}}(V||(V={})),function(e){e.create=function(e,t,n,r){return{uri:e,languageId:t,version:n,text:r}},e.is=function(e){var t=e;return be.defined(t)&&be.string(t.uri)&&be.string(t.languageId)&&be.integer(t.version)&&be.string(t.text)}}(B||(B={})),function(e){e.PlainText="plaintext",e.Markdown="markdown"}(K||(K={})),function(e){e.is=function(t){var n=t;return n===e.PlainText||n===e.Markdown}}(K||(K={})),function(e){e.is=function(e){var t=e;return be.objectLiteral(e)&&K.is(t.kind)&&be.string(t.value)}}(z||(z={})),function(e){e.Text=1,e.Method=2,e.Function=3,e.Constructor=4,e.Field=5,e.Variable=6,e.Class=7,e.Interface=8,e.Module=9,e.Property=10,e.Unit=11,e.Value=12,e.Enum=13,e.Keyword=14,e.Snippet=15,e.Color=16,e.File=17,e.Reference=18,e.Folder=19,e.EnumMember=20,e.Constant=21,e.Struct=22,e.Event=23,e.Operator=24,e.TypeParameter=25}(q||(q={})),function(e){e.PlainText=1,e.Snippet=2}(H||(H={})),function(e){e.Deprecated=1}(X||(X={})),function(e){e.create=function(e,t,n){return{newText:e,insert:t,replace:n}},e.is=function(e){var t=e;return t&&be.string(t.newText)&&p.is(t.insert)&&p.is(t.replace)}}($||($={})),function(e){e.asIs=1,e.adjustIndentation=2}(Q||(Q={})),function(e){e.create=function(e){return{label:e}}}(G||(G={})),function(e){e.create=function(e,t){return{items:e||[],isIncomplete:!!t}}}(J||(J={})),function(e){e.fromPlainText=function(e){return e.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")},e.is=function(e){var t=e;return be.string(t)||be.objectLiteral(t)&&be.string(t.language)&&be.string(t.value)}}(Y||(Y={})),function(e){e.is=function(e){var t=e;return!!t&&be.objectLiteral(t)&&(z.is(t.contents)||Y.is(t.contents)||be.typedArray(t.contents,Y.is))&&(void 0===e.range||p.is(e.range))}}(Z||(Z={})),function(e){e.create=function(e,t){return t?{label:e,documentation:t}:{label:e}}}(ee||(ee={})),function(e){e.create=function(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];var i={label:e};return be.defined(t)&&(i.documentation=t),be.defined(n)?i.parameters=n:i.parameters=[],i}}(te||(te={})),function(e){e.Text=1,e.Read=2,e.Write=3}(ne||(ne={})),function(e){e.create=function(e,t){var n={range:e};return be.number(t)&&(n.kind=t),n}}(re||(re={})),function(e){e.File=1,e.Module=2,e.Namespace=3,e.Package=4,e.Class=5,e.Method=6,e.Property=7,e.Field=8,e.Constructor=9,e.Enum=10,e.Interface=11,e.Function=12,e.Variable=13,e.Constant=14,e.String=15,e.Number=16,e.Boolean=17,e.Array=18,e.Object=19,e.Key=20,e.Null=21,e.EnumMember=22,e.Struct=23,e.Event=24,e.Operator=25,e.TypeParameter=26}(ie||(ie={})),function(e){e.Deprecated=1}(oe||(oe={})),function(e){e.create=function(e,t,n,r,i){var o={name:e,kind:t,location:{uri:r,range:n}};return i&&(o.containerName=i),o}}(ae||(ae={})),function(e){e.create=function(e,t,n,r,i,o){var a={name:e,detail:t,kind:n,range:r,selectionRange:i};return void 0!==o&&(a.children=o),a},e.is=function(e){var t=e;return t&&be.string(t.name)&&be.number(t.kind)&&p.is(t.range)&&p.is(t.selectionRange)&&(void 0===t.detail||be.string(t.detail))&&(void 0===t.deprecated||be.boolean(t.deprecated))&&(void 0===t.children||Array.isArray(t.children))&&(void 0===t.tags||Array.isArray(t.tags))}}(se||(se={})),function(e){e.Empty="",e.QuickFix="quickfix",e.Refactor="refactor",e.RefactorExtract="refactor.extract",e.RefactorInline="refactor.inline",e.RefactorRewrite="refactor.rewrite",e.Source="source",e.SourceOrganizeImports="source.organizeImports",e.SourceFixAll="source.fixAll"}(ce||(ce={})),function(e){e.create=function(e,t){var n={diagnostics:e};return null!=t&&(n.only=t),n},e.is=function(e){var t=e;return be.defined(t)&&be.typedArray(t.diagnostics,I.is)&&(void 0===t.only||be.typedArray(t.only,be.string))}}(ue||(ue={})),function(e){e.create=function(e,t,n){var r={title:e},i=!0;return"string"==typeof t?(i=!1,r.kind=t):S.is(t)?r.command=t:r.edit=t,i&&void 0!==n&&(r.kind=n),r},e.is=function(e){var t=e;return t&&be.string(t.title)&&(void 0===t.diagnostics||be.typedArray(t.diagnostics,I.is))&&(void 0===t.kind||be.string(t.kind))&&(void 0!==t.edit||void 0!==t.command)&&(void 0===t.command||S.is(t.command))&&(void 0===t.isPreferred||be.boolean(t.isPreferred))&&(void 0===t.edit||D.is(t.edit))}}(de||(de={})),function(e){e.create=function(e,t){var n={range:e};return be.defined(t)&&(n.data=t),n},e.is=function(e){var t=e;return be.defined(t)&&p.is(t.range)&&(be.undefined(t.command)||S.is(t.command))}}(le||(le={})),function(e){e.create=function(e,t){return{tabSize:e,insertSpaces:t}},e.is=function(e){var t=e;return be.defined(t)&&be.uinteger(t.tabSize)&&be.boolean(t.insertSpaces)}}(ge||(ge={})),function(e){e.create=function(e,t,n){return{range:e,target:t,data:n}},e.is=function(e){var t=e;return be.defined(t)&&p.is(t.range)&&(be.undefined(t.target)||be.string(t.target))}}(fe||(fe={})),function(e){e.create=function(e,t){return{range:e,parent:t}},e.is=function(t){var n=t;return void 0!==n&&p.is(n.range)&&(void 0===n.parent||e.is(n.parent))}}(he||(he={})),function(e){function t(e,n){if(e.length<=1)return e;var r=e.length/2|0,i=e.slice(0,r),o=e.slice(r);t(i,n),t(o,n);for(var a=0,s=0,c=0;a<i.length&&s<o.length;){var u=n(i[a],o[s]);e[c++]=u<=0?i[a++]:o[s++]}for(;a<i.length;)e[c++]=i[a++];for(;s<o.length;)e[c++]=o[s++];return e}e.create=function(e,t,n,r){return new Ce(e,t,n,r)},e.is=function(e){var t=e;return!!(be.defined(t)&&be.string(t.uri)&&(be.undefined(t.languageId)||be.string(t.languageId))&&be.uinteger(t.lineCount)&&be.func(t.getText)&&be.func(t.positionAt)&&be.func(t.offsetAt))},e.applyEdits=function(e,n){for(var r=e.getText(),i=t(n,(function(e,t){var n=e.range.start.line-t.range.start.line;return 0===n?e.range.start.character-t.range.start.character:n})),o=r.length,a=i.length-1;a>=0;a--){var s=i[a],c=e.offsetAt(s.range.start),u=e.offsetAt(s.range.end);if(!(u<=o))throw new Error("Overlapping edit");r=r.substring(0,c)+s.newText+r.substring(u,r.length),o=c}return r}}(pe||(pe={}));var be,ke,Ce=function(){function e(e,t,n,r){this._uri=e,this._languageId=t,this._version=n,this._content=r,this._lineOffsets=void 0}return Object.defineProperty(e.prototype,"uri",{get:function(){return this._uri},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"languageId",{get:function(){return this._languageId},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this._version},enumerable:!1,configurable:!0}),e.prototype.getText=function(e){if(e){var t=this.offsetAt(e.start),n=this.offsetAt(e.end);return this._content.substring(t,n)}return this._content},e.prototype.update=function(e,t){this._content=e.text,this._version=t,this._lineOffsets=void 0},e.prototype.getLineOffsets=function(){if(void 0===this._lineOffsets){for(var e=[],t=this._content,n=!0,r=0;r<t.length;r++){n&&(e.push(r),n=!1);var i=t.charAt(r);n="\r"===i||"\n"===i,"\r"===i&&r+1<t.length&&"\n"===t.charAt(r+1)&&r++}n&&t.length>0&&e.push(t.length),this._lineOffsets=e}return this._lineOffsets},e.prototype.positionAt=function(e){e=Math.max(Math.min(e,this._content.length),0);var t=this.getLineOffsets(),n=0,r=t.length;if(0===r)return h.create(0,e);for(;n<r;){var i=Math.floor((n+r)/2);t[i]>e?r=i:n=i+1}var o=n-1;return h.create(o,e-t[o])},e.prototype.offsetAt=function(e){var t=this.getLineOffsets();if(e.line>=t.length)return this._content.length;if(e.line<0)return 0;var n=t[e.line],r=e.line+1<t.length?t[e.line+1]:this._content.length;return Math.max(Math.min(n+e.character,r),n)},Object.defineProperty(e.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!1,configurable:!0}),e}();function _e(e){switch(e){case E.Error:return N.MarkerSeverity.Error;case E.Warning:return N.MarkerSeverity.Warning;case E.Information:return N.MarkerSeverity.Info;case E.Hint:return N.MarkerSeverity.Hint;default:return N.MarkerSeverity.Info}}function we(e){if(e)return{character:e.column-1,line:e.lineNumber-1}}function ye(e){if(e)return{start:{line:e.startLineNumber-1,character:e.startColumn-1},end:{line:e.endLineNumber-1,character:e.endColumn-1}}}function Ee(e){if(e)return new N.Range(e.start.line+1,e.start.character+1,e.end.line+1,e.end.character+1)}function xe(e){let t=N.languages.CompletionItemKind;switch(e){case q.Text:return t.Text;case q.Method:return t.Method;case q.Function:return t.Function;case q.Constructor:return t.Constructor;case q.Field:return t.Field;case q.Variable:return t.Variable;case q.Class:return t.Class;case q.Interface:return t.Interface;case q.Module:return t.Module;case q.Property:return t.Property;case q.Unit:return t.Unit;case q.Value:return t.Value;case q.Enum:return t.Enum;case q.Keyword:return t.Keyword;case q.Snippet:return t.Snippet;case q.Color:return t.Color;case q.File:return t.File;case q.Reference:return t.Reference}return t.Property}function Ae(e){if(e)return{range:Ee(e.range),text:e.newText}}function Ie(e){return e&&"editor.action.triggerSuggest"===e.command?{id:e.command,title:e.title,arguments:e.arguments}:void 0}function Se(e){return"string"==typeof e?{value:e}:function(e){return e&&"object"==typeof e&&"string"==typeof e.kind}(e)?"plaintext"===e.kind?{value:e.value.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}:{value:e.value}:{value:"```"+e.language+"\n"+e.value+"\n```\n"}}function Te(e){if(e)return Array.isArray(e)?e.map(Se):[Se(e)]}function je(e){let t=N.languages.SymbolKind;switch(e){case ie.File:return t.Array;case ie.Module:return t.Module;case ie.Namespace:return t.Namespace;case ie.Package:return t.Package;case ie.Class:return t.Class;case ie.Method:return t.Method;case ie.Property:return t.Property;case ie.Field:return t.Field;case ie.Constructor:return t.Constructor;case ie.Enum:return t.Enum;case ie.Interface:return t.Interface;case ie.Function:return t.Function;case ie.Variable:return t.Variable;case ie.Constant:return t.Constant;case ie.String:return t.String;case ie.Number:return t.Number;case ie.Boolean:return t.Boolean;case ie.Array:return t.Array}return t.Function}function Oe(e){return{tabSize:e.tabSize,insertSpaces:e.insertSpaces}}function Le(e){return 32===e||9===e||11===e||12===e||160===e||5760===e||e>=8192&&e<=8203||8239===e||8287===e||12288===e||65279===e}function Me(e){return 10===e||13===e||8232===e||8233===e}function Re(e){return e>=48&&e<=57}!function(e){var t=Object.prototype.toString;e.defined=function(e){return void 0!==e},e.undefined=function(e){return void 0===e},e.boolean=function(e){return!0===e||!1===e},e.string=function(e){return"[object String]"===t.call(e)},e.number=function(e){return"[object Number]"===t.call(e)},e.numberRange=function(e,n,r){return"[object Number]"===t.call(e)&&n<=e&&e<=r},e.integer=function(e){return"[object Number]"===t.call(e)&&-2147483648<=e&&e<=2147483647},e.uinteger=function(e){return"[object Number]"===t.call(e)&&0<=e&&e<=2147483647},e.func=function(e){return"[object Function]"===t.call(e)},e.objectLiteral=function(e){return null!==e&&"object"==typeof e},e.typedArray=function(e,t){return Array.isArray(e)&&e.every(t)}}(be||(be={})),function(e){e.DEFAULT={allowTrailingComma:!1}}(ke||(ke={}));function Pe(e){return{getInitialState:()=>new et(null,null,!1,null),tokenize:(t,n)=>function(e,t,n,r=0){let i=0,o=!1;switch(n.scanError){case 2:t='"'+t,i=1;break;case 1:t="/*"+t,i=2}let a=function(e,t){void 0===t&&(t=!1);var n=e.length,r=0,i="",o=0,a=16,s=0,c=0,u=0,d=0,l=0;function g(t,n){for(var i=0,o=0;i<t||!n;){var a=e.charCodeAt(r);if(a>=48&&a<=57)o=16*o+a-48;else if(a>=65&&a<=70)o=16*o+a-65+10;else{if(!(a>=97&&a<=102))break;o=16*o+a-97+10}r++,i++}return i<t&&(o=-1),o}function f(){if(i="",l=0,o=r,c=s,d=u,r>=n)return o=n,a=17;var t=e.charCodeAt(r);if(Le(t)){do{r++,i+=String.fromCharCode(t),t=e.charCodeAt(r)}while(Le(t));return a=15}if(Me(t))return r++,i+=String.fromCharCode(t),13===t&&10===e.charCodeAt(r)&&(r++,i+="\n"),s++,u=r,a=14;switch(t){case 123:return r++,a=1;case 125:return r++,a=2;case 91:return r++,a=3;case 93:return r++,a=4;case 58:return r++,a=6;case 44:return r++,a=5;case 34:return r++,i=function(){for(var t="",i=r;;){if(r>=n){t+=e.substring(i,r),l=2;break}var o=e.charCodeAt(r);if(34===o){t+=e.substring(i,r),r++;break}if(92!==o){if(o>=0&&o<=31){if(Me(o)){t+=e.substring(i,r),l=2;break}l=6}r++}else{if(t+=e.substring(i,r),++r>=n){l=2;break}switch(e.charCodeAt(r++)){case 34:t+='"';break;case 92:t+="\\";break;case 47:t+="/";break;case 98:t+="\b";break;case 102:t+="\f";break;case 110:t+="\n";break;case 114:t+="\r";break;case 116:t+="\t";break;case 117:var a=g(4,!0);a>=0?t+=String.fromCharCode(a):l=4;break;default:l=5}i=r}}return t}(),a=10;case 47:var f=r-1;if(47===e.charCodeAt(r+1)){for(r+=2;r<n&&!Me(e.charCodeAt(r));)r++;return i=e.substring(f,r),a=12}if(42===e.charCodeAt(r+1)){r+=2;for(var p=n-1,m=!1;r<p;){var v=e.charCodeAt(r);if(42===v&&47===e.charCodeAt(r+1)){r+=2,m=!0;break}r++,Me(v)&&(13===v&&10===e.charCodeAt(r)&&r++,s++,u=r)}return m||(r++,l=1),i=e.substring(f,r),a=13}return i+=String.fromCharCode(t),r++,a=16;case 45:if(i+=String.fromCharCode(t),++r===n||!Re(e.charCodeAt(r)))return a=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return i+=function(){var t=r;if(48===e.charCodeAt(r))r++;else for(r++;r<e.length&&Re(e.charCodeAt(r));)r++;if(r<e.length&&46===e.charCodeAt(r)){if(!(++r<e.length&&Re(e.charCodeAt(r))))return l=3,e.substring(t,r);for(r++;r<e.length&&Re(e.charCodeAt(r));)r++}var n=r;if(r<e.length&&(69===e.charCodeAt(r)||101===e.charCodeAt(r)))if((++r<e.length&&43===e.charCodeAt(r)||45===e.charCodeAt(r))&&r++,r<e.length&&Re(e.charCodeAt(r))){for(r++;r<e.length&&Re(e.charCodeAt(r));)r++;n=r}else l=3;return e.substring(t,n)}(),a=11;default:for(;r<n&&h(t);)r++,t=e.charCodeAt(r);if(o!==r){switch(i=e.substring(o,r)){case"true":return a=8;case"false":return a=9;case"null":return a=7}return a=16}return i+=String.fromCharCode(t),r++,a=16}}function h(e){if(Le(e)||Me(e))return!1;switch(e){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return!1}return!0}return{setPosition:function(e){r=e,i="",o=0,a=16,l=0},getPosition:function(){return r},scan:t?function(){var e;do{e=f()}while(e>=12&&e<=15);return e}:f,getToken:function(){return a},getTokenValue:function(){return i},getTokenOffset:function(){return o},getTokenLength:function(){return r-o},getTokenStartLine:function(){return c},getTokenStartCharacter:function(){return o-d},getTokenError:function(){return l}}}(t),s=n.lastWasColon,c=n.parents,u={tokens:[],endState:n.clone()};for(;;){let d=r+a.getPosition(),l="",g=a.scan();if(17===g)break;if(d===r+a.getPosition())throw new Error("Scanner did not advance, next 3 characters are: "+t.substr(a.getPosition(),3));switch(o&&(d-=i),o=i>0,g){case 1:c=Ze.push(c,0),l=Ne,s=!1;break;case 2:c=Ze.pop(c),l=Ne,s=!1;break;case 3:c=Ze.push(c,1),l=Ue,s=!1;break;case 4:c=Ze.pop(c),l=Ue,s=!1;break;case 6:l=We,s=!0;break;case 5:l=Ve,s=!1;break;case 8:case 9:l=Be,s=!1;break;case 7:l=Ke,s=!1;break;case 10:let e=1===(c?c.type:0);l=s||e?ze:He,s=!1;break;case 11:l=qe,s=!1}if(e)switch(g){case 12:l=$e;break;case 13:l=Xe}u.endState=new et(n.getStateData(),a.getTokenError(),s,c),u.tokens.push({startIndex:d,scopes:l})}return u}(e,t,n)}}var Fe,De,Ne="delimiter.bracket.json",Ue="delimiter.array.json",We="delimiter.colon.json",Ve="delimiter.comma.json",Be="keyword.json",Ke="keyword.json",ze="string.value.json",qe="number.json",He="string.key.json",Xe="comment.block.json",$e="comment.line.json";(De=Fe||(Fe={}))[De.Object=0]="Object",De[De.Array=1]="Array";var Qe,Ge,Je,Ye,Ze=class{constructor(e,t){this.parent=e,this.type=t}static pop(e){return e?e.parent:null}static push(e,t){return new Ze(e,t)}static equals(e,t){if(!e&&!t)return!0;if(!e||!t)return!1;for(;e&&t;){if(e===t)return!0;if(e.type!==t.type)return!1;e=e.parent,t=t.parent}return!0}},et=class{constructor(e,t,n,r){this._state=e,this.scanError=t,this.lastWasColon=n,this.parents=r}clone(){return new et(this._state,this.scanError,this.lastWasColon,this.parents)}equals(e){return e===this||!!(e&&e instanceof et)&&this.scanError===e.scanError&&this.lastWasColon===e.lastWasColon&&Ze.equals(this.parents,e.parents)}getStateData(){return this._state}setStateData(e){this._state=e}};function tt(e){let t=[],n=[],r=new class{constructor(e){this._defaults=e,this._worker=null,this._client=null,this._idleCheckInterval=window.setInterval((()=>this._checkIfIdle()),3e4),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange((()=>this._stopWorker()))}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}dispose(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()}_checkIfIdle(){this._worker&&Date.now()-this._lastUsedTime>12e4&&this._stopWorker()}_getClient(){return this._lastUsedTime=Date.now(),this._client||(this._worker=N.editor.createWebWorker({moduleId:"vs/language/json/jsonWorker",label:this._defaults.languageId,createData:{languageSettings:this._defaults.diagnosticsOptions,languageId:this._defaults.languageId,enableSchemaRequest:this._defaults.diagnosticsOptions.enableSchemaRequest}}),this._client=this._worker.getProxy()),this._client}getLanguageServiceWorker(...e){let t;return this._getClient().then((e=>{t=e})).then((t=>{if(this._worker)return this._worker.withSyncedResources(e)})).then((e=>t))}}(e);t.push(r);let i=(...e)=>r.getLanguageServiceWorker(...e);function o(){let{languageId:t,modeConfiguration:r}=e;rt(n),r.documentFormattingEdits&&n.push(N.languages.registerDocumentFormattingEditProvider(t,new class{constructor(e){this._worker=e}provideDocumentFormattingEdits(e,t,n){let r=e.uri;return this._worker(r).then((e=>e.format(r.toString(),null,Oe(t)).then((e=>{if(e&&0!==e.length)return e.map(Ae)}))))}}(i))),r.documentRangeFormattingEdits&&n.push(N.languages.registerDocumentRangeFormattingEditProvider(t,new class{constructor(e){this._worker=e}provideDocumentRangeFormattingEdits(e,t,n,r){let i=e.uri;return this._worker(i).then((e=>e.format(i.toString(),ye(t),Oe(n)).then((e=>{if(e&&0!==e.length)return e.map(Ae)}))))}}(i))),r.completionItems&&n.push(N.languages.registerCompletionItemProvider(t,new class{constructor(e,t){this._worker=e,this._triggerCharacters=t}get triggerCharacters(){return this._triggerCharacters}provideCompletionItems(e,t,n,r){let i=e.uri;return this._worker(i).then((e=>e.doComplete(i.toString(),we(t)))).then((n=>{if(!n)return;let r=e.getWordUntilPosition(t),i=new N.Range(t.lineNumber,r.startColumn,t.lineNumber,r.endColumn),o=n.items.map((e=>{let t={label:e.label,insertText:e.insertText||e.label,sortText:e.sortText,filterText:e.filterText,documentation:e.documentation,detail:e.detail,command:Ie(e.command),range:i,kind:xe(e.kind)};return e.textEdit&&(function(e){return void 0!==e.insert&&void 0!==e.replace}(e.textEdit)?t.range={insert:Ee(e.textEdit.insert),replace:Ee(e.textEdit.replace)}:t.range=Ee(e.textEdit.range),t.insertText=e.textEdit.newText),e.additionalTextEdits&&(t.additionalTextEdits=e.additionalTextEdits.map(Ae)),e.insertTextFormat===H.Snippet&&(t.insertTextRules=N.languages.CompletionItemInsertTextRule.InsertAsSnippet),t}));return{isIncomplete:n.isIncomplete,suggestions:o}}))}}(i,[" ",":",'"']))),r.hovers&&n.push(N.languages.registerHoverProvider(t,new class{constructor(e){this._worker=e}provideHover(e,t,n){let r=e.uri;return this._worker(r).then((e=>e.doHover(r.toString(),we(t)))).then((e=>{if(e)return{range:Ee(e.range),contents:Te(e.contents)}}))}}(i))),r.documentSymbols&&n.push(N.languages.registerDocumentSymbolProvider(t,new class{constructor(e){this._worker=e}provideDocumentSymbols(e,t){let n=e.uri;return this._worker(n).then((e=>e.findDocumentSymbols(n.toString()))).then((e=>{if(e)return e.map((e=>({name:e.name,detail:"",containerName:e.containerName,kind:je(e.kind),range:Ee(e.location.range),selectionRange:Ee(e.location.range),tags:[]})))}))}}(i))),r.tokens&&n.push(N.languages.setTokensProvider(t,Pe(!0))),r.colors&&n.push(N.languages.registerColorProvider(t,new class{constructor(e){this._worker=e}provideDocumentColors(e,t){let n=e.uri;return this._worker(n).then((e=>e.findDocumentColors(n.toString()))).then((e=>{if(e)return e.map((e=>({color:e.color,range:Ee(e.range)})))}))}provideColorPresentations(e,t,n){let r=e.uri;return this._worker(r).then((e=>e.getColorPresentations(r.toString(),t.color,ye(t.range)))).then((e=>{if(e)return e.map((e=>{let t={label:e.label};return e.textEdit&&(t.textEdit=Ae(e.textEdit)),e.additionalTextEdits&&(t.additionalTextEdits=e.additionalTextEdits.map(Ae)),t}))}))}}(i))),r.foldingRanges&&n.push(N.languages.registerFoldingRangeProvider(t,new class{constructor(e){this._worker=e}provideFoldingRanges(e,t,n){let r=e.uri;return this._worker(r).then((e=>e.getFoldingRanges(r.toString(),t))).then((e=>{if(e)return e.map((e=>{let t={start:e.startLine+1,end:e.endLine+1};return void 0!==e.kind&&(t.kind=function(e){switch(e){case _.Comment:return N.languages.FoldingRangeKind.Comment;case _.Imports:return N.languages.FoldingRangeKind.Imports;case _.Region:return N.languages.FoldingRangeKind.Region}}(e.kind)),t}))}))}}(i))),r.diagnostics&&n.push(new class extends class{constructor(e,t,n){this._languageId=e,this._worker=t,this._disposables=[],this._listener=Object.create(null);let r=e=>{let t,n=e.getLanguageId();n===this._languageId&&(this._listener[e.uri.toString()]=e.onDidChangeContent((()=>{window.clearTimeout(t),t=window.setTimeout((()=>this._doValidate(e.uri,n)),500)})),this._doValidate(e.uri,n))},i=e=>{N.editor.setModelMarkers(e,this._languageId,[]);let t=e.uri.toString(),n=this._listener[t];n&&(n.dispose(),delete this._listener[t])};this._disposables.push(N.editor.onDidCreateModel(r)),this._disposables.push(N.editor.onWillDisposeModel(i)),this._disposables.push(N.editor.onDidChangeModelLanguage((e=>{i(e.model),r(e.model)}))),this._disposables.push(n((e=>{N.editor.getModels().forEach((e=>{e.getLanguageId()===this._languageId&&(i(e),r(e))}))}))),this._disposables.push({dispose:()=>{N.editor.getModels().forEach(i);for(let e in this._listener)this._listener[e].dispose()}}),N.editor.getModels().forEach(r)}dispose(){this._disposables.forEach((e=>e&&e.dispose())),this._disposables.length=0}_doValidate(e,t){this._worker(e).then((t=>t.doValidation(e.toString()))).then((n=>{let r=n.map((e=>function(e,t){let n="number"==typeof t.code?String(t.code):t.code;return{severity:_e(t.severity),startLineNumber:t.range.start.line+1,startColumn:t.range.start.character+1,endLineNumber:t.range.end.line+1,endColumn:t.range.end.character+1,message:t.message,code:n,source:t.source}}(0,e))),i=N.editor.getModel(e);i&&i.getLanguageId()===t&&N.editor.setModelMarkers(i,t,r)})).then(void 0,(e=>{console.error(e)}))}}{constructor(e,t,n){super(e,t,n.onDidChange),this._disposables.push(N.editor.onWillDisposeModel((e=>{this._resetSchema(e.uri)}))),this._disposables.push(N.editor.onDidChangeModelLanguage((e=>{this._resetSchema(e.model.uri)})))}_resetSchema(e){this._worker().then((t=>{t.resetSchema(e.toString())}))}}(t,i,e)),r.selectionRanges&&n.push(N.languages.registerSelectionRangeProvider(t,new class{constructor(e){this._worker=e}provideSelectionRanges(e,t,n){let r=e.uri;return this._worker(r).then((e=>e.getSelectionRanges(r.toString(),t.map(we)))).then((e=>{if(e)return e.map((e=>{let t=[];for(;e;)t.push({range:Ee(e.range)}),e=e.parent;return t}))}))}}(i)))}o(),t.push(N.languages.setLanguageConfiguration(e.languageId,it));let a=e.modeConfiguration;return e.onDidChange((e=>{e.modeConfiguration!==a&&(a=e.modeConfiguration,o())})),t.push(nt(n)),nt(t)}function nt(e){return{dispose:()=>rt(e)}}function rt(e){for(;e.length;)e.pop().dispose()}(Ge=Qe||(Qe={}))[Ge.None=0]="None",Ge[Ge.UnexpectedEndOfComment=1]="UnexpectedEndOfComment",Ge[Ge.UnexpectedEndOfString=2]="UnexpectedEndOfString",Ge[Ge.UnexpectedEndOfNumber=3]="UnexpectedEndOfNumber",Ge[Ge.InvalidUnicode=4]="InvalidUnicode",Ge[Ge.InvalidEscapeCharacter=5]="InvalidEscapeCharacter",Ge[Ge.InvalidCharacter=6]="InvalidCharacter",(Ye=Je||(Je={}))[Ye.OpenBraceToken=1]="OpenBraceToken",Ye[Ye.CloseBraceToken=2]="CloseBraceToken",Ye[Ye.OpenBracketToken=3]="OpenBracketToken",Ye[Ye.CloseBracketToken=4]="CloseBracketToken",Ye[Ye.CommaToken=5]="CommaToken",Ye[Ye.ColonToken=6]="ColonToken",Ye[Ye.NullKeyword=7]="NullKeyword",Ye[Ye.TrueKeyword=8]="TrueKeyword",Ye[Ye.FalseKeyword=9]="FalseKeyword",Ye[Ye.StringLiteral=10]="StringLiteral",Ye[Ye.NumericLiteral=11]="NumericLiteral",Ye[Ye.LineCommentTrivia=12]="LineCommentTrivia",Ye[Ye.BlockCommentTrivia=13]="BlockCommentTrivia",Ye[Ye.LineBreakTrivia=14]="LineBreakTrivia",Ye[Ye.Trivia=15]="Trivia",Ye[Ye.Unknown=16]="Unknown",Ye[Ye.EOF=17]="EOF";var it={wordPattern:/(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,comments:{lineComment:"//",blockComment:["/*","*/"]},brackets:[["{","}"],["[","]"]],autoClosingPairs:[{open:"{",close:"}",notIn:["string"]},{open:"[",close:"]",notIn:["string"]},{open:'"',close:'"',notIn:["string"]}]};return l})()));