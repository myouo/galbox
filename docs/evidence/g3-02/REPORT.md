# G3-02：长音轨、混音与语音身份

2026-10-26，分支 feat/audio-tracks-and-long-media，基线 f9d409933409ccf16a324c1caf2180b509af370f。本轮有限集完成，完整常用 GalGame 功能仍未全部完成。正式 TS Core/coordinator/Web Host/Pixi/DOM/React/IndexedDB 路线未变；没有作品特判、第二解释器或 Rust/WASM。

## 实现与可观察行为

ADR0020、单源 Schema/生成类型与 validator、公开 audioTrack/audioFade/audioDuck 工厂一起落地。支持 mono/stereo WAV、MPEG LayerIII MP3、单逻辑流 Ogg Vorbis/Opus。WAV 默认 buffer，压缩编码默认 element；也可显式选择。完整结构/摘要/预算校验与浏览器实际解码/metadata 检查分开；损坏 CRC/帧/编码/预算明确拒绝。

新 media Task 区分 pending/playing/自然 ended；启动确认只进入 playing，audio.wait 与 all-success 等自然结束，循环不能等待/加入组，取消/失败/替换不冒充成功。旧 audio.play 的 completed 仍只代表启动。循环点使用原生 buffer loop 或 element timeupdate；replay 从零，stop 取消，已结束结果保持关闭，活动 stop-policy 自然等待/组禁止保存。恢复重建 epoch/attempt，不猜物理播放位置。

Core 活动时间管理三角色 bus fade、easing、duck attack/release，解析参数/源签名/包络进 Snapshot。script × role 偏好 × bus × BGM duck × master；Task.gain 保持脚本值，偏好独立持久。暂停同时停 Core、AudioContext、element 时钟。

新 voice track 将自包含 recipe 绑定下一正文；player.replayVoice() 与默认工具栏可回放当前正文。活动源更新 attempt，已结束源创建辅助任务而不重开原完成结果；不增加已读。正文 reveal 不停止 voice，确认按 audio.policy 执行。recipe 保留到历史，但历史回放 UI 尚属 G4。

Host 停止/替换/dispose 清监听、连接、媒体 source 与自有 URL，迟到 Promise/ended 不能影响新 source。blocked 不由解锁暗中重播，只由正式新 attempt 重试；永久 play 失败保留 durable pending，由新 Host 接管不重复 profile 更新。待 play Promise 的 dispose 能及时释放激活等待，迟到结果也不会复活 disposed lifecycle。

原创《灯塔来信·风声回放》/?demo=media 与所有未来实例走相同生产路径，四段原创正弦音轨分别验证 35s Vorbis、Opus 正文语音、MP3 自然等待、WAV buffer/stop。非真人声音，不是 N/F 资料。

## 最终实际执行

命令使用 export TMPDIR=/dev/shm；本机 /tmp 配额问题未通过清理其它项目处理。命令在基线 HEAD 的修改工作树执行，最终源码由 source-manifest.json 和本地提交对应；日志内 revision 为运行时 HEAD，不表示基线本身已有这些改动。

| 命令 | 最终结果与证据 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log；无新增依赖或锁文件变更 |
| pnpm fixture | fixture.log；重建全部原创数据、资源摘要/manifest |
| pnpm check | check.log；生成一致性、strict/headless/边界、真实工厂正反类型检查通过 |
| pnpm test | unit.log；20 文件，149 测试通过 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g3-02 pnpm test:browser | browser.log/browser-results.json；build+harness+60 Chromium 全通过，0 skip/flaky/unexpected |
| 同 evidence 环境 pnpm test:consumer | consumer.log/consumer-result.json；仓库外真实 tarball、strict/skipLibCheck=false、原生 Node ESM、三种编码事实与启动/结束分离、浏览器重播/保存/混音/便携备份与自然等待通过 |
| pnpm test:cli | cli.log/result.json/commands.json；58 真实命令，含 MP3 element 配置/工厂/manifest/build 与坏资源保留旧 manifest，既有模板/迁移/字体/实际浏览器与 dev HTTP 通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic 通过；N/F needs-input 保留 |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；既定 Core/API/三个活动销毁门槛通过 |
| GALBOX_API_BASELINE=f9d4099 pnpm test:release | release.log/release-audit.json；strict 声明检查、12 新增/18 声明变化（按入口计）、0 导出删除、SDK/CLI pack 与 publish dry-run，通过；无外部发布 |
| pnpm dev；node docs/evidence/g3-02/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-media.png；实际保存/刷新/自然 MP3 结束/继续结局/再读旧槽，4 已读/解锁/设置保留，1 canvas，0 pageerror |

