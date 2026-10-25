# M5-04：版本/API 与本地 alpha 候选

2026-10-25，生产/测量接续基线 b88c257；本阶段最后补齐 ReadUnit 身份和 profile 提交输出两项约束，见 ADR 0010/0011。Node 24.15.0、pnpm 11.28.5、npm 11.12.1、TypeScript 5.9.3。候选与范围见 [ALPHA](../../ALPHA.md)。

`GALBOX_EVIDENCE_DIR=docs/evidence/m5-04 pnpm test:release` 实际退出 0，见 release.log。脚本自己构建当前 SDK/CLI、打包当前源码，创建 308c1ae 的 detached 临时 worktree 并编译其真实 SDK；同一锁定依赖版本通过链接可用，旧 SDK 源码没有替换。原生 Node 加载每个公开 ESM 入口，TypeScript strict/skipLibCheck=false 检查全部公开声明和可达声明依赖，CSS 文件实际存在。

API 前后在 api-before.json/api-after.json，结果在 release-audit.json。入口 11→12，新增 release；按入口计有 9 条导出增加和 1 个新入口、8 条声明变化、0 删除。可达声明文件变化另有 SHA，覆盖引用类型的变化。声明变化包括 AssetRequest、PlayerOptions/PlayerView、OperationRegistry 和 SaveBindingRegistry；不能把“无删除”当成自动语义兼容认证，迁移注意事项在 ALPHA.md。

初次基线编译缺 Pixi 解析，因为仅链接 workspace 根 node_modules；baseline-build-first.log 保留真实错误。增加基线 SDK 自己的锁定 node_modules 链接后真实编译通过。临时 worktree 每次清理，git worktree list 无残留；未放宽 strict、未用当前声明冒充旧声明。

SDK/CLI 包均 0.1.0，ReleaseManifest.sdk 与包版本一致；Snapshot schema 仍为 1。CLI tarball 中 galbox-sdk 依赖已解析为 0.1.0，未保留 workspace:*；真实 bin 可执行。sdk-pack.log/cli-pack.log 对应本次 pnpm pack，不依赖历史 artifacts。包与本目录最终独立 SDK/CLI 消费摘要一致；M5-02 是约束修复前的历史基线：

- SDK SHA-256：f93bdb6f83cb72e4e00e5286f0efe3cc9f43433702047be0778c1155b777a6a1
- CLI SHA-256：f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1

两个真实命令均退出 0：`npm publish <对应 tarball> --dry-run --ignore-scripts --tag alpha --access public --json`。见 sdk-publish-dry-run.log/cli-publish-dry-run.log，机器输出记录包身份、完整文件表及内容大小，实际发布=false。dry-run 不是 npm 名称所有权、账号权限或许可证审批证明；包仍 UNLICENSED，没有真实 publish、push、部署或远程 CI 执行。

最终代码再次真实通过：frozen 安装/check、72 单元、29 浏览器（0 skip/flaky）、50 独立 CLI 命令、严格类型/原生 ESM/播放保存备份迁移与显式发布清单的 tarball consumer、4 synthetic 兼容测试，见本目录各日志/JSON。消费者、CLI 和 release audit 的 SDK/CLI 包摘要一致。早期 [M5-02](../m5-02/REPORT.md) 是约束修复前的通过基线，不能替代本目录重验。

最终审查的 ReadUnit 反例通过真实 Builder/linker 拒绝 a@b/c 与 a/b@c，旧 wire Snapshot 仍能导出；profile 合法增量组合超限的反例先实际失败（profile-bound-first.log，错误地提交了回执），再用现有 parseProfile 验证候选整体后整批拒绝，旧值/head/槽位不变。3 个新单元反例使总量 69→72。未收紧旧 Snapshot/Profile wire 以清除旧数据，也没有猜分割或删除已读。before-read-identity 与 before-profile-bound 是早期包/测量，最终以顶层为准。

最终性能再次运行 test:performance，见 performance.json/performance.log：最重 Core 批次 P95 1.341 ms、76 次语义 API P95 2.5 ms；两次 rAF 代理 P95 128.8 ms、dispose max 1673.6 ms。两个工程目标通过，视觉/释放长尾仍保留，初始 [M5-03](../m5-03/REPORT.md) 曾测到 1805.3 ms 释放长尾，不据重跑隐藏风险。V8 heap 测前/GC 后 4572076 B，全部测试释放/GC 后 8964312 B，包含新增模块/JIT/其他 Player 缓存，不能据此证明无泄漏。拥有资源三次归零、PCM=510720 B、RGBA 估算=7767200 B；没有实测 VRAM。

CI 已配置完整历史并加入 test:release；没有远程 CI 结果，不凭配置宣称 CI 通过。本地最终 check/dev 证据与源码/包摘要另在本目录。dev-result.json 实际记录 HTTP 200、manifest origin、9 资源、1 canvas、Web Audio starts=1/decoded=4、0 pageerror，截图 dev-alpha.png；服务留在 127.0.0.1:4173。M0–M5 达到本地 alpha 范围；N-01/F-01 的真实输入阻塞继续保留，M6 未完成。
