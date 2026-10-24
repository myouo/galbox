# galbox-sdk

M0–M2 initial SDK: synchronous TypeScript Core, Pixi WebGL stage, DOM text, Web Audio, IndexedDB and optional React UI.

Public entries: `galbox-sdk` / `player`, `protocol`, `core`, `port-kit`, `react`, `testing`.

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

Source values: bool/string/checked i32. Absolute linear animations, fixed all-success groups, short WAV audio. An audio task acknowledges startup; restoring looped audio replays it, one-shot audio uses the declared replay/stop policy. No exact sample-position restore. Timed choices/video/extensions/SaveBridge/migration are unsupported and rejected.

Snapshots contain narrative state; current durable profile is retained on load. Save success means IndexedDB transaction completion. Revision conflicts require an explicit discard/reload decision. `discardAndLoad` is that explicit resolution; normal load never silently merges nonmonotonic values. `dispose` releases this player's resources and does not cancel already committed storage transactions. Borrowed Store implementations remain caller-owned.

Original fixture and full development instructions are in the repository. This checkpoint does not certify compatibility with any commercial title.
