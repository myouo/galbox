# galbox-sdk

TypeScript visual novel SDK: synchronous Core, Pixi WebGL stage, DOM text, Web Audio, IndexedDB and optional React UI. Includes stateful operations, synthetic save adapters, diagnostics and portable backups.

Public entries: `galbox-sdk` / `player`, `protocol`, `core`, `port-kit`, `react`, `testing`, `save-bridge`, `diagnostics`, `backups`, `release`, `settings`, `react/style.css`.

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

Typed expressions are available from `port-kit`: `expr`, `assignExpression`, `branchExpression`, `templatePage`, `randomI32`. The current bool/i32/string AST supports checked arithmetic, scoped/profile queries, short-circuit conditions and bounded strings without eval. Templates persist evaluated text and source identity; restore does not recompute old text. `ProgramBuilder.rng(seed)` declares a fixed lcg32@1 stream; `rngFromHost()` uses explicit initial `CoreOptions.rngSeed`, or Web Player crypto entropy. Snapshots retain complete RNG state/draw count; restore never samples again or guesses a missing seed. Float/collection values remain unimplemented. Expression depth/node and string bounds are enforced by real factories/linker/runtime.

Snapshots contain narrative state; current durable profile is retained on load. Save success means IndexedDB transaction completion. Revision conflicts require an explicit discard/reload decision. `discardAndLoad` is that explicit resolution; normal load never silently merges nonmonotonic values. `dispose` releases this player's resources and does not cancel already committed storage transactions. Borrowed Store implementations remain caller-owned.

The WebGL Host draws when the owned stage values change and on every new run epoch; text/profile-only updates still execute normally without redundant Pixi frames. Each submitted stage is flushed to the driver. Disposal destroys this instance's textures, renderer/context, audio and listeners, while preserving shared Pixi global pools. Initialization that completes after cancellation also destroys its newly allocated renderer before rejecting; no narrative, save format or public API changes are involved.

Original fixture and full development instructions are in the repository. This checkpoint does not certify compatibility with any commercial title.

The complete common GalGame feature target is still under construction; the existing alpha milestone does not mean rich text, flowcharts, save thumbnails or scripted UI are implemented. Common systems belong to the SDK, with authored content/themes/defaults supplied by the work.

`galbox-sdk/settings` supplies validated preferences and merge factories. `preferencesDefaults` configures authored defaults; stored player values take precedence. `await player.updatePreferences({audio:{master:.5,bgm:.4,voice:.8,sfx:.7},text:{intervalMs:16}})` persists and applies preferences independently of story profiles and snapshots. Volumes are 0..1; text interval is 0..200 ms (0 instant). Mixer uses script × role × master gain without changing Task.gain. The default settings UI includes these controls. Cross-instance CAS conflicts require `reloadPreferences()` before retrying; unknown commit outcomes are reconciled by reading. A committed operation finishing after disposal returns committed/disposed accurately. Legacy custom Stores may omit settings ports; persistent update then explicitly rejects. Story backups currently exclude preferences. Session-only `setVolume` remains available.

`galbox-sdk/release` constructs and verifies manifests bound to the canonical Program, frozen operation/binding identities, catalog, media facts and resource limits. Pass `release` to `createPlayer` for an explicit manifest; legacy callers receive a derived manifest after the same resource preparation. CLI projects publish `program.json.release.json` beside Program; source/port/policy edits require `assets build` before validation. Defaults: 16 MiB per encoded file, 32 MiB encoded total, 128 MiB estimated RGBA, 32 MiB decoded PCM, 4096 px image side and 30 s per WAV. Supported source profile: PNG, fixed-size self-contained SVG, mono/stereo PCM16 or float32 WAV; actual device decoding is checked separately. `signal` cancels initialization and disposes the instance. Resource diagnostics distinguish verified encoded inventory, estimated texture storage and actual retained PCM. Permanent audio failure leaves a committed activation pending; a fresh Host can resume it without repeating committed profile updates. Runtime WebGL loss pauses the session; GPU recreation is explicit.

`await player.exportBackup()` captures all durable profiles and current/previous slot revisions after flushing progress. Save the current narrative position first if needed. Restore using `player.prepareBackupRestore(unknown)` then `await player.commitBackupRestore(plan)`; load the returned slot explicitly. Profile-only backups can explicitly start a new story via `player.start(restoredProfileId)` while retaining reading/unlock progress; the default UI lists these profiles across refresh. Restoration adds independent branches and preserves existing progress and activation authority. Packages are bounded to 1000000 JSON characters, 64 profiles and 128 slots; assets and original-save attachments are excluded. A lost commit reply is retried with the same plan. Cross-release restoration requires a `defineContentMigration` handle from `galbox-sdk/backups`; missing releases, invalid frames or incompatible text are rejected while preserving the source data.
