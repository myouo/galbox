# galbox-sdk 当前状态

2026-10-26。G3-02有限支持集已完成；完整通用GalGame G0–G7仍在建设。分支feat/audio-tracks-and-long-media，基线f9d4099，本轮本地提交见git log。tasks.json为完整状态唯一来源，无外部push/publish/部署/远程CI。下一项G3-03。

新增audio.extended/audio.media：WAV/MP3/单流Ogg Vorbis/Opus、buffer/element双路径、自然完成Task/等待、loop点、三角色bus淡化与语音duck、当前正文语音重播。Core活动时间/参数源签名/混音包络与VoiceRecipe进Snapshot；启动ack与自然ended分开，旧audio.play ABI保留。确认按策略停voice，reveal不停止；重播更新活动attempt或创建辅助结果，不重开已完成逻辑结果。见ADR0020/MEDIA.md。

暂停同时停Core/AudioContext/element时钟；replay从0，stop取消，活动stop-policy自然等待/组明确禁存。Host新epoch/source身份，迟到Promise/ended不复活；blocked解锁不暗中重播，永久失败保留durable pending，新Host接管不重复profile。未决play的dispose及时结束等待并保持disposed生命周期。坏源/静态loop/fade/recipe/phase/包络恢复拒绝并保留旧档。

最终通过frozen install/fixture/check、149单元、60 Chromium（0 skip/flaky）、仓库外strict/skipLibCheck=false/原生ESM tarball与实际媒体/便携备份恢复、58 CLI、4 synthetic、三次活动性能与API/pack/publish dry-run。证据evidence/g3-02/REPORT.md、日志/JSON/截图/source-manifest.json。初轮参数/枚举/异步计数与旧stage保存时序失败及修复保留，最终完整重验通过。

SDK0.1.0 SHA=2a0e1b926b161cdcd6db6ffaca1d1169a7e90b5e144a4a0ab7d0e4e3eb86094f；CLI SHA=abdae8d8a563b1a56f8370915c06a8aa39e053b29c2ada1765412ad95be89817，artifacts/consumer/CLI/audit一致。相对f9d4099按入口计12新增/18声明变化、0删除，本地UNLICENSED alpha，Snapshot wire=1可选cap扩展，不承诺旧二进制前向读取或稳定API。

既有标准小说性能：228次语义API P95 4.2ms、两帧观察P95 47.3ms、最重Core批次P95 1.508ms；三次活动销毁147.4/121.1/73.3ms，原500ms目标通过。仅本机Linux/Chromium156/SwiftShader/Web Audio，无真实GPU/VRAM、其它浏览器、人耳音质、60FPS或大作品保证。

原创《灯塔来信·风声回放》/?demo=media同一Builder/Core/Player运行，35s Vorbis/Opus/MP3及buffer WAV均为原创合成音轨。当前dev已启动http://127.0.0.1:4173/?demo=media；实际223ms淡入切点保存/重播/刷新/MP3自然结束/结局/再读旧槽，4已读/解锁/当前设置保留，1 canvas、0 pageerror，见dev-result.json。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

本轮长媒体先整段编码字节校验再用Blob渐进解码，不是网络边下边播；element不常驻整轨AudioBuffer，实际decoder内存未测。v0.6版本化网络流/分级IntegrityEvidence明确保留G3-04并加入G7依赖。AAC/MP4/链式多流、精确seek、历史语音UI等未启用。下一项G3-03：先定视频/热点/期限/激活/保存恢复的有限ADR，再落Schema/真实工厂/Core/Host/失败反例与原创浏览器/独立消费。

图文存档/回溯、流程图/鉴赏、剧本UI/完整默认系统及G7仍未完成。N/F缺真实edition/Program/资源/原档与原作继续参照，独立blocked，M6未完成，不以原创/synthetic冒充兼容。
