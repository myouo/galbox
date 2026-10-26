# G3-04：版本化媒体串流与分级完整性

2026-10-26，分支feat/versioned-media-streams，基线74d5ff10cee96485ce9bb935b8ee20c82279e7bc。G3-04有限HTTP媒体支持集完成，完整通用G4–G7及N/F/M6尚未完成。唯一TS Core/Host、单Pixi舞台/Canvas、DOM/React/IndexedDB保持原路线；没有WASM、MSE/SW或第二解释器。

## 实现与信任边界

ADR0024与单源Schema/生成类型/validator落地：Asset.transport显式声明版本化URL，仅element音频和已有影片格式；Program声明media.stream。调用者必须提供正式release与资源事实，并显式设置Player.streaming.integrity=versioned-url，默认拒绝较弱等级。不把已有完整bytes路径降级，也不默默完整下载替代串流。

平台中立Cancellation、MediaStreamRequest/Lease/Provider不含DOM/Node/AbortSignal。真实streamRequest工厂锚定identity kind与fact，复制/校验/冻结输入，不使用readonly冒充所有权；Buffer/WAV事实和MIME编码关系也检查。默认HTTP provider绑定game/release/catalogSHA/asset/kind/MIME/预期SHA/version，只解析同源版本化URI，独立nonce隔离Host租约。自定义跨源必须满足匿名CORS。

Host不信provider的verified标记：独立条件HEAD核对If-Match/强ETag、Content-Length/MIME、identity编码、Range bytes、immutable承诺与无redirect，URI限定HTTP(S)/版本参数/无内嵌凭据与fragment。metadata/实际解码仍另验。初始化、接管前、新播放attempt重验；暂停恢复不隐式重试blocked旧请求，旧seq验证结果不能启动新状态。

分级严格区分expected、digest-verified、versioned-url。背景/缓冲资源仍独占复制并计算完整SHA。版本化等级仅是地址/HTTP元数据核对：强ETag、目录预期SHA、甚至原生播放器下载完都不自动升级成客户端完整摘要验证。Native GET/range响应不能由JS逐字节检查，方案依赖源站保证同版本URL/Range不可变、失配拒绝；不能防恶意源站在同版本下伪造等长同形数据。这个较弱保证对调用方显式可见，不冒充分块密码认证。

Core为media.stream保存有界streamCatalog逻辑目录token（整个目录/路径/摘要/版本），恢复不匹配明确拒绝并保留旧槽；不存临时租约URI或设备验证等级。Host另计算正式catalog SHA绑定provider身份，两个层次不混用。旧非stream Program/Snapshot不增加字段，既有replay/stop/forbid与输入计时保持。

每个Host持有自己的准备缓存租约，来源/epoch/attempt/取消和DOM element独立；dispose/准备失败/取消与迟到结果恰好调用一次归还。共享provider不因一个消费者取消而关闭其他来源。归还回调抛错时，SDK仍归还其它租约并清自己的图形/音频/输入/缓存，报告STREAM_LEASE；外部资源是否实际释放仍由provider负责，不能伪称SDK能强制修好失败的外部释放。

buffering显示为缓冲，不制造end；网络/解码错误或异常短结束失败，不猜完成。没有透明重连、精确seek、离线串流缓存或任意协议。现有编码/目录/尺寸/媒体时长预算仍约束有限规模，不把目录长度当常驻RAM。

## 发布和原创路径

CLI公开@galbox/cli/stream-http的serveVersionedMedia/versionedMediaPlugin；CLI dev与playground dev/preview已接入。服务用实际内容SHA作为版本，支持GET/HEAD/If-Match/强ETag/immutable、单Range/后缀Range/If-Range，失配412、错误Range416、外部symlink拒绝。发布端本地读完整文件算SHA是正常生产步骤，不等于客户端必须先完整下载。静态部署需配置同样HTTP契约，不会自动发布服务器。

原创《灯塔来信·海上传声》沿正式Builder/Player/Host，80秒正弦音MP3与16秒合成测试图案/音调VP8 WebM，分别1280646与584795字节。非真人/原作资料。正常fixture使用提交编码，可选build-media.mjs重建才需要ffmpeg。

## 最终实际执行

所有命令export TMPDIR=/dev/shm，无新增依赖/锁文件变化。命令在基线HEAD修改工作树执行；日志revision是当时HEAD，最终源由source-manifest.json与本地提交关联，不表示基线本身已有改动。

