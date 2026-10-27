# ADR0036：用户要求的仓库边界与protobuf正式传输

用户最新要求优先于原任务包中的apps/fixtures位置及JSON默认载荷：引擎实例只在tests，原始证据/日志ignore，正式传输改为protobuf，独立项目只使用公开exports。

以protocol.yaml为单一源，保留已有校验约束并记录稳定tag，生成TS/validator/IDL/映射计划。正式数据使用WireEnvelope和实际protobuf消息/oneof，显式presence及容器包装保留空/缺失差异；不把JSON包进bytes冒充protobuf。既有DTO、语义规则和Core同步接口保持，外部仍需Schema/链接校验。

代码模块摘要/长度改为实际.pb字节，清单由protobuf传输，内部语义指纹保持稳定规则。新CLI空项目默认.pb，旧JSON作为显式兼容输入。备份/设置默认.pb导出。无新的剧情解释器或per-opcode序列化。

移测试实例/验证应用到tests，生成副本和src/generated不入Git，prepare/build重建。docs/evidence只提交短报告，原始材料本地归档到ignored artifacts并由CI上传。SDK仅发布白名单运行产物/IDL，移除schema JSON与source map，实际tarball和独立消费验收防止泄漏。

验收包括所有测试Program的protobuf往返、独立IDL互通、空/缺失/false/精确数值、非法/深输入、实际模块请求、CLI空骨架与旧格式兼容、包文件/体积及日志Git检查。历史Git对象不自动重写。
