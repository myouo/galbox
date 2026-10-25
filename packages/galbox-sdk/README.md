# galbox-sdk

TypeScript visual novel SDK: synchronous Core, Pixi WebGL stage, DOM text, Web Audio, IndexedDB and optional React UI. Includes stateful operations, synthetic save adapters, diagnostics and portable backups.

Public entries: `galbox-sdk` / `player`, `protocol`, `core`, `port-kit`, `react`, `testing`, `save-bridge`, `diagnostics`, `backups`, `release`, `react/style.css`.

```ts
import { createPlayer, createHttpProvider } from 'galbox-sdk/player';
const program: unknown = await (await fetch('./program.json')).json();
const player = await createPlayer({
  program, provider: createHttpProvider(program, new URL('./', location.href).href),
  mount: document.querySelector<HTMLElement>('#stage')!, saveCompatibilitySeries: '1',
});
// Call from a user gesture (audio policy).
await player.start();
await player.save('quick');
await player.load('quick');
player.dispose();
```

Provide a positioned 16:9 mount. `createPlayer` prepares and verifies all assets before returning. Subscribe to `getSnapshot()` for immutable detached views; use prompt-bound `input` or `step` actions. React's `DefaultUI` supplies controls, choices, menus and history; import `galbox-sdk/react/style.css` and use a `.galbox-player` wrapper with a `.stage` mount. Host text is DOM. Input actions require both the prompt number and current view epoch.

Source values: bool/string/checked i32. Absolute linear animations, fixed all-success groups, short WAV audio. An audio task acknowledges startup; restoring looped audio replays it, one-shot audio uses the declared replay/stop policy. No exact sample-position restore. Timed choices/video/unknown source formats are unsupported and rejected. Registered operations support isolated invocation state and explicit full ABI migration.

Snapshots contain narrative state; current durable profile is retained on load. Save success means IndexedDB transaction completion. Revision conflicts require an explicit discard/reload decision. `discardAndLoad` is that explicit resolution; normal load never silently merges nonmonotonic values. `dispose` releases this player's resources and does not cancel already committed storage transactions. Borrowed Store implementations remain caller-owned.

Original fixture and full development instructions are in the repository. This checkpoint does not certify compatibility with any commercial title.

`galbox-sdk/release` constructs and verifies manifests bound to the canonical Program, frozen operation/binding identities, catalog, media facts and resource limits. Pass `release` to `createPlayer` for an explicit manifest; legacy callers receive a derived manifest after the same resource preparation. CLI projects publish `program.json.release.json` beside Program; source/port/policy edits require `assets build` before validation. Defaults: 16 MiB per encoded file, 32 MiB encoded total, 128 MiB estimated RGBA, 32 MiB decoded PCM, 4096 px image side and 30 s per WAV. Supported source profile: PNG, fixed-size self-contained SVG, mono/stereo PCM16 or float32 WAV; actual device decoding is checked separately. `signal` cancels initialization and disposes the instance. Resource diagnostics distinguish verified encoded inventory, estimated texture storage and actual retained PCM. Permanent audio failure leaves a committed activation pending; a fresh Host can resume it without repeating committed profile updates. Runtime WebGL loss pauses the session; GPU recreation is explicit.

`await player.exportBackup()` captures all durable profiles and current/previous slot revisions after flushing progress. Save the current narrative position first if needed. Restore using `player.prepareBackupRestore(unknown)` then `await player.commitBackupRestore(plan)`; load the returned slot explicitly. Profile-only backups can explicitly start a new story via `player.start(restoredProfileId)` while retaining reading/unlock progress; the default UI lists these profiles across refresh. Restoration adds independent branches and preserves existing progress and activation authority. Packages are bounded to 1000000 JSON characters, 64 profiles and 128 slots; assets and original-save attachments are excluded. A lost commit reply is retried with the same plan. Cross-release restoration requires a `defineContentMigration` handle from `galbox-sdk/backups`; missing releases, invalid frames or incompatible text are rejected while preserving the source data.
