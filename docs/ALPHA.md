# galbox-sdk 0.1.0 本地 alpha 候选

M0–M5 的有限 alpha 门槛已完成；完整常用 GalGame 功能的 G0–G7 门槛尚未完成（见 COMMON_VN.md）；本地候选版本为 galbox-sdk 0.1.0 与 @galbox/cli 0.1.0。它提供一个正式 TypeScript Core/Host、Pixi 图像舞台、DOM 正文、React UI、IndexedDB、发布/预算/备份/显式迁移及开发工具。没有第二解释器、Rust/WASM Core 或演示专用剧情。

这是带明确范围的本地 alpha，不是稳定 API 或最终两作支持版。包仍为 UNLICENSED，npm 名称/权限未认证，没有真实 publish、Git push 或部署。N/F 与 M6 的真实兼容门槛仍未完成；所需最小输入见 [INPUTS_REQUIRED](INPUTS_REQUIRED.md)。

本地包：

| 包 | SHA-256 |
| --- | --- |
| artifacts/galbox-sdk-0.1.0.tgz | 04eecad4c4bf73fda6fa8ebfdb75487984458dde675afad77ac6f51bd2fa6a56 |
| artifacts/galbox-cli-0.1.0.tgz | f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1 |

当前 H1-01 加固后的 SDK consumer、CLI 项目和 release audit 的包摘要一致，见 [H1 证据](evidence/h1-01/REPORT.md)；M5-04 为先前基线。独立项目可以按 [CLI](CLI.md) 用两个 tarball 初始化；不用 workspace alias 或私有源码。[DEVELOPER_WORKFLOW](DEVELOPER_WORKFLOW.md) 覆盖真实扩展、完整调用迁移、合成来源和诊断任务。

