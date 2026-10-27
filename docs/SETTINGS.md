# 通用系统设置（G1-01 / G1-02）

设置是 SDK systems 能力，作品给默认配置，玩家值单独持久化。当前支持主/BGM/语音/音效音量、文字间隔、自动阅读等待、未读快进策略、物理按键映射、字体缩放与文本框背景透明度，默认 React 菜单直接可用。播放模式由 SDK 协调器推进，作品只提供默认设置。

```ts
import {defaultPreferences,mergePreferences} from 'galbox-sdk/settings';
const defaults = mergePreferences(defaultPreferences(), {
  audio: {master: 0.5, voice: 0.8}, text: {intervalMs: 32},
  playback: {autoDelayMs: 1500, skipUnread: false},
  input: {advance: ['KeyD']}, display: {fontScale: 1.25, windowOpacity: 0.8},
});
const player = await createPlayer({...options, preferencesDefaults: defaults});
await player.updatePreferences({audio: {bgm: 0.4}, text: {intervalMs: 16}});
const current = player.getSnapshot().preferences; // revision/value，深只读副本
```

Schema 范围：音量 0..1，文字间隔整数 0..200 ms，0 为立即显示。缺省主音量 0.6、角色音量 1、间隔 32 ms。所有外部输入先 Schema 验证；空 patch/空子 patch、未知字段/角色、NaN、越界均拒绝，不能持久化看似支持但未应用的设置。

设置存于稳定 gameId+saveCompatibilitySeries 的独立字段，和 main/imported 等全部剧情 profile 分离。无设置记录时用作品 defaults；已有玩家记录优先。普通 save/load、原档导入/独立分支恢复不会覆盖偏好。当前故事备份不包含设置，设置不进 Snapshot，不能称其为全系统备份。

同 Player 写入串行并按当时记录合并 patch；不同 Player/标签页按修订 CAS。PREFERENCES_CONFLICT 时本次没有覆盖新值，调用 `reloadPreferences()` 明确读取后再调整。其他写入错误保守报告 PREFERENCES_COMMIT_UNKNOWN，不能猜“必定未提交”；重新读取查看真实记录。进入事务后 dispose 不撤销已提交结果，返回 committed/disposed 的事实。生产 IndexedDB 只有事务完成后返回成功。

偏好成功持久后应用到正在播放的音频和当前 Core；文字偏好经 coordinator 排队。Mixer 为 scriptGain × roleGain × masterGain，Task.gain 始终是脚本增益，不被用户设置改写；下一 source/读档恢复使用当前角色增益。角色为协议已有的 bgm/voice/sfx。`setVolume` 保留旧 session-only 预览语义；默认设置界面用新的持久 API。

文字间隔控制剩余揭示，不直接推进 PC 或记已读。修改间隔清除不足一字的余数；0 在下一 tick 或新 page 显完。Snapshot 保留已求值文本和规范揭示位置，恢复先重建该位置，再用当前玩家偏好继续。直接使用 Core 可通过 `accept({type:'text.preferences',value:{intervalMs}})` 配置；播放中的调用由 coordinator 排队，不能从 reducer 重入。

Store 可选端口 `readPreferences(): Promise<PreferencesRecord|null>`、`writePreferences(value,expectedRevision)`。SDK 内存/IndexedDB adapter 均实现；旧自定义 Store 无端口时 preferencesSupported=false，公开持久更新返回 PREFERENCES_UNSUPPORTED，默认 UI 只保留旧 session 音量控件。主库导出的 settings 是 headless 数据工厂，设备混合留在 Host。


设置 wire version=2；`normalizePreferences(unknown)` 与 `normalizePreferencesRecord(unknown)` 接受完整 v1 并补新默认，保留旧 audio/text 和 revision；v2 strict parser 不接受 v1 或未知字段。旧记录按读取规范化，下一次实际写入使用 v2，CAS 修订不重置。此升级不改变故事 Snapshot ABI；旧 SDK 二进制不能前向读取 v2 设置，不能宣称双向版本兼容。

自动等待整数 0..60000 ms（默认 1500），快进未读默认关闭。输入每动作 0..4 个独特 KeyboardEvent.code，支持 Enter/Space、左右方向、Escape、A–Z、0–9、左右 Ctrl/Shift、F1–F12；动作间重复键拒绝。空数组禁用动作。默认 Enter/Space 推进、Escape 菜单、A 自动、Ctrl 按住快进、F5/F9 快存/快读。SDK 不注册 document 全局剧情快捷键；按键只作用于本实例聚焦的舞台/UI（或 `player.attachInput(element)`），编辑控件保留输入，按钮保留 Enter/Space 激活。完整规则见 [PLAYBACK.md](PLAYBACK.md)。

字体缩放 0.75..1.5，文本框背景透明度 0..1，默认均为 1；只作用于 SDK DOM 正文 CSS 变量，正文不随背景淡化，不改变已读、内容身份、PC 或快照。不代表自定义文本框、富文本/Ruby/NVL/自动分页已实现，仍按 G2 任务推进。

`await player.resetPreferences()` 通过相同持久提交路径恢复本实例 preferencesDefaults。`player.exportPreferences()` 返回独立 v2 设置值，`await player.importPreferences(unknown)` 验证完整 v1/v2 并提交；不导入外部 revision 或剧情。默认菜单下载 protobuf（galbox-settings.pb），上传 protobuf 或兼容旧 JSON（文件导入上限 32 KiB）。坏输入/按键冲突不改变设置和修订；故事备份依旧不含设置。
