# E1-04：SDK输入边界复核与后续优先级

2026-10-28，代码基线4cfa54f；检查期间前轮文档收尾提交83f1576进入main，已保留其E1-03完成事实。用户要求继续检查SDK、列出待做项与优化方向。初始工作树干净，Node v24.15.0、pnpm 11.28.5。原始输出仅在ignored `artifacts/sdk-audit/`。

## 已复现并修复

- **C01 / JSON输入隔离**：隐藏的自有`toJSON`可在遍历校验后被`JSON.stringify(input)`调用，替换已检查的数据；数组继承的钩子也会执行。现在从属性描述符复制数据，自有函数/访问器钩子明确拒绝，继承钩子不调用。保留普通`toJSON`字符串键、`__proto__`数据键、字段顺序、负零规范化与可变别名隔离。
- **C01 / 数组完整性**：稀疏数组添加额外属性后，`Object.keys.length === array.length`仍成立，原实现静默变为`[null]`。现在逐项核对自有连续索引，返回`INPUT_JSON`。
- **C01 / protobuf单值字段**：字符串、布尔、整数/浮点标量和map条目内部key/value重复时，原解码器取后一个值。扫描阶段统一拒绝，返回`PROTO_DUPLICATE`；合法repeated数组/map、未知字段跳过及既有envelope错误码保持。
- **验证并发**：默认高并发运行42个测试文件时，生成器漂移测试耗时14秒，超过原10秒门槛；限制4个并发worker后267项全通过。配置保留原超时/全部断言，仅限制进程争用；总耗时不宣称更快。
- **浏览器验收同步**：旧适配器测试隐含失焦暂停，与G1-03默认后台继续策略冲突；显式设置`backgroundPlayback:'pause'`，保留原断言。影片测试在截图/像素读取的约4秒期间自然播放结束，无法再执行skip；改用真实UI暂停/继续固定截图切点，并增加仍为playing的断言，保留真实像素、skipped/cancelled、键盘热点与自然超时/结尾检查。
- **异步UI测试等待**：输入法用例原来假设20ms后协调器已提交compositionend，首次全量失败、原用例单独复验又通过。改为有界等待实际Core字段值，仍断言组合中不保存未提交输入、提交后的值正确、旧DOM/epoch无效；修正后连续3次通过，无超时放宽。

仅收紧原有输入校验，不增加能力、Schema字段或公开类型，不改变合法消息/存档ABI；有限支持集与外部编码器兼容边界见ADR0044。首版修复导致既有envelope错误码回归，已修正而未删断言；新测试的稀疏数组静态声明也已改正，未放宽strict。

## 验证

- 初始`pnpm check`通过。
- 修复前`pnpm exec vitest run tests/unit/wire-input.test.ts tests/unit/protobuf.test.ts`：7失败、6通过，确认新增负例会检出原缺陷；之后另加浮点重复字段用例。
- `GALBOX_EVIDENCE_DIR=artifacts/sdk-audit/browser pnpm test:browser`包含生产build/harness构建：首次172项169通过、3失败，失败均为上述旧测试配置/时序问题。原始JSON与trace保留在browser/和browser-traces/。
- 同一生产构建执行`pnpm exec playwright test tests/browser/adapters.spec.ts tests/browser/interactive.spec.ts tests/browser/background-playback.spec.ts tests/browser/ui.spec.ts --output artifacts/sdk-audit/retest-output`：24项全部通过，无重试/skip。随后UI等待修正，用`tests/browser/ui.spec.ts --grep 'UI input identities' --repeat-each=3`连续3项通过。全量之后未修改生产代码；不是把首次失败写成一次172/172通过。
- 最终`pnpm check`通过生成一致性、CLI构建、strict/纯Core类型、导入及仓库边界；默认`pnpm test`：42文件267项全部通过（固定4并发，15.83秒）。见check-complete.log/unit-complete.log。
- `GALBOX_EVIDENCE_DIR=artifacts/sdk-audit/consumer pnpm test:consumer`：实际tarball安装到仓库外临时目录，skipLibCheck=false声明检查、Node公开入口、新增输入负例、真实浏览器播放/存档/恢复/备份均通过，清理exit 0。
- `GALBOX_EVIDENCE_DIR=artifacts/sdk-audit/package node scripts/audit-package.mjs`：实际SDK包234文件、518202压缩字节；无游戏、测试、日志、证据、source map及Schema源。CLI模板边界也通过。包SHA256=`85bd9d599bc969485e89230cd95dd3fc50dc7339d65ca4456a29ad53393cfc0f`。
- 复用同一生产代码的已建app/harness，执行`GALBOX_EVIDENCE_DIR=artifacts/sdk-audit/performance GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 node tests/tooling/performance.mjs`：3活动周期、228次输入，Core各预算P95<4ms、API P95=34.1ms<50ms、dispose最大256.3ms<500ms，释放后拥有资源归零。仅证明本场景通过门槛，没有本轮同场景基线对照，不宣称整体提速。
- 完整可达历史扫描：83f1576下3053个blob/145198167字节，原包/KS/TJS/私有解包与凭据路径检查无命中，常见密钥签名无命中；补充前轮E1-03已完成的实际凭据审计。SDK历史保留。本轮仅追加代码、测试、配置和短Markdown报告。

