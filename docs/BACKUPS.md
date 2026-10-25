# 便携备份和内容迁移

M5-01 的公共入口为 `galbox-sdk/backups` 与 Player。默认 React 菜单提供「下载备份」「选择备份」「确认恢复备份」。备份只包含已经持久化的数据；需要保留当前剧情位置时先保存。备份不携带资源、原档附件、未保存的活动位置或旧会话权限。

```ts
const backup = await player.exportBackup(); // 先 flush，再单次事务读持久闭包
const json = JSON.stringify(backup); // 可下载为 JSON
const parsed: unknown = JSON.parse(json);
const plan = player.prepareBackupRestore(parsed);
console.log(plan.report()); // 先检查数量、源 release、迁移 ID
const result = await player.commitBackupRestore(plan);
// 提交添加独立 profile/槽位，不改变当前游戏或主进度。
if (result.slots[0]) await player.load(result.slots[0].restoredSlot);
```

格式 `galbox-backup@1` 保留同一 gameId/saveCompatibilitySeries 的全部持久 profile（包括没有槽位的普通进度）、槽位修订、当前/上一 Snapshot、metadata、recipe/onLoad 与 provenance。release 字段记录导出上下文；源 release 集合还包括所有槽位的当前/上一 Snapshot。总量至多 1000000 JSON 字符、100000 节点、64 profile、128 槽位，通用 wire 解析仍限制有限 JSON/深度/4 MB。超限明确拒绝，不截断。

恢复先校验命名空间、引用闭包、每份快照的生产 Core 恢复规则和 recipe。新的 `backup:<commitId>:pN/sN` 身份保留原 profile 修订、槽位修订和 Snapshot.profileBasis；当前 main、原槽位和 activation head 不变。恢复槽位可在默认菜单选择，刷新后仍存在。没有手动槽位时，恢复的普通已读/解锁仍可从「开始时使用的进度」选择，显式从头开始；嵌入方调用 `player.start(restoredProfileId)`。无参数 start() 仍使用 main。恢复时不执行持久钩子，明确 load 时沿用现有最终 dirty 交接与原子 activation 规则。

结果以数据库事务完成为准。`BACKUP_COMMIT_UNKNOWN` 表示调用可能已经提交，请使用同一个 plan 再次 `commitBackupRestore`；播放器为该计划复用提交 ID。重试返回相同持久事实，不创建第二组槽位。默认菜单关闭或页面重载后句柄不持久化；重新规划会产生新的独立分支，已有结果可在槽位列表发现。提交中 dispose 仍返回 committed/disposed 的实际结果。

内容迁移不会自动改 release 或猜章节起点。默认只接受当前 Program 的 release；缺旧 release/映射返回 `BACKUP_RELEASE_UNAVAILABLE`。节点删除、帧 ABI 或正文修订不相容也会在准备阶段拒绝，输入包与原槽位均保留，仍可重新导出。不提供虚假的旧版运行或检查点恢复按钮。

开发者可用受信任的同步工厂登记一次完整迁移。以下示例对应《灯塔来信》第一段译文修订，地址、帧与其他指令保持相容；其他内容变化必须自行明确映射全部受影响状态。

```ts
import {defineContentMigration} from 'galbox-sdk/backups';
import {parsePortableBackup} from 'galbox-sdk/protocol';

const migration = defineContentMigration({
  id: 'lighthouse.zh2', gameId: target.gameId, series: '1',
  fromReleases: ['lighthouse-1'], toRelease: target.release,
  migrate(input) {
    const output = parsePortableBackup(input); // input 深冻结；修改自己的副本
    output.release = target.release;
    for (const p of output.profiles) {
      // 新译文需要重新阅读；其他 ReadUnit 不继承为新版本。
      p.profile.read = p.profile.read.filter(u => u !== 'opening.1@zh-1');
    }
    for (const slot of output.slots) {
      for (const s of [slot.snapshot, ...(slot.previous ? [slot.previous] : [])]) {
        s.release = target.release;
        if (s.text?.textId === 'opening.1') {
          s.text.revision = 'zh-2';
          s.text.content = newOpeningContent; // 必须与目标 Program 完全相符
          s.text.revealed = 0;
        }
      }
    }
    return output;
  },
});
const plan = player.prepareBackupRestore(oldBackup, migration);
await player.commitBackupRestore(plan);
```

迁移必须匹配完整源 release 集合、目标 release、作品和系列，保留全部 profile/槽位身份、修订和上一版本闭包；不能以删掉旧档让校验通过。输出重新过 Schema 与生产 Core，文本仅改版本号不能通过；扩展 args/phase/wait 的改变仍须完整 invocation 迁移。已读继承由显式映射负责，SDK 不按相同 anchor 猜测。

无 DOM 消费者可使用 `prepareBackupRestore(input,{program,series,operations?,migration?})`、`materializeBackupRestore(plan,{program,series,operations?})`，再交给自己的 Store。计划绑定整个 Program 和冻结的 operation registry 实例，变化后须重新准备。自定义 Store 可实现可选 `backup(gameId,series,release)` 与 `restoreBackup({id,backup})` 端口，并通过可选 `listProfiles()` 为默认 UI 提供跨刷新进度选择，必须提供一致读取、原子写入和同 ID 固定 payload 回执；不支持时 Player 显式报错。`storageNamespace(gameId,series)` 与 Player/IndexedDB 使用同一解析器。

这是可恢复性验证，不是备份真实性签名，也不是原作忠实性认证。跨系列迁移、资源分发、自动旧版获取、任意旧 schema 转换仍不在支持集。
