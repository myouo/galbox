# galbox-sdk 当前状态

2026-10-25。M0–M5 通用 SDK alpha 门槛完成，H1-01 后续绘制/销毁加固也完成。分支 fix/player-disposal-latency，基线 090d6ee，本轮本地提交见 git log；没有真实 publish、push、部署或远程 CI。任务表唯一状态来源为 tasks.json，下一项 N-01/F-01 仍缺真实输入。

H1-01 真实探针复现了活动销毁 1616 ms（约 1604 ms 在 GPU loseContext），以及 destroy(true) 对外部 Pixi 全局池的越权清理。正式 Host 只在完整 stage 值变化时绘制、及时 flush，保存值副本并在 epoch 切换后重绘；仍推进正文/逻辑/进度。显式 scoped destroy 保留共享全局池、同步释放本实例 context；app.init 在取消后才完成时也清理局部 renderer。公开 API、Snapshot/Program/存档协议未变，ADR 0012 说明边界。

最终回归：frozen 安装/check、72 单元、32 Chromium（0 skip/flaky）、独立 tarball 严格类型/原生 ESM/播放保存备份迁移、50 CLI 命令/两个工作流、4 synthetic、性能与 pack/publish dry-run 全部通过。相对 090d6ee 公开声明变化为 0。新增三个浏览器场景验证静态不重复绘制/动画与读档正确绘制、多 Player 与全局池隔离、迟到 renderer 的实际 context 销毁。最终证据 evidence/h1-01/REPORT.md、各日志/JSON/CPU profiles/source-manifest.json；前期 alpha 证据只对应各自基线。

未包装生产三次活动实例各执行完整两路线各两次并保存/恢复，销毁 111.6/230/119 ms，全部满足本轮保持不变的 500 ms 参考目标；首次未 flush 的 541.9 ms 失败仍保留。228 次 API 响应 P95 2.8 ms，两次 rAF 代理 P95 50.7 ms；Core 最重批次 P95 1.359 ms。对比旧 alpha 活动销毁 1673.6 ms，但样本组成不同，不声明通用 P95 或任意 GPU <50 ms。三次拥有资源均归零，RGBA 仍为估算，V8 heap 含共享缓存/JIT，未证明无泄漏或测真实 VRAM。

当前本地 SDK 0.1.0 包 artifacts/galbox-sdk-0.1.0.tgz SHA=91d9756128bf808595dfd29bac55c16aefd6c1311da1164a36706945c1792457；CLI 0.1.0 包 SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。consumer/CLI/release audit 摘要相同，ALPHA.md 已更新，旧包证据保留历史而不冒充最新。

运行 export TMPDIR=/dev/shm（本机 /tmp 配额限制），pnpm install --frozen-lockfile，pnpm dev → http://127.0.0.1:4173/。本轮已重新启动服务并实际点击阅读/显完/备份菜单，HTTP200、1 canvas、真实音频、manifest 绑定、0 pageerror 见 dev-result.json。test:browser 前停止 dev 释放 4173/4174。复跑性能可用 GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance；profile:disposal 是当前版本的受控探针，不替代未包装生产验收。

N/F 项目内仍没有 ports、原档或已准备输入，包括忽略目录的核查也只找到 INPUTS_REQUIRED.md。收到资料后按该文档锁定 edition/语言/补丁、Program/资源指纹、槽位/global 附件与原作加载后继续参照，推进真实导入→继续→网页再保存切片。N-01/F-01 blocked，N/F 后续及 M6 未完成，不编造商业作品兼容。

范围继续为 Linux/Chromium156/SwiftShader 的自动化参考环境；其他浏览器/移动真机/物理 GPU/headed 窗口、人耳音质、大作品尺度与长期回执未认证。有限预加载/主 chunk >500 kB、长媒体流/精确 seek/视频/热点/timed-choice/GPU 自动重建等既有限制保留，见 PLATFORMS.md/ALPHA.md。
