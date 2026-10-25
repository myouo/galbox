# 图像设备与无 WebGL 兼容模式

默认 `createPlayer({...options, graphics: {renderer: 'auto'}})` 按 WebGL2→Canvas2D 选择。省略 graphics 等价于 auto；Pixi 8.22.0 的图像场景图、Core、DOM 正文、React UI 和存档路径共用。原 `This Host requires the declared WebGL backend` 硬检查已移除，允许同一 Pixi 的 Canvas renderer。

`graphics: {renderer: 'canvas'}` 可强制兼容模式；`'webgl'` 要求 WebGL2，失败明确报错而不改后端。默认 auto 在 context 创建不可用、实际初始化失败时均可回落；失败候选释放自己的画布/context，不清共享 Pixi 池。无 Canvas2D 时明确 GRAPHICS_UNAVAILABLE。

playground 支持 `/?renderer=canvas`；可组合 `?demo=media&renderer=canvas`。兼容模式在开始屏幕标识，开发诊断 `resources.renderer` 为 canvas，`graphicsFallback` 描述自动回落原因。显式选 Canvas 不冒充“WebGL 失败”。这些字段不进入 Snapshot/profile，也不改变作品 release。

Canvas 当前可用：原作验证用基础 ADV/NVL/结构化正文与文字效果、音频、选择、保存恢复、常规图片/透明度、二维 pose/父子层级、矩形 clip、相机、fade/shake、normal/add/multiply/screen。画幅/输入变换沿原 Pixi/DOM 路径，只有一个舞台 canvas。基础像素和存档跨后端真实验证，不等于与 GPU 逐像素完全一致。

Canvas 当前不支持 GPU 滤镜或隔离的分层 crossfade；Pixi 内部可能静默跳过这些 filter，SDK 因此扫描所有 Program 分支，资源取得前就明确 GRAPHICS_FEATURE_UNSUPPORTED，恢复候选也在持久提交前检查。不能通过另一个分支暂时没执行来掩盖缺失。`?demo=stage` 使用这些效果，Canvas 将准确拒绝。H2-02 保留滤镜/相机组滤镜/隔离透明层合成的有界实现与内存/像素验收，并为 G7 依赖。

WebGL/Canvas 可以读同一个命名空间和 release 的内部槽位与便携备份；加载仍重建媒体请求身份、使用当前持久进度与偏好。运行时 WebGL context lost 仍暂停并保留保存能力；本项不在运行中热切设备。重新创建 Canvas Player 后读档，可继续工作。性能/设备限制不会改写剧情分支。

证据见 evidence/h2-01/REPORT.md。回归测试令 webgl/webgl2 获取失败，验证实际 Canvas 像素、两路线、IndexedDB 刷新和独立 tarball；开发模式另外以 Chromium --disable-webgl 启动参数和原生 getContext API 验证真正禁用 WebGL 后的保存/刷新/继续。其它浏览器/真机需对应验收，不声称全部环境支持。

依据：[锁定 Pixi CanvasRenderer 文档](https://pixijs.download/v8.22.0/docs/rendering.CanvasRenderer.html)，实现同时核对该版本 autoDetectRenderer/CanvasFilterSystem 源码。决策见 decisions/0021-graphics-backend-fallback.md。
