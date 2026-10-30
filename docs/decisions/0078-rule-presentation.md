# ADR0078: Verified display masks for native rule images

Some source engines decode rule JPEGs directly as grayscale. Decoding the same
JPEG as ordinary RGB can retain chroma artifacts and does not satisfy the SDK's
opaque grayscale rule contract. A port can provide a verified, canonical mask
as a view resource through `RulePresentation`, using the existing independent
PresentationAssetCatalog. Core instruction IDs, Program/release digests and save
state stay unchanged. No rule format guard or resident budget is relaxed.

Pairs name a Core image and a declared image mask with the same dimensions.
Only rule sampling resolves the alternative; ordinary scene images retain their
original textures. Mask resources participate in mandatory preparation, leases,
integrity checking and captures, and are not evicted during a transition.
