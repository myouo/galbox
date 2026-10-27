# G3-05：灰度规则转场与独立原作标题

2026-10-28，SDK基线4c5e234，分支feat/rule-image-transitions；有限支持集见ADR0039和STAGE。真实工程仍在SDK外，未引入第二解释器或作品特判，不逆向exe。

新增stageRuleTransition/stage.rule、稳定Protobuf分支与可保存RuleTransition/任务状态。支持单张静态from→to、同尺寸不透明灰度rule、vague1..256、舞台时间/easing；cancel冻结、活动finish到终点、并行pose及写锁、恢复源签名/进度校验。from/rule进入当前、预取和恢复资源闭包。冻结/分层画面须显式重建基底，不支持递归合成或replace。

WebGL/Canvas共用CPU内核，复用像素数组、256项查表和私有Canvas texture；整数相位不变不重算。每像素21字节+512字节查表的逻辑预算默认64MiB；预检scratch同时计Canvas及ImageData，Canvas另合计back buffer/滤镜。不是物理RAM/VRAM或60FPS认证。候选尺寸/灰度/alpha/读回/预算错误在持久接管前拒绝；dispose按实例释放。

原作禁存标题暴露Player.start错误限制，现允许SAVE_POLICY的initial候选安装；普通capture/save权限仍拒绝，显式用户存档语义未放宽。

## 实际验证

- pnpm check（check-accepted.log）：生成一致性、strict类型、纯Core/导入边界、仓库门禁通过。
- pnpm test（unit-accepted.log）：39文件252项通过；新增6项覆盖整数阈值/边界、opaque取整/RGBA、真实工厂与负例、预算1/8/100、并行任务、cancel/finish、protobuf和损坏快照拒绝。还将宿主预检scratch保守估算4→8字节/像素，受影响的浏览器预算/故障已重验。最后工厂增加JavaScript policy覆盖拒绝，重新check/252单元及实包consumer；包差异只有program-tools/stage.js，Core/Player/Host/Schema与浏览器验证版本逐文件相同，见factory-final-package-diff.log。
- browser-accepted.log：最终5项通过。两后端1:1真实像素、真实IndexedDB图文保存/刷新恢复、finish/dispose释放；尺寸/非灰度/透明规则与两种预算拒绝保留head/槽/像素；注入读回失败、透明冻结与静态不重算；禁存初始标题能运行且capture/save仍拒绝。
- WebGL像素测试初版在放大32倍后采样，受插值与页面遮挡影响；已隔离无关应用并改成1:1精确采样，保留原生整数期望，没有放宽断言。
- 最终相关舞台/Canvas/载入21项回归全部通过（browser-regression.log）；未重跑历史全量浏览器集。构建通过（build-regression.log）。
- pnpm test:consumer：最终实包独立安装、公共类型/14入口、真实播放/保存/恢复/便携备份等通过（consumer-accepted.log及同名目录）。SHA256=32a636e668027363fe8ff06f261e61ac2682222386606511f3b149faf79ab91c。
- node scripts/audit-package.mjs（先前pnpm test:package亦通过）：230文件/505337压缩字节；无游戏、测试、日志、证据、maps或JSON Schema，只有npm package.json元数据。无推送或发布。

所有raw日志/截图/trace只在ignored artifacts/rule-transition，报告不携带商业载荷。

## 独立作品消费

/home/myo/Desktop/galbox-fata-morgana以散列命名tarball精确安装上述包。冻结安装、严格类型/边界、3 Python+15 TS、8语言各22页trace/两次恢复及最终4浏览器通过。实际无WebGL Canvas运行：原作3秒标题淡入→原钢琴曲循环→右侧擦出规则图2.5秒→原图开始命中区→22页旁白；图文存档/刷新/语言隔离仍有效，画面无实验或SDK工具栏。

本地KAGLayer.tjs确认children默认true。标题中背景不变、仅静态菜单层改变，转换器按原30像素位移先形成800×600完整静态目标页，SDK再在原页坐标执行规则转场；不是把规则图绑到位移后的菜单局部原点，也不是预录动画。音轨使用element而非长PCM buffer，源BGM.tjs默认loop=true；浏览器需要首次真实手势解锁音频。

首次跨语言构建发现按输入摘要命名的PNG被后续编码重写，SDK ASSET_DIGEST正确拒绝。现剥离编码元数据、按实际编码后摘要命名，并在全部语言完成后重验每个发布资源闭包；Program release纳入完整Program和资产事实。重复转换的protobuf摘要检查见实例convert-rule-determinism.log。

标题源码配置/未知标签负例与真实音频/800×600工作区均实测，截图已目视。属于源参数/素材与浏览器验证，没有原作运行像素/时序对照认证。标题离场、OP44/音轨、按钮SE/其他菜单、正常对话宏/变量/CFG、中日.tft、完整i18n、原档和整作仍未完成；F-01A继续进行。

规则整数依据：[公开TransIntf](https://github.com/krkrz/krkrz/blob/master/visual/TransIntf.cpp)、[univtrans内核](https://github.com/krkrz/krkrz/blob/master/visual/gl/univtrans_sse2.cpp)。这不扩大为所有原生alpha类型、动态children聚合或通用KAG VM。

本轮独立Program/release发生变化，无隐式旧槽迁移；已有槽保留，未经迁移的旧发布明确拒绝，不通过删除槽位掩盖不兼容。
