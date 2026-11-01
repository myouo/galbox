# ADR0101: Dispatch instruction validation by its required opcode

The runtime schema generator annotates Instruction with Ajv's discriminator on
`op`. Every variant already requires a unique string constant for that field;
Ajv compilation rejects overlapping or missing tags. All fields, references,
strict extra-property checks and semantic linking remain unchanged. Unknown or
mistyped tags reject. Errors may report the selected branch instead of all
unrelated branches. Types, protobuf and the normative YAML are unchanged.

A differential test compares the generated validator against unannotated oneOf
validation on the original fixture opcode corpus and missing/mistyped/extra
fields. Real consumer cold/hot activation profiles determine the performance
result; this does not claim that all loading work is asynchronous.

Thumbnail capture also relies on the existing complete stage cache key instead
of invalidating an unchanged background. Canvas retains complete frames; WebGL
redraws its potentially discarded foreground before readback, retaining the
already owned 2D background. It still renders the authoritative snapshot;
changed/hidden views and animation phases produce different keys, and capture
still copies owned pixels before releasing the narrative freeze.
