# G3-13：静态 RGB 通道上限

2026-10-31。在现有源绑定 ImageFilter 增加有界 channelCeil：原图像素按
native gamma=1、floor=0 的表公式 round(channel/255*ceil) 校正后继续 tint/box。
保留透明像素 RGB 和 alpha。新能力 stage.channel-ceil 使旧引擎显式拒绝，
未增加时间任务、预生成变色图片或改变既有 32 项能力/64MiB 工作区预算。
来源/参数进入已有恢复签名和共享纹理键，复制仍共用表面。

实际执行：

- `pnpm check`：通过。
- `pnpm fixture && pnpm exec vitest run`：78 文件 / 422 项通过；含原生半径 6
  样本、RGB 上限数值、透明保留、无能力拒绝及既有恢复/反例。
- `pnpm build:harness && pnpm exec playwright test tests/browser/image-filter.spec.ts tests/browser/raster.spec.ts`：8 项通过；合成滤镜现含通道上限，两种后端实际
  IndexedDB 画面恢复相同，表面共享/取消/失败保留/销毁通过。
- `pnpm test:consumer`：独立 tarball、严格类型及实际浏览器通过，消费带
  channelCeil 的合成滤镜，并回归录史策略和 IndexedDB 冷恢复。

定义与顺序来自公开 KRKR2 GammaAdjust 表和作品只读 AnimationLayer.tjs 的
参数传递。源码/日志/载荷只在实例 ignored 树。本项不宣称通用 gamma、非零
floor、任意 shader 或原作 SIMD 像素认证；第四门实素材仍由实例验收。

后续实例模块接入发现 v2 capability 注册表未接纳 text.history / stage.channel-ceil。
已修复正式 ModuleProgram 注册，v1 仍拒绝；没有实例特判或提高预算。
`pnpm check`、滤镜/录史/advanced-modules 三文件 10 项通过；返回写入函数的
冷模块恢复现同时携带两项新能力。`pnpm test:consumer` 再次通过，公开实包的
录史验证已改成实际 ModuleProgram，验证 IndexedDB 存读、推进及冷恢复。
