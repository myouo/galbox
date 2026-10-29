# F-01E / W1-02：逐轴运动、同相复制和预取页数

2026-10-29。ADR0053/0054落实到正式Schema/Protobuf、公开stageMotion/stageClone/stopStageMotion、Core与Pixi/Canvas、PlayerPreferences/Settings。运动保持独立base pose与可恢复offset，支持同目标多个key、同key按目标替换、有限/循环、闭合子树复制和取消/删除；源签名、静态复制可达性、offset、预算及任务闭包均检查。普通pose/filter未结束时复制明确拒绝，不丢弃continuation。

prefetchPages为可选0..8偏好，缺省沿作者LoadingOptions；持久CAS、导入导出/重置和实际Host动态提示共用原实现。调整不取消当前必需资源，也不扩大128步/16资源/预算和分支停止边界。

pnpm check通过；pnpm test 50文件309单元通过，含7运动预算/恢复/复制/替换/坏输入反例及1偏好边界。19真实浏览器（motion/prefetch/loading/stage）通过，包含两个图形后端的IndexedDB保存缩略图像素、持久偏好重建、资源失败/取消/LRU和原舞台恢复；pnpm test:consumer实际tarball消费通过。首次WebGL测试在交换后直接toDataURL读到被丢弃buffer，改为正式图文保存捕获路径后通过；不修改设备参数或放宽像素断言。

独立实例新增八语设置PO及源运动适配：八语第一门各67动作，按库调用顺序覆盖定义；作品おじぎ为50px/1000+1000ms，不是插件默认。SDK正式包仍不含作品资料。实例新包安装/设置浏览器、粒子/组转场/整门执行与回放仍继续；本报告不代表第一门完成。raw为ignored artifacts/door2。
