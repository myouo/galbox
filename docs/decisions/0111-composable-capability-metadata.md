# ADR0111: Compose the complete supported capability set

The linker exposes 43 supported capability identifiers, but Program/ModuleHeader
wire lists accepted at most 32 entries. A valid composition of existing stage,
text, audio, UI and timed interaction features was rejected before linking.
Set those two metadata bounds to the current supported-set cardinality (43).
Keep existing item validation and unsupported-capability refusal. Do not change
instruction/function/asset/task/resource or storage budgets, add a new opcode,
or remove declarations to fit. Existing field numbers and valid old programs stay
compatible. A test ties both bounds to the actual public capability registry and
exercises the full wire set plus public builders and modular Core with more
than 32 valid declarations. Catalog-dependent flags require their normal data.
