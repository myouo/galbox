# ADR0093: bounded producer leaf expansion

Provide an opt-in producer transform for standard ModuleParts. It expands only
leaf functions containing clone/mix/window visibility/selection and a final
return, with literal-only arguments. It substitutes numeric parameter
expressions, gives each emitted instruction a unique call-site address, removes
those leaf declarations, and emits an explicit old-origin/new-origin mapping.
Calls/waits/operations/media or recursive helpers are not eligible.

Restore mappings reject a snapshot suspended inside a removed leaf. Only mix
origins may need rebasing: select a target with identical resolved duration,
source/target IDs and method, then replace source at/signature while preserving
logical task IDs, timing, groups and object state. Old source validation remains
required before using a producer mapping. Other captured addresses remain exact.
No 256-function/32-capability/wire budget is increased.

ProgramBuilder may omit the five legacy foundation markers with an explicit
option. Those markers are not feature gates: foundational opcodes belong to
semantics galbox-core@1. Advanced feature inference/guards remain required.
The default builder retains its original marker bytes.
