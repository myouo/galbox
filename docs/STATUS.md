# galbox-sdk 当前状态

2026-10-25。Git 已初始化，M0–M2 基线提交为 `7d463b3`；当前分支 feat/stateful-operations。无远程推送或发布。

M0–M2 与 M3-01 已完成。新实现包括受审查 codec 工厂、冻结操作表、每 invocation 状态/等待/快照、失败原子性和完整调用迁移，实际 Player 与打包消费者均已接入。完整任务状态以 tasks.json 为准。

最新验证：34 单元测试、13 个真实 Chromium 回归、严格检查/静态构建与 tarball 独立类型/播放/保存/迁移均通过。证据在 evidence/m3-01/REPORT.md，旧 M0–M2 报告只对应基线。API 与约束见 OPERATIONS.md 和 ADR-0003。

下一项 M3-02：建立 codec/source schema 身份绑定、不可变导入准备计划及 fixture-save@1 字节/摘要/附件负例。之后继续有界 recipe、独立导入 profile 和激活幂等。N-01/F-01 仍缺真实发行版/资源/原档/原作继续参照，不因此阻塞通用 SDK。

运行仍为 pnpm install --frozen-lockfile、pnpm dev；本机测试使用 TMPDIR=/dev/shm。开发服务为运行浏览器门槛已暂时停止。未完成 M3-02～04、M4/M5 与商业作品认证。