新增 12 单元测试：编码实际字节与预算/坏 CRC 和帧；startup≠natural end/旧 attempt；活动和结束语音回放；replay/stop/ended 恢复；循环/stop 等待保存拒绝；fade/duck 精确活动分数与恢复；reveal/确认策略；冲突/坏参数原子失败；fade replace；300 轮同名回收闭包；坏源/静态参数/phase/recipe/包络保槽；真实 coordinator 在预算 1/8/100 下串行完成与 Auto。没有删除断言、永久 skip、放宽 strict 或双重断言。

六项新增真实浏览器测试：原生 buffer segment loop 超过原时长仍运行并在 load 新建 source；未决 play dispose/迟到 Promise；原创两路线/IndexedDB 保存刷新；35s element 在 maxAudioBytes=4 下无全轨 AudioBuffer、实际 currentTime 暂停/loop/增益乘积/恢复；blocked 重试与旧 ended；codec 前置拒绝与永久 play pending 接管。保留既有真实 RGBA 舞台像素测试。

## 包与性能

SDK 0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA256：2a0e1b926b161cdcd6db6ffaca1d1169a7e90b5e144a4a0ab7d0e4e3eb86094f。
CLI 0.1.0 artifacts/galbox-cli-0.1.0.tgz SHA256：abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817。
consumer/CLI/audit/实际 artifacts 一致。仍是 UNLICENSED 本地 alpha，无 push/publish/部署/远程 CI。Snapshot wire=1 可选新字段由新 capability 限定，旧 Program/旧 WAV fact 保留；不承诺旧二进制读取新状态或稳定 API。

既有标准小说性能基线：228 次语义 API P95 4.2ms，两帧观察 P95 47.3ms，最重 Core 批次 P95 1.508ms；三次活动销毁 147.4/121.1/73.3ms，原 500ms 门槛通过，自有 canvas/资产/PCM/活动音频归零。仅本机 Linux/Chromium 156/SwiftShader/Web Audio，不代表长音轨样例的性能认证、人耳音质、真实 GPU/VRAM、60FPS、其它平台或大作品规模。

## 失败与修复记录

media-browser-first.log 保留最初测试缺 restore 参数/非法标识、pending head 枚举断言错误及 stage 保存点已完成的失败；media-browser-second.log/third.log、stage-browser-fourth.log 保留改用虚拟时钟跨刷新后初始化/帧稳定失败。最终改为在公开 diagnostics 第一次显示 light:motion 时以 DOM 菜单动作暂停，不干预 Core，不放宽原有 0<elapsed<2400 与保存/两路线断言，stage-browser-fifth.log 和最终完整 browser.log 通过。

首轮设备测试还揭示 blocked source 在 unlock 后先启动旧源再正式重试，已在 Host 阻止这一隐式重播。独立消费者早期 consumer-first.log/consumer-full-first.log 的超时来自假定启动次数固定为三次：原 source 可在启动确认前被 replay 替代。最终检查同逻辑 invocation 的新 attempt 与 playing，再验证实际自然结束；consumer-second.log 为中间通过，consumer.log 是最终通过。自然结束切点用当前正文或已读来观察，避免 20ms 轮询错过 autoDelay=0 的短暂页面。dev-probe-first.log 为 Vite 未监听时过早连接；服务 ready 后 dev-probe.log 实测通过。原始失败日志未删除。

## 未完成与接续

当前 element 路径先完整验证编码字节，再用私有 Blob URL 渐进解码；它没有全轨 AudioBuffer，但不是网络边下边播。v0.6 网络流与分级 IntegrityEvidence 明确保留为 G3-04，并作为 G7 依赖，不能用本项通过掩盖剩余要求。AAC/MP4/链式多流、精确 seek、历史语音 UI、视频/热点/限时交互、图文存档/回溯、流程图/鉴赏、剧本 UI/完整默认系统及 G7 未完成。

下一项 G3-03：先定有限视频/交互输入/期限/保存恢复策略 ADR，再使 Schema、真实工厂、Core/Host/失败反例及原创浏览器与独立消费一起落实。N/F 缺明确 edition、可用 Program/资源、原档和原作加载后继续参照，独立 blocked；M6 未完成。

本机 dev 已启动 http://127.0.0.1:4173/?demo=media。重启用 export TMPDIR=/dev/shm，pnpm install --frozen-lockfile，pnpm dev；构建 pnpm build。跑 browser 前停 dev 释放 4173/4174。完整状态以 ../../tasks.json 为准。
