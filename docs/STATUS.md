# galbox-sdk 当前状态

2026-10-26。G3-01已完成有限支持集，完整常用GalGame G0–G7仍在建设。分支feat/stage-effects-and-transforms，基线d489243，本轮本地提交见git log。tasks.json为完整状态唯一来源，无外部publish/push/部署/远程CI。下一项G3-02。

新增stage.effects：局部二维pose（缩放/镜像/旋转/斜切/pivot/anchor）、parent/z/visible/矩形clip/四种blend，blur/brightness/grayscale，相机、fade/crossfade/三角波shake。参数表达式一次解析，from/to/fields/duration/easing/源签名进Task；相对量不在恢复重算。属性通道独立，重叠reject/replace，cancel与finish区分，旧动画共用锁，删父节点取消后代，all-success不把取消/替换当完成。见ADR0019、STAGE.md。

Snapshot.scene/object/Task.stageTask恢复校验来源/静态参数/资产图层/父图/写锁/当前进度；新Program缺scene明确拒绝保旧档，旧Program保持旧路径。Pixi Container/Sprite/Graphics/原生滤镜重建，crossfade按premultiplied RGBA权重累加后合成，半透明图也正确；viewport裁切、全字段缓存与新epoch绘制，释放自有节点/滤镜而不清共享program。图像效果不含DOM正文/UI。

最终通过frozen install/check、137单元、54 Chromium（0 skip/flaky）、仓库外tarball strict/skipLibCheck=false/原生ESM与活动舞台/便携备份恢复、54 CLI、4 synthetic、三个活动性能、API/pack/publish dry-run。新增浏览器含实际像素：透明/不透明crossfade、滤镜、层级mask、相机、旋转、overlay和blend；真实IndexedDB坏进度不替换工作head或删槽。证据evidence/g3-01/REPORT.md、日志/JSON/截图/source-manifest.json。

SDK0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA=6f6e903263772c1c606cc138db40bbdadeb93824193b419b78a4424f738458c1；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e，consumer/CLI/audit一致。相对d489243按入口计34新增/6声明变化，无导出删除；Snapshot wire=1可选扩展，stage.effects限定能力，旧二进制不承诺前向读新状态，不宣称稳定API。

参考性能：228次语义API P95 3.4ms、两帧观察P95 46.3ms、最重Core批次P95 1.660ms；三次活动销毁55.6/153.5/117.1ms，原500ms局部门槛通过。仅Linux/Chromium/SwiftShader/Web Audio，无视觉延迟/60FPS、物理GPU/VRAM/真机/其它浏览器/大作品保证。滤镜中间纹理不冒充实测VRAM，体积/预加载/任务规模限制保留。

原创《灯塔来信·光影回信》/?demo=stage同一Builder/Core/Player/Pixi运行；脚本distance从140改9999，已启动目标仍x410。当前dev已启动http://127.0.0.1:4173/?demo=stage，实际134ms保存/刷新/继续结局/再读旧槽，任务原参数、4已读/解锁/当前文字设置保留、1 canvas/真实音频/0 pageerror，见dev-result.json。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

有限集128对象/256保留任务/8层父图/4转场资产；空容器、非矩形mask、任意shader/路径/骨骼及未列效果未启用。下一项G3-02常用编码/长媒体/循环/淡化/压低/语音回放，先定媒体身份/等待/暂停/恢复ADR，不把startup ack当自然结束或猜seek。其余媒体/视频/图文存档/流程图/鉴赏/剧本UI/G7未完成。N/F缺真实edition/Program/资源/原档与原作继续参照，blocked独立保留，M6未完成，不以原创/synthetic冒充兼容。
