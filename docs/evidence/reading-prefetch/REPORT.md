# W1-02：稳定标签预取与音乐连续性

2026-10-29。用户报告远程序章换句/立绘时停顿和音乐断续。确认实例默认demand；源标签被编为control.jump，旧balanced遇到标签即停。ADR0050沿同函数无条件跳转做128步/16资源/页数有界扫描；不猜分支。计划只按PC变化重算，先取得重叠引用再撤销旧预取；按资源事实限制预取到驻留预算一半和工作集外余量。版本化音乐URL去掉随机lease查询串，JS租约/取消仍独立，HEAD版本验证保留。

相关单元和类型检查已通过。浏览器loading/reading-prefetch/streams 19项通过，含四种策略、失败保旧帧重试、LRU跨刷新、真实HTTP渐进播放、版本漂移/取消/双实例隔离。受控图像读取延迟400ms、阅读间隔600ms下，demand实际AudioContext暂停，balanced两次推进均无暂停、共享预取各一次；这是负对照而非仅看配置名。真实作品远程复验与默认策略更新继续，不据此声称所有网络下无卡顿。

raw在ignored artifacts/door-loading、artifacts/door-prefetch及对应log；独立实例正在整章迁移，正式包不包含其资产。
