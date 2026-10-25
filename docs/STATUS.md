# galbox-sdk 当前状态

2026-10-25。G2-01 已完成有限支持集，完整常用 GalGame G0–G7 仍在建设。分支 feat/structured-text-effects，基线 108566e，本轮本地提交见 git log。没有外部发布、push、部署或远程 CI；tasks.json 为完整状态唯一来源。下一项 G2-02。

G2-01：text.rich、公开 richText/richPage 工厂、文字/Ruby/换行/速度/毫秒停顿、安全颜色/粗斜体/下划线/缩放及 fade/wave/shake。新正文固定字素分割，旧 page/template 和旧档保留 codepoint。DOM 预建完整布局，隐藏未来字素并更新可见性/效果，不用 innerHTML。正文不参与 Pixi 合成；默认历史仍为纯正文摘要，但快照保留完整 runs。

Snapshot 保存已求值 runs、源 at/规范签名、分割身份、cursor、活动 elapsed、字符余量、显现时刻和剩余停顿。当前可见正文/历史恢复均验证来源与 continuation，缺标记/源变更拒绝而保留原档，不用后来变量重算旧页。当前玩家偏好独立，重新应用同一间隔保留余量。Core/Auto/快进共用 isTextComplete，段内停顿/淡入未完不提前推进，周期效果不阻挡 Auto。规则见 ADR0016、TEXT.md。

仅新增锁定 unicode-segmenter 0.17.3，经 protocol/text.ts 的明确中立导入边界；不用设备 Intl.Segmenter，不引入第二 Core。原创《灯塔来信·信纸上的光》在 /?demo=text，Builder/Program/清单与生产 Core/Player/DOM/IndexedDB 同一路径，没有 UI 硬编码剧情。

最终源码通过 frozen install/check、105 单元、44 Chromium（0 skip/flaky）、仓库外 tarball strict/skipLibCheck=false/原生 ESM 与新工厂/字素/停顿/效果恢复、50 CLI 命令/两个工作流、4 synthetic、三次活动性能、API/pack/publish dry-run。证据 evidence/g2-01/REPORT.md、日志/JSON/截图/source-manifest.json。消费者首轮夹具少算3 ms 的失败日志保留，修正为575 ms未完/578 ms刚好完成的边界断言后重验通过。

SDK 0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA=f459960fd8a1c35f108b5800b73bcb4ca247d6f9bca9d82238d10cb7871e494a；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1，consumer/CLI/audit 一致。相对108566e按入口计12新增/4声明变化，无导出删除；Snapshot wire version=1 的可选 rich 扩展，旧二进制不能前向读新能力，不承诺稳定 API。

当前参考：228 次语义 API P95 3.2 ms、两帧观察 P95 37.8 ms、最重 Core 批次 P95 1.339 ms，三个完整活动销毁85.8/72.3/77.5 ms，原500 ms局部门槛通过。仅 Linux/Chromium/SwiftShader/Web Audio；无视觉延迟/60 FPS、真机/物理 GPU/真实 VRAM/人耳音质或大作品保证。整包预加载/chunk体积/回执规模等限制保留。

运行 export TMPDIR=/dev/shm（本机/tmp配额限制），pnpm install --frozen-lockfile，pnpm dev。基础 http://127.0.0.1:4173/；表达式 /?demo=expressions；结构化正文 /?demo=text。当前 dev 已启动，实际 UI 保存剩余606 ms的段内停顿，刷新恢复/Auto继续到结局，3条已读/解锁/当前字号保留、manual、1 canvas、真实音频、0 pageerror，见 dev-result.json/截图。browser 前停 dev 释放4173/4174。

下一项 G2-02：ADV/NVL、多文本框、声明式主题布局/必要字体及 renderer 端口，先定 ADR，再按 Schema/工厂/Core/DOM/Player/UI/独立消费实现。G0-03 浮点/集合、G3 演出/媒体、G4 图文存档/回溯、G5 流程图/鉴赏、G6 剧本 UI/完整界面、G7 全面验收仍未完成。N/F 缺指定 edition、Program/资源、真实原档附件及原作加载继续参照，blocked 独立保留；M6 未完成，不以原创或 synthetic 冒充真实兼容。
