import ts from 'typescript';
import { readdir,readFile } from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve('packages/galbox-sdk/src');
const allowed=new Set(['protocol','core','runtime','program-tools','testing']);
async function walk(p){return (await Promise.all((await readdir(p,{withFileTypes:true})).map(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]))).flat();}
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
  if(spec&&(!spec.startsWith('.')||!allowed.has(path.relative(base,path.resolve(path.dirname(file),spec)).split(path.sep)[0]))){console.error(`Headless boundary: ${file} -> ${spec}`);failed=true;}
  if(ts.isIdentifier(n)&&['window','document','Date','indexedDB','Blob','File','AbortSignal','setTimeout','requestAnimationFrame'].includes(n.text)){console.error(`Device global ${n.text}: ${file}`);failed=true;}
  ts.forEachChild(n,visit);
 }
 visit(sf);
}
if(failed)process.exitCode=1;else console.log('Import and device boundaries passed');
