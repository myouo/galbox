# ADR0094: explicitly retain checked predecessor catalog aliases

A module producer may opt into inheritExtrasCompatibility. For each checked
ModuleProgram passed through extrasSources, retain its own catalog signature and
its declared predecessor signature/catalog pairs. Deduplicate identical signatures.
Only the producer opts in; default output remains byte compatible. The final
manifest uses the normal bounded schema, composition digest and release checks.
No runtime migration bypass, guessed source, new opcode or larger bound is added.
This preserves old progress when a release extends its gallery after an earlier
release already supported older editions.
