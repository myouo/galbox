# galbox-sdk 当前状态

2026-10-25。Git 已初始化；M0–M2 基线 7d463b3，M3-01/02/03 分别为 06becf4、1ef8913、06e4077。当前分支 feat/stateful-operations；仅本地提交，无推送或发布。

M0–M3 已完成。M3 加入受检有状态操作/完整调用迁移、来源绑定/不可变准备计划、有界候选 recipe，以及独立 profile 的导入事务和显式激活。pending 恢复保持语义 activation ID，owner/sequence 控制接管资格，旧回执不复活。完整任务状态只以 tasks.json 为准。

最终验证：frozen 安装、pnpm check、50 单元测试、19 真实 Chromium 测试、合成兼容 suite、skipLibCheck=false 的 tarball 独立类型/播放/保存/恢复/导入/迁移通过。证据在 evidence/m3-04/REPORT.md，包含源码摘要、真实日志/JSON、失败修复和截图。旧报告只对应各自基线，当前回归以本目录为准。

运行：export TMPDIR=/dev/shm（本机 /tmp 配额满）；pnpm install --frozen-lockfile；pnpm dev，地址 http://127.0.0.1:4173/。菜单导入 fixtures/synthetic-saves/data 中的 slot.bin + global.json，检查报告→提交→显式载入；网页进度保留。样本严格标合成，不是 N/F 原档兼容。API 与约束在 OPERATIONS.md、SAVE_BRIDGE.md、ADR-0003～0006。

未完成：M4 CLI/模板/诊断、M5 便携备份/跨内容迁移/资源预算/平台与性能验收，及 N/F/M6。N-01/F-01 仍缺明确发行版/资源/原档/原作继续参照，通用 SDK 不因此阻塞。

下一项 M4-01：在现有公开 SDK 上建立真正的 CLI init/validate/assets/dev/build 与标准模板，隔离 tarball 安装验证；不得建立空命令或源码路径别名。先核对 Git/本状态和任务表，再读 M4 及相关契约/验收。
