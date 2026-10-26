export * from 'galbox-sdk/player';
export * from 'galbox-sdk/core';
export * from 'galbox-sdk/port-kit';
export * from 'galbox-sdk/protocol';
export * from 'galbox-sdk/testing';
// Test-only adapter surfaces. These do not become SDK exports or playground assets.
export { openStore } from '../../../packages/galbox-sdk/src/storage/indexeddb.js';
export { verifiedBytes } from '../../../packages/galbox-sdk/src/web-host/assets.js';
export * from 'galbox-sdk/save-bridge';
export {createFixtureBinding} from '../../../fixtures/synthetic-saves/binding.js';

export * from 'galbox-sdk/backups';

export * from 'galbox-sdk/release';

export * from 'galbox-sdk/settings';

export {DefaultUI,GameUI} from 'galbox-sdk/react';
export {createElement} from 'react';
export {createRoot} from 'react-dom/client';
