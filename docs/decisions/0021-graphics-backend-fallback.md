# 0021：图像设备选择与 Canvas 后备

用户实际报告 GRAPHICS_UNAVAILABLE: This Host requires the declared WebGL backend。优先修复图像兼容性，G3-03 保留未开始。用户已授权拓展原 WebGL-only 固定限制；仍为唯一 TS Core、同一 Pixi 场景图/单 canvas、DOM 正文/React/IndexedDB，不引入第二解释器。

锁定 Pixi 8.22.0 已含 CanvasRenderer，原 preference='webgl' 会自动回落其它后端，却被 SDK instanceof WebGLRenderer 硬检查拒绝。新 graphics.renderer=auto（默认）/webgl/canvas：auto 明确只按 WebGL→Canvas 选择；不未经验证进入 WebGPU。强制后端不静默更换。选择和原因由 Host diagnostics 报告，不写 Snapshot/profile，不改 Program 或存档格式。更换后端读取同一逻辑快照。

本轮 Canvas 支持已有 ADV/NVL/富文本/音频/交互、图像/alpha/二维 pose/层级/矩形 mask/相机/fade/shake/基础 blend。Pixi Canvas 对通用 GPU Filter 会静默跳过；当前 crossfade 使用 AlphaFilter 隔离合成，也不能直接当普通 alpha。故所有可能使用 stage.filter、crossfade、非恒等初始滤镜/多图层或 camera filter 的 Program 在资源获取和激活前报 GRAPHICS_FEATURE_UNSUPPORTED；恢复候选额外校验同样状态，不能跳过效果或提交半画面。图像滤镜/隔离转场完整 Canvas 对等是 H2-02 后续任务，仍保留完整 G7 门槛，不声称现在完全等价。

自动检测不可用和实际 WebGL 初始化失败都应走 Canvas；取消/销毁不启动替代候选。失败时清理自有 canvas/renderer/context/监听，绝不清 Pixi 全局共享池。运行中 context lost 仍暂停并允许保存，下一次创建可明确选 Canvas；本项不热切换正在播放的 GPU 设备或假装故障前没有副作用。

验证：浏览器强制禁止 webgl/webgl2 实际选择 canvas，原创两路线/IndexedDB跨刷新、WebGL↔Canvas同槽位、像素（图片/变换/裁剪/混合/相机/遮罩）、真实音频/DOM；强制模式、双设备缺失、取消/迟到初始化/双实例/坏候选保持head与槽、GPU效果前置拒绝；独立tarball调用公开选项。WebGL既有像素/性能/销毁回归保留。不能以 software WebGL 模拟无 WebGL。

依据：仓库锁定 Pixi 的 autoDetectRenderer、CanvasRenderer、CanvasFilterSystem 源码与 https://pixijs.download/v8.22.0/docs/rendering.CanvasRenderer.html 。
