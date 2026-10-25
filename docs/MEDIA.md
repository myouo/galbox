# 音轨、混音与语音身份（G3-02）

本支持集沿正式 Schema → Builder → Core → coordinator → Web Host → IndexedDB 工作。通用语义属于 SDK；素材、台词、loop 点、策略和 UI 外观属于实例配置。原创风声回放仅是消费者，没有另写解释器。

## 编码与资源

支持 mono/stereo PCM16/float32 WAV、MPEG LayerIII MP3、单逻辑流 Ogg Vorbis/Opus。WAV 默认 buffer，压缩编码默认 element，可用 Asset.playback 明确选择。结构检查遍历 MP3 帧、Ogg page/CRC/serial/granule；最终仍检查实际浏览器 codec/解码和 metadata。压缩编码时长容差为 150ms，WAV 为 2ms。

所有资源完整获取、摘要校验且受 encoded 限额约束后，element 路径使用本实例私有 Blob URL 和原生 HTMLMediaElement，避免整轨常驻 AudioBuffer。它是渐进解码，不是网络边下边播。element 不计 retained PCM 的 maxAudioBytes，受 maxMediaMs（省略默认一小时、最大两小时）约束；buffer 仍受 maxAudioMs/maxAudioBytes。资源诊断分开列 mediaElementBytes 和 decodedAudioBytes，前者不代表实际 decoder 内存。测试原创 35 秒 Vorbis 在 maxAudioBytes=4 下真实播放，不代表大作品内存认证。

## 指令与等待

从 galbox-sdk/port-kit 导入 audioTrack、audioFade、audioDuck；原生 audio.policy 配置正文确认是否停止语音，audio.wait 等待自然结束。音量为有限 0..1 数值表达式，时间为 i32 毫秒；参数在启动时一次解析，存档保留解析值和来源签名。

新 media Task 的 pending → playing 只表示播放已启动；自然 ended 才成为 completed。blocked 可重试，failed/cancelled/superseded 不冒充完成。audio.wait/task.join 不允许循环媒体，all-success 不把失败/取消当成功。旧 audio.play ABI 保留：completed 仅为启动确认。

loop=true 从 0 播放 intro，区间终点后回到 loopStartMs；null 终点使用真实时长。buffer 由原生 loopStart/loopEnd 执行，element 区间依赖原生 timeupdate，精度较弱。超出实际媒体时长在激活计划检查或运行时明确失败。

## 混音与恢复

实际增益为 script × player role × scripted bus × BGM duck × player master。audio.fade 是 Core 活动时间的三角色 bus 包络，支持有限 easing、reject/replace。Task.gain 始终是脚本值，偏好独立持久。duck 可配置 level/attack/release，由新 voice 的 pending/playing 意图触发，blocked/failed/ended 释放。旧 audio.play 不提供可恢复的自然播放 phase，不加入自动 duck。

暂停同时停止 Core 包络、AudioContext 和 element 时钟。恢复 replay 为活动源建立新请求身份并从 0 开始；stop 取消，不猜媒体完成或物理采样位置。已自然完成结果保持关闭。活动 stop-policy 媒体的自然等待/组禁止保存和恢复，普通正文切点可保存其取消策略。

语音 audio.track 将自包含 VoiceRecipe 附着下一正文。player.replayVoice() 和默认工具栏“重播语音”使用当前正文身份；仍活动时更新 attempt，已结束时建立辅助任务而不重新打开原结果。单独 reveal 不停止语音，确认按 audio.policy 执行。历史中保留 recipe；历史回放 UI 属于后续 G4。

所有 Host 结果经串行队列按 epoch/task/attempt 接纳。停止、替换、读档或 dispose 清除原 source/listeners，迟到 play/ended/error 无权影响新源。play 的暂时策略拒绝进入 blocked；永久设备失败保持 durable pending head，可由新 Host 接管，不能重复 profile 提交。

## 限制与依据

版本化网络流与分级 IntegrityEvidence 明确保留在 G3-04，并为 G7 依赖；不能要求所有未来长音轨整轨下载后才能播放。当前支持集尚未提供 AAC/MP4、链式/多流 Ogg、精确 seek/采样点续接、外部任意 URL、网络流、视频或全平台兼容声明。真实验证平台以 evidence/g3-02 为准，合成音轨不是人耳音质或原作兼容证据。

媒体启动和自然事件依据 [HTML media](https://html.spec.whatwg.org/multipage/media.html#dom-media-play)，buffer loop 依据 [Web Audio](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode)。语义决策见 decisions/0020-audio-tracks-and-long-media.md。
