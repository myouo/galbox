# 当前实施计划

W1-02完成，下一W1-03；分支feat/loading-strategies，基线fe86769。本轮数据/代码在同一本地提交，无外部发布。详细策略LOADING，原计划差距WEB_READINESS，实际报告evidence/w1-02。

完成门槛：check-complete、225单元、141逻辑/设备全量、最后UI的28专项、CG固定引用21专项、consumer-complete、CLI-complete65、compat4 synthetic、release-complete、performance-complete、profile-verified/comparison、native dev真实demand→balanced无WebGL/刷新/图文。当前143浏览器用例列表仅为列举，勿冒充最后全跑143。旧失败两轮及修复证据保留。

接续顺序：
1. 检查Git/用户改动、STATUS/tasks及v0.6模块/存储章节；当前dev在4173，测试前停掉实际Vite子进程。
2. W1-03先写有限支持集与ADR，明确模块manifest/链接/地址/快照/取消，及存储读写放大、留存/原子head/回执/迁移。
3. 先做可复现规模基线，再沿唯一生产Core/Coordinator/Host/Store实现，不引入另一解释器或放大上限伪装支持。
4. 真浏览器/故障/跨刷新/打包消费验收；之后W1-04字节缓存/离线/平台、G7综合，N/F资料门槛独立保留。

新策略只在创建时选择，媒体流不等于整轨预下载，资源等待暂不支持保存。驻留估算不覆盖浏览器全部内存，eager CG临时预览副本单列。TMPDIR=/dev/shm；更改源码后重验相关证据，保持包SHA与源码绑定，不推送发布。
