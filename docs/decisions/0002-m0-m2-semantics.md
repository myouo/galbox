# ADR-0002：M0–M2 的执行与恢复规则

状态：采纳，2026-10-25。对应实现：protocol/core/runtime/player/storage。

- JSON Schema 是 wire 类型、Ajv standalone 校验器和 OperationSpec 参数表的来源。生成物入库；check 在内存重生成并比较，检测漂移时不修改文件。链接继续验证作用域、帧、值和资源种类。
- 指令地址是显式稳定字符串；PC 指向当前等待指令或下一条待执行指令。调用帧保存布局、局部槽及 callAt/returnAt/dest。初期 source 值仅 bool/string/checked i32；比较无隐式转换。
- 一条剧情流。动画和 delay 由协调器提供的活动时间推进；表现为绝对 x/y/alpha 的线性插值。音频任务的 completed 表示成功启动，实际 ended 单独报告为设备诊断；不把两者混为一谈。loop 与 one-shot 均遵守 replay/stop；completed 仅表示启动已确认，因此 replay 的单次意图也会在恢复时重建。初次激活保留所有 pending 播放意图，stop-on-restore 只在真正恢复时生效，不会静默丢弃新游戏的提示音。
- Snapshot 保留任务、已结算结果、固定组、等待和文本内容/修订/码点揭示位置。只有语义等待/end 可保存；预算中间态、profile flush 和资源准备期间拒绝。所有素材在 Player 初始化时完成 SHA-256 与解码，运行期间没有未表达的资源屏障。恢复音频请求建立新 epoch/attempt；完成的动画不会重做。
- 已读以 TextId@Revision 标识，在 advance 时记录。step 是一个语义输入：当前未显完时只揭示，已显完时只推进。显式 reveal/advance API 仍分别存在。物理输入必须同时携带当前 prompt 和 Player epoch；旧 epoch 即使 prompt 数字相同也无效。
- 外部输入受理时先固定活动时间，再把时间事件和语义事件相邻入队。Core 不读设备时间。协调器在预算 continuation 完成前不消费下一事件；Host 结果和订阅触发的动作都重新入队。
- namespace 为 gameId + saveCompatibilitySeries，release 不改变 namespace。Snapshot 不回写 profile；load 总是接入当前 durable profile。非单调冲突不自动合并，只有显式 discardAndLoad 放弃当前未提交修改。
- profile 提交批次深冻结并绑定 ID/基修订/序号/内容；回执与 profile 同事务提交。初始候选在首个提示前的 profile 变化随 activation 同事务提交；候选内部的 flush 在此原子激活事务中兑现，不提前修改旧会话。启动准备总执行预算有限。
- load 的准备与激活分开。最终屏障先在语义边界冻结旧协调器并暂存迟到消息，交接全部 dirty，再校验持久 head 和基修订。提交后旧 Core 撤权；接管前和确认后再次检查 head。提交前失败可以 thaw 旧会话，提交后失败保留 committed-pending，不伪装回滚。resumeCommitted 是显式的新激活，且只采用当前 head。
- IndexedDB 每个 namespace 一个原子记录；槽位保留上一修订。回执、activation 记录在此初始版保留，后续 M5 增加有证据的预算/回收规则。dispose 不撤销已经开始的存储提交，借用 Store 的生命周期由调用者拥有。
- 图像只用 Pixi WebGL；正文为独立 DOM 控制器，默认菜单/选择/历史是 React。音频暂停与恢复串行协调，activation 的短逻辑冻结不额外暂停设备音频。

未启用的计时选择、视频、relative 动画、复杂 source 值、有状态扩展、迁移和 SaveBridge 明确拒绝。M3–M5 与 N/F 的义务仍由任务表保留。

依赖核对参考：[Pixi Application](https://pixijs.com/8.x/guides/components/application)、[Vite 环境要求](https://vite.dev/guide/)、[Ajv standalone](https://ajv.js.org/standalone.html)。具体锁定版本以 pnpm-lock.yaml 为准。
