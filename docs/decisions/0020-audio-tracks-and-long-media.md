# 0020：媒体任务、长音轨与混音

G3-02有限集：WAV、MPEG LayerIII MP3、单逻辑流Ogg Vorbis/Opus，mono/stereo；buffer或element路径。编码字节仍走provider/摘要/有界完整校验，element用私有Blob URL与HTMLMediaElement渐进解码，不整轨AudioBuffer；不宣称HTTP边下边播/任意未验证URL、AAC/MP4、链式/多流容器、精确seek或全部平台。资源事实取自完整结构/帧/粒度检查，实际设备解码/metadata另验，压缩时长允许明确150ms容差。

新audio.track为Task.kind=media，pending/playing/ended等phase与status关联，startup ack只进入playing，自然end才completed；旧audio.play的completed仍只代表启动。audio.wait只接受非循环media的自然结束，取消/替换/失败不是成功。事件按epoch/task/attempt串行，旧/重复/被取代回调不复活任务。循环点支持buffer精度与element时间更新的较弱精度，intro从0开始，恢复replay也从0；不猜原播放位置。active restore=stop的media/group等待禁止保存/恢复，正文切点可按stop取消，不冒充ended；已结束结果不重播。

Snapshot.audioState持有三角色bus增益、duck策略与活动时间包络、stopVoiceOnAdvance，audio-fade任务保存解析from/to/duration/easing/源签名。脚本gain × role偏好 × bus × duck × master，Task.gain是脚本值；暂停同时停Core包络、AudioContext与element时钟。duck由新track的voice意图触发（pending/playing，blocked/failed释放），不猜旧startup-only任务的自然状态。默认duck关闭，作品audio.duck启用；玩家偏好独立。

VoiceRecipe自包含原asset/at/签名/解析gain/restore，附着下一正文，history保留可继续使用的身份但本项只提供当前正文回放。活动源回放续用逻辑id并更新attempt，已结束源回放新建辅助media任务，不重开已完成的原逻辑结果或旧group；新prompt/epoch时旧输入失效。默认正文确认时停止仍活动voice，可由audio.policy明确关闭。新语音任务的已结束历史结果若无程序等待引用可回收；同名旧结果仅在无活动group引用时回收，所有活动/等待结果保持闭包，容量仍有界。

Host先检查codec/实际metadata与loop范围，注册element URL只属于本实例。play promise拒绝分blocked/failed；暂停造成的AbortError不冒充失败，恢复仅处理当前token。dispose/stop/replacement撤销监听/连接/URL；迟到play/ended/error不能影响新source。激活前候选意图校验，提交后设备失败保留pending，不让旧Core复活。

Schema单源、真实工厂、Core中立状态与Web adapter分界；Core不接触Audio/Blob/AbortSignal/Date。用原创《灯塔来信》与合成音轨验证真实浏览器/IndexedDB/独立tarball，不能借合成声音或文件推及真实两作兼容/人耳音质。

续建约束：v0.6要求网络媒体无需整轨下载、ResolvedAssetIdentity与IntegrityEvidence区分版本化流式URL/完整验证。现有provider只有完整bytes，本项不把Blob称为网络streaming。该剩余要求在任务表保留为G3-04，并加入G7完整门槛依赖；不能由G3-02有限集通过删去产品要求。
