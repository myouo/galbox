# Complete-work read capacity (W1-17, ADR0116)

2026-11-04. The real composed consumer crosses20000 read units in its seventh
chapter; preserve every unit and increase the logical Profile.read count to
50000. Profile/Snapshot/store4M/100000-node wire and working envelopes remain
unchanged. This is not truncation or an unconditional byte-capacity increase.

`pnpm generate`, `pnpm check`,457 unit tests/93 files, one real IndexedDB browser
case and `pnpm test:consumer` pass. Actual Core with extras confirms another page
from25000 historical reads, protobuf and cold restore retain25001; count50001
and a too-large string profile still reject. Existing storage atomic-refusal
fixture was updated from the old20000 count to the new50000 boundary and still
proves no partial value or receipt is committed on overflow. Browser production
Store.progress seeds historical units, then actual Player confirms a page and
saves/reopens an illustrated slot, preserving first/last historical units.

The actual larger consumer route must now be rerun separately. Full original
save codecs, target-platform fidelity and whole-game completion are not claimed.
Raw logs and synthetic generated data remain ignored.
