# 平台与性能声明

当前 alpha 的已验证参考环境为 Linux x64、Playwright Chromium 156.0.8078.4、SwiftShader WebGL 2、Web Audio 与真实 IndexedDB。证据：[M5-02 功能/故障](evidence/m5-02/REPORT.md)、[M5-03 性能](evidence/m5-03/REPORT.md)。同名能力存在不代表其他设备可用。

| 环境或能力 | 状态 | 已执行的范围 |
| --- | --- | --- |
| Linux/Chromium/SwiftShader 自动化 | 已验证参考环境 | ADV/Pixi/DOM/React、两路线、输入、保存/刷新/备份、owner 接管、故障与完整调用迁移 |
| PNG/SVG | 当前素材可用 | 固定 SVG 与小 PNG 实际解码、尺寸/预算、错误数据拒绝 |
| WAV PCM16 | 当前素材可用 | mono 22.05 kHz 源、设备重采样、真实启动/暂停/重播/重试 |
| WAV float32 | 小样本可用 | 自制 mono 48 kHz、240 帧，实际 Host 解码与启动；其他组合未验证 |
| WebGL context loss | 故障处理已验证 | 真 WEBGL_lose_context、停止声音、暂停、保存切点；恢复需显式重建 |
| Web Audio NotSupported/closed | 故障处理已验证 | 故障注入后 unavailable/pending，真实 IndexedDB 与新 Host 恢复，profile 不重复 |
| 自动播放限制 | 当前环境可观察 | 待用户动作与启动重试，不证明移动系统策略 |
| Windows/macOS/物理 GPU/headed 窗口 | 未验证 | 没有设备证据，不承诺与软件渲染相同性能 |
| Firefox/Safari | 未验证 | 没有浏览器执行证据 |
| iPhone/iPad/Android 真机 | 未验证 | 没有真机；不以桌面 viewport 或 WebKit 模拟代替 |
| 大作品/长媒体流/视频/热点/timed-choice | 未实现或未验证 | 当前固定素材与有界预加载，不静默替代必需能力 |

可复跑 `TMPDIR=/dev/shm pnpm test:performance`。脚本保留原始样本、硬件/驱动信息、Core 预算 1/8/100 的一致 Snapshot、初始化/网络/图像与音频解码、直接语义 API、两次 rAF、gl.finish、V8 heap 与资源计数。其返回值只以 Core 批次 P95 <4 ms、语义 API P95 <50 ms 两个工程目标判定。

当前测得最重 Core 批次 P95 1.369 ms、语义 API P95 2.4 ms；两次 rAF 代理 P95 135.3 ms，dispose 有 1805.3 ms 长尾。创建/释放仅三个样本，不能作普遍分位数承诺。渲染/释放长尾尚未优化，软件参考环境不作 60 FPS/视觉响应保证。已测资源约 7.41 MiB RGBA 估算、0.49 MiB 实际 PCM；不是 VRAM/浏览器总内存测量，也不是大作品尺度认证。

发布绑定保证声明与字节一致，设备能力由实际 prepare/start 判定。没有覆盖的设备应标未验证；需要承诺某个移动设备时，先取得真实设备记录再扩充矩阵，不把“未测”改写为“兼容”。
