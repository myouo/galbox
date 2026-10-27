# 播放模式与实例输入（G1-02）

通用系统由 SDK 提供，作品通过 Program 表达正文/媒体、通过 preferencesDefaults 给初始偏好。React 调 Player API，不推进 PC，不复制 Core 逻辑。规则见 ADR 0015；本支持集不包括视频、精确媒体 seek 或语音重播 UI。

```ts
await player.updatePreferences({playback:{autoDelayMs:1000,skipUnread:false}});
await player.setAuto(true);
player.setFast(true); // 按住时开启，释放时 setFast(false)
const {mode,reason,voice,elapsedMs}=player.getSnapshot().playback;
```

Auto 只在 text 等待、正文完全揭示、当前 voice 已自然结束（或没有实际播放源）之后计时。语音启动的 completed 回执仍只代表启动成功；Web Audio onended 通过 epoch/task/attempt 单独入队。旧 epoch、旧 attempt、重复/停止/替换回调不能伪造当前媒体结束。blocked/failed/loop 语音保守等待；玩家可以手动推进或关闭自动。BGM/SFX 不阻挡正文 Auto。

每个 tick 最多产生一个普通剧情输入，预算续跑不重复执行。Auto 到选项/结尾/错误停止；对 group、delay、flush、operation 等等待继续正常时钟/任务规则。快进逐页发 step，先显完再消费，默认遇未读停止；允许未读必须显式启用。快进不跳过真实等待、不选择选项、不伪造媒体完成。手动推进/选择取消模式。

菜单、显式暂停、失焦、后台暂停均排除停用时间，恢复不补算整段墙钟。Auto 可暂停后续读；按住快进在暂停/失焦时清理。新运行、load、导入恢复和 pending 接管均创建 manual 模式；模式不是 Snapshot 权威状态。恢复的 voice 按 replay 重建源并等待新 onended，stop 则没有播放源；不承诺旧媒体位置延续。

输入 adapter 只绑定本实例舞台/默认 UI，或 `const detach=player.attachInput(element)` 明确绑定的根。使用物理 `KeyboardEvent.code`，按下记录 epoch/prompt，释放重验；重复 keydown 不消费两次，换映射/菜单/读档/失焦清除 held。焦点在其他 Player 时不会推进本实例；input/textarea/select/contenteditable 保留编辑。按钮 Enter/Space 保留可访问激活；正文按钮同样验证按下时的 prompt。F5/F9 等浏览器快捷键仅在本实例区域匹配且生效时阻止默认行为。调用 detach 或 dispose 移除监听。

默认菜单可配置每动作一个主按键，公开设置 API 支持每动作最多四个。键表、验证范围、设置迁移与 protobuf 导入导出（兼容旧 JSON）见 [SETTINGS.md](SETTINGS.md)。字体缩放与背景透明度作用于 DOM 样式，不是剧本布局指令；后续 G2 仍须提供结构正文和可恢复布局。