| 命令 | 最终结果/证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install/generate/fixture.log；实际生成和所有原创摘要/manifest重建通过 |
| pnpm check | check.log；生成一致、strict/headless/边界、真实kind关联工厂正反类型通过 |
| pnpm test | unit.log；24文件、171测试通过 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g3-04 pnpm test:browser | browser.log/browser-results.json；build+harness+84通过，0 skip/flaky/unexpected |
| 同evidence环境pnpm test:consumer | consumer.log/consumer-result.json；仓库外tarball、strict/skipLibCheck=false/原生ESM、版本化音视频/重验身份/保存/备份/等级/当前profile/清理通过；服务端用编译的公开CLI HTTP helper，浏览器只消费隔离安装SDK |
| pnpm test:cli | cli.log/result.json/commands.json；65真实命令，新增transport/显式策略+manifest/发布事实/实际CLI dev条件HEAD/Range与浏览器原生影片级别通过，旧工作流保留 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic通过，N/F needs-input保留 |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；既定Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=74d5ff1 pnpm test:release | release.log/release-audit.json；strict声明、28新增/7声明变化（按入口计）、0删除、两包pack/publish dry-run通过，0外部发布 |
| pnpm dev；node docs/evidence/g3-04/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-streaming.png；Chromium --disable-webgl/原生API，版本化音视频/保存刷新/结局/旧槽保当前进度通过 |

新增7单元：真实streamRequest复制/冻结、诚实等级与不匹配证据拒绝、真实Core目录token与版本/path/SHA拒绝、非法buffer/非媒体与旧Program无字段、影片同Core路径不存临时URI；真实Node HTTP条件/区间/后缀/多Range/失配/文件变化/symlink边界；Web adapter独立HEAD拒绝弱ETag/错长度/错MIME/无Range/可变缓存/重编码和无版本URI。没有固定成功对象、类型逃逸、删旧断言或skip。

新增5浏览器：实际慢速HTTP音视频渐进/身份重建/真实槽；版本漂移拒绝候选保head/profile/槽、断网不冒充自然end；取消后迟到租约归还/伪造provider身份/缺显式策略；两个同时活动Player共享provider仍各自归还/播放、诊断无可变别名；归还回调失败仍清SDK自有资源和尝试所有租约。

### 渐进播放的实际字节证据

stream-progress.json记录服务器实际发送区间并去重，不靠“响应没关闭”推断。音频实际playing时仅发送40960 / 1280646字节（3.20%），影片实际playing时40960 / 584795字节（7.00%）。两者均未整文件传输即启动解码/播放。Host此时mediaElementBytes=0、decodedAudioBytes=0，背景已验证bytes与远端声明库存分开。测试服务器按8KiB/120ms实际分段，Native metadata/播放使用真实HTTP Range；没有假媒体成功对象。

## 失败、重验和限制

初期strict指出泛型Extract的只读映射不可赋值，已改成kind映射+实际工厂校验/冻结，未用双重断言放宽；一次CLI/playground配置相对路径和测试对象括号错误均已在最终check修正。browser-first/second/third是过程探索日志，最终以完整check/unit/browser/consumer/CLI/performance/release/dev为准。

cli-first.log保留旧开发任务UI只传派生release、遇串流正确被STREAM_POLICY阻止后的真实超时。修正测试示例显式加载正式manifest后，重新跑完整65 CLI和后续兼容/性能/API通过；没有降低SDK验证。dev-probe-first.log是探针在初始异步接管期间直接读不存在tasks的错误，改为可空轮询后，原生无WebGL实测通过。过程旧构建不作为最终门槛。

SDK0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA256=cd6c7f91070fc4738e5789ce8f9ef88b01c945ad3b1538963900dfd038673d97。
CLI0.1.0 artifacts/galbox-cli-0.1.0.tgz SHA256=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。
最终consumer/CLI/audit/实际artifacts一致，本地UNLICENSED alpha，0 push/publish/部署/远程CI。Snapshot wire=1有media.stream限定streamCatalog，旧无stream字段程序保持，不承诺旧二进制前向读新状态或稳定API。

既有标准小说WebGL回归：228次语义API P95 4.5ms、两帧观察P95 48.0ms、最重Core批次P95 1.530ms；活动销毁 94.9/244.4/102.4ms，原500ms门槛通过。它不是网络时延/串流吞吐量/Canvas/全平台/decoder RAM/VRAM认证。

原生无WebGL开发实测：renderer=canvas，WebGL=false/2D=true，旧音频槽attempt递增；流式影片真实startup后skip，结局后再读旧槽仍保留2已读/streamingComplete/当前文字设置，单canvas/0 pageerror。背景digest-verified、两个媒体versioned-url保持区分，没有因为快速开发服务器可能已预取完整就错误升级SHA等级。渐进的证据只取慢速HTTP测试。

下一G4-01：先定义同一捕获切点的Snapshot/正文+舞台缩略图、槽位元数据/自动快速槽/原子提交与失败回执，再实现默认存读档管理/IndexedDB/刷新/独立consumer。G4–G7完整通用能力和N/F/M6仍未完成；真实两作缺edition/Program/资源/原档/原作继续参照，独立blocked。

当前dev已启动 http://127.0.0.1:4173/?demo=streaming 。重启export TMPDIR=/dev/shm，pnpm install --frozen-lockfile，pnpm dev；构建pnpm build。browser前停dev释放4173/4174；静态部署需满足STREAMING.md中的版本化HTTP契约。完整状态../../tasks.json。
