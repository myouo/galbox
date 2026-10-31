# G3-14：实时条件音频循环链接

2026-10-31。新增公开 audioSourceLoopRegion，绑定一个正在运行的循环 element
音源，以采样帧定义单个后向链接并实时启停。切换不重建音源、不重置当前位置、
增益、淡化或启动身份；越过终点之后才启用时不立即回跳。上一位置与当前
位置的正向跨越触发链接，并保留检测时的超出量；关闭后遵循原整曲循环策略。

最后写入者及完整参数进入 mediaTask，来源/签名/目标音源验证后恢复，模块
保留已经返回的写入函数。原 restore=replay 仍从0重播，不声称存盘音频位置。
仅支持 element/stream，buffer、错误范围/来源/参数/能力/实际媒体长度拒绝。
没有新任务或扩大输入预算。时间回调/帧轮询不是原生sample-accurate或Smooth
crossfade认证。详见ADR0091。

实际命令：

- `pnpm check`：类型/生成/边界通过。
- `pnpm build && pnpm exec vitest run`：79文件/424项通过。
- `pnpm build:harness && pnpm exec playwright test tests/browser/audio-loop-region.spec.ts tests/browser/media.spec.ts`：7项通过。
- 把新浏览器验证改为实际IndexedDB后，专项再次1项通过；原生媒体证实切换
  无restart、经过的点不倒跳、实际循环、关闭继续、存读保持模式；长度超界
  候选失败保留当前正文/head。
- `pnpm test:consumer`：最后公共Store参数与所有实包严格类型/Headless/实际
  浏览器通过，包含新工厂和模式恢复。全部载荷为合成四秒波形。

原始日志位于独立实例 artifacts/door4-loop-*；不进入SDK包/Git。
