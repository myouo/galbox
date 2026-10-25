# M5-03：实际平台与性能基线

2026-10-25，基线 1f93068。`GALBOX_EVIDENCE_DIR=docs/evidence/m5-03 pnpm test:performance` 实际退出 0，构建正式 SDK/CLI/样例和测试 harness 后调用生产 Core/Player。原始样本、环境、P95/P99/max 见 [performance.json](performance.json)，命令输出见 [performance.log](performance.log)，Program 原始 SHA 见 fixture-sha256.txt。本阶段未修改 SDK 生产行为；功能/故障证据仍对应 M5-02 的 69 单元、29 浏览器和独立消费。

环境：Node 24.15.0，Linux 7.2.9-zen1-1-zen x64，AMD Ryzen 7 5800H、16 逻辑核、约 13.49 GiB 系统内存；Chromium 156.0.8078.4，1280×900、DPR 1。实际 renderer 为 ANGLE Vulkan SwiftShader Device/Subzero。HTTP 本机、禁缓存；有一个未开始的样例 Player，测量 Player 为另外的正式实例。不是物理 GPU/移动设备或 WAN 性能认证。

| 实测项目 | 样本与结果 |
| --- | --- |
| Core《灯塔来信》启动批次 P95 | 预算 1/8/100 分别 0.0077/0.0139/0.0090 ms |
| Core 1000 条 checked i32 批次 P95 | 预算 1/8/100 分别 0.0186/0.1241/1.3690 ms；50050/6300/550 批次 |
| 逻辑一致性 | 两个实际 Builder/Program，所有预算/重复运行 Snapshot 相同，运算结果 1000；构造时间单独统计 |
| 浏览器语义 API 响应 | 两条路线各 2 次、76 次输入，P95 2.4 ms，max 13.8 ms |
| 两次 rAF + layout 观察 | P95 135.3 ms，max 159.7 ms；是帧调度代理，不是实际像素呈现时间，也不等于 API 响应 |
| 创建/准备 | 3 次，median 120.9 ms，max 138.2 ms |
| dispose | 3 次，median 42.6 ms，max 1805.3 ms；软件图形设备释放存在明显长尾，未隐藏或调松断言 |
| 图像/音频 decode | 15/12 次，P95 7.2/5.5 ms |
| 首次 start 到 gl.finish | 155.6 ms，包含激活/逻辑/提交/渲染与 GPU 等待，不单独归因为 GPU upload |

工程目标只针对 Core 批次 P95 <4 ms、语义 API P95 <50 ms；两者通过。浏览器测量从直接 Player API 调用到 Promise/逻辑更新返回，不包括物理输入/CDP 传输；两帧观察仍较慢，本报告不承诺 60 FPS 或 <50 ms 的视觉输入延迟。5 次预热后测 Core，分位数用 nearest-rank；创建/释放仅 3 样本，P95 等于 max，不能推及其他设备或大作品。

实际资源：9 个源文件 120009 B；RGBA 纹理估算 7767200 B（约 7.41 MiB）；实际保留 PCM 510720 B。默认预算分别为编码 32 MiB、纹理估算 128 MiB、PCM 32 MiB。三次 dispose 后 canvas、资源数量、纹理/PCM 计数、活动声音均为 0。

CDP Runtime.getHeapUsage 在显式 GC 后记录整页 V8 heap：测前 usedSize=4568068、测后=8956968 B。后者包含新增模块/JIT/其他 Player 缓存；不是整个浏览器物理内存，也不证明全部 heap 回收或无泄漏。没有测量真实 VRAM，RGBA 数字是预算模型。原始 backing/embedder 数据均保留。

另用自制 240 帧、48 kHz、mono float32 WAV，通过正式 inspect/Host 解码及 BGM source 启动，结果 available、starts=1；它只是一个小样本，不推广到全部 WAV 编码/声道/采样率。PCM16、SVG、PNG 的真实路径及错误设备路径在 M5-02 已验证。

平台范围见 [PLATFORMS](../../PLATFORMS.md)。Windows/macOS、headed 窗口/物理 GPU、Firefox/Safari、iOS/Android 真机、后台/省电策略、人耳音质与大作品压力均未验证。当前 alpha 只保留这个自动化参考环境的证据，不把探测结果当全平台认证。下一项 M5-04：版本/API 差异、本地打包与 publish dry-run、能力/包/文档一致性。
