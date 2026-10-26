# @galbox/cli

Galbox project tooling: `init`, `assets build`, `validate`, `dev`, `build`, `saves analyze`, `saves verify`.

Use `galbox init directory --sdk-tarball sdk.tgz --cli-tarball cli.tgz` for unpublished local artifacts, then `pnpm install`, `pnpm assets`, `pnpm check`, `pnpm dev`, `pnpm build` inside the project. Settings and local package overrides are written to pnpm-workspace.yaml for pnpm 11.

story.mjs and port.mjs are trusted ESM using public SDK factories; original saves are never executed. validate checks structural/semantic links, declared mandatory behavior coverage, asset kind/header and actual SHA-256. assets build explicitly regenerates the catalog and published Program. dev serves the last valid publication; run assets after source/resource changes and restart dev after registration changes.

build validates before bundling and refuses unowned nonempty dist directories. init atomically publishes a new project and refuses a nonempty destination. Project/asset paths cannot escape through traversal or symlinks. Unknown commands or invalid command options fail.

SourceMap diagnostics retain address/file/line/column. Missing necessary mapping blocks publication even when the Program itself links. This is declared coverage, not original-game fidelity certification.

saves analyze/verify use explicitly registered sources or --internal. Internal verify requires --profile. Verification prepares a bounded candidate without storage writes or guessed human/media results; originalReference remains not-verified. Missing input and unsupported sources return exit 2; validation errors return 1.

No automatic npm publish or external deploy is performed. M5 backups/content migration/platform budgets and N/F original-reference certification are separate work.

Versioned streaming: `@galbox/cli/stream-http` exports `serveVersionedMedia(root,request,response)` and `versionedMediaPlugin(root)`. CLI dev serves content-SHA versioned GET/HEAD/Range with strong ETag/immutable headers and rejects stale versions; static deployments need an equivalent server contract. Browser code must explicitly opt into `streaming:{integrity:'versioned-url'}`. This metadata guarantee is weaker than complete client digest verification.
