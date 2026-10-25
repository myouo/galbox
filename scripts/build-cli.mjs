import {copyFile,chmod} from 'node:fs/promises';
await copyFile('packages/cli/src/generated/validator.d.ts','packages/cli/dist/generated/validator.d.ts');await chmod('packages/cli/dist/main.js',0o755);
