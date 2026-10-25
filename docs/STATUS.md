# galbox-sdk 当前状态

2026-10-25。用户已明确目标为完整常用 GalGame 能力。M0–M5/H1 仅为有限 alpha 历史，不等于通用功能齐备；G0–G7 总体仍在建设。当前分支 feat/common-vn-preferences，基线 b06f540，本地提交见 git log；无真实 publish/push/部署或远程 CI。tasks.json 为唯一完整任务状态，下一项 G0-02。

G0-01 完成：COMMON_VN.md、ADR 0013 定义 SDK 与实例边界。Core 管剧情/可恢复规则和状态，Host 管设备效果，SDK systems/UI/storage 提供通用机制与默认界面，实例声明剧情/素材/主题/图与解锁规则。流程图、图文存档、富文本/文本框、鉴赏、剧本 UI 不能因“实例能手写”而计为 SDK 支持；M6 追加 G7 依赖。

G1-01 完成：settings 公共模块和生成 Schema/validator、独立设置 CAS、主/BGM/voice/sfx 音量、文字间隔、默认 React 设置界面。作品给 defaults、持久玩家值优先；设置与所有剧情 profile/快照分开，旧档/导入/故事备份恢复不覆盖设置。Mixer 不重复乘角色增益、不污染 Task.gain；文字偏好经 coordinator 排队，不跳 PC 或自动记已读。跨实例冲突显式 reload，未知回包按 unknown 重读，在途提交销毁返回真实事实。当前故事备份不含设置；旧自定义 Store 无端口时明确 unsupported，旧 setVolume 为 session-only。

当前源码实际验证：frozen install/check、76 单元、35 Chromium（0 skip/flaky）、仓库外 tarball strict/skipLibCheck=false/原生 ESM/公开 settings 与播放保存备份迁移、50 CLI 命令/两个工作流、4 synthetic、性能与 API/pack/publish dry-run 全部通过。证据 evidence/g1-01/REPORT.md、日志/JSON/截图/source-manifest.json；G0 文档检查另在 evidence/g0-01。旧 alpha/H1 结果对应旧支持集/包，当前用新证据覆盖。

本地 SDK 0.1.0 包 artifacts/galbox-sdk-0.1.0.tgz SHA=ffce829f33ce4bf95bf7d2546a0c9a2680cf50330a41d200f06810f5faf05a90；CLI 包 SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。consumer/CLI/release audit 摘要相同；新 settings 入口与 Player/CoreEvent/Store 等声明有增量变化，24 条按入口计的变更、无删除，不承诺稳定 ABI。仍为本地有限 alpha，不是完整通用成品。

最新参考性能：228 次语义 API P95 3.3 ms、两次 rAF 代理 P95 36.7 ms，最重 Core 批次 P95 1.339 ms；三个完整活动销毁 200.5/54.8/172.9 ms，原 500 ms 局部门槛通过。无真实 VRAM/全进程内存/其他平台保证，既有资源规模和长尾限制仍保留。

运行 export TMPDIR=/dev/shm（本机 /tmp 配额限制），pnpm install --frozen-lockfile，pnpm dev → http://127.0.0.1:4173/。本轮已启动并点击设置、立即显示、刷新、开始阅读，截图/HTTP200/manifest/真实音频/0 pageerror 在 dev-result.json。test:browser 前停止 dev 释放 4173/4174。

下一项 G0-02：通过正式 Schema/Builder/Core 实现通用类型化表达式、字符串插值、确定性 RNG 和恢复反例，为 G2/G3/G5/G6 提供公共底座。G1-02 自动阅读/快进/输入/辅助与恢复默认；G2 正文/NVL/文本框；G3 舞台/媒体/热点；G4 图文存档/回溯；G5 流程图/鉴赏；G6 剧本 UI/完整默认屏幕；G7 原创全面验收均未完成，不能提前标支持。

N-01/F-01 仍缺指定 edition/语言/补丁、可用 Program/资源、真实原档/global 附件及原作加载后继续参照；该阻塞不影响 G 通用建设。M6 未完成。当前平台仍限 Linux/Chromium156/SwiftShader 自动化参考环境，其他浏览器/移动真机/物理 GPU/headed 窗口、人耳音质与大作品尺度未认证。
