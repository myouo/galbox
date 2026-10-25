# H1-01：舞台绘制与实例销毁加固

2026-10-25，从 090d6ee 接续，分支 fix/player-disposal-latency。仓库干净起步；包括隐藏/忽略目录的项目内检查仍未找到 N/F 输入，真实作品任务保持 blocked。本轮按既有性能发现增加 H1-01，加固正式 Host，没有新增解释器、剧情协议或公开 API。

## 定位与实现

初始探针使用正式 Player 和同一个固定 Pixi 8.22.0 实例，保存 CPU profile 与真实 WebGL/纹理/音频调用。详见 profile-before/disposal-profile.json、profile.log 和三个 cpuprofile。原活动销毁 1616 ms，Application.destroy=1609 ms，其中 WEBGL_lose_context=1604.4 ms；468 个 render 请求全部提交。显式 scoped destroy 仍约 1619 ms，但外部全局池 clear 从 3 降为 0，说明越权清理是独立问题，不能冒充长尾根因。

受控相同舞台去重将提交数降至 275/633、活动销毁约 288 ms；正式去重+scoped destroy 的首次未包装三活动周期仍为 412.5/541.9/360.2 ms，500 ms 门槛未全部通过，performance-initial.json/log 保留 target-missed。进一步 flush-probe 对当前实现比较及时提交，约 480→105 ms；该控制组有 profiler 开销，最终不以它判定通过。

正式修复见 [ADR 0012](../../decisions/0012-stage-render-and-owned-disposal.md)：

- Host 比较 stage 的 id/asset/x/y/alpha/z 和顺序，只跳过完全相同的 Pixi 帧。保存上一成功提交值的副本，新 epoch 失效缓存；正文、Core 时间/事件与普通进度照常推进。没有延后实际变化的绘制。
- 真正绘制后调用 WebGL flush，及时提交交互/读档等非 RAF 路径的命令；不调用 finish，不延迟 context 释放。API 背景参考 [MDN flush 建议](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#flush_when_expecting_results)，收益只以本机测量说明。
- 明确 removeView=true、releaseGlobalResources=false，保留 Pixi 的共享全局池，同时仍销毁自己的纹理、舞台、renderer/context、音频与输入。没有把资源计数提前清零后再异步销毁 GPU。
- 取消时尚未返回的 app.init 若迟到创建 renderer，显式销毁局部 app 后再拒绝；不依赖已幂等返回的 dispose 来补清理。

## 最终真实验证

环境沿用 Linux x64、AMD Ryzen 7 5800H、Chromium 156.0.8078.4/SwiftShader WebGL2、Node 24.15.0、pnpm 11.28.5、TS 5.9.3；源码/包摘要见 source-manifest.json。日志提交前仅移除行尾空白。以下命令均退出 0：

| 命令 | 证据与结果 |
| --- | --- |
| pnpm install --frozen-lockfile / pnpm check | install.log/check.log；锁文件、生成、类型、headless/导入边界通过，无新增依赖 |
| pnpm test | unit.log；12 文件、72 单元通过 |
| GALBOX_EVIDENCE_DIR=docs/evidence/h1-01 pnpm test:browser | browser.log/browser-results.json；32 通过，0 skip/flaky/unexpected；含生产 build |
| pnpm test:consumer（同 evidence 环境） | consumer.log/consumer-result.json；仓库外 tarball 严格类型、原生 ESM、播放/保存/备份/完整迁移通过 |
| pnpm test:cli（同 evidence 环境） | cli.log/result.json/commands.json；50 真实命令及两个独立开发浏览器工作流通过 |
| pnpm test:compatibility（同 evidence 环境） | compatibility.log；4 synthetic 通过，N/F needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance（同 evidence 环境） | performance.log/performance.json；三个活动周期、228 个语义输入，固定门槛全部通过 |
| GALBOX_API_BASELINE=090d6ee pnpm test:release（同 evidence 环境） | release.log/release-audit.json；真实编译旧基线，公开声明/导出变化 0，snapshot schema=1，当前源码 pack 与两包 publish dry-run 通过 |

三个新增浏览器回归直接验证：静态文本/进度/外部视图修改不产生重复 GPU 帧，动画位置变化仍绘制，同舞台读档在新 epoch 绘制一次；销毁 A 时 A 的 context 已 lost、B context/播放/读档/进度可用（该隔离用例借用真实 MemoryStore，既有套件另验 IndexedDB），外部全局池未 clear；延迟实际 app.init 的取消最后销毁新 context 一次、没有 canvas/text/文件获取或 head 遗留。原有在途提交、设备故障、备份、profile 与迁移断言保留。

## 性能与范围

最终未包装生产代码的三个 Player 每个都完整执行两路线各两次并保存/恢复后销毁。三次活动销毁 **111.6/230.0/119.0 ms**，各自低于预先给定且未放宽的 500 ms；原 M5-04 的一次同等活动场景为 1673.6 ms。不能把“旧 1 活动+2 空闲”与“新 3 活动”的分位数当同一统计总体，也不据三个样本承诺任意设备延迟。

228 个 API 输入 P95=2.8 ms、max=13.2 ms；两次 rAF+layout 代理 P95=50.7 ms；最重 Core 批次 P95=1.359 ms。三个创建 median=98.2 ms、max=133.4 ms，首个 start 到 gl.finish=76.2 ms。后者仅为 benchmark 中的复合测量，生产代码没有 finish/fence。原始样本完整保留。

每个 Player 仍 9 个已验证资源、120009 B 编码、7767200 B RGBA 估算、510720 B 实际 PCM；三次销毁后的拥有资源/canvas/声音计数全为 0。CDP 整页 V8 heap 在 GC 后 4580340→9157976 B，含模块/JIT/根 Player/共享缓存，不证明无泄漏；没有实测 VRAM。同步 context loss 仍有等待，500 ms 是当前参考场景的局部门槛，非全平台承诺。

更新 SDK 本地候选 SHA=91d9756128bf808595dfd29bac55c16aefd6c1311da1164a36706945c1792457；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。独立 SDK consumer、CLI 与 release audit 摘要一致，版本仍 0.1.0；没有实际 publish、push 或部署。早期 alpha 证据对应旧包，当前以本目录为准。

H1-01 完成后，下一项仍为 N-01/F-01，等待指定发行版、可用 Program/资源、真实原档/全局附件及原作继续参照；M6 未完成。其他浏览器/移动真机/物理 GPU/headed 窗口等未验证，既有限媒体与规模限制不因本轮优化而取消。

开发服务已实际重启并点击阅读/显完/备份菜单；dev-result.json 记录 HTTP200、manifest、9 资源、1 canvas、Web Audio starts=1/decoded=4、0 pageerror，截图 dev-player.png。
