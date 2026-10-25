# 0018：数值、集合与迁移

G0-03有限支持集：保留bool/i32/string，增加i64/f64/null/list/dict。i64为有符号64位规范十进制字符串，计算用bigint，越界/除零拒绝；f64的value为大端16位hex，保留±0/±Infinity，NaN统一7ff8000000000000。外部hex可大写/非规范NaN，统一入口规范为小写/固定NaN；不是JSON Number、隐式数值或任意JS对象。null明确{kind:'null',value:null}；stored void/undefined、引用heap、循环、i32/i64回绕和超范围数值算子未启用，函数returns=void仍表示无返回，不混作null。

新增values.extended能力和真实构造/表达式工厂。i64 checked加减乘除余数/min/max/neg/abs；f64的加减乘除余数/min/max/neg/abs/floor/ceil/trunc按ECMAScript基本IEEE操作，结果NaN规范。不先加入跨设备未限定的超越函数。转换显式：i32→i64/f64精确，i64→f64允许显式舍入；f64/i64→i32和f64→i64必须整数/范围合法，不隐式截断。比较严格kind；f64 NaN与任何值不等且排序比较全false，±0相等；容器递归比较，字典插入顺序有意义。

列表最多256项，字典最多64个有序{key,value}，键1..128非NUL字符、重复拒绝；null与缺键分开，contains/get分开。get/at声明预期返回kind，错类型/缺键/越界明确拒绝；更新返回新值，不保留引用别名。dict.set保留已有键顺序，新键追加；remove缺键无变化；list.set/push/slice/concat、length，dict.keys/has/get/set/remove均有界。单个值树最多8层/1024节点。值字符串保留旧UTF-16内容，不引入隐式Unicode归一化。

Schema为形状单源，公有unknown入口校验后在自有副本规范化原生值/表达式。仅遍历明确native字段，不改插件codec的任意args/state JSON。Core/扩展native actions/profile/存储批次同一Value规范；失败不得提交半个集合或影响目标/profile/RNG/已发布效果。新增profile.expression写入求值结果。纯逻辑表达式短路但完整链接所有分支，计算/字符串/AST和树大小有界。

新类型可用于全局/局部/参数/返回/profile/快照/备份。恢复不把旧i32静默改成f64或其它kind；缺全局/错类型/旧release拒绝，保留旧档。明确完整内容迁移处理全部profile、current/previous槽位、调用帧和相关内容；operation args/phase/wait变化仍必须完整invocation迁移，state-only不能冒充。旧i32及旧Program语义保留，Snapshot wire version=1不代表旧SDK能前向读新族。

用原创《灯塔来信》补通用数据章节，通过正式Builder/Core/Player/IndexedDB/renderer，显示真实数值/集合运算、保存/恢复和独立消费。不会为两作资料缺失编造格式。G3舞台参数表达式后续复用此值基础；本项不顺便开启完整演出或未知VM。

递归表达式加入多个数值族后，原allErrors聚合会在已知kind不符的分支继续遍历同一子树，深AST产生指数级重复工作。SDK validator改用Ajv strict=true/allErrors=false，在失败分支短路诊断聚合；不改变接受集合、不跳过合法分支的子节点/语义链接，继续保留生成一致/地址定位/深度规模与深层坏节点负例。CLI配置校验不变。此项是有界执行修复，不放宽strict或Schema。
