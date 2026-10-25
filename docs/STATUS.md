# galbox-sdk 当前状态

2026-10-25。G1-02 已完成有限支持集，完整常用 GalGame G0–G7 仍在建设。分支 feat/playback-modes-input，基线 935f8e8，本轮本地提交见 git log。无外部发布、push、部署或远程 CI。tasks.json 是完整状态唯一来源，下一项 G2-01。

G1-02：协调器 Auto/已读快进，真实 voice 自然结束门控，实例键盘映射，字号/文本框背景透明度，偏好 v1→v2，JSON 导入导出与恢复作品默认。Auto 等正文显完、当前语音自然结束及 active-time delay，暂停不补墙钟，到选项的同次稳定结果停止；快进不猜选项、不跳真实等待，未读需显式允许。媒体 epoch/task/attempt 过滤过期/重复回调。新运行/load/pending 接管从 manual 开始；模式与设备结束状态不进 Snapshot，音频 completed 仍只代表启动。

设置独立于剧情/profile/故事备份；v1 迁移保留 audio/text/revision，v2 在持久成功后应用，坏输入/冲突不半写。字体和背景辅助不改剧情身份，不代表自定义文本框/富文本/NVL 已实现。规则见 ADR0015、PLAYBACK.md、SETTINGS.md。

最终源码通过 frozen install/check、95 单元、41 Chromium（0 skip/flaky）、仓库外 tarball strict/skipLibCheck=false/原生 ESM 与公开 API、50 CLI 命令/两个工作流、4 synthetic、三次完整活动性能、API/pack/publish dry-run。证据 evidence/g1-02/REPORT.md、日志/JSON/截图/source-manifest.json。首轮夹具错误、选项停止时序问题及布局修正前结果均保留归档，最终结论以顶层重验为准。

SDK 0.1.0 本地包 artifacts/galbox-sdk-0.1.0.tgz SHA=7a2d1efd32c5337d85644010c9621e7c7aac323917b58a27973d412681b149be；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1，consumer/CLI/audit 一致。相对 935f8e8 按入口计 16 新增/10 声明变化，无导出删除；偏好 v2 不能由旧二进制前向读取，故事 Snapshot ABI 未变，仍不承诺稳定 API。

本机参考：228 次语义 API P95 3.4 ms、两帧观察 P95 38 ms、最重 Core 批次 P95 1.398 ms、三个活动销毁均小于 500 ms。仅 Linux/Chromium/SwiftShader/Web Audio；无视觉延迟/60 FPS、真机/物理 GPU/真实 VRAM/人耳音质或大作品保证。

运行 export TMPDIR=/dev/shm（本机 /tmp 配额限制），pnpm install --frozen-lockfile，pnpm dev。基础 http://127.0.0.1:4173/；表达式章节 /?demo=expressions。当前 dev 已启动，真实 UI 自动走到分支并跑完海岸结局，保存后刷新/读旧槽位保留 9 条已读、解锁和当前设置，1 canvas、真实音频、0 pageerror，见 dev-result.json。browser 前停止 dev，释放 4173/4174。

下一项 G2-01：结构化正文/Ruby/有限文字效果，先定 ADR/恢复支持集，再沿 Schema/工厂/Core/DOM/保存来源验证落地；Auto 使用正式揭示状态。G0-03 浮点/集合、G2–G7 其余正文/演出/图文存档/流程图/鉴赏/剧本 UI/全面验收仍未完成。N/F 缺 edition/Program/资源/真实原档附件与原作继续参照，blocked 独立保留，不阻塞 G 工作；M6 未完成，synthetic 不是真实兼容认证。
