# ADR0095: Revision-checked save protection

Add optional `SlotMetadata.protected` (absent means false), `Store.protectSlot`
and `Player.protectSave`. Protection changes increment the slot revision without
replacing either snapshot, capture, previous metadata, profile or activation head.
Saving and deleting reject a protected record inside the same durable transaction
that checks its revision; caller metadata cannot remove protection. Loading and
backup transport remain available. Unprotecting requires the current revision.
Existing records remain readable; no snapshot ABI changes. Stores without the
optional port explicitly reject protection. Auto/quick selection does not bypass
the durable check. Receipt retries still report the original committed outcome.

Validate memory and real IndexedDB transactions, stale writers, protected delete,
backup round trips and schema/protobuf compatibility through public APIs.
