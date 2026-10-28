# G2-05：字符单位等待

基线d282bd9，独立feat/text-character-waits分支；未改另一工作区G3-07文件。ADR0046：pauseUnits(1..300)，遇到控制采样当前有效字符间隔，瞬显为0，活动等待保存pauseIntervalMs和剩余毫秒；之后更改偏好不重算已开始的等待。旧固定pause/旧消息编号保持。另修正固定/字符等待后紧邻confirm时的恢复判定，等待结束前不要求确认旗标。

实现：Schema生成TS/validator/protobuf，真实richText工厂、生产Core文本推进/恢复校验、DOM忽略控制run。拒绝非法单位/缺采样/错误范围/孤立采样与改源，输入不被修改；预算1/8/100同结果，显完/瞬显/连续等待/页内确认分别验证。

实际pnpm check通过生成/strict/headless/导入/仓库边界；43文件270单元通过。独立动态端口浏览器使用真实Canvas/DOM/IndexedDB，验证跨刷新恢复、当前采样与新速度、确认与显完；原始日志browser.log通过。pnpm test:consumer使用实际tarball运行新公开工厂/protobuf恢复，以及既有播放/保存/恢复/备份，全部通过。raw仅artifacts/character-waits。

浏览器脚本第一次因未服务拆分JS块失败，补完整静态依赖；第二次误读容器aria-label，改读真实story-text节点后通过，没有删除语义断言。当前仅通用文本等待，不宣称原KAG VM、所有源宏或整作迁移完成。
