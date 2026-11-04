# ADR0115: Bounded v3 catalog envelope and component commitments

A real composed catalog exceeds the generic4M JSON envelope despite every
header/catalog/descriptor satisfying its own bound. For v3 with the explicit
commitment tree-v1 marker, allow a separate16M-character/512000-node catalog
envelope. Snapshot, Profile, save, body and active-working-set limits do not
change. Unmarked v3 and v1/v2 retain their original4M/100000-node wire limits.

Tree-v1 commits the checked header, each code descriptor, function order, each
asset catalog, authored points and each predecessor catalog separately. The
manifest identity commits that composition plus the complete release record.
No individual digest requires a giant generic JSON message. Earlier unmarked
v3 commitments/identities remain valid; default v2 output stays byte-identical.
The new optional marker has protobuf tag10 and is refused on old versions.
Producers must preserve old source manifests and use a new release identity
when changing composition format; a metadata re-encode is not a save migration.
