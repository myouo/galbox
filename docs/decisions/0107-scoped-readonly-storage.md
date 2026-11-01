# ADR0107: Validate the data actually returned by readonly storage queries

A load rereads the hot root several times. Each read parsed unrelated backup/import
receipts, other profiles and a duplicate activation snapshot, even when returning
only one profile/head or cold slot. For v3, retain actual hot-root/disk/decoded
working bounds, then validate only the returned profile/head, slot, journal or
summary. Profile/head reads still check live activation ID/owner/sequence/status.
Returned values are owned copies. Legacy/v2 queries retain their original path.

This does not accept unvalidated data into a mutation: every activation, claim,
confirmation, progress/history/save/preferences/import/backup write still parses
the complete hot state, checks authority/CAS and commits atomically. Unrelated
corrupt hot data may be ignored by a readonly query but still blocks writes until
resolved. Relevant corruption always rejects. No persistent format or limits change.
