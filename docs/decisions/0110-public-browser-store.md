# ADR0110: Expose the production IndexedDB Store factory

Store is already a public browser port, but an independent consumer could only
obtain its production durable adapter through a private module. Export
openIndexedDBStore(namespace, database?) from player. It validates bounded names
before opening and returns the existing production Store unchanged. Recommend
storageNamespace(gameId, series). The caller owns the connection and closes it;
passing it to Player keeps the existing borrowed-store ownership rule.

This is a browser adapter, never a neutral Core/runtime/testing dependency. No
new persistence implementation, wire format, import privilege, capacity increase
or portable-backup bypass is introduced. Typed Store callers remain responsible
for validating/mapping input through the public Core/codec contracts. Browser
tests cover durable reopen, namespace isolation, invalid names, closed access
and borrowed Player disposal; an isolated installed consumer uses the factory.
