# 设计与执行方式依据

核对日期：2026-10-24。任务包的架构/阶段/反例是针对 galbox-sdk 的工程决策；下面的官方资料仅用于核对 Codex 仓库指导和执行记录方式，不代表 OpenAI 对引擎设计作出保证。

## 设计基线

- [GalBox SDK v0.6 完整设计](GalBox-SDK-v0.6-Implementation-Design.md)，本包逐字收录。
- 基线文件 SHA-256：`b86ae7fa2754b693a3319bd33664ed5779094bcaf31a329e69c6b2031d9d7f19`。
- 用户当前目标：强类型、完整但范围收束的 Web VN 移植 SDK；WASM 可选；原版存档与作品细节需要有界适配；最终产品 galbox-sdk。
- 设计文件中的包/API/CLI 是拟定契约，历史编译抽样不等于本项目生产实现完成。

## Codex 官方资料

| 来源 | 本包采用的有限依据 |
| --- | --- |
| [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) | 仓库指导按作用域读取；主 AGENTS 保持精简，细节显式路由到 docs |
| [Codex Best practices](https://learn.chatgpt.com/guides/best-practices) | 任务明确目标、上下文、约束与完成标准；实现需要实际验证 |
| [Using PLANS.md for multi-hour problem solving](https://developers.openai.com/cookbook/articles/codex_exec_plans) | 参考可接续执行计划和更新进度的思路；该旧文章已标 archived，不采用其中旧模型/API或运行时长承诺 |

本包没有修改 Codex 全局设置、模型、审批策略或沙箱。它也没有启动后台自动任务。持续推进来自当前 Codex 会话的实际能力，换会话靠仓库状态文件接续。

## G2-01 字素实现

[unicode-segmenter 官方仓库](https://github.com/cometkim/unicode-segmenter) 的 grapheme 入口提供 Unicode17/UAX29 字素分割。实际安装并固定 0.17.3，版本/完整性由 SDK package.json 与 pnpm-lock.yaml 记录；查验本地 grapheme/core/data 模块为环境中立算法，仅 protocol/text.ts 获准导入。SDK 的字素跨 run、ZWJ/组合符、揭示/恢复与浏览器布局仍用本仓库实际测试验证，不把上游测试声明当作本 SDK 已通过的证据。

## G2-02 字体准备

[CSS Font Loading Module Level 3](https://drafts.csswg.org/css-font-loading/) 的 FontFace 二进制构造、load 与 FontFaceSet 登记/删除是字体宿主实现依据（草案，不将其当设备兼容认证）。SDK 实际检查原始 TrueType，并在当前Chromium测试加载、失败、取消和双实例释放；未测设备不借用规范存在作支持结论。原创Latin字体由fontTools4.60.1生成，正常消费不依赖Python。
