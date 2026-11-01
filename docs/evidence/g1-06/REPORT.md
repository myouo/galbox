# G1-06: Fast playback for authored visual waits

2026-11-01; ADR0096. Skip mode emits one regular step per tick for a prompted
skippable group/delay. Core still validates permission and group membership. It
does not advance unrelated tasks or logical time, and it stops at unread text
under the existing policy. Auto keeps natural timing; unmarked/forced waits and
media completion remain barriers. No snapshot ABI or protocol limit changes.

The new scheduler test was first red against the previous built package, then
passed after rebuilding. `pnpm test`: 432 tests pass. Coverage includes budgets
1/8/100, one wait per tick, unchanged ambient fade time, auto and forced barriers,
and the first unread page. The consumer project exercises physical held Control
on its source-derived OP using the actual tarball, separately from SDK fixtures.

`pnpm check` and `pnpm test:consumer` pass. The latter installs the real tarball
in isolation and checks playback, saves, restore, portable backup and cleanup.
Physical Control and the final source/tarball pin are recorded by the consumer. No real-game payload is part of this SDK.
