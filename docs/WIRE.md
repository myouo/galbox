# 正式protobuf传输与独立项目入口

正式外部传输入口为galbox-sdk/wire，提供强类型encodeWire(kind,payload)和decodeWire(kind,bytes)。协议是实际protobuf字段消息/oneof，不是bytes字段里包JSON。Program、Snapshot、Profile、ReleaseManifest、代码清单/模块、便携备份和设置等wire类型共用版本化WireEnvelope。

```ts
import {createPlayer, createHttpProvider} from 'galbox-sdk/player';
import {decodeWire} from 'galbox-sdk/wire';

const program = decodeWire('Program', new Uint8Array(
  await (await fetch('/game/program.pb')).arrayBuffer(),
));
const release = decodeWire('ReleaseManifest', new Uint8Array(
  await (await fetch('/game/program.pb.release.pb')).arrayBuffer(),
));
const player = await createPlayer({
  program, release, provider: createHttpProvider(program, '/game/'),
  mount, saveCompatibilitySeries: release.series,
});
await player.start();
```

也可直接用port-kit的TypeScript Builder构造Program，不要求写任何JSON文件。React可选，用galbox-sdk/react及react/style.css；纯逻辑使用core，测试端口使用testing，原档桥接使用save-bridge。独立消费测试安装实际tarball，不靠workspace paths。

schema/protocol.yaml是单一源：生成TS DTO、Ajv validator、protobuf IDL及紧凑映射计划。字段和union tag显式保存在源中，已有号码不改义/不重用。保留显式presence，空容器用消息包装区分缺失与空值；精确i64/f64仍保留原DTO的无损表示。IDL可供其他语言工具使用；DTO映射由公开wire入口处理。

编码/解码使用protobuf标准Reader/Writer。解码前检查长度、字段类型、UTF-8、递归和节点预算，之后继续Schema与逻辑链接；protobuf并不替代opcode/参数/资源/模块ABI验证。独立protobuf实现按发布IDL解码再编码的互通测试验证格式正确。参考[字段presence说明](https://protobuf.dev/programming-guides/field_presence/)。

Core/协调器/Host仍在同进程通过强类型DTO和串行事件调用，避免每条指令做二进制编解码。IndexedDB继续原生structured clone原子记录。资源是字节lease或显式媒体URL流；它们不是JSON通信。内部语义摘要/字符预算使用规范化数据，不等于网络发送JSON。

新CLI骨架默认发布program.pb和release.pb，模块代码与清单使用.pb，备份/设置默认导出.pb。旧JSON文档仅在明确兼容入口或测试数据中读取，不再作为新项目默认格式。

包白名单不包含游戏、测试输入、历史证据和协议YAML源，只有运行所需代码/声明/样式和IDL。依赖自己的package.json属于npm元数据，不会把仓库那批历史JSON复制给业务项目。实际包统计与限制见本轮工程报告。
