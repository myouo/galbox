# 独立开发者工作流

完整可重跑示例由 `pnpm test:cli` 在仓库外生成，安装 artifacts 对应的 SDK/CLI tarball；源码见 tests/cli 的三个 advanced 文件。这些文件本身只 import SDK 公共入口，没有 workspace alias。

## 从标准项目开始

按 CLI.md 初始化并运行 `pnpm assets`。story.mjs 使用正式 ProgramBuilder，port.mjs 使用 createPortRegistration；主界面只 createPlayer/订阅只读视图/提交语义动作。源 JS 由 checkJs 严格检查，界面是 TSX，均不需要 any 或强制断言。

## 增加路线与操作

在 choice 的 options 增加目标，在同一主函数添加 text/profile/jump，最后回到现有 ending。示例增加“写一封新的回信”第三条路线，确认结局后解锁 mailUnlocked，运行真实 Core。

复杂规则在 port.mjs 通过 codec/defineOperation 注册。示例信号操作第一次 start 计算 2 并等待，收到声明的 finish 后变为 5。initialize 只在新调用发生；快照保存 args/state/phase/wait，恢复只重建请求身份。

界面 Signal 组件读 invocation/wait，按下时构造 result 并捕获 epoch，释放时调用 resumeOperation；菜单/epoch 改变会清除旧动作。不要把旧回调重标成当前 epoch，也不要由 React 推进 PC。

## 迁移已有等待

示例同时保留 v1/v2 定义：args 从 delta 变为 step，state 从 count 变为 total，resume 从 continue/value 变为 finish/amount。defineInvocationMigration 处理完整调用，再经恢复链接核验。CLI 验证旧档后报告 version=2、resumeKind=finish；旧文件仍为 v1。删除迁移时返回 INVOCATION_MIGRATION_REQUIRED，不能仅把 state 填成默认值。

## 原档来源与候选

示例另行登记 developer-synthetic@1 的 original.json，显式 locator=main:signal、value=2，使用实际 bytes/UTF-8/schema/digest 端口。来源 mapping 通过同一生产 Core 建立已知的等待位置，没有替用户完成信号或媒体。recipe 只增加候选 loads，准备和 verify 不写存储。

`galbox saves analyze` 查看 source/grade/差异，`saves verify` 核验标准候选并保留等待。界面准备→提交→载入是三个独立动作；导入独立 profile 后 loads 从 4 到 5，自定义信号仍要用户确认。这个格式是自制 synthetic，不是 NScripter/KAG 或商业原档认证。

## 定位失败

- 改错信号 args：CLI 报 CODEC_VALUE，含 main:signal、story.mjs:9:1。
- 删除必要映射：即使 linkProgram 合法，CLI 以 OBLIGATION_UNMAPPED 阻断 validate/build。
- 文本修订变化：旧快照返回 RESTORE_TEXT，定位当前源；输入档案不被修改，不猜 fallback。
- 缺迁移：拒绝并保留旧档；缺来源/profile：明确 needs-input/参数失败，不造默认进度。

当前只验证标准状态与声明覆盖；原作忠实性、跨内容 release 迁移、便携备份、其他平台和性能预算仍由后续任务承接。
