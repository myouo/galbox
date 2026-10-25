# galbox-sdk 当前状态

2026-10-25。M0–M4 与 M5-01 完成；M5 其余任务未完成。当前分支 feat/portable-backups，基线 8980849，本轮本地提交见 git log；没有推送/公开发布。完整任务状态以 tasks.json 为准，当前下一项 M5-02。

M5-01 新增正式 galbox-sdk/backups、Player 备份/准备/提交、显式完整内容迁移、IndexedDB 单事务导出和原子独立分支恢复。保留全部持久 profile、当前/上一槽位、recipe/onLoad/provenance 和原始修订；不转移 activation 权限，不覆盖 main/旧槽位。未保存的剧情位置、资源字节和原档附件不在备份中；总量有界。没有槽位的普通进度也可在默认菜单跨刷新选择，明确从头开始；公开 start(profileId)，无参数仍用 main。用法见 BACKUPS.md，支持集见 ADR 0008。

最终回归：frozen 安装、check、63 单元、24 Chromium 用例（0 skip/flaky）、独立 SDK tarball 严格类型/原生 ESM/浏览器播放保存备份/完整 invocation 迁移、40 条独立 CLI 命令及两个开发浏览器工作流、4 个 synthetic 兼容测试均通过。证据在 evidence/m5-01/REPORT.md、顶层日志/JSON/截图和 source-manifest.json。旧阶段证据只对应各自基线；before-profile-entry 与失败日志为历史记录。已修复 Ajv standalone 的 CJS helper 导致原生 ESM 打包消费失败，补了回归，未添加运行时 Ajv。

本地包 artifacts/galbox-sdk-0.1.0.tgz 和 galbox-cli-0.1.0.tgz 已实际独立安装验证；SDK consumer 与 CLI 测得 SDK 包 SHA 相同，具体摘要在报告。运行 pnpm install --frozen-lockfile；本机用 export TMPDIR=/dev/shm 避开 /tmp 配额。pnpm dev → http://127.0.0.1:4173/，本轮服务已启动，实际点击阅读/备份菜单、Pixi canvas/Web Audio/0 pageerror 另有 dev-result.json。test:browser 前应停止该开发服务以释放严格端口。

下一项 M5-02：读取 C10/C11、T12/T13/T16/T22/T25/T28，先写不可变发布闭包、有限能力与资源预算 ADR，再实现发布绑定/预算拒绝及设备失败、取消迟到验证。保持现有 TS Core/Host/Pixi/DOM/React/IndexedDB 路线；按素材证据增加必要媒体能力。当前仍整包预加载、主 chunk >500 kB、回执长期留存，尚无预算或性能测量认证。

M5-03 平台/性能矩阵与 M5-04 SDK alpha 候选未完成。N-01/F-01/M6 仍缺明确 edition、可用 Program/资源、原档附件和原作加载后继续参照；合成通过不算真实兼容。其他浏览器、移动真机、人耳音质、跨系列迁移和自动旧 release 获取未验证/未实现，详情见能力表。
