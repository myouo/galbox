# G0-01：完整通用 GalGame 能力与职责

用户明确要求一般 GalGame 常用能力由 SDK 承担。检查了当前协议 24 opcode、Player API、纯文本 TextController、默认 React UI、槽位/存储和能力表，确认流程图/缩略图/富文本/脚本 UI 等缺口不能由“实例可以自写”计作已实现。

COMMON_VN.md 与 ADR 0013 明确 Core/Host/runtime/systems/UI/storage/实例的职责；PRODUCT/ARCHITECTURE/MILESTONES/ACCEPTANCE 同步。tasks.json 增加 G0–G7、真实依赖和逐项验收；M6 追加 G7 依赖。原 M0–M5/H1 的 done 保留其有限支持集，N/F 的真实资料阻塞也保留，不把文档定义当运行时新功能。

实际检查：Git 工作区 b06f540 干净起步；读取适用规则与产品/架构/契约；任务 ID 唯一和依赖存在由脚本验证。当前先落实 G1-01 的持久设置/分轨音量/文字速度；其余 G 项状态 todo。文档任务通过不代表通用功能已齐备。
