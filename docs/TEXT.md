# 结构化正文与效果（G2-01）

SDK 提供 `text.rich`、安全样式和统一揭示/恢复状态，作品声明内容与参数，React 不解释正文或推进 PC。当前为基础横排 ADV；NVL、多文本框、布局主题、字体加载/竖排/禁则/自动分页仍由 G2-02 等后续任务建设。

```ts
import {richPage,richText as R,expr as E,variable} from 'galbox-sdk/port-kit';
const name=variable('name','string');
const page=richPage('letter:page','letter.page','zh-1','澪',[
  R.text(E.template`${E.variable(name)}，`),
  R.ruby('灯塔','とうだい',{color:'#FFD580',bold:true}),
  R.br(), R.pause(300), R.speed(40),
  R.text('光从字里慢慢浮起来。',{effect:{kind:'fade',duration:200}}),
  R.text('海风',{italic:true,effect:{kind:'wave',amplitude:2,periodMs:1000}}),
]);
// 加入普通 ProgramBuilder.function 的 code；build 自动声明能力。
```

`richText.text/ruby` 的文本与 reading 接受字符串或真实 `TypedExpression<'string'>`，speaker 同样支持。工厂运行时验证，raw Program 仍经 Schema/表达式链接；不是 HTML/Markdown 解析器，不接受任意 CSS/JS。运行时求值后保存 runs/speaker/plain content，恢复不按新变量或 profile 重算旧页。默认历史显示正文摘要，Snapshot.history 保留完整 runs，交互回溯/语音历史仍在 G4。

样式支持 `color`（#RRGGBB）、`bold`、`italic`、`underline`、`scale`（0.75..1.5）和单个效果：fade duration=1..10000 ms；wave amplitude=0..12 px/periodMs=100..10000；shake amplitude=0..8 px/periodMs=50..10000。没有任意 CSS、组合滤镜或正文参与 Pixi 合成的承诺。每页 1..128 runs，总正文 1..4096 UTF-16 单元，reading 单段最多 256，源规范签名最多 65536 字符。来源表达式继续受深度/节点/字符串限制。

新正文按固定 `uax29-17.0.0@1` 字素分割（锁定 unicode-segmenter 0.17.3，非设备 Intl.Segmenter），组合符/肤色/ZWJ/旗帜等不拆开。run/control 不能切开一个字素，未知分割版本拒绝。Ruby base 逐字素揭示，注音不计揭示/已读单位；完整 base 已揭示后显示注音，布局从一开始保留。显式换行计一个单位。旧 text.page/text.template 与旧档保留原 codepoint 语义，不把旧下标改解释为字素。

`speed(0..200)` 控制后续字素间隔，`pause(0..60000)` 是段内活动时间停顿；玩家 intervalMs=0 覆盖字速但仍遵守停顿。第一次 step/reveal 直接显完本页、跳过段内停顿并完成淡入，不记已读；另一次 step/advance 才翻页并写当前 ReadUnit。自然 reveal、pause、fade 未完成时 advance 无效。`isTextComplete(text)` 和 `textUnitCount(text)` 从 protocol 提供给已验证 TextState 的调用者；外部 unknown 先 parseTextState，Core/Auto/快进使用同一完成判定。周期效果不阻止 Auto，淡入与段内停顿会阻止。

Snapshot.text.rich 保存源 at/签名、分割身份、求值后 runs、token cursor、elapsed/remainder、revealedAt、剩余停顿及上次文字间隔依据。不同 tick 分割、预算 1/8/100、暂停及保存/恢复使用同一 continuation。当前玩家偏好仍独立持久化：重新应用相同间隔不丢字符余量，换间隔才清余量，不回写旧偏好。显现时间 null 表示手动瞬显，不能伪造半页瞬显 continuation。

DOM 在新页创建完整节点，隐藏未来字素以保留行布局；更新揭示/效果时不重建整页。只使用 textContent，来源字符串中的标签会原样显示，隐藏未来正文不进入 aria-label。fade 按已揭示活动时刻计算，wave/shake 按活动 elapsed/字素序号决定相位，不自跑 CSS 动画；菜单/后台冻结，恢复创建新 DOM 后直接重建相位。正文被后继 choice/group/end 保留时冻结旧表现。OS reduced-motion 可抑制运动，不改变剧情。

当前可见正文和历史的 rich 标记、源签名、样式/静态字串、求值结果拼接、cursor/时间/停顿等恢复时重验。移除标记、篡改来源/版本、将同一 textId/revision 混作旧/新正文均拒绝；旧槽位保留，需要显式完整内容迁移。Snapshot wire version 仍为 1 的可选扩展，不承诺旧 SDK 能读新 Program/存档。

原创验证章节为 `pnpm dev` 后的 http://127.0.0.1:4173/?demo=text ，Builder 输入在 fixtures/text-novel/build.ts，复用原创素材并走正式 Player/Core/DOM/IndexedDB。它不能替代真实作品兼容资料。
