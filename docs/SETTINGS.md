# 通用系统设置（G1-01）

设置是 SDK systems 能力，作品给默认配置，玩家值单独持久化。当前实际支持主/BGM/语音/音效音量和文字间隔，默认 React 菜单直接可用。自动阅读、快进策略、输入映射和显示辅助属于 G1-02，尚未实现，不接受其伪配置。

```ts
import {defaultPreferences,mergePreferences} from 'galbox-sdk/settings';
const defaults = mergePreferences(defaultPreferences(), {
  audio: {master: 0.5, voice: 0.8}, text: {intervalMs: 32},
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
