# 历史语音与受控回溯

G4-02有限支持集，见 ADR0026。Core负责确认和实际可恢复状态；runtime记录切点，Storage负责原子journal/回执；Host预览声音，默认React历史面板只发Player动作，不改PC。

```ts
const player = await createPlayer({
  program, provider, mount, saveCompatibilitySeries: '1',
  history: historyPolicy({maxEntries: 32, maxCharacters: 500000, rollback: true}),
});
await player.start();
const row = player.getSnapshot().backlog.entries[0];
if (row?.canReplay) await player.replayHistory(row.id, player.getSnapshot().epoch);
player.stopHistoryVoice();
if (row?.canRollback) await player.rollback(row.id, player.getSnapshot().epoch);
```

historyPolicy从player或port-kit导出，Schema与真实工厂验证1–64条、65536–1000000 JSON字符，默认32/500000/允许回溯。实例配置不随旧档回写。回溯可关闭；超限淘汰旧点/单点过大标CHECKPOINT_BUDGET，无旧点明确拒绝。显示当前叙事最近N条，不把别的路线的持久journal当跳转菜单。旧档无historyId仍可展示和验证已有语音，但没有凭空生成的过去快照。

Coordinator仅在完整正文实际确认时记录：显完、旧prompt/input、预算continuation不制造切点，自动阅读走同一路径。Core.historySession为安装时的新逻辑分支scope（与Host请求无关），当前/后续正文使用scope+prompt，已确认ID保持。加载旧快照继续确认会生成新分支ID，避免同样文字对应错误变量/调用/RNG的切点。每条journal保存真实确认前Core.capture的完整Snapshot或明确不可用原因；不递归嵌入journal。ID必须关联真实文本和切点，不能用TextId/行号推算状态。

禁存、不可恢复媒体等待/插件等切点仍有历史/可用语音，回溯按钮禁用并解释。回溯的当前状态也须允许Core保存，不能从禁存处逃逸。API只接受当前可见ID与当前epoch；缺点、旧输入、坏PC/来源/版本无迁移都拒绝，提交前不破坏原会话。

回溯复用prepare/旧Core freeze/dirty profile与journal flush/持久activation/head/Host接管。剧情帧、局部变量、RNG、文本窗口、活动任务恢复；当前持久profile/玩家偏好保持权威。已读和解锁不会被旧快照覆盖。未来再次走过的剧情按正常指令产生新效果；不是永久禁止作者更新profile。回溯不重复onLoad recipe，因为真实切点已经包含当时的候选效果，但保留未来普通读档的加载策略。提交后失败留pending，用resumeCommitted或新Host恢复，不能复活旧Core。

readHistory/commitHistory/historyReceipt是可选中立存储端口。默认IndexedDB与MemoryStore同候选事务写journal和SHA256绑定的不可变回执，绑定profile/活动authority；旧会话新批次被拒。flush/save/load/backup包含历史提交，失回执核验同ID、失败不假报持久成功。缺端口时明确memory-only：当前会话可用，刷新不承诺保留。原普通进度与journal不是跨事务ACID；已提交普通进度不会因历史写入失败撤销，后续flush会重试原不可变批次。

槽位Snapshot中的ID精确关联持久journal，因此读档/刷新可回溯仍在保留窗口中的点。开始新故事不自动展示上一次运行的文本历史。便携备份包含所有保留journal，原子恢复映射到新profile；跨release迁移须覆盖所有历史来源和checkpoint Snapshot并保持身份/存在性，不接受只迁移槽位的部分转换。原Namespace4 MB/backup1 MB预算继续，超限拒绝，不截断备份中的点。

replayHistory播放已有VoiceRecipe，支持已实现的WAV/buffer、MP3/Opus/Vorbis element及显式版本化HTTP stream；资源仍通过原正式Host校验路径。专用Host AudioContext/源使用当时的script gain乘当前master/voice偏好，独立于剧情bus/duck/任务，不向Core报告started/ended，不新增已读或语音门。API预览期间只持有自己的history-voice暂停原因；菜单暂停允许预览，用户/隐藏/失焦/设备暂停仍生效，关闭菜单/离开历史/load/rollback/dispose停止预览。切换条目、迟到play/ended/错误不能影响新的预览或另一个Player。

block/缓冲/失败只显示在backlog.voice，不伪装剧情成功；再次点击可用新attempt重试。预览不承诺任意seek/跨设备采样点、任意编码或无限历史。Blob URL/Native元素/PreviewContext/实际播放进度不进Snapshot/journal/备份。媒体恢复仍遵守已有replay/stop/forbid。

默认历史界面有逐条回放、停止、不可回溯原因和确认回溯；关闭后回到普通Player。原创《灯塔来信·回声书签》位于 `/?demo=history`，可加 `&renderer=canvas`。其中一条禁存正文仍可重听，不能回到它的禁存切点。实际验证状态见任务表/evidence，不据此宣布G5–G7或真实两作完成。
