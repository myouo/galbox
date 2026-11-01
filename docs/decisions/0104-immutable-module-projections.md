# ADR0104: Reuse immutable checked module projections inside the engine

Cold/warm load CPU profiles repeatedly copy, parse, normalize and freeze code
that the same ModuleProgram already verified. Keep unknown input schema, encoded
length/SHA, ABI and complete semantic-link checks at installation. Normalize an
owned body only after checking its original byte/ABI identity, then freeze it.
Assemble projections from those normalized immutable functions and a normalized
private header. Installation validates before publication and seeds the exact
closure cache; failures never publish partial bodies or projection entries.

Private package-internal readers reuse frozen projections. Core/Player receive
their own shallow program shell where incremental function attachment is needed;
the immutable code/header references cannot be mutated. Module provenance and
extras aliases remain bound to each shell. Public program()/describe()/descriptor()
still return isolated owned values. No trust token, unchecked projection or private
engine path is exposed to consumers. Registry identity remains checked on every
projection request. Cache invalidation follows successful installation only.

No Program/Snapshot ABI, restore checks, budgets or media semantics change. Verify
caller mutation, old-view isolation, failed atomic installation, registry mismatch,
real restore/continued execution and isolated actual-package consumption.
