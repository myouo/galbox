import {cp,mkdir,readdir,readFile,writeFile,mkdtemp,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {requireValue} from './config.js';
export async function initProject(directory:string,options:{sdkTarball?:string;cliTarball?:string}={}):Promise<string> {
 const target=path.resolve(directory);let entries:string[]=[];try{entries=await readdir(target);}catch(error){if(!(error!==null&&typeof error==='object'&&'code'in error&&error.code==='ENOENT'))throw error;}requireValue(entries.length===0,'INIT_NOT_EMPTY','init refuses to overwrite a nonempty directory');
 requireValue(Boolean(options.sdkTarball)===Boolean(options.cliTarball),'INIT_PACKAGES','Pass both --sdk-tarball and --cli-tarball for local candidates');
 const vendor:Record<string,Uint8Array>={};if(options.sdkTarball&&options.cliTarball){vendor['galbox-sdk.tgz']=new Uint8Array(await readFile(path.resolve(options.sdkTarball)));vendor['galbox-cli.tgz']=new Uint8Array(await readFile(path.resolve(options.cliTarball)));}
 await mkdir(path.dirname(target),{recursive:true});const output=await mkdtemp(path.join(path.dirname(target),'.galbox-init-'));try {await cp(fileURLToPath(new URL('../templates/standard',import.meta.url)),output,{recursive:true});await rename(path.join(output,'gitignore'),path.join(output,'.gitignore'));await mkdir(path.join(output,'public'),{recursive:true});
 if(options.sdkTarball){await mkdir(path.join(output,'vendor'));for(const [name,bytes]of Object.entries(vendor))await writeFile(path.join(output,'vendor',name),bytes);const pkgFile=path.join(output,'package.json'),input:unknown=JSON.parse(await readFile(pkgFile,'utf8'));requireValue(typeof input==='object'&&input!==null&&!Array.isArray(input),'TEMPLATE_PACKAGE','Invalid template manifest');const pkg={...input,dependencies:{'galbox-sdk':'file:./vendor/galbox-sdk.tgz',react:'19.3.1','react-dom':'19.3.1'},devDependencies:{'@galbox/cli':'file:./vendor/galbox-cli.tgz',typescript:'5.9.3','@types/react':'19.2.7','@types/react-dom':'19.2.3'}};await writeFile(pkgFile,JSON.stringify(pkg,null,2)+'\n');await writeFile(path.join(output,'pnpm-workspace.yaml'),"packages: []\noverrides:\n  galbox-sdk: file:./vendor/galbox-sdk.tgz\nallowBuilds:\n  esbuild: true\n");}
 await rename(output,target);return target;}catch(error){await rm(output,{recursive:true,force:true});throw error;}
}
