# Galbox 标准项目与 CLI

当前已实现 init、assets build、validate、dev、build。CLI 是 Node adapter，只通过 SDK 公共 exports 生成/链接 Program，Vite 负责 HTTP 服务和静态构建，不提供第二个解释器。

本地尚未发布的候选：

```sh
node packages/cli/dist/main.js init /path/to/new-story \
  --sdk-tarball artifacts/galbox-sdk-0.1.0.tgz \
  --cli-tarball artifacts/galbox-cli-0.1.0.tgz
cd /path/to/new-story
pnpm install
pnpm assets
pnpm check
pnpm dev
pnpm build
```

`pnpm test:cli` 会先打包两者，在仓库外且含空格的目录安装并执行上述闭环，保留本地 artifacts。SDK/CLI 的公开 npm 名称尚未确认，不会自动发布。

项目结构：galbox.config.json 是有限 schema；story.mjs 是受信任 Builder 输入；port.mjs 通过 createPortRegistration 登记操作/来源；public/program.json 是发布数据。所有资源从 assetsRoot 中读取，SHA-256 从实际字节计算，路径及 symlink 不得逃逸资源目录。TypeScript checkJs 同时检查这两个 JS 模块与 TSX。

修改源或资源后先执行 `pnpm assets`；dev 服务已验证的发布数据。更改登记模块后重启 dev。build 校验已有发布摘要，不悄悄接受被替换的字节。dist 只在项目内、带 Galbox 输出标记时才允许清理，init 原子创建且拒绝非空目录。

CLI 从目标项目的直接 node_modules/galbox-sdk 读取显式公共 ESM exports，与 port.mjs 使用同一实例。不会借父 workspace 的 SDK 或私有源码路径。自造/混用登记对象会失败。

pnpm 11 的候选覆盖写入 pnpm-workspace.yaml，避免 CLI 间接依赖去下载未发布 SDK；包管理设置变更依据：[pnpm 11 官方说明](https://pnpm.io/blog/releases/11.0)。外部依赖版本固定，首次安装后可用 frozen-lockfile 复验。

下一部分 M4-02 接入可定位来源和必要行为覆盖、saves analyze/verify；没有实现的命令现在会失败，不返回占位成功。

## 来源与必要行为

ProgramBuilder.source(at,{file,line,column,locator?}) 登记 Builder/原定位；obligation 声明必要行为，mapping 将它连接到标准地址。普通 linkProgram 仍只证明标准语义合法；inspectProgram 与 CLI validate/build 另查必要映射覆盖。删除必要 mapping 会以 OBLIGATION_UNMAPPED 阻断，报告指向义务的源文件/行列。该覆盖声明不是原作忠实性认证。

公开 `galbox-sdk/diagnostics` 提供 inspectProgram、inspectSnapshot、locateAddress。快照追踪含调用帧、等待、invocation 和任务来源；旧任务没有 at 时列出声明的候选创建地址，不猜唯一来源。结构/链接错误保留标准地址和 SourceMap 位置。

```sh
galbox validate --json
galbox saves analyze snapshot.json --internal --json
galbox saves verify snapshot.json --internal --profile profile.json --json
galbox saves analyze slot.bin global.json --source fixture-save@1/lighthouse --schema fixture.original@1 --version 1 --json
galbox saves verify slot.bin global.json --source fixture-save@1/lighthouse --schema fixture.original@1 --version 1 --json
```

原档命令只使用 port.mjs 登记的明确来源，没有绑定或存在歧义时返回 needs-input/退出 2；不做通用归档识别。internal verify 要求明确提供当前 profile，不用默认值伪造恢复依据。verify 只核验标准候选，保留真人/媒体 continuation，不写存储，也不声称已由原作加载继续验证。无迁移/文本修订改变明确失败，输入档案保留。

发布清单与资源预算见 [RELEASES](RELEASES.md)。assets build 同时生成 Program 旁路 .release.json；改 source/port/resource-policy 后重新构建，validate/build/dev/saves 都检查绑定。标准模板默认 series=1，resourcePolicy=resource-policy.json，可在受控硬上限内调整。静态文件的混代会被拒绝，重复 assets build 可重建，部署不承诺跨文件事务。
