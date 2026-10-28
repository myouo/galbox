# ADR0052：正文续段与显式运行状态保留

2026-10-29。第一门包含同段文字中插入演出，以及无p的自动正文。text.rich增加completion=input（默认）、continue（揭示后执行后续指令但不确认历史）、finish（揭示后确认历史）；append要求同textId/revision/speaker、同ADV窗口且完整已揭示前缀完全一致，沿用前缀揭示状态，不重复显示或要求多点一次。speed的user标记恢复当前玩家速度。新能力text.continuations必须声明；旧source signature在默认值下保持。

state.collect显式收集终态任务及有界历史，能力state.retention。所有活动/blocked任务、仍播放的旧audio启动任务、未消费组及其任务、音源包络引用、作者retainTasks声明的最新结果保留；只移除已消费组和其他终态任务。历史保留最近historyLimit项加可见窗口/保留正文所需记录，普通已读/解锁与counter不缩减。作者必须保留后续join/cancel仍需的结果；不自动猜测用户插件的隐式字符串引用。此指令不是新保存点，不提高256活动任务上限。

无额外Host VM、无后台计时改PC。旧recipe、基础代码模块不自动扩充；未知能力拒绝。迁移必须重建新源签名/等待闭包。完整实现须通过真实工厂、预算1/8/100、Unicode/页内确认、跨续段保存恢复、活动任务引用和长期序列边界验证。
