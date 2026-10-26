# 0024：版本化 HTTP 媒体、完整性与租约

G3-04支持已有element音频/VP8 WebM的版本化HTTP渐进播放，不先整文件下载、生成Blob或常驻AudioBuffer。保持TS Core/Host和单Pixi舞台，不引入WASM/MSE/SW/第二VM。

Asset.transport={kind:'versioned-url',version}显式声明，版本为有限安全ASCII token；仅audio element/video，Program声明media.stream。必须提供绑定Program/catalog/资源事实的正式release，Player.streaming={integrity:'versioned-url'}显式接受较弱等级；默认不允许。既有bytes路径保持独占复制+完整SHA-256验证，不能因串流而降级。发布工具本地仍整文件检查/摘要并记录事实。

平台中立Cancellation/MediaStreamProvider/Lease端口不含DOM/Node I/O/AbortSignal。请求绑定game/release/catalog摘要/asset/kind/MIME/预期SHA/version与相应媒体fact；租约仅返回身份/URI与release，不接受provider的“已验证”标签。Host独立验证结构、HTTP(S)URI/版本query与条件HEAD的强ETag/Content-Length/MIME/identity编码/range/immutable承诺，构造IntegrityEvidence。

等级明确区分expected、digest-verified、versioned-url。强ETag/预期摘要不等于实际全部字节已验证；原生媒体GET的响应不可由JS逐字节核验。有限方案依赖源站按galbox-version参数保证该地址内容不可变、失配拒绝、各range同一版本；不能防恶意源站用同版本伪造等长同形内容。默认HTTP provider限同源，自定义跨源需匿名CORS与可见响应头。无未声明任意URL/redirect/弱ETag/隐式凭据方案。

每个Host拥有自己的已准备租约，缓存期明确，dispose/准备失败/取消与迟到结果归还恰好一次，不清同源别作或其他消费者。各播放请求仍有独立epoch/attempt/取消和DOM element。初次metadata、每次接管和新播放attempt核对版本；读取旧槽前HEAD失败不换head/回写profile。提交后失败只保留pending或明确设备错误，不复活旧Core。原生buffering不猜结束，网络错误/异常短结束明确失败。

Core为media.stream Program保存有界streamCatalog逻辑目录token（不含临时URI/租约/设备验证等级），恢复校验整个目录/版本/预期摘要；Host仍计算/验证正式catalog SHA，两个层次不混用。旧非stream Program/Snapshot不变。restore仍按既有replay从0/stop/forbid，未提供精确seek、透明自动重连、分块密码校验或离线串流缓存。

原始媒体HTTP由通用CLI/Vite开发中间件提供强内容版本/If-Match/Range/immutable语义，支持构建后的标准部署契约说明。浏览器以慢速/中途阻断服务器，记录发送区间去重，证明实际启动时未收全文件；覆盖身份/版本替换、断网、取消/迟到归还、双实例、保存刷新、无WebGL和独立tarball。只能以实际运行证据计done。

依据：v0.6资源身份/IntegrityEvidence，RFC9110 ETag/If-Match/Range，HTML media加载模型。原生URL等级的信任与元数据限制必须对调用者可见。
