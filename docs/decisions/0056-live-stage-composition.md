# ADR0056：活动图层组转场

stage.mix混合两组互斥根对象（各最多32个，包含其完整子树），支持crossfade、整数规则图与scroll-top。普通根图层的姿态/可见性由作者保留；target在开始前已设置为本页所需可见值，完成后隐藏source并保留target。组内可继续motion/particles，Core保存完整相位，Host按同一Scene绘制。限定根层次且外部可见根不可插入混合组z区间；重叠mix、删除活动根、非法root/规则明确拒绝。finish完成转场；cancel本阶段显式unsupported，不伪造冻结合成页。

两组先各自隔离，再按预乘alpha加权相加，再正常叠到外部舞台；禁止将两个半透明Container直接source-over。WebGL固定Filter程序，规则使用像素中心/整数phase；Canvas使用有界alpha matte与destination-in，复用场景合成池，多计两层与规则缓存/工作区，不做逐帧GPU读回。现有规则/Canvas预算仍同时约束，总体超限在激活前拒绝。规则坐标跟随camera/quake转换；不同像素量化后的边缘差异需实测说明。

同时补stage.asset（替换图片但保持姿态/样式/运行motion，拒绝活动asset转场冲突）和stage.style.filters的静态滤镜设置（拒绝同目标活动滤镜冲突），供编译器紧凑表达常见立绘换表情/说话明暗，不重复输出整对象。GraphicsOptions可选background控制清屏颜色，默认保持旧值，实例使用原黑底。

新增stage.composition能力必须声明；旧数据/源码签名默认保持。需两后端实际像素、动图层/粒子、规则与scroll、中途IndexedDB/截图、根/重入/预算失败和打包消费。完整第一门仍需独立验收。
