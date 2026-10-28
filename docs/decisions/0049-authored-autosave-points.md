# ADR0049：作者声明的自动存档提示点

2026-10-28。SavePolicy新增可选autoAt地址数组（protobuf字段4，最多256个唯一稳定地址），只过滤既有on-prompt自动存档。省略保持所有合法正文/选择提示点；空数组不匹配任何点。auto=off仍禁用。必须是已链接经典Program中的text.page/text.rich/text.template/choice地址；缺失/非提示点前置拒绝。模块程序尚不支持此过滤器，明确MODULE_UNSUPPORTED。

它属于Player保存策略，不改Core/快照/原子存储ABI。保存仍走既有合法切点、资源屏障、串行捕获、当前head、图片和回执流程；旧prompt被取代不补写，load不立即覆盖当前自动槽，偏好/策略不从旧档回写。没有为此在React写PC或另建存档机。

本作将源[autosave]绑定到真实问候选择提示，循环4槽。策略声明只承接明确源点，不擅自给每一页加自动保存；选择标签同时进入图像舞台，存档截图包含该切点的选项文字。
