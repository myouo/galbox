# G3-07：绑定音源的包络与具名SE缓冲

2026-10-28，生产代码基线eaa1f38；CI分组调整d282bd9。有限支持集与兼容边界见ADR0045、MEDIA.md。原始日志仅在ignored artifacts/g3-07。

只读核对独立工程system/BGM.tjs的fadeOutAndStop/onFadeCompleted及system/SE.tjs的fadeOut、原场景buf0/1用法；源含义为指定buffer的淡出完成后停止。没有复制原脚本/二进制素材，没有改作品专属Core。

实现：Program最多8个具名sfxBuffers；真实Builder.sfxBuffer、sfxTrack、audioSourceFade、audioFadeOutAndStop、audioSourceStop工厂。audio.sources与角色bus/偏好分开，包络执行时绑定逻辑media ID。替换、自然结束、失败、停止和all-success等待分别结算；source-stop核对epoch/task/attempt。源包络/声明签名/可达源进入Snapshot和protobuf，恢复保持逻辑关系并新建物理请求。错误引用、声明变化、增益/签名/计数范围损坏明确拒绝。300次重复join/播放验证不累积不可达调用。

初始激活与读档取消策略分开，restore=stop源初始仍实际播放；活动包络禁存，不能通过普通restore恢复。已停止语音释放Auto等待。首轮浏览器发现Player启动白名单尚未接纳该合法初始切点，补齐后实际原生启动/禁存/结算保存通过；未删失败断言。

兼容：旧字段tag/必需参数不变，新增Program tag20、Snapshot tag28、Task tag21/22、Instruction tag66/67；旧Program/旧快照保留原义，新能力由旧SDK显式拒绝。有限v1不支持多BGM槽、延迟包络、精确采样续播及基础代码模块；真实整作/原档认证仍独立，原实例尚未升级依赖。

验证：
- 最终pnpm check通过生成一致性、strict/headless、导入/仓库边界及真实工厂编译负例；pnpm test完整44文件284项通过（unit-ready.log），含恢复计数范围和npm报告解析负例。
- 第一轮原生媒体浏览器12通过/1失败，失败为启动白名单；修复后20项全部通过，无skip/retry。覆盖原生buffer/element两个SE、真实IndexedDB中途恢复、旧onended无效、同缓冲替换存活、初始stop策略禁存、Auto/后台/视频既有路径。日志browser-first.log/browser-complete.log，失败trace保留。
- 实际tarball仓库外消费通过原生ESM/skipLibCheck=false声明、新工厂、protobuf源闭包、真实浏览器多源/读档/便携备份。最后计数校验补充后consumer-final及release-final再次通过；SDK包236文件/524411压缩字节，SHA256=f5347b568396ad89ba3ac8f569afb18b0f6a99cfa394371baeb2784433eb3cbd，consumer/release/package实际字节一致。
- 最终3e31187重建app/harness后4项源音频浏览器再次通过；标准性能3周期228输入通过，Core预算P95<4ms、API P95=29.4ms<50ms、dispose最大209.2ms<500ms，拥有资源释放归零。命令使用GALBOX_EVIDENCE_DIR=artifacts/g3-07/performance-final、GALBOX_PERF_ACTIVE_CYCLES=3、GALBOX_PERF_DISPOSE_LIMIT_MS=500及node tests/tooling/performance.mjs；没有同环境前后对照，不宣称整体提速。
- 实际release审计以eaa1f38为API基线：无公开入口/导出删除，SDK/CLI的npm dry-run身份/版本/文件清单全部通过，actualPublish=false。
- 远程代码提交3e311870f9d01971960b6ae404d329cc7141d26a，run40637434057全部success：check（含strict、单元、compatibility、CLI、consumer、release、package）及22+154=176浏览器，无skip/retry。结果见[GitHub Actions](https://github.com/myouo/galbox/actions/runs/40637434057)。G3-07验收完成。
- 发布引用完整历史扫描3101个blob/146482169字节，原作/私有路径及常见凭据签名零命中；SDK原历史保留，未推原作载荷/原始证据。

运行：pnpm check；pnpm test；pnpm test:browser；pnpm test:consumer。音频专测为tests/browser/audio-sources.spec.ts，开发应用pnpm dev。后续SDK优先W1-03C热记录/容量，真实作品转换器改用新工厂另验。
