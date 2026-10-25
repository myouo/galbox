# G0-03：精确数值与有界集合

2026-10-25，分支feat/numeric-collection-values，基线f981ecc。G0-03有限支持集完成，下一项G3-01。相同生产TS Core/coordinator/Player/DOM/IndexedDB和公开Builder承接原创章节，没有第二语言Core、eval或作品特判。

## 实际实现

i64/f64/null/list/dict与同源Schema/类型/validator。i64使用有符号64位规范十进制/checked bigint；f64以大端16hex保存±0/∞，规范所有NaN为7ff8000000000000。显式比较/转换/非locale格式，不把JS非有限Number/BigInt直接JSON序列化。集合有序、值语义、有界，missing与null分开，get/at声明返回kind，更新复制且保序。

真实protocol构造与port-kit.expr工厂支持算术/转换、集合构造/查询/更新/长度/键及profile.expression；Builder推导values.extended，可信扩展可显式capability。纯AST完整链接、运行短路，节点/层级/字符串/值树/容量限制保持。数值范围失败带标准地址，不提交半个值。

所有原生入口在拥有的副本规范化Program/表达式/字面量/全局/帧/profile/原生actions/批次/recipe/备份闭包；插件opaque args/state保持codec语义。只读嵌套值可作为构造/赋值输入，kind关联不靠断言。候选恢复profile从浅复制改完整parseProfile，初始/运行进度批次递归冻结，重试payload幂等且外部改嵌套值不能影响权威状态。

旧槽位kind不暗转；显式内容迁移验证current/previous/profile闭包，集合真实经过参数/局部帧/返回/恢复；args/resume变化仍必须完整invocation迁移，不重初始化，不用state-only伪装。旧槽/原分支保留，候选失败不提交profile/音频或撤销旧Core。

原创《灯塔来信·补给簿》位于fixtures/data-novel与apps/playground/public/data。余额12.5→10.25、货号9007199254740993→9007199254740994、物资列表/账本/持久profile与两路线都由真实Core执行，/?demo=data。

## 最终实际执行

所有命令export TMPDIR=/dev/shm（本机/tmp配额），未清理其它项目。

| 命令 | 结果/证据 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log；无新依赖/锁文件变动 |
| pnpm generate；pnpm check | generate.log/check.log；生成一致/strict/headless/导入边界/真实工厂类型正反例 |
| pnpm fixture | fixture.log；所有原创章节/清单由正式模块生成 |
| pnpm test | unit.log；18文件、127测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g0-03 pnpm test:browser | browser.log/browser-results.json；51通过、0 skip/flaky，含build和3新增场景 |
| pnpm test:consumer（同evidence环境） | consumer.log/consumer-result.json；仓库外tarball、strict/skipLibCheck=false/原生ESM、新数值/集合/批次/备份与真实浏览器保存恢复 |
| pnpm test:cli | cli.log/result.json/commands.json；54命令、既有开发/迁移/适配/字体资产流程 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic，N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；既有Core/API/活动销毁目标通过 |
| GALBOX_API_BASELINE=f981ecc pnpm test:release | release.log/release-audit.json；真实旧/新声明编译，18新增/16声明变化（按入口计），无导出删除，两包pack/publish dry-run |
| pnpm dev；node docs/evidence/g0-03/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-data.png；真实UI旧档保留最新profile，刷新后精确货号/余额/有序集合与3已读/解锁保留，manual、1 canvas、实际音频、0 pageerror |

13新增单元：f64原生入口/±0/∞/NaN规范与所有权；checked i64精度/界限；IEEE算术/比较；显式转换/格式；有序异构集合/缺键-null/递归比较；容量/树/索引/失败原子性；opaque JSON不误规范与嵌套隔离；完整链接/短路/能力/错误地址；实际调用帧/返回/恢复；profile表达式与深冻结批次重试；扩展之前的嵌套profile/状态/效果回滚；current/previous/profile完整数值迁移且保留原档；numeric args/resume变化强制完整invocation迁移且不重初始化。旧i32及原生ESM/生成漂移等既有断言全部保留。

3新增真实浏览器场景：补给簿两路线/旧档与最新profile/刷新/精确大整数和f64集合；实际IndexedDB拒绝遗漏previous的半迁移、完整迁移再继续/保存/恢复且不改原分支；失败候选不提交profile/声音/activation，不撤销旧活跃Player，其后仍可读完并持久已读。data-playable.png为路线显示，开发服务dev-data.png为精确数据。

## 实施排错与限制

早期unit-first-failure.log/before-complete-validator为实现中失败/中断，不计通过。字典key最初minLength/maxLength触发Ajv原生ESM外的CommonJS helper，原generation测试真实捕获；改用仓库既有正则形状+语义UTF-16范围后原生ESM通过。递归多族AST的allErrors聚合在错误kind分支重复遍历，导致早期运行停滞并中断；strict=true/allErrors=false短路错误聚合后，原深AST/错误节点/完整链接测试及全部127测试通过，最终以顶层日志为准。不是放宽Schema/strict、删断言或skip。

泛型readonly容器曾使DeepReadonly条件类型歧义；改为先对具体Value联合取得readonly再Extract，保留NoInfer的kind关联。调用帧夹具的括号错误已改用真正expressionWire/listPush工厂。早期没有完整结论的记录不冒充最终证据。

SDK本地0.1.0 SHA=7f3cc79d1fb0e4fd998c7a02a39db9a568fbaa5621fda68838a83428c69a0a1c；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e，consumer/CLI/audit/实际包交叉相等。未真实publish/push/部署/远程CI。Snapshot wire version=1，新族受values.extended/Schema限制，旧二进制不承诺前向读新值，不宣称稳定API或新旧数值ABI自动兼容。

参考性能：228次语义API P95 4.9ms、两帧观察P95 46.2ms、最重Core批次P95 1.531ms，三次活动销毁157.4, 183.8, 161.5ms，原500ms局部门槛通过。仅Linux/Chromium 156.0.8078.4/SwiftShader/Web Audio；无视觉延迟/60 FPS、物理GPU/VRAM/真机/其它浏览器/音质/大作品保证。预加载/chunk/历史规模等限制保留。

有限语义：list256项/dict64项/key128 UTF-16/单值树8层1024节点；stored void/undefined、引用heap/循环、回绕和未列算子拒绝。f64 mod为ECMAScript截断商余数，NaN payload不保留；i64→f64仅显式舍入。大作品/原作特殊数值模型未由本集认证。

## 接续

下一项G3-01：有限二维变换/转场/滤镜/并行任务与冲突/恢复ADR，Schema/工厂/Core解析参数与任务状态/Pixi Host闭环；保存已解析参数，不按新变量重算旧演出。G3–G7其余舞台/媒体/图文存档/流程图/鉴赏/剧本UI/全面验收仍未完成。N/F缺edition/Program/资源/真实原档附件和原作继续参照，blocked独立保留；M6未完成，不以原创/synthetic冒充兼容。

当前dev已运行http://127.0.0.1:4173/?demo=data。重启export TMPDIR=/dev/shm、pnpm dev；browser前释放4173/4174。任务唯一状态tasks.json、当前接续STATUS.md，源码指纹source-manifest.json。
