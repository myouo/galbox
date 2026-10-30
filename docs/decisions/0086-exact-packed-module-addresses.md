# ADR0086: exact packed module address declarations

Version 2 producers may opt into `packedDeclarations`. Each ModuleFunction keeps
`addresses: [entry]` and carries the entire ordered address list in the optional
newline-delimited `packedAddresses` field. This replaces repeated JSON nodes,
not address identities. The 10,000-address, 128-character ID and existing global
wire budgets remain unchanged. The string is bounded by that same finite list.

ModuleProgram expands and validates declarations before indexing any addresses;
installation compares the exact expanded ABI with the checked code body. Its
external manifest, identity and composition commitment retain the packed form.
Descriptors remain external; declarations and snapshot closure use the full list.
Duplicate/invalid addresses, ambiguous dual lists and mismatched bodies fail.
Version 1 rejects the field. Existing manifests and code bytes are unchanged.
Older version 2 readers that drop this unknown field fail the composition hash.

This does not add lazy story execution, change control flow or raise input limits.
