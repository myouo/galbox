# ADR0116: Complete-work read-unit capacity

An actual composed consumer crosses20000 read units during its seventh chapter;
truncation would lose skip/unread semantics and old progress. Raise the logical
Profile.read item bound to50000, sufficient for the measured remaining corpus.
The Profile/Snapshot/store working envelope stays4M/100000 nodes; oversized
strings or larger records still reject. No snapshot fields, read-unit identity,
execution or resident limits change. Existing profiles remain valid.

Verify a25000-unit historical profile receives a new read through the actual
Core, survives protobuf and durable browser save/reopen, and remains unchanged
on refusal. Check50001 units and a large-character profile reject explicitly.
Then re-run the actual complete consumer route that exposed the limit.
