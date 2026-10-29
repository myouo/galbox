# 第一门所需通用运行时（本地检查点）

2026-10-29。ADR0053–0062；作品与转换器仍在独立实例，不包含在SDK包中。

已实现持久预取页数0..8、有限逐轴运动及闭合页复制、确定性镜像粒子/裁剪帧、实时组交叉/规则/滚动转场、正文跟随场景与图文分层、采样震动、独立BGM缓冲及延迟源包络、标题禁存切点的隔离回放、有限演出跳过。静态预取跟随已加载call/return（512条/32层/16资产），正文续段按一页计数；extras标题/说明可与正文一起拆分。

`pnpm check`通过。全单元340项中339通过、1个新增测试fixture使用非法数字开头的release/revision失败；修正fixture后localization/skippable-wait/loading共16项全部通过（生产代码未为该失败放宽校验）。此前相同粒子/组转场等实现已通过337项。`pnpm test:consumer`完整实包播放/保存/恢复/备份通过。

Canvas/WebGL分层像素测试发现透明清屏保留非零RGB，导致存档缩略图偏色；前景清屏同时将颜色置黑/alpha置零后两后端像素测试通过。保存先同步复制WebGL前景，避免异步正文栅格化后读取已丢弃的drawing buffer。额外Canvas计入预算，底层静止场景按键缓存。

本轮14项最终关联浏览器通过（browser-final5.log），实际实包消费通过；先前29项关联浏览器与2项分层像素分别通过。原始日志、trace与图片仅本地ignored artifacts/door2。完整第一门转换、整章八语运行、迁移/回放/公网媒体与真机尚未验收，F-01E仍in_progress；不能把通用能力测试称作游戏整章完成。

后续ADR0063/0064：英文整门压缩差分style后218021节点/3610054字符/247资产，新增类型专用程序预算与resident发行资源范围。已通过pnpm check、全56文件343单元（含3500段原创大程序Wire/文本绑定/Release/保存恢复/超限拒绝）。发现并修正ResourceLoader驱逐后累计旧资源事实的问题，先Cache驱逐再检查实际驻留事实。最终loading/resident浏览器及consumer复验仍进行中。

d93e30c之后最终loading/resident共14浏览器和独立consumer复验全部通过。英文真实第一门使用该实包完整跑通2478段/2492正文切片、7次中途protobuf恢复，7862步；媒体由明确虚拟started/ended事件驱动，未作为实际音频验证。整章验收修正了实例KAG默认exchange=false复制语义与同时对齐后等待被取消的旧前页任务，不修改Core伪造完成。

ADR0065/0066新增alpha运动使一次wflash对应一个有限任务/一次跳过，离散文字淡入与用户字速门禁、可保存阴影。pnpm check、关联25单元、Canvas/WebGL不透明度保存像素及真实DOM文字/阴影共3浏览器通过；本轮实包消费仍需复验。整门八语/真实浏览器/旧93升级/源菜单与公网发布仍未完成。

ADR0065/0066最终全58文件346单元与实包consumer通过（fidelity-all-units.log / fidelity-consumer.log）；原3项浏览器及check通过。实例将消费该实包再重验全章，未把仅SDK验证标作F-01E完成。

完整SDK浏览器分片29/49/43/40/43共204项执行，第四组初始39通过/1失败：旧系统设置缺省prefetchPages，导入后错误保留重置产生的覆盖值。保持partial update语义，完整import在同一CAS队列中清除缺省预取覆盖；随后playback/prefetch五项全部通过，末组43项通过。无字段旧设置恢复作者lookahead，新增明确回归。最终check与consumer复验通过，记录preferences-browser2/preferences-consumer。CLI69命令、release/package及compatibility工具通过；真实原档认证仍为not-verified，不与内部存档迁移混淆。
