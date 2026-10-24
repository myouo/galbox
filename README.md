# galbox-sdk

强类型、可嵌入的视觉小说 Web SDK。已完成 M0–M2 与 M3-01：同一正式 TypeScript Core 驱动原创《灯塔来信》，使用 Pixi WebGL、DOM 正文、React 默认 UI、Web Audio 与 IndexedDB。

《水仙》《海市蜃楼之馆》的真实资料仍缺，当前不声明商业作品兼容。完整任务状态见 [tasks.json](docs/tasks.json)，当前摘要见 [STATUS](docs/STATUS.md)，范围见 [能力表](docs/CAPABILITIES.md)。

## 运行

Node >=22.12，pnpm 11.28.5。依赖版本已固定。

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

打开 `http://127.0.0.1:4173`。开始阅读后，一次输入显完、下一次推进；走完海岸或灯塔路线。菜单提供保存、读档、历史、音量与重新开始。普通已读和结局解锁自动持久；刷新后可读取快速存档。失焦清除瞬态快进；菜单、用户暂停和隐藏状态分别管理。

本次环境的 `/tmp` 配额已满，运行需要临时文件的命令前使用 `export TMPDIR=/dev/shm`。这不影响项目目录写入，不要求清理其他项目。普通环境无需此设置。

## 构建与验证

```bash
pnpm check           # 生成一致性、主包/应用严格类型、无 DOM/Node headless 编译、导入边界
pnpm test            # 生产 Core/协调器、Schema/链接/恢复负例、提交和激活故障
pnpm test:browser    # 构建静态应用/独立测试 harness，再运行真实 Chromium 集成
pnpm test:consumer   # tarball、仓库外临时安装、公开声明检查、独立浏览器播放/保存恢复
pnpm build           # SDK ESM/声明与 apps/playground/dist 静态目录
```

`pnpm fixture` 从原创 Builder 输入重新生成素材和 Program；`pnpm generate` 更新 Schema 生成物。`check:generated` 是只读漂移检查。`pnpm dev` 会先构建 SDK，不使用源码路径别名伪装公开包消费。静态产物可由任意 HTTP 静态服务器提供；本地预览用 `pnpm exec vite preview --config apps/playground/vite.config.ts --host 127.0.0.1`。

## 嵌入

公开入口：`galbox-sdk` / `player`、`protocol`、`core`、`port-kit`、`react`、`testing`。React 是可选 peer，headless 入口不加载 Pixi/React/DOM。

```ts
import { createPlayer, createHttpProvider } from 'galbox-sdk/player';
const program: unknown = await (await fetch('./program.json')).json();
const player = await createPlayer({
  program, provider: createHttpProvider(program, new URL('./', location.href).href),
  mount, saveCompatibilitySeries: '1',
});
await player.start(); // 由用户动作调用，满足浏览器声音策略
const view = player.getSnapshot();
const wait = view.core?.run.wait;
if (wait?.kind === 'text') await player.step(wait.prompt, view.epoch);
await player.save('quick');
await player.load('quick');
player.dispose();
```

默认 UI 使用 `DefaultUI` / `usePlayer`，并导入 `galbox-sdk/react/style.css`。在 `.galbox-player` 容器内放置一个 `.stage` mount 和 `<DefaultUI player={player}/>`；正文 DOM 由 Host 管理。完整接入实例见 [playground](apps/playground/src/main.tsx)；只使用 tarball 的最小项目见 [consumer](tests/consumer/main.ts)。

内部快照接入当前持久 profile，不覆盖新的解锁。冲突不会自动合并非单调字段；`discardAndLoad` 是显式放弃当前未持久进度的入口。已提交存储操作不会因 dispose 被报告为无副作用取消。

初始能力与限制见 [CAPABILITIES](docs/CAPABILITIES.md)，细节决策见 [ADR-0002](docs/decisions/0002-m0-m2-semantics.md)。有状态扩展与迁移用法见 [OPERATIONS](docs/OPERATIONS.md)。后续从 `CODEX_CONTINUE.md` 和任务表推进剩余 M3，不将本检查点称作最终两作支持版。
