# G1-04 滚轮与历史入口

2026-10-28，ADR0048。正式InputController读取Schema派生的可选wheel偏好，新增protobuf字段7，不改变剧情Snapshot。旧v2默认true、关闭可持久化；真实工厂/错误类型/protobuf及strict类型反例覆盖。

SDK check、43文件271单元通过；原8项偏好/按键/字符等待浏览器通过；新增真实双Player滚轮测试修正fixture revision与零高附加根page单位后通过。覆盖三单位、显完/推进、连续包/惯性、menu/load/focus、原生滚动/编辑/捏合、嵌套根和dispose。raw artifacts/wheel。

独立实例仍待实包更新和原历史页面/八语/真实IndexedDB复验，不提前标done。默认存储openStore(namespace,'galbox-sdk')是真实IndexedDB；原作存档codec和完整章节回放未接通。SDK G5-01/G5-02能力并不等于本作宏与章节已完成。
