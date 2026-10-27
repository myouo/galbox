import {readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {transform} from 'esbuild';
const roots={sdk:'packages/galbox-sdk/dist',cli:'packages/cli/dist'},root=roots[process.argv[2]];
if(!root)throw new Error('Expected sdk or cli distribution');
async function walk(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await walk(file);else if(file.endsWith('.js')){const source=await readFile(file,'utf8'),result=await transform(source,{loader:'js',format:'esm',target:'es2022',minify:true,keepNames:true,legalComments:'eof'});await writeFile(file,result.code);}}}
await walk(root);
