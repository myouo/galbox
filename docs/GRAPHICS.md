# 图像设备与 Canvas 合成

默认 createPlayer 的 `graphics: {renderer: 'auto'}` 按 WebGL2→Canvas2D 选择。省略 graphics 等价于 auto；强制 `'canvas'` 使用兼容路径，强制 `'webgl'` 不暗换设备。依旧是同一 Pixi 场景图、TS Core、DOM 正文、React UI 与 IndexedDB。设备选择不进入 Snapshot/profile，也不改变 release。

playground 的 `/?renderer=canvas` 可强制兼容；`?demo=stage&renderer=canvas` 可游玩完整原创光影章节。诊断 resources.renderer/graphicsFallback 报告实际选择，canvasBlur 为 native/cpu，canvasBytesEstimated/canvasPeakBytesEstimated/canvasSurfaces 报告本实例合成工作区。开始屏幕标识兼容模式。

Canvas 现已支持既有 G3-01 有限集：二维 pose/层级/矩形 clip、相机/fade/shake、normal/add/multiply/screen，brightness/grayscale/blur、最多四层加权交叉淡化、父子组与相机组滤镜。任务仍由 Core 活动时间完成，快照仍保存解析参数与来源，读档不按后来变量重算。ADV/NVL/富文本、音频、输入与存档系统共用原实现。

透明交叉淡化先在私有透明面按 premultiplied RGBA 权重相加，再合成到父层，不以 source-over 伪装权重。组滤镜在组内容绘完后处理；色矩阵在未预乘颜色上运算。Blur 优先原生 Canvas filter，缺失时使用预乘颜色/alpha 的三次 box Gaussian 近似，避免黑边。模糊有光学容差，不保证与 WebGL 核逐像素相同；颜色/alpha/隔离权重实际 RGBA 检查，见 canvas-parity.json。

可选 `graphics: {renderer: 'canvas', maxCanvasBytes: 67108864}` 设置合成预算，默认 64MiB，上限 512MiB。预算含 1280×720 back buffer、透明栈、模糊 padding、native scratch、色矩阵 ImageData 或 CPU Float32 双工作区。它与 release 的资产纹理估算分开，是逻辑 RGBA/工作数组的预算，不是实际浏览器 RAM/VRAM 测量。按全部对象保守规划，包括不可见分支的现有状态；有界分配不按任意作品坐标扩展画布。

每次候选激活前检查完整快照计划；每帧再检。超过预算报 CANVAS_COMPOSITION_BUDGET，不分配、不提交候选 head。运行中绘制失败明确暂停；帧先绘制在私有 back buffer，成功才一次拷到可见 canvas，因此上一有效画面可保留。缓存按尺寸/深度有界复用，resize/dispose 释放自有缓冲并恢复本实例 Pixi filter/context 状态，不改全局原型或清共享池。

没有新增任意 shader、非矩形 mask、backdrop filter、WebGPU、视频或网络流。无法执行的 blend/设备仍明确拒绝，不能静默省略。运行时 WebGL context lost 仍暂停且可保存；需要新建 Canvas Player 后读档，本项不热切正在运行的设备。

WebGL↔Canvas 同槽与便携备份可互读，当前普通进度与玩家偏好不被旧槽回写。证据见 evidence/h2-02/REPORT.md：无 WebGL 的两路线/保存刷新、真实 RGBA、预算/故障边界、独立 tarball、旧 WebGL 回归；开发模式以 Chromium --disable-webgl 与原生 API 复测。其它浏览器/真机与大作品尺度仍需对应验收。

决策见 ADR0021/0022。实现核对锁定 Pixi8.22.0 的 CanvasRenderTargetAdaptor/CanvasContextSystem/FilterPipe；依据 [CanvasRenderer](https://pixijs.download/v8.22.0/docs/rendering.CanvasRenderer.html) 与 [HTML Canvas compositing](https://html.spec.whatwg.org/multipage/canvas.html#compositing)。
