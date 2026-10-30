# W1-03B2：高级交互模块闭包

2026-10-31，ADR0080接通v2的剧本UI、流程图入口、RNG、计时交互、WebM及已登记operations，沿用原Core/Coordinator/Host/Storage。ModuleHeader用新增protobuf tag携带UI/flow目录；v1支持集不变，单输入/模块/快照/资源预算未提高。

UI/流程图运行签名绑定完整manifest；活动UI保留已返回show函数的来源，扩展调用/音效与其他任务同样有来源闭包。Player核对当前profile gate后加载声明根，失败/取消保持原会话；旧槽不回写持久访问。注册表的Schema/实现/迁移身份在compiler、source、Player和恢复中核对release，未知/不同注册拒绝。重播的临时Player重新绑定真实注册表，主线权威不合并子会话进度。

当前验证：377单元、check与29相关浏览器通过。新增6模块浏览器覆盖冷UI编辑/图文IDB刷新、flow失败重试/取消、真实视频/禁止存档、计时/RNG/operation续接和含UI/扩展的隔离回放。包含既有基础/高级模块、单体UI/流程图/交互回归；没有称全235浏览器重跑。CI发现矩阵完整覆盖235项，5组无遗漏/重复。`pnpm test:consumer`真实tarball的独立安装/严格TypeScript/headless/浏览器消费通过，新增模块UI、扩展注册表、视频/计时/RNG和cold flow完整运行；安装路径在临时目录，未引用workspace源码。

失败记录：新增回放案例最初读取了未刷新的测试站静态fixture，更新Vite输出后29项通过；独立消费新增夹具的语法错误已修正并严格类型重验；并行分片发现曾碰到consumer重建dist的暂态缺文件，改为构建结束后顺序验证，没有降低门槛。

跨manifest迁移、模块recipe/SaveBridge/历史回溯和代码驱逐另列后续；W1存储容量、持久缓存/离线与真机矩阵没有借此完成。SDK只提交通用源码、原创fixture与短报告，真实作品资料及原始日志不在包或Git中。

实际npm包审计通过：270文件、606433压缩bytes，白名单不含游戏、测试、原始证据/日志、source map或JSON Schema。当前支持集已验收，后续任务W1-03B3及W1-03C/W1-04明确保留。
