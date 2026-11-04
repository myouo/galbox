export * from 'galbox-sdk/player';
export * from 'galbox-sdk/core';
export * from 'galbox-sdk/port-kit';
export * from 'galbox-sdk/protocol';
export * from 'galbox-sdk/testing';
export {WebCodeModules} from '../../../packages/galbox-sdk/src/web-host/code-modules.js';
// Test-only adapter surfaces. These do not become SDK exports or playground assets.
export { openStore } from '../../../packages/galbox-sdk/src/storage/indexeddb.js';
export { verifiedBytes } from '../../../packages/galbox-sdk/src/web-host/assets.js';
export * from 'galbox-sdk/save-bridge';
export {createFixtureBinding} from '../../fixtures/game-data/synthetic-saves/binding.js';

export * from 'galbox-sdk/backups';

export * from 'galbox-sdk/release';

export * from 'galbox-sdk/settings';

export {DefaultUI,GameUI} from 'galbox-sdk/react';
export {createElement} from 'react';
export {createRoot} from 'react-dom/client';
export {WebHost} from '../../../packages/galbox-sdk/src/web-host/host.js';
export {BrowserScheduler} from '../../../packages/galbox-sdk/src/web-host/scheduler.js';

export {loadingFixture} from "./loading-fixture.js";

export * from 'galbox-sdk/wire';

export {interactiveRegistry} from '../../fixtures/game-data/interactive-modules/source.js';

export {RasterImages} from '../../../packages/galbox-sdk/src/web-host/raster-images.js';

export {verifyLoopRegion} from '../../consumer/loop-region.js';
// Synthetic large receipt fixture and disk codec: test-only, never public SDK exports.
export {receiptVolume,volumeBatch} from '../../fixtures/game-data/receipt-volume/source.js';
export {partitionReceiptTables,withoutReceiptTables,receiptPage} from '../../../packages/galbox-sdk/src/runtime/receipt-ledger.js';
export {encodeColdRecord} from '../../../packages/galbox-sdk/src/storage/cold-record.js';
export {writeReceiptFixture} from '../helpers/receipt-fixture.js';
