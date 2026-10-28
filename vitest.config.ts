import { defineConfig } from 'vitest/config';
// Keep generator subprocesses and per-file SDK imports from competing with an
// unbounded number of workers on high-core-count machines. Preserve timeouts.
export default defineConfig({test:{include:['tests/unit/**/*.test.ts'],testTimeout:10000,maxWorkers:4}});
