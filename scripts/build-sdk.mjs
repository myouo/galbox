import { copyFile } from 'node:fs/promises';
await copyFile('packages/galbox-sdk/src/protocol/generated/validators.d.ts','packages/galbox-sdk/dist/protocol/generated/validators.d.ts');

await copyFile('packages/galbox-sdk/src/react/style.css','packages/galbox-sdk/dist/react/style.css');
