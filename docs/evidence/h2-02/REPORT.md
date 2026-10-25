# H2-02：Canvas 滤镜与隔离合成

2026-10-26，分支feat/canvas-effects-composition，基线e241dd83fea3de573ed0b580394147dc61a6138c。H2-02完成当前有限支持集；单TS Core/Host、单Pixi场景图、DOM正文、React/IndexedDB保持原路线。G3-03及其它通用/真实作品任务仍未完成。

## 实现与支持集

ADR0022明确实例级Canvas filter栈与预算。新增可选GraphicsOptions.maxCanvasBytes，由Schema生成类型/validator，默认64MiB、最大512MiB。纯计划器按父图计算滤镜/图片层隔离深度、累积blur padding（32px量化）与RGBA/像素工作区，候选在持久接管前预检，每帧再检，不按任意作品坐标无限分配。预算独立于资源纹理估计，不入Snapshot/profile，也不是浏览器实际RAM/VRAM测量。

沿原Pixi场景图与绘制管线，只适配本实例filter push/pop和root render target，不另解释Program、矩阵、任务或PC，不改全局原型/扩展。透明二/四层转场先按premultiplied RGBA权重相加，再按filter的blend合成父层；组和相机滤镜在组内容完成后处理，颜色矩阵在未预乘RGB上运算，避免逐sprite滤镜错误。复用已有blur/brightness/grayscale与AlphaFilter隔离语义，mask、parent alpha、基础blend和相机继续由同一Pixi场景图处理。

Blur先实际探测原生Canvas filter，缺失/不生效时用预乘颜色/alpha的三次可分离box Gaussian近似。它有光学容差，不承诺与GPU核逐采样同值。没有新增任意shader、非矩形mask、backdrop filter、WebGPU、视频或网络流。

每帧先绘到私有back buffer，成功后一次提交可见canvas。draw失败先恢复render target/context/projection/blend，立即释放本实例全部中间缓冲并同步诊断，再报告设备失败/暂停，保留上一有效可见canvas。dispose幂等、恢复实例级filter方法、释放自有面/数组，不清共享Pixi池。当前字节/峰值/面数/native或CPU模式对外报告为只读DTO；文字/profile未改动舞台时沿原脏检查跳过重绘。

原Core、解析任务/相对参数/源签名/保存闭包与wait ABI不变。恢复读取同一Snapshot，在本后端重建表现；不以新变量重算已启动参数。原创光影回信复用同一生产路径。

## 最终实际验证

所有命令export TMPDIR=/dev/shm；无新依赖/锁文件变更。命令在基线HEAD的修改工作树执行，日志revision是当时HEAD；最终源码对应source-manifest.json与本地提交，不表示基线本身已有这些改动。

| 命令 | 最终结果/证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate | install.log/generate.log，成功 |
| pnpm check | check.log：生成一致、strict/headless/边界、公开预算选项真实正反类型通过 |
| pnpm test | unit.log：21文件、152测试通过 |
| GALBOX_EVIDENCE_DIR=docs/evidence/h2-02 pnpm test:browser | browser.log/browser-results.json：build+harness+72通过，0 skip/flaky/unexpected |
| 同evidence环境pnpm test:consumer | consumer.log/consumer-result.json：仓库外tarball、strict/skipLibCheck=false/原生ESM，强制Canvas完整舞台任务/活动保存/便携备份、销毁统计归零；既有禁WebGL/双实例/跨后端槽位也通过 |
| pnpm test:cli | cli.log/result.json/commands.json：58真实命令与模板/迁移/字体/压缩媒体/浏览器和dev HTTP通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json：4 synthetic通过，N/F needs-input保留 |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json：既定Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=e241dd8 pnpm test:release | release.log/release-audit.json：strict声明、0新增/3声明变化（按入口计）、0删除，SDK/CLI pack及publish dry-run通过；无外部发布 |
| pnpm dev；node docs/evidence/h2-02/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-stage.png：Chromium --disable-webgl、原生API实测光影章节活动保存/刷新/结局/再读旧槽，0 pageerror |

新增3单元使用真实ProgramBuilder/工厂/Core捕获快照：基础back buffer、GraphicsOptions运行时界限/输入不变；滤镜父路径与image-only crossfade深度；累积padding/native scratch/CPU Float32双工作区精确预算和超限拒绝。未修改Core逻辑、未删必要断言或放宽strict。

五项新增浏览器测试：

