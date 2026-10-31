# W1-07 — bounded leaf expansion and batch installation

2026-10-31. Public `expandModuleLeaves` expands only pure clone/mix/window leaves
with literal arguments. Calls, waits, media, operations, locals and external roots
remain intact. Call-site addresses and exact mix origin mappings are emitted.
`rebaseLeafOrigins` requires original-source validation first, rejects removed
live frames or changed duration/signature, and preserves logical IDs/time/groups.
Raw 256-function, 32-capability and wire limits remain unchanged. Foundation
markers can be explicitly omitted; default producer bytes retain the markers.

`ModuleProgram.installAll` checks the complete bounded batch (digests, ABI,
dependencies, points, links and resource release) before publishing any body.
This removes repeated prefix projection in offline producers; demand installation
still uses the existing individually checked API.

Actual checks: `pnpm check`; full units 81 files / 428 tests, including actual
137/700 ms mix -> cold module restore and bad signature/duration/live-frame cases,
plus atomic rejection of a damaged batch. `pnpm test:consumer` passes independent
strict tarball compilation and headless public expansion/installAll/origin binding,
then browser consumer checks. Logs remain ignored artifacts. This is not arbitrary
inlining, invocation migration, a legacy VM or a native save codec.
