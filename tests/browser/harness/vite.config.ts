import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({build:{outDir:fileURLToPath(new URL('./dist',import.meta.url)),lib:{entry:{sdk:fileURLToPath(new URL('./sdk.ts',import.meta.url)),'disposal-probe':fileURLToPath(new URL('./disposal-probe.mjs',import.meta.url))},formats:['es'],fileName:(_format,name)=>name+'.js'},emptyOutDir:true}});