1. 14种实际像素场景，覆盖二/四层透明权重、色矩阵、父组/相机组、clip/alpha/混合/姿态。
2. WebGL与Canvas实际RGBA对照，嵌套透明父子、clip/crossfade，以及缺原生filter时CPU blur；样点结果存canvas-parity.json。
3. 真正拒绝webgl/webgl2取得的Canvas光影章节：两路线、活动任务保存/菜单暂停/刷新/原目标x410和当前进度。
4. 合成预算超限的合法活动候选：不换head、不改profile、不删槽、不改可见图像或当前分配。
5. 注入真实getImageData失败：上一可见canvas不变、设备暂停、head不变，故障时及dispose后中间字节/面归零。

既有H2-01的“滤镜不支持”拒绝用例在该能力启用后改为预算拒绝，保留acquire=0/head/槽/画面等副作用断言；其它WebGL像素/设备、音频/文字/扩展/迁移/存储与双实例回归全部保留。

实际对照样点：[{"case": "nested", "backend": "canvas", "maxChannelDelta": 2, "bytes": 14745600}, {"case": "clipped-cross", "backend": "canvas", "maxChannelDelta": 0, "bytes": 14745600}, {"case": "blur", "backend": "canvas", "maxChannelDelta": 4, "bytes": 16330752}, {"case": "blur", "backend": "cpu", "maxChannelDelta": 5, "bytes": 45834240}]。非blur容差4/通道，sigma=4的当前blur样点容差12/通道；不能把这组样点推成所有内容/浏览器逐像素相同。颜色/alpha/隔离合成最大观测差2，原生blur最大4，CPU近似最大5。

## 包、资源与性能

SDK0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA256=98affabc60c93354e1fbf21afdff215bb754c6ba5ca37b51881f539f911eedf8。
CLI0.1.0 artifacts/galbox-cli-0.1.0.tgz SHA256=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817。
最终consumer/CLI/audit/实际artifacts一致，仍是UNLICENSED本地alpha，0 push/publish/部署/远程CI。Snapshot wire=1未改，预算为Host选项，旧槽位和既有资源manifest不因后端重写；不宣称稳定API或旧二进制读取新选项。

既有标准小说WebGL性能基线：228次语义API P95 4.6ms、两帧观察P95 51.1ms、最重Core批次P95 1.537ms；活动销毁 109.2/129.8/113.3ms，原500ms门槛通过。它不是Canvas吞吐量/60FPS或大作品/真实GPU认证。

原生无WebGL开发实测：保存于任务20ms，恢复后仍是已解析目标x410，结局后再读旧槽保留4已读/解锁/当前文字设置。renderer=canvas，原生2D=true/WebGL=false，当前合成估计20545536字节、峰值20545536字节、4个面，低于默认67108864；单canvas/真实音频/0 pageerror。该估计包含back buffer与工作区，未测浏览器内部临时副本或实际RAM。

## 失败、重验与接续

canvas-first.log至canvas-fourth.log为过程证据：从原有Pixel工厂逐步扩到组/CPU/预算/故障，早期build.log/harness.log不作为最终源码门槛；最终以check/unit/browser/consumer/CLI/performance/release及dev报告为准。

新增故障即时字节断言后，canvas-readback-repro.log真实复现旧逻辑在失败状态仍报告上一帧3686400字节。随后修正draw异常时立即释放中间面与Host同步，再完整重跑152单元/72浏览器/consumer/CLI/性能/API，最终通过。没有用固定成功计数、删断言、永久skip或类型逃逸遮盖失败。开发probe最终JSON将native canvas信息与canvasCount分别记录，避免键覆盖。

H2-02仅是既有有限舞台效果的Canvas实现。未知shader/新效果、其它浏览器/真机、极端层叠规模不计通过；超预算明确拒绝，可在512MiB上限内显式配置。下一G3-03视频/热点/限时交互，先定资源编码/输入激活/活动期限/保存策略ADR再实现；G3-04真正网络流、G4–G7与N/F/M6未完成。N/F仍缺真实edition、Program/资源、原档和原作继续参照，不用原创/synthetic替代。

当前dev已启动 http://127.0.0.1:4173/?demo=stage&renderer=canvas 。重启export TMPDIR=/dev/shm，pnpm install --frozen-lockfile，pnpm dev；构建pnpm build。browser前停dev释放4173/4174，完整任务状态见../../tasks.json。
