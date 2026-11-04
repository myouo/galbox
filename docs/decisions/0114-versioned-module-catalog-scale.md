# ADR0114: Version 3 module composition catalogs

The existing consumer plus a newly compiled narrative fragment exceeds v2's
256 function catalog; later chapters also need more than 64 code descriptors.
Add an explicit compositionVersion: 3 producer option, bounded to 1024 declared
functions, 256 code modules and 8 auxiliary asset catalogs (512 assets each).
Default output remains v2 with its original bounds and commitment bytes.

This is a catalog capacity revision, not another interpreter. Each downloaded
module retains its 128-function /4MiB bound and function node/character limits.
Runtime instruction, stack, task, stage, resident graphics and save budgets stay
unchanged. Saved active code closure remains at most64 modules; installation
batches stay at most64. Large catalogs are useful with demand loading, not an
instruction to eagerly load every body. Wire conditionals preserve v1/v2 bounds.

Version3 includes its version in the composition commitment. Old versions keep
their existing digest. Packed declarations, receipt validation, ABI/link checks,
atomic installation, scoped cold restore and catalog aliases use the same
advanced semantics. Test >256 functions and >64 descriptors using public
factories, late demand calls, save/cold restore, invalid commitments/body bytes,
old-version and new upper bounds, plus real browser and packed consumer paths.
