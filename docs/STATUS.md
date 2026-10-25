# galbox-sdk 当前状态

2026-10-25。当前分支 feat/developer-cli，从 M3 完整检查点 b4e1851 接续；仅本地提交，没有推送或发布。完整任务状态以 tasks.json 为准。

M0–M3 与 M4-01/02 已完成。新增 @galbox/cli 的 init/validate/assets build/dev/build、有限配置生成、标准 Builder/port/React 模板和受控 PortRegistration。CLI 从项目自己的 SDK 公共 ESM exports 加载，不借 workspace 源码。

最近验证：pnpm check、54 单元测试；仓库外 tarball 安装模板并执行 28 个真实命令，frozen 安装/严格类型/静态构建/HTTP dev/浏览器保存刷新恢复通过。记录在 evidence/m4-02/REPORT.md。M3 的 50/19 回归对应 b4e1851；M4 后续整合仍须重验受影响路径。

运行现有样例仍为 pnpm dev；新项目按 CLI.md 传 artifacts 下的两 tarball 后安装/运行。本机工具继续使用 TMPDIR=/dev/shm。CLI 的 dev 服务是独立模板测试时启动/关闭，不占用现有 4173 服务。

SourceMap/必要行为发布门槛与 saves analyze/verify 已实现，仍只准备候选。下一项 M4-03：在仓库外标准项目增加扩展、完整调用迁移与合成 binding，实际浏览器交互/导入并用故障定位闭合文档。

M4-03、M5、N/F/M6 未完成。真实 N/F 版本/素材/原档/原作继续参照仍缺；不会以 synthetic 通过代替。平台/性能/跨内容版本迁移/原版导出等限制保持。
