# SaveBridge：来源绑定、导入与激活

M3 提供真实来源工厂、不可变转换计划、有界候选 recipe、独立 profile 的导入事务和显式载入。合成格式只证明框架；N/F 仍缺原作资料。

## 公共接入

`galbox-sdk/port-kit` 提供 defineSaveSource、defineSaveCodec、defineSaveMapping、bindOriginalSave、createSaveBindingRegistry。类型从 codec 一侧锚定 SourceKey/schema/version；状态保持不变型，运行时继续核验真实工厂和 schema signature。

Headless 可调用 binding.prepare(files,context,program,operations)，用 materializeImport 检查副本；原始 plan 不能被调用者改写。bytes 在首次 await 前私有化，SHA-256/严格 UTF-8 通过中立端口提供。Core 不处理 Blob/File/Node I/O。计划绑定规范 Program 和同一个冻结操作表，依赖改变后须重新准备。

Web Player 接收 `bindings:createSaveBindingRegistry([...])`：

```ts
const source={sourceKey:binding.sourceKey,schema:binding.schema,version:binding.codecVersion};
const prepared=await player.prepareImportFiles(source,selectedFiles);
if(prepared.status==='ready'){
  const report=prepared.plan.report(); // 展示等级和差异，再由用户提交
  const imported=await player.commitImport(prepared.plan);
  await player.load(imported.slot);   // 显式、独立的接管动作
}
```

prepare 不写存储或切换故事，commitImport 原子创建新槽位/profile/回执，也不激活；load 才冻结旧会话、交接 dirty 并建立候选。解锁、已读等不会默认合并到网页 profile。导入不覆盖已有槽位，跨 profile 覆盖明确拒绝。

DefaultUI 只在配置了来源时显示文件选择、报告、提交和载入按钮；来源名由 binding 提供。槽位选择器可跨刷新找回独立导入进度。主网页快速档仍名为 quick；导入分支的默认 save() 使用隔离的 key，返回 SaveResult.slot。加载所保存的独立档请使用该返回 key。显式 load() 默认指网页 quick。

## Recipe 与恰好一次

RestoreRecipe 经同一个 Core 分派器执行，最多 128 个有限步骤。只对 candidate 角色开放；真人选择、媒体完成等待、控制流循环、未授权扩展均拒绝。任何步骤失败回滚整份候选，设备效果保持意图。

导入原始槽位保留 baseline + reconstruction recipe；预演结果不写回基线。普通 SDK 存档保存已经重建的快照，只延续 onLoad hook，避免重新加载后又强制切回旧背景。槽位与 activation metadata 都保存来源报告、profile 身份和加载规则。

最终屏障重新读取目标 durable profile，再执行加载 recipe；不是给旧预演改一个 revision。profile 批次、候选、head 一次提交。syntheticLoadCount 的示例：来源 4 → prepare/commit 后仍 4 → 第一次明确 load 为 5 → 恢复同一 pending 仍为 5 → 再明确 load 为 6。

pending 恢复保持同一语义 activation id，另领 owner token 和递增 sequence；旧 owner 的 confirm/progress 不再有资格。已经 activated 的记录不作为 pending 自动重放，应显式 load。回包丢失时只核验当前持久 head，不回到已经失权的旧 Core；无法核验则报告 commit-unknown。导入结果未知可用同一 plan/commit ID 重试，不能报告无副作用取消。

## 范围与证据

fixture-save@1 的输入为 GBFX/version/LE 长度/最多 64 KiB payload/SHA-256 的 slot.bin，加必需 global.json；edition、locator、read revision 都校验。它只映射《灯塔来信》已登记位置，grade 为 semantic，不承诺原格式没有提供的历史和精确音频位置。

`pnpm fixture` 重建公开样本（apps/playground/public/synthetic-saves）；菜单中选择这两个文件即可试用。`pnpm test:compatibility` 运行合成格式负例并单独报告 N/F needs-input；`--require-real` 在缺原作证据时返回 2。独立消费者另注册自己的 synthetic codec/binding，再完成实际浏览器导入和加载。

当前保存了恢复所需的完整标准状态/规则和源文件摘要，未提供原版导出或便携备份；原始附件归档/双向互通与跨内容版本迁移由后续阶段承接。旧 M2 IndexedDB 行保留为 main profile，不清空旧进度。多作品 namespace 相互隔离。
