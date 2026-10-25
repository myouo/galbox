# G3-01：二维舞台与并行效果

2026-10-26，分支feat/stage-effects-and-transforms，基线d489243。G3-01有限支持集完成，下一项G3-02。相同生产TS Core/coordinator/Web Host/Pixi/DOM/Player/IndexedDB，不另写解释器或UI动画权威。

## 实际能力

同源Schema/生成物与公开stageImage/stageTween/stageFilter/stageCamera/stageFade/stageTransition/stageShake/stageStyle工厂：局部pose（x/y/alpha、scale镜像、rotation/skew度、pivot像素/anchor归一化）、parent/z/visible/矩形clip/基本blend，blur/brightness/grayscale，相机、fade、crossfade、三角波shake。数值为有限i32/f64表达式，启动一次解析/校验/捕获，变量后来变化与load不重算。

任务保存from/to/fields/duration/easing/源签名，按scope/字段锁定。不同属性并行，冲突reject或superseded后从当前值继续；task.cancel冻结而cancelled，task.finish显式completed，组不把取消/替换当成功。旧动画共用锁；删父节点取消/删除后代。非法参数/层级/五图层等在替换/计数器/舞台提交前拒绝。

Snapshot.scene/object/Task.stageTask验证源、静态参数、phase、图层资产/权重、父图、写锁与活动属性对elapsed的数学一致性。旧无scene Program保持旧路径；新stage.effects Program缺scene或源变化明确拒绝并保旧槽。Host回调不能代替Core时钟完成stage任务。

Pixi用Container/Sprite/Graphics/原生滤镜重建；相机只作用图像world，overlay覆盖相机外画幅。crossfade在透明组按premultiplied RGBA权重相加，再合成，不把权重直接当source-over alpha。全表现字段缓存、新epoch强制绘制；只有自有节点/滤镜/纹理被释放，shader destroy(false)，保留共享program。

原创《灯塔来信·光影回信》位于fixtures/stage-novel/apps/playground/public/stage。脚本distance=140启动相对移动后改9999，已解析目标仍x410。/?demo=stage真实可玩两路线，复用原创素材，markers四个SVG仅用于真实像素断言。

## 最终实际执行

命令均export TMPDIR=/dev/shm，应对本机/tmp配额；未清理其它项目。

| 命令 | 结果/证据 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log；无新增依赖/锁文件变化 |
| pnpm generate；pnpm check | generate.log/check.log；生成一致、strict/headless/导入边界、真实stage工厂类型正反例 |
| pnpm fixture | fixture.log；所有原创章节/清单使用正式模块 |
| pnpm test | unit.log；19文件、137测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g3-01 pnpm test:browser | browser.log/browser-results.json；54通过，0 skip/flaky，含build和3新增场景 |
| pnpm test:consumer（同evidence环境） | consumer.log/consumer-result.json；仓库外tarball/strict/skipLibCheck=false/原生ESM，stage工厂/解析参数/并行恢复/真实Pixi保存与便携备份恢复 |
| pnpm test:cli | cli.log/result.json/commands.json；54真实命令及既有开发/迁移/适配/字体工作流 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic，N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；原Core/API/三个活动销毁目标通过 |
| GALBOX_API_BASELINE=d489243 pnpm test:release | release.log/release-audit.json；真实旧/新声明编译，34新增/6声明变化（按入口计），无导出删除，两包pack/publish dry-run |
| pnpm dev；node docs/evidence/g3-01/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-stage.png；实际134ms活动保存/刷新/继续结局再读旧槽，原目标x410/4已读/解锁/当前文字设置保留，1 canvas、真实音频、0 pageerror |

10个新增单元覆盖：相对表达式一次解析/recipe改变量后恢复；pose分通道与相机/filter/fade/shake并行、预算1/8/100与部分组恢复、忽略伪造Host完成；冲突/坏参数提交前原子拒绝；replace从当前值且旧组失败；cancel/finish/shake清偏移；复合crossfade取消/恢复；第五资产边界；父图原子/后代取消；旧动画锁和旧Snapshot路径；源/进度/写锁/scene损坏拒绝保槽。类型测试实际调用工厂/资源种类/数值表达式/duration/字段，不用any、双重断言、删断言或永久skip。

3个新增实际浏览器场景：原创两路线/活动演出保存/菜单暂停/刷新/不按9999重算相对目标；10种真实WebGL图像模式逐点RGBA断言（不透明与半透明crossfade、brightness/grayscale、父子mask、相机、旋转、overlay、add/multiply/screen）；真实IndexedDB坏进度拒绝且当前head/工作舞台/两个槽位保留。像素使用真实canvas截图PNG再解码取值，仅测试检验用2D解码，不是第二生产图像后端。截图stage-playable.png/dev-stage.png辅助说明，不能替代像素/语义断言。

## 实现与范围记录

before-stage-tests中的早期构建记录仅属实施过程；最初Host旧缓存的浅类型与dispose后多余invalidate、filterArea不接受null等编译错误已修复，最终顶层check/unit/browser为准。relative scale测试按from=1加delta=-2、p=.25应为.5，夹具在实际验证前校正，未改变生产公式迁就。原有必要回归全部保留。

透明crossfade不能逐层source-over应用权重，否则半透明会错误衰减；已用独立AlphaFilter图像组+add预乘RGBA合成并像素验证。滤镜clipToViewport及有界padding来自锁定Pixi8.22.0实际代码；中间纹理不声称为已测VRAM。相对目标、shake与curve均由Core活动时间，无设备时钟/随机或CSS自走任务。

SDK本地0.1.0 SHA=6f6e903263772c1c606cc138db40bbdadeb93824193b419b78a4424f738458c1；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e，consumer/CLI/audit/实际包交叉一致。未实际publish/push/部署/远程CI。Snapshot wire=1可选扩展，stage.effects限制新能力，旧二进制不承诺前向读新状态，源变化/缺scene须完整迁移，不宣称稳定API。

参考性能：228次语义API P95 3.4ms、两帧观察P95 46.3ms、最重Core批次P95 1.660ms，三个活动销毁55.6, 153.5, 117.1ms，原500ms局部门槛通过。仅Linux/Chromium 156.0.8078.4/SwiftShader/Web Audio，无视觉延迟/60FPS/物理GPU/VRAM/真机/其它浏览器或长作品认证；体积/预加载/保留任务规模等限制继续。

有限集：128对象、256保留任务、8层父图、4转场资产，有界参数与1..3600000ms任务。空容器、非矩形mask、任意shader、路径/骨骼及其它效果未导出，不能借扩展点计作实现。图像效果不含DOM/UI。

## 接续

下一项G3-02：常用编码/长媒体、循环/淡化/压低/语音回放。先定义媒体身份/等待/暂停/恢复/失败ADR，再实现Schema/资源事实/adapter/Host/Player/UI/存档/独立消费，不把音频startup ack当自然结束、不猜seek。其余媒体/视频/图文存档/流程图/鉴赏/剧本UI/G7仍未完成；N/F缺真实edition/Program/资源/原档和原作继续参照，blocked独立保留，M6未完成，原创/synthetic不冒充真实兼容。

当前dev http://127.0.0.1:4173/?demo=stage，重启export TMPDIR=/dev/shm、pnpm dev；browser前释放4173/4174。任务唯一状态tasks.json，接续STATUS.md，源码指纹source-manifest.json。
