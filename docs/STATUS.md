# galbox-sdk 当前状态

2026-10-26。G3-04有限HTTP串流集完成，分支feat/versioned-media-streams，基线74d5ff1，本地提交见git log。完整状态唯一来源tasks.json；下一G4-01。无外部发布/推送/部署/远程CI。

ADR0024：Asset.transport+media.stream，正式release事实，Player.streaming显式接受versioned-url。中立Cancellation/请求/租约与真streamRequest工厂无DOM/AbortSignal，Host独立HEAD核对强版本ETag/If-Match/长度/MIME/Range/immutable等。expected/digest-verified/versioned-url区分，provider标签不能升级；目录预期SHA和元数据版本都不等于已验证完整bytes。原有缓冲路径仍完整摘要。

Core保存有界逻辑streamCatalog并校验恢复目录/版本/path/SHA，不存临时URI/设备等级。接管前和每attempt重验，旧版本失败保head/profile/槽；租约按Host拥有，取消/迟到返回恰好归还、两实例互不关闭，回调异常仍清自有设备和其它租约并报告。buffering/断网/异常短结束不制造end。通用CLI/Vite强内容版本/Range服务已接入，静态部署需同契约；恶意源站违背同版本不可变不在客户端密码保证内。

最终frozen install/fixture/check、171单元、84浏览器（0 skip/flaky）、strict/skipLibCheck=false仓库外consumer、65 CLI、4 synthetic、性能/API/pack/publish dry-run通过。真实慢速HTTP：音频启动40960/1280646、视频启动40960/584795去重发送字节，均未传全即播；Host无stream Blob/整轨AudioBuffer。证据evidence/g3-04/REPORT.md、stream-progress.json、原失败/修复日志和source-manifest。

SDK0.1.0 SHA=cd6c7f91070fc4738e5789ce8f9ef88b01c945ad3b1538963900dfd038673d97；CLI SHA=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e，consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，28新增/7声明变化、0删除。Snapshot wire=1新cap限定目录token，旧程序/槽位保留，不承诺前向旧二进制或稳定API。WebGL基线API P95 4.5ms、最重Core批次P95 1.530ms，活动销毁94.9/244.4/102.4ms，原500ms目标通过；不当作网络/Canvas/全平台/真实内存认证。

当前dev已启动http://127.0.0.1:4173/?demo=streaming 。Chromium --disable-webgl/原生API实测：串流音视频、保存刷新/重播/结局、再读旧槽保留2已读/解锁/设置，背景digest与两个媒体URL等级分开，单canvas/0 pageerror。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

下一G4-01：同切点Snapshot+正文/舞台缩略图，槽位元数据/自动快速槽、原子提交/故障回执，再默认管理UI/实际IndexedDB/刷新/独立consumer。G4–G7及N/F/M6未完成；真实两作缺edition/Program/资源/原档/原作继续参照，独立blocked。
