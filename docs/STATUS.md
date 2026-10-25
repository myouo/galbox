# galbox-sdk 当前状态

2026-10-25。M0–M4 与 M5-01/02/03 完成，完整状态以 tasks.json 为准。分支 feat/release-resource-budgets，M5-02 基线 308c1ae；本地提交见 git log，没有推送/发布。当前下一项 M5-04。

新增公开 galbox-sdk/release、生成的发布/预算 Schema、Program/目录/冻结注册表身份绑定、实际资源事实与预算。CLI assets build 产出 Program 旁路 .release.json，标准模板与《灯塔来信》实际消费；修改 source/port/资源/策略后须重建。旧调用者在同一 Host 路径生成 derived 清单。用法见 RELEASES.md、ADR 0009；备份/迁移仍见 BACKUPS.md。

Host 有界读取 HTTP、解码前检查图片/WAV、按设备采样率限 PCM、核对实际解码，并归还取消后的迟到租约。普通可重试启动失败清节点；明确媒体 unavailable 不冒充待点击。接管在宿主启动后确认，失败保留 pending；新 Host 恢复不重复已提交 profile 累计。实际 GPU context loss 暂停并允许保存逻辑切点，重建为显式操作。

最终回归：frozen 安装/check、69 单元、29 Chromium、独立 tarball 严格类型/原生 ESM/发布与播放保存备份迁移、50 CLI 命令及两个开发工作流、4 synthetic 兼容测试均通过。证据在 evidence/m5-02/REPORT.md、日志/JSON/截图/source-manifest.json。SDK consumer 与 CLI 安装 SDK 包 SHA 相同；本地两 tarball 在 artifacts/。本轮 pnpm fixture 已生成真实 Program/资源/发布清单；旧证据只对应其基线。

运行 export TMPDIR=/dev/shm（本机 /tmp 配额限制），pnpm install --frozen-lockfile，pnpm dev → http://127.0.0.1:4173/。当前为测试已停止旧 dev 服务。pnpm test:browser 需要 4173/4174 空闲。

M5-03 实测已完成，见 evidence/m5-03/REPORT.md、performance.json 和 PLATFORMS.md。Core 最重批次 P95 1.369 ms、76 次语义 API P95 2.4 ms；两帧观察 P95 135.3 ms、dispose max 1805.3 ms，未承诺视觉响应或 60 FPS。实际 PCM 510720 B、RGBA 估算 7767200 B，三次释放拥有资源计数均为 0；整页 V8 heap 含模块缓存，不能据此证明无泄漏。自制 float32 WAV 小样本也经生产 Host 实际解码/启动。平台仍仅 Linux/Chromium/SwiftShader，其他矩阵未验证。

下一项 M5-04：对公开声明与 308c1ae 基线做实际 API/type 差异报告，检查版本/exports/内容，再本地 pack 与 publish dry-run、独立消费者，输出 alpha 候选说明。不改变已成立的语义或外部发布范围。

M5-04 SDK alpha/API/本地发布候选未完成；N-01/F-01/M6 仍缺明确发行版、Program/资源、原档附件与原作继续参照。float32 WAV 当前为受控接入，真实媒体证据为 PCM16/PNG/SVG；没有长媒体流/精确 seek、视频/热点/timed-choice、GPU 自动恢复或真实商业作品兼容结论。
