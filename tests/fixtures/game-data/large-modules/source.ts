import {ProgramBuilder,instruction,compileProgramModuleParts} from 'galbox-sdk/port-kit';
import {parseProgramModule} from 'galbox-sdk/protocol';
export async function largeModules(functions=300,perModule=4,catalogs=0){
 const b=new ProgramBuilder({gameId:'original-large-catalog',release:'v3',entry:'main'});
 b.function({id:'main',entry:'intro',layout:1,params:[],locals:[],returns:'void',code:[instruction('text.page',{at:'intro',textId:'intro',revision:'v1',speaker:'Keeper',content:'A catalog can hold many chapters.'}),instruction('control.call',{at:'late-call',function:'chapter'+(functions-1),args:[]}),instruction('text.page',{at:'done',textId:'done',revision:'v1',speaker:'Keeper',content:'The late chapter returned.'}),instruction('control.end',{at:'end'})]});
 for(let n=0;n<functions;n++)b.function({id:'chapter'+n,entry:'chapter'+n+':entry',layout:1,params:[],locals:[],returns:'void',code:n===functions-1?[instruction('text.page',{at:'chapter'+n+':entry',textId:'late',revision:'v1',speaker:'Keeper',content:'Only the selected late chapter was loaded.'}),instruction('control.return',{at:'chapter'+n+':return'})]:[instruction('control.return',{at:'chapter'+n+':entry'})]});
 const parts=b.parts({compositionVersion:3}),all=parts.files.flatMap(f=>f.body.functions);parts.files=[];for(let n=0;n<all.length;n+=perModule){const id='unit'+parts.files.length;parts.files.push({uri:'code/'+id+'.pb',body:parseProgramModule({format:'galbox-code',version:1,id,functions:all.slice(n,n+perModule)})});}parts.assetCatalogs=Array.from({length:catalogs},()=>[]);
 const built=await compileProgramModuleParts({compositionVersion:3,parts,series:'large-v3',resources:[],points:['intro','chapter'+(functions-1)+':entry'],packedDeclarations:true});return {b,parts,built};
}
