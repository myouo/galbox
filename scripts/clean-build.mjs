import {rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const paths={sdk:'../packages/galbox-sdk/dist/',cli:'../packages/cli/dist/'};
const name=process.argv[2];if(!Object.hasOwn(paths,name))throw new Error('Expected sdk or cli build output');
await rm(fileURLToPath(new URL(paths[name],import.meta.url)),{recursive:true,force:true});
