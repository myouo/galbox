# ADR0126：控制等待中的未确认正文前缀

2026-11-06，W1-27。

includeCurrentText已允许当前提示的已揭示文字进入只读历史。text.rich的
completion=continue完成揭示后会跨过提示，保留正文前缀；其后的delay/group
等待期间，历史页不应丢掉该前缀。

CoreView.currentHistoryText增加有限派生：仅waiting状态下delay/group等待，
保留文字完整且匹配已加载、相同at/textId/revision及签名的rich源，源必须
continue且recordHistory不为false。仍使用原冻结TextState，不确认、不标读、
不写journal、不推进时钟/PC，不赋予回退或语音重放。显式清页、失败、其它
等待种类、已确认正文、history-only及源抑制不在此投影中。

现有includeCurrentText默认关闭、显示计量、Snapshot与protobuf ABI/存储
预算均不变。源匹配按不可变文字身份缓存，模块重入/冷恢复从当前来源派生。
真实工厂、源/清页/边界负例、跨模块冷恢复、默认UI图文保存刷新和隔离实包
通过后才完成；作品原生行数保留、跨分支名字缓存及其它等待另验。
