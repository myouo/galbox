# ADR-0007：标准项目、CLI 与项目登记

状态：采纳并实现，M4，2026-10-25。

- CLI 独立为 @galbox/cli，只导出已实现命令。项目配置是有限 JSON Schema；Node 文件/构建/摘要 I/O 留在 CLI，Core 的职责不变。
- 标准项目有受信任本地 story.mjs（Builder 输入）、port.mjs（操作/来源登记）、public/program.json 与资源目录。源模块经真实 SDK 公共工厂生成 Program；不执行原档或未知旧脚本。
- 项目登记通过 SDK 受控 PortRegistration 工厂。CLI 从目标项目解析 SDK 公共入口，与项目登记使用同一安装实例，避免混用源码/dist 或多个 SDK 的身份域。
- assets build 校验路径、资源种类/格式、SHA-256，完成语义链接后原子更新发布数据；validate 和 build 拒绝错摘要、未知操作或不完整声明。构建使用既定 Vite，产物只写项目内受控目录。
- init 不覆盖非空目录。本地未发布候选通过显式 SDK/CLI tarball 选项复制到模板 vendor 并固定依赖，验证不借 workspace alias。普通安装仍固定版本。
- M4-02 的 SourceMap/必要行为义务是声明覆盖检查，不能当作原作忠实性认证。saves analyze/verify 只准备/核验候选，不写存储、不猜输入，不将 synthetic 算作 N/F 通过。

M4-03 独立任务：标准项目在仓库外自行增加第三条路线、signal 操作、args/state/resume 全部变化的调用迁移与 synthetic binding。项目 UI 捕获 invocation/wait/epoch，仍只提交 Player 结果。旧档无迁移或 text revision 不匹配时保留并拒绝，工具不制造 fallback。
