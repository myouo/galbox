# 0019：二维舞台、任务通道与恢复

G3-01有限集：局部x/y/alpha、scaleX/Y（含镜像）、rotation/skew（度）、pivot像素/anchor归一化、层级parent/z、visible、矩形clip与normal/add/multiply/screen；对象/图像舞台blur/brightness/grayscale，中心相机x/y/zoom/rotation，颜色遮罩fade、有界最多4图层crossfade、对象/相机三角波shake。单Pixi/WebGL图像舞台，效果不含DOM正文/UI。不预导出任意shader、路径/骨骼、非矩形mask、其它转场/滤镜，后续支持须独立扩展与验收。

新stage.image/pose/filter/camera/fade/transition/shake/style接收受限i32/f64表达式，由Core在启动时一次求值/校验，再捕获完整from/to、fields、duration/easing与源签名。相对pose只加到启动时当前属性；恢复/变量改变不重算。全部数值有限且有界，非法候选不替换旧任务、不推进counter或改舞台。旧stage.put/animate保留语义，和新任务共用冲突/引用检查。

每个任务锁独立scope/属性通道：pose按实际fields，filter按fields，相机按fields，crossfade资产通道，fade遮罩通道，shake独立偏移。不同通道可并行；相交时reject或将冲突旧任务标superseded，再从当前已解析状态启动。task.cancel冻结当前值并标cancelled（shake清偏移），task.finish明确到终点并标completed；不能把取消当成功。删除父对象连同后代取消，parent必须存在且无环。all-success组引用旧逻辑身份，取消/替换不冒充完成，恢复保留已完成结果。

crossfade保存逻辑图层权重，不截GPU图；replace从当前复合权重继续，最多4独特资产，超界先拒绝。取消保留混合画面，完成收敛到目标单图。scene保存相机/滤镜/遮罩，object保存扩展变换/滤镜/裁切/图层/偏移；旧Program无scene不猜新语义，新stage.effects Program缺scene明确拒绝并保留旧档。

Core活动tick用解析参数与linear/ease-in/ease-out/ease-in-out多项式计算，无设备时钟或随机。shake用有界三角波而非跨实现超越函数，结束归零。快照验证源签名/资产、层级、写锁唯一、任务phase/from/to/fields以及活动任务对当前属性的数学一致性；预算yield不制造保存点。设备回调不能代替Core时钟完成stage任务。

Host将逻辑层级实现为Container+Sprite、Graphics裁切/遮罩与原生Blur/ColorMatrix滤镜；相机仅作用于图像world，fade在相机之外覆盖逻辑画幅。缓存包含全部表现字段，每个新epoch绘制；不重复自跑Pixi ticker。只释放实例节点/滤镜/纹理，不清共享Pixi程序池。用真实WebGL像素/快照/暂停/刷新与独立tarball消费验证，原创《灯塔来信》不另写解释器。

层级最多8层，避免无界矩阵累积；滤镜保持Pixi clipToViewport，纹理中间结果不宣称实测VRAM。交叉转场用独立图像组在透明缓冲上按premultiplied RGBA权重累加，再合成至世界，不能把权重直接当source-over alpha（透明图会错误变暗）。真实WebGL像素测试覆盖半透明来源。shader程序销毁显式false，保持其它实例的共享程序可用。
