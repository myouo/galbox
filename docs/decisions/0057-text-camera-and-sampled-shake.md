# ADR0057：正文跟随舞台与有限采样震动

TextLayout可选followStage使其DOM正文跟随同一逻辑camera/quake矩阵，默认不变。使用未变换外容器内的变换层，确保图文捕获复制完整CSS矩阵且不重复应用包围盒偏移。设置/标题UI不属于正文层，不受此选项影响。

stage.shake可选samples（最多32个x/y样本，每个不超出已声明amplitude）；在periodMs网格取样，完成仍归零，无样本保持原三角衰减语义。配合源码有限时间/整数位移样本可表达离散抖动，原作Math.random无种子时只保留参数/分布，不声称原随机序列。新能力text.stage-transform/stage.sampled分别声明；旧签名、旧矩阵默认保持，恢复检查样本/相位和同切点截图。当前KAG全局震动50ms、正文会一起移动；角色motion_quake为另一宏，需按源码单独降低。
