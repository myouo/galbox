# ADR0119: Complete-work v3 function declaration capacity

A source-led consumer composes 1,254 functions when keeping the original
normal story and adding post-clear story variants. Removing original functions
would break existing save identities. Raise only the explicit v3 function
catalog from 1,024 to 2,048 declarations. V1/v2 bounds and the default v2
producer remain unchanged. Existing v3 documents retain the same commitments;
a larger composition gets its own release and requires a supporting reader.

The 256-module, 8 auxiliary catalog, 16M/512000-node tree-v1 envelope,
128-function/4MiB body, 64-module live closure/batch and all function, runtime,
resource and save budgets remain unchanged. This is checked metadata capacity,
not eager code loading. Schema, producer and module reader must agree.

Verify the exact 2,048 limit and refusal at 2,049 via public factories, old
version refusals, late demand loading and scoped cold restore above 1,024,
real IndexedDB refresh/illustrated restore, and isolated tarball consumption.
