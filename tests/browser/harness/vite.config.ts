import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({build:{outDir:fileURLToPath(new URL('./dist',import.meta.url)),lib:{entry:fileURLToPath(new URL('./sdk.ts',import.meta.url)),formats:['es'],fileName:'sdk'},emptyOutDir:true}});
