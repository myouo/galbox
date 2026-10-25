# 0016：结构化正文、字素揭示与可恢复效果

G2-01 有限支持集：text.rich，已求值文字/Ruby/换行，安全颜色/粗斜体/下划线/缩放，段内速度/毫秒停顿，淡入/波动/抖动。正文和 Ruby base/reading 接受 string expression，经公开 richText/richPage 工厂进入同一 Schema/Core。128 runs、4096 UTF-16 正文和有界效果参数；不执行 HTML/CSS/JS。NVL、多文本框、主题布局、字体加载/竖排/禁则/自动分页在 G2-02 等任务，不在本项宣称支持。

新文本用 unicode-segmenter 0.17.3 的固定 UAX29/Unicode17 实现，分割身份 uax29-17.0.0@1，不调用宿主 Intl.Segmenter。跨 run 的字素边界必须合法，不允许把组合符/ZWJ 簇拆成样式或控制片段。Ruby base 按字素揭示，注音保留完整布局，base 完全出现后显示；reading 不计已读/揭示长度。显式换行计一个单位。旧 text.page/template 仍 codepoint，不将旧存档下标暗转为字素。

Snapshot.text.rich 含分割版本、源 at/规范签名、求值后 runs、token cursor、已揭示时间、活动 elapsed、字符余量、当前玩家文字间隔依据和剩余停顿。源签名包括表达式/样式/控制参数；恢复不按后来变量/profile 重新求值。验证当前可见正文与历史 rich 来源、布局数据及 continuation，移除 rich 标记也拒绝。新旧正文不能共用相同 textId/revision 来混淆表示。ABI 不兼容/来源变化需显式完整内容迁移，保留原槽位。

Core 的 tick 用活动时间推进同一 continuation，字素间隔和 pause 余量跨切分与保存保持。玩家 interval=0 覆盖字速，但仍遵守显式 pause；文本中 speed 控制其后字速。手动 reveal/step 显完包括跳过段内停顿并完成淡入，不能同次记录已读/推进。advance 必须正文/停顿/淡入完成。波动/抖动不阻挡 Auto。isTextComplete 共用于 Core、Auto/skip；不让 React 用另一套字符长度推进 PC。当前 player 偏好重新应用，改变间隔才清字符余量，不把旧快照中的偏好回写持久设置。

淡入按每字素显现活动时刻计算；波动/抖动按活动 elapsed 和单位序号确定相位，不使用随机数或 CSS 自走时钟。暂停/菜单/后台保持效果；恢复重建 DOM 后直接应用保存相位。段落切换/后继非正文等待冻结旧页表现；手动确认将淡入完成。效果属于正文，不进入 Pixi 合成；OS reduced-motion 可关闭视觉运动但不变剧情。

DOM 在新页建立完整节点/隐藏字素，后续只更新可见性/效果，保留换行布局；只用 textContent 创建节点，不用 innerHTML。隐藏内容不进入正文 aria-label；当前默认历史显示纯正文摘要，但快照保留完整 rich 数据，G4 再补历史语音/回溯。所有中立算法保持 headless，导入边界仅允许 protocol/text.ts 使用锁定的 unicode-segmenter/grapheme，其他外部导入仍拒绝。
