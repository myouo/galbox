# galbox-sdk 当前状态

2026-10-25。M0–M5 通用 SDK 门槛完成，当前为 galbox-sdk/@galbox/cli 0.1.0 本地 alpha 候选。完整事实以 tasks.json 为准；分支 feat/release-resource-budgets，M5-02=1f93068、M5-03=b88c257，最终候选本地提交见 git log。未执行真实 publish、Git push、部署或远程 CI。

本轮新增正式 release 工厂、生成 Schema/validator、Program/目录/操作与 binding 注册表/源资源事实绑定，CLI/模板/灯塔样例实际生成消费 .release.json。预算内预加载、有界 HTTP、解码前后校验、取消/迟到租约/音频节点清理、实际 GPU context loss 暂停与持久 pending/新 Host 恢复已验证。ReadUnit 当前身份保留 @，旧 wire 可读/备份；组合 profile 超限整体拒绝，保留旧记录。细则在 RELEASES.md、ADR 0009/0010/0011；备份与迁移见 BACKUPS.md。

最终代码重验：frozen 安装/check、72 单元、29 Chromium（0 skip/flaky）、严格类型/原生 ESM 的独立 tarball 与播放保存备份迁移、50 条独立 CLI 命令/两个开发工作流、4 synthetic、性能、API/type/版本/pack/publish dry-run 均通过。最终证据 evidence/m5-04/REPORT.md、日志/JSON/截图/source-manifest.json；M5-02/03 为各自历史基线，before-* 和首轮失败日志不是最终通过证据。

本地包 artifacts/galbox-sdk-0.1.0.tgz SHA=f93bdb6f83cb72e4e00e5286f0efe3cc9f43433702047be0778c1155b777a6a1；CLI tgz SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。最终 SDK consumer/CLI/audit 测得摘要一致。API 相对 308c1ae 新增 release 入口、8 条按入口计的声明变化、无导出删除；不是稳定 API/零破坏承诺，迁移注意事项在 ALPHA.md。

最新实测：Core 最重批次 P95 1.341 ms、76 次语义 API P95 2.5 ms；两次 rAF 代理 P95 128.8 ms、dispose max 1673.6 ms（原始基线曾到 1805.3 ms），仍有软件渲染/释放长尾，不承诺视觉延迟或 60 FPS。PCM=510720 B、RGBA 估算=7767200 B，三次拥有资源归零；整页 V8 heap 含模块/JIT/其他 Player，未证明无泄漏，未测真实 VRAM。Linux/Chromium156/SwiftShader 为已测参考环境，PNG/SVG/PCM16 与 tiny mono float32 实际可用，其他平台/声道组合未认证，见 PLATFORMS.md。

运行 export TMPDIR=/dev/shm（本机 /tmp 配额限制），pnpm install --frozen-lockfile，pnpm dev → http://127.0.0.1:4173/。本轮已启动并真实点击阅读/备份菜单，HTTP 200、1 canvas、真实 Web Audio、manifest 绑定、0 pageerror 见 dev-result.json。browser 前停止 dev 释放 4173/4174。test:release 需要完整 Git 历史；test:performance 是本地参考基线，不推导其他设备。

下一项为 N-01/F-01，仍因缺明确 edition/语言/补丁、可用 Program/资源/文件指纹、真实原档与全局附件、原作加载后继续参照而 blocked。收到资料先按 INPUTS_REQUIRED.md 核验，再做真实导入→继续→网页再保存切片；M6-01 尚未完成。没有无依赖且未完成的通用 SDK 任务，不编造原档或兼容结论。

已知 alpha 限制：有限整包预加载/主 chunk >500 kB/长期回执与大作品尺度未认证；没有长媒体流/精确 seek、视频/热点/timed-choice、GPU 自动重建、跨系列迁移或同 realm 沙箱；Windows/macOS、其他浏览器、移动真机/物理 GPU/headed 窗口、人耳音质未验证。synthetic 只证明 SDK 流程，不算两部真实作品兼容。
