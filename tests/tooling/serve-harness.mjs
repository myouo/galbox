import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('tests/browser/harness/dist');
const server=createServer(async(req,res)=>{const file=path.resolve(root,'.'+(req.url??'/'));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{const bytes=await readFile(file);res.writeHead(200,{'content-type':'text/javascript','access-control-allow-origin':'*'});res.end(bytes);}catch{res.writeHead(404);res.end();}});server.listen(4174,'127.0.0.1');
