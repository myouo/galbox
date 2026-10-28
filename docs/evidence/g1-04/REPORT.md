# G1-04 滚轮与历史入口

2026-10-28，ADR0048。正式InputController读取Schema派生的可选wheel偏好，新增protobuf字段7，不改变剧情Snapshot。旧v2默认true、关闭可持久化；真实工厂/错误类型/protobuf及strict类型反例覆盖。

SDK check、43文件271单元通过；原8项偏好/按键/字符等待浏览器通过；新增真实双Player滚轮测试修正fixture revision与零高附加根page单位后通过。覆盖三单位、显完/推进、连续包/惯性、menu/load/focus、原生滚动/编辑/捏合、嵌套根和dispose。raw artifacts/wheel。

独立实例仍待实包更新和原历史页面/八语/真实IndexedDB复验，不提前标done。默认存储openStore(namespace,'galbox-sdk')是真实IndexedDB；原作存档codec和完整章节回放未接通。SDK G5-01/G5-02能力并不等于本作宏与章节已完成。

独立实例更新为真实73bb065ba1a4实包。原history背景/关闭图与各语边距/字号按源读取；8语UI PO、独立32 TS/3 Python、本地7项通过，直接读取IndexedDB的quick快照/PNG缩略图/偏好并刷新恢复。16份Program/release字节不变，菜单增量不改变存档身份。新增9资源已上传并HTTPS摘要验证，复用305个先前全量已验证的不可变对象，旧资源本地摘要再次逐个核对。全量314首次probe曾遇网络截断失败，未改称全量通过。

远程CI ada625b：check和Canvas通过，remaining仅旧stage的light:join→quiet轮询失败。沿用主线已验证3dfd713的固定50ms采样及五片动态覆盖检查，保留原5秒门槛和全部断言；本地3舞台+1滚轮通过，174项分片无遗漏/重复。待新的准确SHA CI回收结果。此补丁未合入主线其它代码/用户改动。

最终：SDK实包consumer实际播放/存读档/便携备份通过；实现与CI修正c1960da的run40650077493六个任务均success，174浏览器分片覆盖。独立实例本地7项、线上滚轮/移动4项，以及wheel-history-diagnostic的真实IDB/设置/刷新菜单读档1项通过；原15秒资源准备和5秒UI门槛保持。网络曾三次超时/传输截断，最终存档复验25.3秒完成，未宣称公网延迟稳定。预览52文件4057549字节与本地build一致；314个资源中9新增6292289字节已HTTPS核验，305复用旧摘要证据。实例SDK包73bb065ba1a4ac3ecabfcd64e586095ec6f107befbd5aa931a8fb7a5ee535e39。

实例menus:refresh单独更新菜单资源，保持16个剧情Program/Release protobuf原字节，避免界面更新使存档失效。章节回放菜单、全门角色/天气/高级模块、原档互通仍未完成；能力清单在实例docs/CAPABILITIES.md。
