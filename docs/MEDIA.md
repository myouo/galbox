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

G3-03已单独建设有限影片任务与设备路径，见VIDEO.md；本页旧audio.play ABI保持启动确认含义，不用影片功能改变旧音频存档语义。

## 介面提示音（G3-06）

`uiSound(audioRef, gain=1)`產生Schema/Protobuf的`UISoundRequest`，由`await player.playUISound(cue)`播放；`player.stopUISound()`取消。工廠關聯audio資源種類，Player再核對當前作品目錄。壓縮音效需明確宣告`playback:'buffer'`；有限v1最多30秒、gain0..1，不支援element或任意URL。介面音效沒有Core任務，不改PC/profile，也不進入快照或讀檔重播。

回傳值started僅表示原生source.start已執行；blocked表示尚需手勢，cancelled表示準備被替換/停止。自然完成另見`getSnapshot().uiSound`的state/ended。無啟用的hover不抓資源，也不在稍後自動補播過期提示音。失敗以Promise拒絕並更新獨立診斷，作品可忽略可選SE的失敗後繼續動作；不借此暫停劇情。

每個Player最多一個cue，一個惰性且可清理的AudioContext，沿既有cache/摘要/解碼預算固定準備及播放資源。新cue替換舊cue，遲到租約只歸還一次；準備上限10秒，結束/停止/隱藏/blur/用戶暫停/重新啟用/dispose清理。劇情選單暫停時仍可播放；master×sfx偏好即時生效，與劇情bgm/voice/sfx及bus包絡分開。沒有承諾無限混音或所有瀏覽器/裝置；見ADR0040與evidence/g3-06/REPORT.md。

## 绑定音源的淡出停止与具名SE（G3-07）

`audio.sources`增加最多8个具名SFX缓冲。使用`builder.sfxBuffer('ambient')`声明，`sfxTrack(at, taskName, audioRef, bufferRef, options)`沿既有media路径播放；未声明/重复缓冲或非audio资源拒绝。无buffer的audio.track仍使用bgm/voice/默认sfx槽。角色偏好、bus和duck仍作用于对应角色，具名源共享资源缓存但各有独立设备请求与状态。

`audioSourceFade(at, envelopeTask, sourceTaskName, to, duration, options)`和`audioFadeOutAndStop(at, envelopeTask, sourceTaskName, duration, options)`在执行时把任务名解析为具体活动media ID。新包络保存该ID及解析的from/to/duration/easing/elapsed，不随同名任务重用而换目标。`audioSourceStop(at, sourceTaskName)`直接停止解析到的活动源。时长支持1..3600000ms；即时停止用audioSourceStop；stop包络的终点必须为0。源不存在/不活动、冲突拒绝或表达式非法时不提交部分音轨/计数器变更。

同一源支持reject/replace包络；替换从当前gain开始。包络完成可只改变gain，或将绑定源cancelled并停止真实设备；不冒充自然ended。源先结束/停止时包络cancelled，被替换则superseded，失败则failed。旧audio.gain按角色更新全部源并supersede相关源包络；旧audio.stop停止该角色全部源。audio.fade仍控制角色bus，UI cue保持独立。

快照保留包络所指的完整源/结果闭包和缓冲声明签名。恢复保留逻辑ID，重新建立epoch/attempt，replay源从0启动并续跑保存的包络进度。活动包络指向restore=stop源时明确禁存/拒绝读档；初始激活仍启动该意图，不能误用读档取消策略。源停止会释放Auto的语音等待。迟到旧设备回调和旧包络不能影响替换源。

这是单体Program的有限能力；基础代码模块暂不支持，新旧release没有隐式迁移。未提供多BGM槽、延迟启动包络、采样级seek或任意数量混音。设计见ADR0045；实际验收状态及远程CI结果以tasks.json和evidence/g3-07为准，不据此声称完整KAG或整作音频兼容。
