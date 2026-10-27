import ts from 'typescript';
import { readdir,readFile } from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve('packages/galbox-sdk/src');
const allowed=new Set(['protocol','core','runtime','program-tools','testing','save-bridge','diagnostics','backups','release','settings']);
async function walk(p){return (await Promise.all((await readdir(p,{withFileTypes:true})).map(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]))).flat();}
function isDeviceIdentifier(n){
 if(!ts.isIdentifier(n))return false;const parent=n.parent;
 const property=parent&&(ts.isPropertyAccessExpression(parent)&&parent.name===n&&!(ts.isIdentifier(parent.expression)&&parent.expression.text==='globalThis')||(ts.isPropertyAssignment(parent)||ts.isPropertySignature(parent))&&parent.name===n);
 return !property&&['window','document','Date','indexedDB','Blob','File','AbortSignal','setTimeout','requestAnimationFrame'].includes(n.text);
}
for(const [code,expected]of [['const x=window;',true],['const x=globalThis.window;',true],['const x={window};',true],['const x={window:1};x.window;',false],['interface Data {window:string}',false]]){let found=false;const visit=n=>{if(isDeviceIdentifier(n))found=true;ts.forEachChild(n,visit);};visit(ts.createSourceFile('boundary-fixture.ts',code,ts.ScriptTarget.Latest,true));if(found!==expected)throw new Error('Device boundary fixture failed: '+code);}
let failed=false;
for(const file of await walk(base)) {
 if(!/\.(ts|tsx|js)$/.test(file)||file.endsWith('.d.ts')||file.includes('/generated/'))continue;
 const source=await readFile(file,'utf8');
 if(/\bany\b|\bas\s+unknown\s+as\b/.test(source)){console.error(`Unsafe public/implementation escape: ${file}`);failed=true;}
 const zone=path.relative(base,file).split(path.sep)[0];
 if(!allowed.has(zone))continue;
 const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 function visit(n){
  let spec;
  if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier&&ts.isStringLiteral(n.moduleSpecifier))spec=n.moduleSpecifier.text;
  if(ts.isCallExpression(n)&&n.expression.kind===ts.SyntaxKind.ImportKeyword){console.error(`Dynamic import in headless: ${file}`);failed=true;}
  if(spec&&zone==='core'&&(spec.includes('save-bridge')||spec.includes('diagnostics')||spec.includes('backups')||spec.includes('release')||spec.includes('settings')||spec.includes('program-tools/index'))){console.error(`Core reverse dependency: ${file} -> ${spec}`);failed=true;}
  if(spec&&!(file===path.join(base,'protocol/protobuf.ts')&&spec==='protobufjs/minimal.js')&&!(file===path.join(base,'protocol/digest.ts')&&['@noble/hashes/sha2.js','@noble/hashes/utils.js'].includes(spec))&&!(file===path.join(base,'protocol/text.ts')&&spec==='unicode-segmenter/grapheme')&&(!spec.startsWith('.')||!allowed.has(path.relative(base,path.resolve(path.dirname(file),spec)).split(path.sep)[0]))){console.error(`Headless boundary: ${file} -> ${spec}`);failed=true;}
  if(isDeviceIdentifier(n)){console.error(`Device global ${n.text}: ${file}`);failed=true;}
  ts.forEachChild(n,visit);
 }
 visit(sf);
}
if(failed)process.exitCode=1;else console.log('Import and device boundaries passed');
