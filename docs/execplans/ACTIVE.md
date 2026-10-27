# 当前实施计划

用户优先性能。H3-01有限优化验收完成，perf/runtime-history、基线ce29850。217单元/124全浏览器/strict consumer/65 CLI/4 synthetic/API/原生无WebGL dev与同工作负载前后对照通过；证据evidence/h3-01，设计ADR0031，公开说明PERFORMANCE。

10000历史tick 92.06→0.084ms；1000历史/IDB/回溯API111.2→47.9ms、flush232.1→62ms；Node trace和12张PNG相同。标准API22.3→17.3/15.9ms。销毁更高的样本全部保留（56–115ms），不把500ms通过当未回归。

下一H3-02尚未实施：固定剧情与实际提交帧数，分别测GPU drain/gl.finish、native loseContext、SDK资源清理，在WebGL/Canvas下比较；先定位差异因果，再决定生产修复，禁止仅延后清理来美化dispose计时。之后G7继续综合、容量与其它性能验证；N/F/M6真实资料仍缺。

当前dev4173，/?demo=interface；TMPDIR=/dev/shm。完整browser前停dev。源码/API未变后不用重复已有门槛；后续改动需对应重验。只做授权本地提交，无外部发布。
