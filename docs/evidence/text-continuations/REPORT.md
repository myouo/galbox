# F-01E 的通用前置能力：正文续段与状态保留

2026-10-29，ADR0052。正式Schema/Protobuf、公开richPage/richText工厂、Builder能力声明、链接与Core提供显完后继续/自动结束、同段appendFrom和恢复用户字速。原有text.rich默认源签名保持；中间演出不重复正文、不额外确认、不生成多条已读/历史。state.collect保留活动任务、未消费组、音源引用、显式保留的最新结果和可见正文，清理其余终态记录并保留有界历史。

实际通过pnpm check、pnpm test（48文件301项）、pnpm build、pnpm build:harness、pnpm test:consumer。7项新单元覆盖预算1/8/100、页内确认/自动结束、protobuf恢复、700页状态回收、明确保留/丢弃结果及伪造前缀拒绝；真实IndexedDB浏览器验证页内演出切点、Unicode续段和单条历史。3项新增/关联浏览器和18项既有正文/多窗口/历史/备份浏览器均通过。consumer从实际包通过独立构建/播放/存取/备份。测试编写时的组逻辑名/物理ID断言和openStore参数错误已修正；未放宽生产约束。

第一门实例目前只有八语全文控制IR与正文边界转换，尚未接入完整舞台/运动/雨樱粒子、章末解锁与原菜单回放；本通用能力不等于整章完成。raw位于ignored artifacts/door-continuation-*；游戏资料不进入SDK或正式包。
