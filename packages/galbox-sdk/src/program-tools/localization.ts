import {ensure,parseProgram,parseProgramTextCatalog,parseLocaleCatalog,parseInterfaceTextCatalog} from '../protocol/index.js';
import type {Program,ProgramTextCatalog,ProgramTextEntry,LocaleCatalog,InterfaceTextCatalog} from '../protocol/index.js';
import {encodeWire} from '../protocol/protobuf.js';
import {byteDigest} from '../protocol/digest.js';
import {richText} from './text.js';
import {linkProgram} from './linker.js';
import type {OperationRegistry} from '../core/operations.js';
const placeholder='@text-catalog';
function supported(p:Program):void {ensure(!p.ui&&!p.presentation&&!p.flowchart&&!p.functions.some(f=>f.code.some(i=>i.op==='text.template'||i.op==='interaction.prompt')),'TEXT_CATALOG_UNSUPPORTED','This text split profile supports title/pages/rich pages/choices only');}
export function splitProgramText(input:unknown,locale:string):{template:Program;catalog:ProgramTextCatalog}{
 const p=parseProgram(input);ensure(!p.textCatalogBinding,'TEXT_CATALOG_BOUND','Program already requires a text catalog');supported(p);const entries:ProgramTextEntry[]=[{kind:'title',at:'program:title',text:p.title}];p.title=placeholder;
 for(const e of p.extras?.entries??[]){for(const field of ['title','description']as const){entries.push({kind:'title',at:`extras:${e.id}:${field}`,text:e[field]});e[field]=placeholder;}}
 for(const f of p.functions)for(const i of f.code){
  if(i.op==='text.page'){entries.push({kind:'page',at:i.at,textId:i.textId,revision:i.revision,speaker:i.speaker,content:i.content});i.speaker=placeholder;i.content=placeholder;}
  if(i.op==='text.rich'){entries.push({kind:'rich',at:i.at,textId:i.textId,revision:i.revision,speaker:i.speaker,runs:i.runs});i.speaker={op:'literal',kind:'string',value:placeholder};i.runs=[richText.text(placeholder)];}
  if(i.op==='choice'){const [first,...rest]=i.options.map(o=>({id:o.id,text:o.text}));ensure(first,'TEXT_CATALOG_SLOT','Empty choice');entries.push({kind:'choice',at:i.at,options:[first,...rest]});i.options.forEach(o=>{o.text=placeholder;});}
 }
 const catalog=parseProgramTextCatalog({version:1,gameId:p.gameId,release:p.release,locale,entries});p.textCatalogBinding={version:1,locale,sha256:byteDigest(encodeWire('ProgramTextCatalog',catalog))};return {template:parseProgram(p),catalog};
}
export function bindProgramText(input:unknown,textInput:unknown,operations?:OperationRegistry):Program {
 const p=parseProgram(input),catalog=parseProgramTextCatalog(textInput),binding=p.textCatalogBinding;ensure(binding,'TEXT_CATALOG_REQUIRED','Expected a bound program template');supported(p);ensure(catalog.gameId===p.gameId&&catalog.release===p.release&&catalog.locale===binding.locale,'TEXT_CATALOG_IDENTITY','Text catalog game/release/locale differs');ensure(byteDigest(encodeWire('ProgramTextCatalog',catalog))===binding.sha256,'TEXT_CATALOG_DIGEST','Text catalog bytes differ from the template binding');
 const entries=new Map<string,ProgramTextEntry>();for(const e of catalog.entries){ensure(!entries.has(e.at),'TEXT_CATALOG_DUPLICATE',e.at);entries.set(e.at,e);}
 const title=entries.get('program:title');ensure(title?.kind==='title','TEXT_CATALOG_SLOT','Missing program title');p.title=title.text;entries.delete('program:title');
 for(const item of p.extras?.entries??[])for(const field of ['title','description']as const){const key=`extras:${item.id}:${field}`,e=entries.get(key);ensure(e?.kind==='title','TEXT_CATALOG_SLOT','Missing extra '+key);item[field]=e.text;entries.delete(key);}
 for(const f of p.functions)for(const i of f.code){if(i.op!=='text.page'&&i.op!=='text.rich'&&i.op!=='choice')continue;const e=entries.get(i.at);ensure(e,'TEXT_CATALOG_SLOT','Missing '+i.at);
  if(i.op==='text.page'){ensure(e.kind==='page'&&e.textId===i.textId&&e.revision===i.revision,'TEXT_CATALOG_SLOT','Page identity differs');i.speaker=e.speaker;i.content=e.content;}
  if(i.op==='text.rich'){ensure(e.kind==='rich'&&e.textId===i.textId&&e.revision===i.revision,'TEXT_CATALOG_SLOT','Rich page identity differs');i.speaker=e.speaker;i.runs=e.runs;}
  if(i.op==='choice'){ensure(e.kind==='choice'&&e.options.length===i.options.length&&e.options.every((o,n)=>o.id===i.options[n]?.id),'TEXT_CATALOG_SLOT','Choice options differ');i.options.forEach((o,n)=>{o.text=e.options[n]!.text;});}entries.delete(i.at);
 }
 ensure(entries.size===0,'TEXT_CATALOG_SLOT','Unexpected text slots');delete p.textCatalogBinding;linkProgram(p,operations);return parseProgram(p);
}
export function localeCatalog(input:unknown):LocaleCatalog {
 const c=parseLocaleCatalog(input),ids=new Set(c.locales.map(l=>l.id)),names=new Set<string>();ensure(ids.size===c.locales.length&&ids.has(c.defaultLocale),'LOCALE_CATALOG','Duplicate/default locale');
 for(const l of c.locales){ensure(l.label.length>0,'LOCALE_CATALOG','Empty locale label');for(const name of [l.id,...l.aliases]){const key=name.toLowerCase();ensure(!names.has(key),'LOCALE_ALIAS','Duplicate locale/alias');names.add(key);}const visited=new Set([l.id]);let next=l.fallback;while(next!==null){ensure(ids.has(next)&&!visited.has(next),'LOCALE_FALLBACK','Missing/cyclic fallback');visited.add(next);next=c.locales.find(x=>x.id===next)!.fallback;}}
 return c;
}
export function resolveLocale(input:unknown,requested:string|null|undefined):string {const c=localeCatalog(input),key=requested?.toLowerCase();return c.locales.find(l=>l.id.toLowerCase()===key||l.aliases.some(a=>a.toLowerCase()===key))?.id??c.defaultLocale;}
export function interfaceTextCatalog(input:unknown):InterfaceTextCatalog {const c=parseInterfaceTextCatalog(input);ensure(new Set(c.messages.map(m=>m.id)).size===c.messages.length,'LOCALE_MESSAGE_DUPLICATE','Duplicate message id');return c;}
export function createTranslator(input:unknown,translations:readonly unknown[],requested:string):{locale:string;text(id:string):string}{
 const c=localeCatalog(input),locale=resolveLocale(c,requested),tables=new Map<string,Map<string,string>>();for(const raw of translations){const t=interfaceTextCatalog(raw);ensure(c.locales.some(l=>l.id===t.locale)&&!tables.has(t.locale),'LOCALE_CATALOG','Unexpected/duplicate translation locale');tables.set(t.locale,new Map(t.messages.map(m=>[m.id,m.text])));}
 const chain:string[]=[];let id:string|null=locale;while(id!==null){chain.push(id);id=c.locales.find(l=>l.id===id)!.fallback;}
 ensure(chain.some(l=>tables.has(l)),'LOCALE_MISSING','No selected/fallback interface catalog');return {locale,text(key){for(const l of chain){const value=tables.get(l)?.get(key);if(value!==undefined)return value;}ensure(false,'LOCALE_MESSAGE_MISSING',key);}};
}
