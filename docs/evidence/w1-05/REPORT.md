# W1-05：独立R2与真实域名网络验证

2026-10-28，用户授权Cloudflare专桶与test子域名试验；SDK与真实作品工程隔离，后者为`/home/myo/Desktop/galbox-fata-morgana`，只依赖正式SDK tarball/public exports。

实际创建`morgana-sdk-network-test`并上传当前发布闭包304对象/64355598字节；图片/音频/字体按完整SHA路径，共享资源与BCP47语言资源分开。原作public仅为ignored转换暂存，发布目录从Program/原菜单实际引用重建、验证后原子提升，旧孤儿不进入Vite或R2。程序、剧情目录、UI目录各自protobuf，所选语言文本绑定字节还原原Program；字体/图像中的本地化内容保留。

部署`https://test.morgana.love`，Worker静态前端/文本与私有R2绑定同源；整个站点先认证，r2.dev公开入口、workers.dev与preview关闭。只用已保存Wrangler OAuth；环境API Token权限不足的失败有原始记录。首次CPU限额设置被免费套餐拒绝，移除该设置后部署，未升级套餐。最终Worker版本bca70352-0d8f-4258-9e44-6b26060f01e4。登录只保存在外部ignored private/cloudflare/access.md与Worker secret，未提交/输出密码。

实际`python3 tooling/probe-r2.py`：公网全304对象逐字节SHA/长度一致，HEAD/单范围/后缀Range、ETag/If-Match/If-None-Match与304/404/405/412/416通过。认证前拒绝所有前端/文本/媒体，缓存预热后匿名仍401。初次Cache API全MISS，定位为对象头的大小写键合并把private/public拼在一起；改Headers.set后完整复验64 HIT/240 MISS，预热对象连续HIT，字节仍一致。Worker直接传body流，未把媒体整体缓冲到Worker内存。

独立`pnpm convert`真实8语言Core/44前导/22页及两恢复切点、所有资源闭包通过。`pnpm check`、3 Python+21 TS、`pnpm build`、Wrangler生成类型及独立Worker strict、dry-run/实际deploy通过。本地13浏览器通过；线上缓存修复后3项语言切换/临时503可见重试/180ms延迟和750000B/s冷启动通过。

当前最终线上完整验收仍执行：旧8语言合在180秒用例触及总限额，已保留全部断言拆成独立语言；旧四次冷启动跨语言保存用例90秒超时，保留每资源15秒检查并按完整网络流程给180秒总预算复验。计时模拟下ResourceTiming字节为0的旧度量作废，改CDP loadingFinished实际encodedDataLength，要求非零且小于12MiB。之后完整20项已通过；独立CDP复验3647450编码响应字节/23请求/7媒体、8.9秒。SDK驻留估算16877703、峰值18309982字节，未把ResourceTiming零值算入结论。

限制：仍仅原作44静态前导+22页，未完成整作/原档/原作逐帧认证。当前原曲为完整摘要Blob，不冒充渐进网络流；Range服务能力与播放器选用版本化流是两件事。自定义DOM菜单资产计入网络度量，未计入SDK设备驻留估算；64MiB不是整个浏览器内存硬上限。未认证离线安装、Firefox/Safari、移动真机与跨地区/运营商网络。

原始记录全在独立工程ignored artifacts（r2-upload-progress.log、r2-network-probe-final.log、cloudflare-deploy-cache-fix.log、remote-final.log与remote/），不进入SDK包。运行命令与安全接续见独立工程deployment/README.md。没有推送Git或改根域名/其他桶。

用户追加部署隔离后，test为本地build预览，testsdk为自动化回归。预览52文件3964650解码字节与本地dist一致，两个Worker身份/匿名鉴权均验证。testsdk旧基线另20项通过；全量304资源最终HIT，含一次TLS传输断连后的有界重试，字节摘要错误不重试掩盖。PO最新构建已部署：preview 512394da-2465-4f27-8df3-703dbde953b9，regression eff76469-9112-417f-ad08-06d85611d341，最终20项回归全部通过（8.6分钟，零失败/skip/flaky）。限速仅测试CDP，不在Worker/R2/预览。

最终PO部署冷网测量：CDP编码响应3647247字节/23请求，180ms与750000B/s条件下11.2秒到标题；驻留估算16877703、峰值18309982字节。最新预览52文件3964825解码字节逐文件等于本地dist。源文件与发布产物可追踪，raw为外部artifacts/po-remote-browser.log、remote/po-final-results.json、po-preview-identity.log。