```bash
export TMPDIR=/dev/shm # 仅本次机器 /tmp 配额受限；普通环境可省略
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

打开 http://127.0.0.1:4173/。原创《灯塔来信》有海岸/灯塔两条路线，实际媒体、普通进度与保存恢复；菜单可备份并恢复独立进度。新作品使用同一个 Program/Builder/Player 路径。构建 `pnpm build`；资源 profile/预算与发布文件见 [RELEASES](RELEASES.md)，备份/旧版失败保留见 [BACKUPS](BACKUPS.md)。

本地验收：`pnpm check`、`pnpm test`（88）、`pnpm test:browser`（37）、`pnpm test:consumer`、`pnpm test:cli`（50 条命令）、`pnpm test:compatibility`（4 synthetic）、`pnpm test:performance`、`pnpm test:release`。browser 需要空闲 4173/4174；先停止 dev。release 检查需要完整 Git 历史，默认 API 基线 308c1ae，可通过 GALBOX_API_BASELINE 明确指定。性能基线不是通用设备门槛，命令保留全部原始样本。

相对 M5-01 基线，新增 release 入口、发布/预算 Wire 类型与工厂、Player 的 release/resourceBudget/signal 选项及诊断视图、AssetRequest.maxBytes 和注册表描述。没有删除显式导出；8 条按入口计的声明发生变化，详细前后声明与可达类型文件摘要在 [release-audit.json](evidence/m5-04/release-audit.json)。这不是自动证明“没有破坏变化”：手写 PlayerView 数据需要新增诊断字段，CLI 修改 source/port 后必须先 assets build，原先未约束的素材现在会被有限 profile/预算拒绝。当前 TextId/revision 保留 @ 作为分隔符，含 @ 的旧 wire 数据仍保留供备份/显式迁移；合法增量组合超出 profile 既有限额时整批拒绝，不写坏持久记录。

版本分别管理：SDK/CLI=0.1.0，wire Snapshot/Program/备份/发布清单格式=1，Core 语义=galbox-core@1，作品内容 release、文本 revision、扩展 invocation 与 mapping 版本另行绑定。不会因“类型能编译”或清单匹配而跳过旧状态的帧、文本、等待或完整调用迁移。

已验证平台/性能见 [PLATFORMS](PLATFORMS.md)。当前 Linux/Chromium/SwiftShader 的 Core 批次/语义 API 目标通过；H1 三个完整活动周期的销毁为 111.6/230/119 ms、两帧观察 P95 50.7 ms（旧 alpha 活动销毁曾为 1673.6 ms，初始基线曾达 1805.3 ms），存在明显长尾。没有视觉输入延迟或 60 FPS 保证，三次创建/释放样本不能推及大作品。PNG/SVG/PCM16 和 float32 小样本实际可用，其他设备/声道组合不能由此推断。

主要限制：预算内整包预加载，主 chunk >500 kB，纹理只有 RGBA 估算，未测真实 VRAM；回执长期留存/大作品压力未认证；没有长媒体流或精确 seek、视频/热点/timed-choice、GPU 自动重建、跨系列迁移、代码签名或同 realm 沙箱；Windows/macOS、Firefox/Safari、移动真机/物理 GPU/headed 窗口、人耳音质未验证。

M6 需要锁定《水仙》《海市蜃楼之馆》具体发行版/语言/补丁、可用 Program 与资源、真实原档及全局附件、原作加载后继续参照，再做一条真实导入/继续/再保存切片。fixture-save@1 和自制素材不替代这些资料，当前不作商业作品兼容结论。

H1-01 按舞台变化绘制、及时 flush、隔离实例/全局资源并清理取消后的迟到 renderer。公开 API/存档格式未变。局部性能回归可用 `GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance`，诊断用 `pnpm profile:disposal`；后者是带测试探针的当前版本实验，不替代未包装生产测量。

G1-01 新增 settings 公共入口和持久玩家偏好；最新 SDK 包见 g1-01 证据，CLI 包不变。主题/文本/节点/控件声明来自作品，通用设置/存档/流程图/UI 系统应由 SDK 提供。其余 G 项不因底座已验收而计作完成。

G0-02 新增现有值族纯表达式、已求值模板正文和完整确定性随机流；当前包及重验见 evidence/g0-02/REPORT.md。新的 RNG Program 不接受缺失随机状态的旧档，旧档保留，需显式迁移；浮点/集合仍为 G0-03 todo，不能因此声称通用功能已齐备。

G1-02 已完成当前支持集：协调器自动阅读/快进、真实语音结束、实例按键映射、显示辅助、偏好 v2/迁移和设置导入导出/默认恢复。当前包及最终重验见 [G1-02](evidence/g1-02/REPORT.md)：95 单元、41 浏览器、独立消费者、50 CLI、4 synthetic、性能与 API 审计通过。偏好 v1 可向 v2 规范化，旧二进制不能读新偏好，Snapshot 音频启动语义不变。下一项 G2-01；完整 G0–G7/N/F/M6 仍未完成。

G2-01 已完成结构化正文有限集：text.rich/公开工厂、固定字素/Ruby、安全样式和活动时间效果/停顿，以及完整 continuation 与恢复来源校验。新增原创 /?demo=text；当前证据 [G2-01](evidence/g2-01/REPORT.md)：105 单元、44 浏览器、仓库外消费者、50 CLI、4 synthetic、性能/API/打包 dry-run 和开发服务刷新恢复。当前 SDK SHA=f459960fd8a1c35f108b5800b73bcb4ca247d6f9bca9d82238d10cb7871e494a，旧二进制不承诺前向读取新 rich；旧 codepoint 档未改解释。NVL/多文本框/主题布局仍为下一项 G2-02，完整 G0–G7/N/F/M6 未完成。

G2-02有限支持集完成：ADV/NVL、多窗口与声明式主题、TrueType准备、隔离renderer端口和窗口/历史来源闭包。原创/?demo=layout；最新证据 [G2-02](evidence/g2-02/REPORT.md)：114单元、48浏览器、独立消费者、54 CLI、4 synthetic、性能/API/dry-run和真实dev保存/刷新/清页。当前SDK SHA=6591a423544a250dc47a99f4252b64984f8407dc47c988b3e2d9b7ccf461d636，CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e。旧无布局档不改语义，新Program缺布局状态需迁移；未启用字体/排版分支和其余G任务仍保留，下一项G0-03，完整两作支持未完成。

G0-03有限支持集完成：checked i64、位模式f64、null/有序有界集合、数据表达式与原生规范化/深所有权/完整迁移。原创/?demo=data，最新证据 [G0-03](evidence/g0-03/REPORT.md)：127单元、51浏览器、独立消费者、54 CLI、4 synthetic、性能/API/dry-run及dev实际旧档/刷新。SDK SHA=7f3cc79d1fb0e4fd998c7a02a39db9a568fbaa5621fda68838a83428c69a0a1c，CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e。旧值语义保留，新族不声称旧二进制可读；下一项G3-01，完整G3–G7和真实两作认证仍未完成。

G3-01有限舞台支持集完成：二维pose/层级/crop/blend、相机/三类滤镜/fade/crossfade/shake、属性通道与解析任务闭包，原创/?demo=stage。最新证据 [G3-01](evidence/g3-01/REPORT.md)：137单元、54浏览器（含真实RGBA像素）、独立消费者、54 CLI、4 synthetic、性能/API/dry-run及dev实际活动演出保存/刷新。SDK SHA=6f6e903263772c1c606cc138db40bbdadeb93824193b419b78a4424f738458c1；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e。仅图像舞台，不包含DOM/UI或全部效果/规模/平台认证；下一项G3-02媒体，完整通用能力与真实两作仍未完成。

G3-02有限支持集完成：WAV/MP3/单流Vorbis/Opus、Blob长媒体渐进解码、自然结束等待/循环点、Core淡化/duck/当前正文语音重播与恢复身份，原创/?demo=media。最新证据[G3-02](evidence/g3-02/REPORT.md)：149单元、60浏览器、strict仓库外消费者、58 CLI、4 synthetic、性能/API/dry-run与dev实际保存刷新。SDK SHA=2a0e1b926b161cdcd6db6ffaca1d1169a7e90b5e144a4a0ab7d0e4e3eb86094f；CLI SHA=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817。启动与自然结束分开，旧audio.play ABI保留；replay从零，不猜seek。下一项G3-03，真正网络流/分级完整性保留为G3-04并为G7依赖；完整通用及N/F/M6未完成，0.1.0仍仅本地alpha。

H2-01用户设备修复完成：默认WebGL2→Pixi Canvas后备、强制选项/诊断、基础画面/文字/音频/存档跨后端，见[图像兼容](GRAPHICS.md)与[证据](evidence/h2-01/REPORT.md)。149单元、67浏览器、strict独立消费者/双Canvas隔离、58 CLI、4 synthetic、性能/API/dry-run及真正--disable-webgl开发实测通过。SDK SHA=20f97afae5230ddc3ea1ac1b1e641687e2e3e00bdeb83e11bcb397103ee3fd6c；CLI SHA=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817。Canvas滤镜/隔离转场仍明确拒绝，下一H2-02，再继续G3-03；完整G7/N/F/M6未完成，0.1.0仍只为本地alpha。

H2-02有限Canvas滤镜/隔离合成通过：同Pixi场景图、组/相机滤镜、四层透明权重、native/CPU近似blur、64MiB默认中间预算与成功帧提交/失败立即清理。证据[H2-02](evidence/h2-02/REPORT.md)：152单元、72浏览器、独立Canvas舞台/备份消费者、58 CLI、4 synthetic、性能/API/dry-run与原生--disable-webgl活动保存刷新。SDK SHA=98affabc60c93354e1fbf21afdff215bb754c6ba5ca37b51881f539f911eedf8；CLI SHA=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817。0新增/3声明变化/0删除，Snapshot=1未改；估计工作区不是实际RAM。下一G3-03，完整通用/其它平台/真实N/F/M6仍未完成。

G3-03有限影片/互动集通过：opaque VP8 WebM/Opus或Vorbis、同Pixi影片平面、end/skip/replay-forbid、矩形热点/键盘、prepared激活/活动期限与恢复。证据[G3-03](evidence/g3-03/REPORT.md)：164单元、79浏览器、strict独立consumer、62 CLI、4 synthetic、性能/API/dry-run与原生--disable-webgl保存刷新。SDK SHA=ba41bd16ea1daea0e462ffcb3da937287b89891f5e73cbb0b1aa98e844b3ad67；CLI SHA=cbd2e69f36b4139d06fca5091122dd4e8760f73c089948d3675dc21b27fca9b7。13新增/16声明变化/0删除，Snapshot=1新cap扩展；未知编码/seek/网络流不计支持。下一G3-04，完整G4–G7/N/F/M6未完成。

G3-04有限版本化HTTP串流通过：显式较弱等级/正式manifest、中立租约/取消、条件HEAD、目录恢复绑定、通用CLI/Vite Range服务，详见[STREAMING](STREAMING.md)与[证据](evidence/g3-04/REPORT.md)。171单元、84浏览器、strict独立consumer、65 CLI、4 synthetic、性能/API/dry-run及原生--disable-webgl保存刷新通过。启动时实际去重发送audio 40960/1280646、video 40960/584795字节，未传全即播；不能把URL等级当整文件密码校验。SDK SHA=cd6c7f91070fc4738e5789ce8f9ef88b01c945ad3b1538963900dfd038673d97；CLI SHA=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。28新增/7声明变化/0删除，Snapshot=1新增cap目录token。下一G4-01，完整G4–G7/N/F/M6未完成。

G4-01有限图文存档集已通过177单元/92浏览器/strict独立消费/65 CLI/性能/API/原生无WebGL回归，见 [报告](evidence/g4-01/REPORT.md) 与 [保存系统](SAVES.md)。同切点DOM正文+舞台、原子图文/回执/上一修订、手动/快速/自动管理不扩大为全部G任务或真实作品兼容；下一G4-02。

G4-02有限历史语音与受控回溯通过186单元/98浏览器/strict独立消费/65 CLI/性能/API/原生无WebGL验证，见 [报告](evidence/g4-02/REPORT.md) 与 [HISTORY](HISTORY.md)。合法确认切点/有界持久journal/当前profile与原head、独立回放/默认确认UI不扩大为无限历史/流程图或真实两作兼容；API P95实际26.5ms（旧4.4ms）增幅由G7跟进。下一G5-01。

G5-01有限流程图/节点访问解锁/声明章节根通过192单元、104完整浏览器+最终UI两设备重验、strict独立消费、65 CLI、性能/API与原生无WebGL开发实测；见 [报告](evidence/g5-01/REPORT.md) 和 [FLOWCHART](FLOWCHART.md)。普通进度与声明入口绑定已闭合，G5-02鉴赏和G6/G7仍未完成。

G5-02有限鉴赏/成就与隔离场景回放通过199单元、112完整浏览器、strict独立消费、65 CLI、4 synthetic、性能/API与原生无WebGL开发实测，见 [报告](evidence/g5-02/REPORT.md) 和 [EXTRAS](EXTRAS.md)。SDK SHA=faed999eb8824e697a5ab51effeffbcbf3042b298b8ecaaf5fb1c186ee1c85d2，CLI SHA=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e；24新增/16声明变化/0删除，wire仍1/新cap，仍仅本地alpha。原创/?demo=extras支持Canvas，回放只写临时profile，刷新/旧档保当前收藏。G6/G7和真实N/F/M6仍未完成，父子实例总内存/大目录/其它设备另验。