旧报告绑定各自历史基线；当前改动以本报告实际复验为准。未重跑的长历史、加载策略、存储规模profiling及未取得的真实设备证据，不转写为本轮性能/平台通过声明。

## 待做与优化顺序

| 优先级 / 任务 | 实际缺口与下一步 | 完成门槛 |
| --- | --- | --- |
| P1 / G3-07 | 当前`audio.fade`修改通道增益，媒体恢复拒绝同通道重叠；补绑定具体音源的淡出停止及声明的多个SE缓冲，先有限Schema/ADR。 | 替换音源后旧淡出不误停新音源；多SE独立恢复；迟到回调、失败原子性和实包浏览器验证。 |
| P1 / W1-03C | IndexedDB已拆冷槽位/历史，但hot根仍整体写入；命名空间仍有4,000,000个逻辑JSON字符上限。 | 逐记录热数据、明确留存/容量策略；长历史/多槽位测量写入量和延迟；回执幂等、旧head失权及备份闭包保持。 |
| P1 / I1-01 | locale偏好和文本目录已具备；DefaultUI设置/存档/错误提示仍有硬编码中文，运行中正文/语音切换和章节目录未完成。 | 全系统界面使用目录，持久偏好/回退/存读档一致；正文切换策略和TextId/Revision明确，不猜跨语言已读继承。 |
| P2 / H3-03 | 新发现的待测候选：`Player.publish`每次通知都`parseReleaseManifest`并复制资源完整性列表，目录越大重复工作越多。 | 先按目录规模测量，再按不可变release/资源版本缓存只读投影；保留输入校验、所有权隔离及加载/驱逐失效。尚未证明它是当前主要耗时。 |
| P2 / W1-03B2 | 模块编译器明确拒绝高级UI/鉴赏/流程图/布局/RNG，模块运行只支持基础ADV及有限媒体。 | 为高级指令与元数据声明版本签名、按实际依赖加载和完整恢复闭包；不能把单体支持当成模块支持。 |
| P2 / W1-04 | 当前是在线发布与内存驻留缓存；没有SDK管理的可恢复离线安装。浏览器配置仅Chromium。 | 版本化持久字节缓存、断点安装/驱逐恢复、冷启动JS拆包实测；Firefox/WebKit及移动真机证据分别记录。 |
| P2 / G7-01 | 已有多个原创专题fixture，但完整通用功能/容量/跨平台综合认证未完成。 | 在同一原创验收作品和实际tarball消费中贯通高级媒体、UI、国际化与恢复，并复核性能门槛。 |

优先补上述功能和容量证据；目前没有依据重新选择Core语言或引入第二解释器。CI多个入口重复构建SDK、核心/Player的大型密集函数可作为后续维护优化，但须保持干净检出生成校验和生产语义测试，不能仅减少检查换取速度。

N/F/M6真实作品与原档认证仍是独立缺口：实例目前仅44静态前导+22页，不能据SDK测试宣称整作兼容。开始检查时只读核对：SDK远端main与前轮文档提交83f1576一致，实例main=ccdaf3758ac27bd3faab1f1a452f81a1090c95bc、单一根且无LICENSE，E1-03已完成。

运行：`pnpm dev`启动原创验证应用；`pnpm check`、`pnpm test`、`pnpm test:browser`、`pnpm test:consumer`复跑相应门槛。E1-04验收完成，下一G3-07先记录音源绑定/多SE有限支持集和ADR；大作品优化优先W1-03C，H3-03先量测再决定视图缓存。
