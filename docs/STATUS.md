# galbox-sdk 当前状态

2026-10-25。完整常用 GalGame G0–G7 仍在建设，有限 alpha 的 M0–M5/H1 历史 done 不代表功能齐备。当前分支 feat/typed-expressions-rng，基线 24d8874，本轮本地提交见 git log；未真实 publish/push/部署或执行远程 CI。tasks.json 为完整唯一状态，当前下一项 G1-02。

G0-02 完成：现有 bool/i32/string 的纯类型化表达式、checked 算术、比较/短路/条件、当前帧/全局/profile/read 查询、有界 codepoint 字符串和插值。public port-kit 的真实工厂保留类型关联和来源验证，raw Program 走 Schema/linker，不用 JS eval。G0-03 浮点/集合值族仍 todo，并已接入后续演出依赖，不提前宣称支持。

新增 text.template：保存求值后的 speaker/content、源 at 与规范模板签名。恢复不按变化后的 globals/profile 重算旧正文；可见正文即使停在后继 choice/group/end 也验证来源。缺迁移/模板改变/缺来源明确拒绝，旧槽位保留。

RNG 为 lcg32@1，显式 random.i32 闭区间和 rng.seed，拒绝取样包括所有消耗，失败仅在候选上计算不前进权威状态。Program 可固定 seed 或声明 host；CoreOptions.rngSeed 是平台中立的新运行输入，Web Player 用 crypto 采一次。Snapshot 保存 algorithm/state/draws，pending 恢复与 load 不重新采熵；旧档缺新 Program 所需随机状态时拒绝而不猜 seed。recipe 本支持集不允许随机或重播正文。

新增原创《灯塔来信·值班簿》，公开 Builder 产出 fixtures/expression-novel 与 apps/playground/public/expressions 的 Program/清单，复用原创素材，同一生产 Core/Player 跑两路线。默认基础样例不改剧情；React 仅选择实例数据。原 G1-01 持久设置/分轨音量/文字速度仍通过回归。

最终源码实际通过：frozen install/check、88 单元、37 Chromium（0 skip/flaky）、仓库外 tarball strict/skipLibCheck=false/原生 ESM 与表达式/模板/随机保存恢复/host 输入、50 CLI 命令/两个工作流、4 synthetic、性能、API/pack/publish dry-run。证据 evidence/g0-02/REPORT.md、日志/JSON/截图/source-manifest.json。首轮 UI wait 竞态保留，before-template-origin 是最终可见正文来源补强前的历史结果，最终以顶层为准。

当前 SDK 0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA=04eecad4c4bf73fda6fa8ebfdb75487984458dde675afad77ac6f51bd2fa6a56；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1，consumer/CLI/audit 一致。相对 24d8874 的 27 条按入口计新增/声明变化、无删除，Snapshot wire version=1 的可选扩展；不承诺旧二进制前向兼容或稳定 ABI。

最新参考性能：228 次语义 API P95 3.4 ms、两次 rAF 代理 P95 56 ms；最重 Core 批次 P95 1.398 ms；三次完整活动销毁 190.1/118/146.2 ms，既有 500 ms 参考目标通过。没有视觉延迟/60 FPS、真实 VRAM、全平台或大作品尺度保证。

运行 export TMPDIR=/dev/shm（本机 /tmp 配额限制），pnpm install --frozen-lockfile，pnpm dev。基础样例 http://127.0.0.1:4173/；通用章节 http://127.0.0.1:4173/?demo=expressions 。本轮服务已启动，真实点击值班簿/保存/刷新/读取，69 号与完整 RNG 保留、manifest/1 canvas/真实音频/0 pageerror 见 dev-result.json。browser 前停止 dev 释放 4173/4174。

下一项 G1-02：自动阅读/快进策略/配置输入与显示辅助，基于正式设置和媒体完成身份，不以音频启动等同语音播完，不在 React 偷改 PC。G0-03、G2 正文/NVL/文本框、G3 演出/媒体/热点、G4 图文存档/回溯、G5 流程图/鉴赏、G6 剧本 UI/完整界面、G7 原创全面验收仍未完成。N/F 缺 edition/Program/资源/真实原档附件与原作继续参照的 blocked 独立保留，不阻塞 G 任务；M6 未完成。
