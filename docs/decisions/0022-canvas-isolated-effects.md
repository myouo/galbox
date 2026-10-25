# 0022：Canvas 隔离合成、滤镜与预算

H2-02 沿同一 Pixi 场景图，在本实例 Canvas filter push/pop 中建立透明离屏栈；不重写剧情、动画或另一套对象变换。支持既有 blur/brightness/grayscale、四层权重 crossfade、父子与相机组滤镜。效果任务/解析参数继续由原 Core/Snapshot 权威决定，后端和缓存不入档。

交叉淡化在透明面上按 premultiplied RGBA 加权相加，随后按原 filter.blendMode 合成父层，不把权重 source-over。组滤镜在组绘制完成后依原顺序处理，色矩阵在未预乘 RGB 上运算；blur 优先 Canvas 原生 filter，缺该 API 时用三次可分离 box Gaussian 近似，使用预乘颜色/alpha避免黑边。模糊是有容差的光学近似，不承诺和 WebGL 核逐像素相同；颜色/alpha/隔离权重严格用实际 RGBA 验收。

通过实例级 Pixi filter 方法适配，不改全局扩展/原型、不清共享池。每帧先在私有 back buffer 绘制，成功后一次提交到可见 canvas；异常恢复 Pixi context/projection/blend，立即释放本实例中间缓冲，保持上一有效 canvas 画面并报告设备失败，不能留下半画面。

新增可选 GraphicsOptions.maxCanvasBytes（1..512MiB，默认64MiB）。精确预检快照树中的滤镜路径/图片层隔离深度/blur padding（按32px量化），计入RGBA back buffer、离屏栈、native scratch、色矩阵ImageData或CPU blur Float32双工作区。它是逻辑RGBA/工作数组估计，不等于浏览器实际RAM。尺寸由1280×720 viewport与有限blur路径推导，不按任意脚本坐标扩大分配；余量防止屏幕外模糊贡献被截断。尺寸/深度变化先释放旧自有缓冲再分配，缓存有界；预算拒绝不分配，不提交候选head，运行中失败明确暂停。

Program可在资源获取前做最小预算检查，恢复候选在激活前做完整计划检查；实际每帧再检，不猜未来表达式。默认预算内运行原创光影章节与完整既有G3-01支持集；病态滤镜层叠超预算明确拒绝，调用者可在上限内配置。旧未带选项的用户保持默认，wire Snapshot=1/Program不改。Schema生成选项类型与validator，真实公开工厂/Core和两后端消费者证明同一生产路径。

验收含无WebGL的完整舞台章节两路线/保存刷新，透明crossfade、父子/相机滤镜、clip/blend/alpha、CPU blur fallback与清理、预算/故障保head与画面、实例隔离、独立tarball、原WebGL像素及性能回归。未引入任意shader/非矩形mask/新效果、WebGPU、视频/网络流或真实两作认证。

依据：锁定Pixi8.22.0的CanvasRenderTargetAdaptor/CanvasContextSystem/FilterPipe源码，https://pixijs.download/v8.22.0/docs/rendering.CanvasRenderer.html ，https://html.spec.whatwg.org/multipage/canvas.html#compositing 。
