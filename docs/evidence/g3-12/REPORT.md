# G3-12：实时单图染色与方框模糊

2026-10-31。新增 stageFilteredImage / stage.image.filtered；参数有限、来源绑定，
无新计时任务。原图、染色与模糊配置进入 Snapshot，返回后的写入函数也进入
模块保存闭包。复制共享同一设备纹理；Canvas/WebGL 消费同一 RGBA 表面。
候选分块让出和取消，包含临时 RGBA/列和的 64MiB 原预算检查；失败保留当前
画面，销毁释放设备表面。支持集与边界见 ADR0088。

执行与结果：

- `pnpm check`：类型、生成一致性、导入和仓库边界通过。
- `pnpm exec vitest run`：77 文件 / 418 项通过。
- `pnpm test:consumer`：实包隔离安装，公开 filter 工厂、链接、wire、恢复通过。
- `pnpm build:harness && pnpm exec playwright test tests/browser/image-filter.spec.ts tests/browser/raster.spec.ts`：8 项通过；实际 IndexedDB 保存的图像恢复后相同，
  两后端各只持有 1 个原图 / 1 个共享滤镜表面，取消、预算失败与销毁通过。

滤镜数值 golden 由公开 KRKR2 argb.h / tvpgl.c 的便携实现产生，核对
alpha8 染色、预乘方框平均、边缘裁剪及透明输入；不是原游戏可执行文件的
SIMD 像素认证。参考源码、编译产物、日志和图像仅在独立实例 ignored 树。
真实作品接入及旧档迁移正在独立实例继续，未恢复上传或线上发布。

独立实例随后以实包 SHA 055ac986b8430d83a74c59a640f347ec9ecb10d72c3e43d4f6b5fec332870ecd
消费。`pnpm exec playwright test --config playwright.heartbeat.config.ts` 两项通过：
实际旧三门心跳 137ms 档 Canvas/WebGL 映射后，文字和 frames 保持一致、
所有相关 pose 任务 elapsed 不变；两层共用一表面，保存并刷新可恢复，
资源请求均在新 catalog/presentation 闭包内，没有旧派生图请求。原始证据
在实例 artifacts/heartbeat/，不进入 SDK 包或 Git。
