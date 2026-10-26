# ADR0028：鉴赏目录、持久解锁与隔离回放

状态：已接受并验收，G5-02有限支持集；证据见../evidence/g5-02/REPORT.md。

1. Program.extras是版本化、至多128条的判别联合目录：CG（1–16张image差分）、music（audio/gain/loop）、scene（声明零参数void函数入口）、achievement（可选image图标）。真实工厂关联资源kind/场景ref，link验证目录/入口/能力；Profile.extras和Snapshot.extrasSignature绑定定义与资源/场景源。定义变化必须显式完整迁移。
2. extras.unlock显式永久解锁；extras.check检查纯profile/read条件。新运行初始化、profile写入和确认正文时也自动检查，满足条件后锁存到跨存档Profile.extras。检查使用候选profile，失败不改变profile、等待或已提交效果；原子ProgressBatch/回执保证单调且旧档不擦新解锁。独立导入/备份profile分支仍隔离。预览目录可从当前持久条件显示资格，打开时在最终屏障重验。
3. 一个主Player同时至多一个鉴赏会话。打开前暂停自己的extras原因，freeze主Coordinator并flush；只允许ready或合法可保存切点。鉴赏期间主线输入/保存/加载/重入等拒绝，关闭显式释放；不能用别的操作误thaw会话。窗口隐藏/失焦/用户暂停仍作用于预览，menu/extras自身暂停允许音乐/场景运行。
4. CG由Host重新acquire/私有化/摘要核验并创建独立DOM图像/Blob租约，可切差分；不移动主线纹理对象。音乐复用已验证资源与独立音频预览控制器，使用当前master/BGM偏好与声明gain，可循环；真实blocked/buffering/失败/取消/迟到都隔离。临时URI/媒体设备不入档。
5. 场景使用相同生产Player/Core/Host和声明场景入口，独立生产内存Store，以当前durable profile副本为初值；所有访问/解锁/已读/剧情写入都只落该临时Store。每个Host仍只有一个Pixi舞台；预览是独立实例，资源/设备预算按实例，两个同时存活实例的总内存另验。主线不重建、不改PC/RNG/等待/head。回放实例禁止嵌套鉴赏/保存导入/重入等外部系统操作，默认ReplayUI只控制该场景的正文/选择/互动/媒体。
6. 关闭、失败、取消、dispose清自己的图片/音频/子Player。资源准备不阻塞关闭；迟到准备结果必须销毁。主线冻住期间若持久head被其他实例接管，关闭后不thaw旧Core，停止旧设备并要求重新开始/读档。条件表达式、外部资源/原生回调不作为任意代码沙箱。

验收：Schema/真实工厂正反类型、解锁单调/自动条件检查原子失败/预算一致、老档/刷新/备份迁移；CG真实解码/差分、buffer与element/版本流音乐、场景实际交互和写入隔离；取消迟到/双实例/失权/设备失败；默认UI、WebGL/Canvas、strict独立tarball。无限目录/任意seek/所有设备/真实两作认证仍不在本任务完成范围。

场景目录的entry函数须以绑定自身ID的extras.scene标记开头；正常主线可以调用同一函数并解锁它，鉴赏以专用replayScene根在临时实例运行。它不依赖或暴露主线流程图导航；root return只在明确声明根结束，嵌套调用不变。
