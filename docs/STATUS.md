# galbox-sdk 当前状态

2026-10-25。M0–M4 完成。当前分支 feat/developer-cli；本轮 M4-01=e56e46c、M4-02=91ec213，M4-03 交付另有本地提交。无推送/发布，完整任务状态以 tasks.json 为准。

新增实际 @galbox/cli init/validate/assets build/dev/build/saves analyze/verify、有限项目配置、标准 Builder/port/React 模板、受控项目登记、SourceMap 与必要行为发布门槛。Core 仍为唯一 TS 生产执行路径，不依赖 Node/Vite/DOM；CLI 通过项目 SDK 公共 ESM exports 工作。

最终验收：frozen 安装/check；54 单元；40 个仓库外模板/开发者真实命令与两个浏览器工作流；19 个引擎 Chromium 回归；独立 SDK tarball 严格类型/保存/恢复/导入/完整迁移。证据在 evidence/m4-03/REPORT.md（日志/JSON/摘要/截图），本地包在 artifacts/galbox-sdk-0.1.0.tgz 与 galbox-cli-0.1.0.tgz。旧证据只对应各自基线，当前修改用最新回归。

新项目用法见 CLI.md；完整增加路线、signal、完整调用迁移与自制来源见 DEVELOPER_WORKFLOW.md。开发者任务没有 workspace alias，坏 args/缺 mapping/缺迁移/旧 text revision 均实际失败且能定位。候选 verify 不写存储，也没有原作忠实性认证。

现有样例 pnpm dev → http://127.0.0.1:4173/；验证时保持该端口空闲。本机仍用 TMPDIR=/dev/shm 避开 /tmp 配额。标准项目通过显式两 tarball 初始化后 pnpm install/assets/check/dev/build。

下一项 M5-01：便携备份/恢复、跨内容 release 的显式迁移政策与失败保留。先读 C05/C07/C11、T11/T27，继续现有保存/导入/owner 模型，不制造任意旧档 fallback。

M5 资源预算、设备/性能矩阵、发行候选未完成；N/F/M6 仍缺明确 edition、可用资源/行为、原档附件、原作加载后继续参照。合成通过不算真实兼容；SDK/CLI 未占用或公开发布 npm 名称。
