# ADR0113: Flush captured progress before releasing the capture barrier

Illustrated save starts thumbnail rasterization while the narrative is frozen.
Flush the captured cut's pending progress/history before thawing, then await
the asynchronous thumbnail outside the freeze. A later tick may begin resource
preparation; it cannot invalidate or block persistence of the already captured
cut. Do not flush an uncommitted later resource target or silently discard a
failed autosave. The capture promise retains authority/generation checks and
the existing atomic slot/receipt path. No protocol or budget changes.

This adds pending durable progress I/O to the capture barrier; thumbnail I/O is
still outside it and starts before progress flush. Verify active resource
sequences with a deliberately delayed real thumbnail, same-cut pixels, exactly
one autosave, load suppression, failures/disposal and actual workload latency.
