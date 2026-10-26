import {versionedMediaPlugin} from '../../packages/cli/src/stream-http.js';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),base:'./',plugins:[versionedMediaPlugin(fileURLToPath(new URL('./public',import.meta.url)))],build:{outDir:'dist',emptyOutDir:true},server:{port:4173,strictPort:true},preview:{port:4173,strictPort:true}});
