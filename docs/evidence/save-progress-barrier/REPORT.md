# Save progress capture barrier (W1-14, ADR0113)

2026-11-03. An illustrated save thawed the narrative, awaited the thumbnail,
then flushed progress. An intervening resource round can correctly reject that
flush with RESOURCE_PREPARING, dropping an automatic save despite a valid
captured cut. Flush captured progress/history while the narrative is still
frozen; thumbnail rasterization starts first and completes outside the freeze.
The slot/receipt transaction and same-cut image/metadata checks are unchanged.

`pnpm check` and `pnpm exec vitest run` pass450 tests /90 files. Sequential
player/harness builds followed by autosave-points/save-system/loading pass all
27 existing browser cases, including delayed-thumbnail input responsiveness,
atomic failures, disposal, refresh, same-cut pixels and load suppression.
The corrected save-resource-race fixture passes separately: a real SVG text
thumbnail waits on a controlled image src gate, a real resource sequence starts
blue preparation, then exactly one red illustrated autosave commits during that
pending round; load restores red without another revision. Fixture controls use
the browser image API so they intercept the actual packed Player host.

`pnpm test:consumer` passes isolated packed TypeScript/headless/browser play,
save, restore and backups. Final strict types and browser-shard enumeration are
checked after the fixture correction. Raw evidence stays ignored. Pending
progress I/O now belongs to the capture barrier; actual workload latency is
still measured in the independent instance, not inferred from this synthetic
case. No protocol, execution, storage or resource budget changes.
