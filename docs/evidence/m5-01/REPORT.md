# M5-01：便携备份、内容迁移与恢复失败

2026-10-25；工作目录 `/home/myo/Desktop/galbox-sdk`；基线 `8980849`；分支 `feat/portable-backups`。Node 24.15.0、pnpm 11.28.5、TypeScript 5.9.3、Chromium 156.0.8078.4；Linux、软件 WebGL/Web Audio。临时目录使用 `/dev/shm`。当前源码与包摘要见 [source-manifest.json](source-manifest.json)。本次仅本地提交/打包，没有推送或公开发布。

实现对应 [ADR 0008](../../decisions/0008-portable-backups.md) 和 [BACKUPS](../../BACKUPS.md)。正式 `galbox-sdk/backups`、Player、默认 React UI、内存与真实 IndexedDB adapter 使用同一实现；没有第二个剧情解释器。

- 导出单次事务的全部持久 profile 与当前/上一槽位闭包，包含 recipe/onLoad/provenance，保留修订与 profileBasis。至多 1000000 JSON 字符、64 profile、128 槽位；不含资源、原档附件、活动未保存位置、旧 activation 权限或回执。
- 准备先做 Schema、闭包、生产 Core 和有界 recipe 校验。源数据保留，跨 release 必须显式完整迁移；完整 invocation 迁移仍由已冻结的真实操作注册表负责。
- 恢复仅原子添加独立 profile/槽位与幂等回执，main、原槽位和 head 保持原值。load 单独激活。只有普通进度时，默认 UI 列出持久 profile，刷新后可明确从头开始；公开 API 为 start(profileId)。
- 提交失败、同 ID payload 改变、缺引用/上一 metadata、错误作品/系列、过大输入明确失败。丢失回包使用同一 plan 重试；提交后 dispose 返回 committed/disposed 的事实。

## 实际验证

以下命令全部退出 0；日志和结构化结果均为实际执行结果。提交前仅规范化日志行尾空白，保留全部命令、结果和错误。

| 命令 | 结果与证据 |
| --- | --- |
| `pnpm install --frozen-lockfile` | 锁文件一致；[install.log](install.log) |
| `pnpm check` | 生成一致性、严格类型、headless 无 DOM/Node 编译、导入边界通过；[check.log](check.log) |
| `pnpm test` | 10 文件、63 测试通过；[unit.log](unit.log) |
| `GALBOX_EVIDENCE_DIR=docs/evidence/m5-01 pnpm test:browser` | 内含 SDK/CLI/样例与 harness build；24 Chromium 用例通过，0 skip/flaky/unexpected；[browser.log](browser.log)、[browser-results.json](browser-results.json) |
| `GALBOX_EVIDENCE_DIR=docs/evidence/m5-01 pnpm test:consumer` | 仓库外安装真实 tarball，strict/skipLibCheck=false，原生 Node ESM、浏览器播放/保存/备份、完整扩展调用迁移通过；[consumer.log](consumer.log)、[consumer-result.json](consumer-result.json) |
| `GALBOX_EVIDENCE_DIR=docs/evidence/m5-01 pnpm test:cli` | 40 条独立项目真实命令及两个浏览器开发工作流通过；[cli.log](cli.log)、[commands.json](commands.json)、[result.json](result.json) |
| `GALBOX_EVIDENCE_DIR=docs/evidence/m5-01 pnpm test:compatibility` | 4 个 synthetic 测试通过，N-01/F-01 均 needs-input；[compatibility.log](compatibility.log)、[compatibility-result.json](compatibility-result.json)、[synthetic-results.json](synthetic-results.json) |
| `pnpm dev` + Playwright 实际点击 | HTTP 200、1 个 canvas、真实音频 starts=1/decoded=4、备份菜单可用、0 pageerror；[dev.log](dev.log)、[dev-result.json](dev-result.json)、[菜单截图](dev-menu.png) |

新增 8 个备份语义测试和 1 个原生 ESM 回归测试；新增 5 个真实浏览器场景。浏览器实际验证下载 JSON、损坏/旧 release 拒绝、恢复到新分支、跨刷新、另一数据库消费、显式译文迁移、无槽位进度恢复，以及 IndexedDB quota 注入导致的整事务回滚。已开始的恢复不借调用方后续修改的对象；丢失回包重试不重复钩子；提交后销毁不关闭借用存储。截图 [backup-restored.png](backup-restored.png) 对应恢复后真实舞台，行为断言另由测试证明。

T11 分项：同稳定地址的新正文 revision/content 未迁移时拒绝；显式迁移重置揭示位置，按声明映射 ReadUnit，不继承未读内容。T27 分项：删除节点、无迁移、旧 release 不可取得时拒绝且保留旧备份/原槽位，可再次导出。迁移输入冻结、输出隔离，禁止丢失 profile/槽位/上一修订，目标 Program/registry 改变使旧计划失效。现有 M0–M4 语义、生命周期、原档 synthetic、CLI 与独立消费同时回归。

## 曾失败的验证与修复

初次 tarball 的原生 ESM 导入失败：新增 minLength/maxLength 让 Ajv standalone 生成 CommonJS ucs2length require，浏览器构建掩盖了缺失运行时依赖。已使用与现有兼容系列一致的有界 pattern，并加入原生 Node import 测试；最终生成物没有 CommonJS require，SDK 仍无需运行时 Ajv。见 [consumer-initial.log](consumer-initial.log)。

首轮新浏览器测试误读折叠诊断区的 innerText，故障 fixture 缺少 counter 初值；已改用 textContent 与真实初值。完整回归还暴露旧动画测试跨两次 RPC 的 100 ms 时钟竞态，以及正文相同导致未等待 load 完成的测试竞态；已固定测试时钟并等待实际 profile/lifecycle，未删动画/恢复断言。失败日志分别在 browser-initial*、browser-clock-failure*、browser-load-wait-failure*。before-profile-entry/ 是补齐无槽位进度 UI 前的历史结果，不作为最终通过证据；最终以本目录顶层最新日志/JSON 为准，临时 trace 可能已被后续运行覆盖。

## 本地包与边界

SDK `artifacts/galbox-sdk-0.1.0.tgz` SHA-256：`62987138bcea075ef27353e7a5717f3755e6a47043751761daf6c98f440cc6c7`。SDK consumer 与 CLI 项目实际安装并测试的包摘要一致。CLI `artifacts/galbox-cli-0.1.0.tgz` SHA-256：`17f8baf6d74333b2592cd1482735fc92a2276cc64eb24120c419b60d65c612a5`。源码摘要与包记录可复核；artifacts 按仓库规则不提交。

Vite 仍有主 chunk 超过 500 kB 的真实提示，整包预加载、回执长期留存的预算尚未加固。没有性能测量、移动真机/其他浏览器认证、人耳音质认证、跨系列迁移、自动旧 release 获取或备份真实性签名。此阶段不声明完整 SDK alpha 或真实商业作品兼容。

M5-01 完成；下一项 M5-02：先规定 release 闭包、有限能力与资源预算，再补发布绑定、预算/设备失败和取消迟到的验收。M5-03/04 未完成。N/F 仍缺明确发行版、可用 Program/资源、原档附件与原作加载后继续参照；合成测试不替代这些输入。
