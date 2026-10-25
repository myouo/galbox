# @galbox/cli

Local Galbox project tooling. Implemented commands: init, assets build, validate, dev, build.

Use `galbox init directory --sdk-tarball sdk.tgz --cli-tarball cli.tgz` for unpublished local artifacts, then `pnpm install`, `pnpm assets`, `pnpm check`, `pnpm dev`, `pnpm build` inside the project.

`story.mjs` and `port.mjs` are trusted project ESM code using public SDK factories; original saves are never executed. `validate` checks the published Program, semantic links, asset kind/header and actual SHA-256. `assets build` explicitly regenerates the catalog and published Program. `dev` serves the last valid publication; after source/assets changes run `pnpm assets` and restart dev if registration changed. `build` validates before bundling; it does not silently accept changed bytes.

init refuses nonempty directories; asset/project paths cannot escape via traversal or symlinks. Unknown commands/options fail. Output is local; there is no automatic publish/deploy.
