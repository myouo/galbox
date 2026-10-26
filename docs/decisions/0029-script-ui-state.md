# ADR0029：剧本 UI 的状态、事件和恢复

状态：G6-01有限支持集已接受并验收，见../evidence/g6-01/REPORT.md。保持唯一TypeScript Core、Pixi WebGL/Canvas、DOM正文和React默认系统界面。

1. Program.ui为版本化屏幕目录（1–16屏、每屏1–64控件、逻辑1280×720），同时一个活动屏幕。有限控件为label/image/button/toggle/range/input；目录262144字符、每屏图像16MiB RGBA估计上限，静态矩形/安全颜色/字号和图片资源，动态文字/可见/启用/类型化值。实例只声明，不执行JS/HTML/CSS字符串。
2. ui.show重新初始化声明屏并产生新generation；ui.hide清理活动屏；ui.text/visible/enabled/toggle/range/input通过纯表达式更新有限属性。Snapshot.ui保存目录/资源/UI指令身份和完整活动控件状态，界面焦点/鼠标按住/IME未提交组合不属于存档权威。
3. ui.wait冻结当前屏幕身份，声明按钮→当前函数内分支和类型关联字段→剧情槽的提交映射。只有active等待接收事件；控件编辑只改UI状态，按钮提交全部映射和按钮ID再分支。无第二剧情线程、任意回调、系统设置写入或自动真人选择。其它剧情等待时屏幕可见但只读。
4. 事件携带epoch/prompt/attempt/generation/inputId；显示就绪才activate，恢复保留值但更新attempt并重新prepared。旧事件、隐藏/禁用控件不生效；非法值/类型/范围和提交失败不部分写入。程序只能等真实UI，RestoreRecipe不猜输入。show重置、hide取消旧事件；dispose释放本实例DOM/图像。
5. Web adapter提供真实DOM控件和键盘/指针输入，Player路由至同一串行Coordinator/Core。React默认系统菜单仍只调用Player；作品不用自写控件状态机。中立Core没有DOM；DOM显示不作为状态权威。未提交IME组合保持本地编辑，完成组合后提交；截图只捕获Core已确认状态。
6. 图文保存沿同切点捕获正文、Pixi及脚本UI，图片仅用已验证资源；字段值进入快照，临时图片URL/焦点不入档。备份/旧档恢复绑定完整目录/资源；变化须完整迁移，不重放show或偷偷复位字段。受信任renderer/provider并非沙箱。

验收：真实工厂正反类型、预算1/8/100、隐藏/禁用/错误范围、输入幂等/过期拒绝、嵌套帧提交、保存恢复/完整迁移、真实DOM控件/图文缩略图/IndexedDB刷新、双实例/取消、WebGL/Canvas和严格独立tarball。屏幕堆栈/任意布局约束/任意HTML控件/移动完整皮肤仍不由本有限任务冒充，G6-02/G7继续。

补充设备边界：绘制失败清理本实例UI并暂停；逻辑保存仍可用，图文保存明确拒绝SAVE_CAPTURE_UI，重建Player后恢复。原生ESM生成物禁止CommonJS辅助require，字符串用既有有界pattern，未改变strict或绕过validator。
