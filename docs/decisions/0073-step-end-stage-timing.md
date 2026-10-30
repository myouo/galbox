# ADR0073：演出末端离散切换

部分有限演出需要在指定时长保持图层，再在终点隐藏；若用普通线性淡出会改变源表现。StageTiming新增step-end缓动：ratio<1时0，到终点为1。作为既有StageTaskState.easing的显式值进入Schema/protobuf与来源签名；恢复重新核验位置/滤镜/相机/透明度，不依赖Host回调。

默认linear与所有旧快照不变；旧SDK遇到新枚举明确拒绝。不是通用计时脚本或第二个演出解释器。普通加法MotionTrack的有限曲线集保持原样，不借本项加入无界采样或提高预算。
