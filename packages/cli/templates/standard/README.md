# Galbox 标准项目

这是原创《海风的回信》，通过公开 SDK 驱动，可替换为你自己的标准 Program。

```sh
pnpm install
pnpm assets
pnpm check
pnpm dev
pnpm build
```

默认本地地址 http://127.0.0.1:4173/。构建目录 dist 可通过 HTTP 静态服务提供。

修改 story.mjs 的 Builder 输入；在 galbox.config.json 登记已可使用的资源，再运行 pnpm assets 计算 SHA-256 并重新链接发布数据。port.mjs 只登记受信任的 SDK 操作/来源，不执行原版脚本或存档代码。TypeScript 同时检查 TSX 和两个 JS 模块。

本地未发布候选应以 galbox init --sdk-tarball ... --cli-tarball ... 创建，依赖会复制到 vendor，固定同一个 SDK 实例。npm 名称与公开发布仍需另行确认。

assets build 生成 public/program.json.release.json，播放器与 CLI 校验 Program、port 注册表、资源字节与预算的一致性。修改 story/port/资源/resource-policy.json 后重新运行 assets build。预算可在 SDK 硬上限内调整；视频、热点、限时选择等未启用能力明确拒绝。
