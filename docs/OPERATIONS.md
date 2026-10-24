# 同步有状态操作

M3-01 提供真实工厂、生产 Core 分派、等待/快照及调用迁移。入口位于 `galbox-sdk/port-kit`，使用者无需导入私有源码。

```ts
import {codec,defineOperation,waitFor,createOperationRegistry} from 'galbox-sdk/port-kit';
const count=codec.integer('my.count');
const args=codec.object('my.args@1',{delta:count});
const state=codec.object('my.state@1',{count});
const resume=codec.object('my.resume@1',{
  kind:codec.literal('my.ready','ready'), value:count,
});
const operation=defineOperation({
  id:'my.counter',version:1,args,state,resume,
  manifest:{implementation:'my.counter@1',save:'safe',restore:'continue',
    resumeKinds:['ready'],jumpTargets:[],recipe:false},
  initialize(){return {count:0};},
  reduce(input,current){
    return {state:{count:current.count+(input.kind==='start'?input.args.delta:input.event.value)},
      actions:[],effects:[],flow:input.kind==='start'
        ? {kind:'wait',wait:waitFor(resume,'ready','signal')}
        : {kind:'continue'}};
  },
});
const operations=createOperationRegistry([operation]);
const instruction=operation.invocation('main:counter',{delta:1});
```

将 instruction 放入正式 Program，并用 `builder.build(operations)` 链接。Headless 使用 `createCore(program,profile,snapshot,{operations})`；Web Player 使用 `createPlayer({...options,operations})`。未注册 opcode/version、错误参数或 schema 身份在执行前拒绝。

扩展 flow 的 continue/jump/wait 是控制流唯一入口；actions 仅允许有类型的 run 槽写入与 profile.set，effects 仅提供现有音频意图。jump 必须来自 manifest 登记并且在当前函数内。当前扩展等待是明确的外部 signal，宿主从 `view.core.run.invocations` 取得活动调用/等待，使用 `operation.result(wait,id,payload)` 构造结果，再调用 `player.resumeOperation(result,view.epoch)`。不能用虚拟 Host 猜选择或媒体完成。

每次调用有独立 State，initialize 和首次 reduce 原子提交。参数/状态/context 隔离且冻结；结果取得独立所有权。抛错、错误输出、动作或效果校验失败都不改变调用前的剧情/profile/等待/任务。错误可以报告，不能把失败当作已执行。恢复使用已保存 State，重建 attempt，旧/重复结果不会推进新等待。

`codec` 工厂支持有限 i32 整数、string/bool/literal、精确 object、有限 array/tuple/union；不接受自造 codec 对象。JSON 输入限制为 4 MB、100000 个节点、64 层，拒绝循环、非有限数和 accessor。schema ID 与完整规范 signature 一起核验；signature 不是加密摘要。DeepReadonly 保留品牌和元组，运行时隔离另行执行。

`migrateState` 只适用于 args/resume 身份和 schema signature 均相同的变化。args 或 wait ABI 改变时使用 `defineInvocationMigration(old,new,convert)`，转换 args/state/phase/wait 后重新链接；缺迁移明确拒绝并保留旧档。迁移不能改 invocation/address/帧归属，不能复用旧宿主 attempt。跨 content release 的迁移属于后续 M5。

完整独立示例见 `tests/consumer/extension.ts`：tarball 的公开工厂登记 v1、保存等待，再把完整调用升级到 args/resume 都变化的 v2。浏览器消费者另外验证 Player 保存/恢复及旧 attempt 拒绝。

扩展是受信任的同步 TS；这些工厂和冻结措施不是同 realm 安全沙箱。recipe 资格只是声明，M3-03 还须实施有界允许集；SaveBridge 尚未因此获得支持。
