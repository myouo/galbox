# ADV/NVL、多窗口与主题（G2-02）

Program.textLayout@1 是版本化作品定义，Core 保存窗口状态；DOM renderer 负责布局，React 只调用 Player。单个剧情控制流依次把正文写进 active 窗口，保留其它窗口显示，不为每窗另设 PC。

```ts
import {textLayout,textTheme,textWindow,textFont,instruction} from 'galbox-sdk/port-kit';
const face=builder.asset('font',{id:'letter-font',path:'letter.ttf',mime:'font/ttf',sha256});
builder.textLayout(textLayout('dialogue',[
  textTheme('night'),
  textTheme('paper',{font:textFont(face),background:'#EEE2C5',color:'#233744'}),
],[
  textWindow('dialogue','adv','night',{x:48,y:500,width:1184,height:188}),
  textWindow('book','nvl','paper',{x:48,y:112,width:730,height:370},{visible:false,maxEntries:8}),
]));
// 普通 code 中选择窗口，再使用原 text.page/template/rich：
instruction('text.window.select',{at:'book:select',window:'book'});
instruction('text.window.theme',{at:'book:theme',window:'book',theme:'night'});
instruction('text.window.visible',{at:'book:hide',window:'book',visible:false});
instruction('text.window.clear',{at:'book:clear',window:'book'});
```

最多8窗/16主题；1280×720逻辑画幅，矩形必须完整在画幅内，z=-128..128。主题字段：font、fontSize=12..64、lineHeight=1..3、letterSpacing=0..8、#RRGGBB颜色、背景透明度、borderWidth=0..8、padding=0..96、align=left/center/right。工厂补默认值后经 Schema；raw Program 仍经完整链接，缺窗口/主题/字体、重复身份、越界、未知CSS/HTML均拒绝。Builder 自动声明 text.windows。

ADV 开始新段时替换该窗显示；NVL 保留已确认段，再显示当前段。maxEntries=1..32（ADV固定1），容量包含当前段；满时明确 TEXT_WINDOW_FULL，作者须在代码中显式 clear，不暗丢文字。段落确认才写全局 history/普通已读/窗口 entries。第一次 step 只显完，另一次才确认；Auto/快进沿同一 Core。全局历史不因清窗口而丢失。

select 选窗并显示它，不清其它窗口。visible 控制显示；待输入文本必须在 active 且 visible 的窗。clear 清指定窗，text.clear 在 layout 模式清 active 窗。确认后的旧段冻结，停在 choice/group/end 仍可显示，不因换玩家速度改写旧 continuation。NVL DOM 以可滚动容器显示，新段/恢复默认滚到底部；物理滚动位置不是剧情快照。

Snapshot.textLayout 保存定义/字体签名、active、每窗主题/显隐/已确认 entries；Snapshot.text 是唯一当前揭示权威，window{id,at}绑定来源。恢复检查全部身份/容量/来源、history闭包、当前prompt/active/visibility；缺状态、换定义/字体来源或篡改条目明确拒绝且保留旧槽。新窗口Program不能自动读取没有窗口状态的旧档，需完整内容迁移；没有textLayout的旧Program/旧档保持原路径。

字体有限支持 font/ttf（TrueType glyf/loca SFNT）；和其它资源一样从 provider 接收，核验身份/摘要/目录、编码字节预算和发布清单事实，然后实际 FontFace.load 成功才允许 Player 创建/激活。缺字体能力/解码失败不静默替换。每个实例注册独有 family，dispose 仅移除自有 FontFace，取消后的迟到加载不登记。仅测编码字节，不宣称测得字体解码内存；system 或 asset.fallback 显式指定 serif/sans-serif/monospace，未含字形仍使用系统fallback，不将加载成功当作全部字形/排版认证。WOFF/WOFF2/可变字体、竖排、禁则和自动分页尚未启用。

默认 DOM renderer 把逻辑窗口缩放到 mount；作品字体大小叠乘玩家 fontScale，背景透明度叠乘 windowOpacity，正文不随背景变淡。窗口层在游戏 UI 控件下方，窗口间按z排列。多窗口不是多个Pixi舞台，也不自动进入GPU合成。

`createPlayer({...options,textRenderer(context){...}})` 可替换正文表现。context 包含 mount、独立只读 Program 副本、已准备 fontFamily(asset) 查询；工厂在资源/字体就绪后执行。返回 render(snapshot)、applyDisplayPreferences(settings)、dispose()，它们不持有剧情写权限。render 接收与 Core/Player 缓存隔离的快照，不能直接推进PC；默认 createDomTextRenderer(context) 可包装复用。dispose 幂等，Player 不在dispose后调用render；工厂取消后的迟到结果也dispose。renderer在已提交接管阶段抛错时保留 committed-pending，由新实例/新renderer恢复，不复活旧Core。扩展是受信任TS，不是同realm沙箱。

原创《灯塔来信·双页值班簿》在 `pnpm dev` 的 http://127.0.0.1:4173/?demo=layout 。三窗口、ADV/NVL、主题切换/清页与真正加载的原创小型Latin测试字体走同一生产路径；字体源为 fixtures/layout-novel/build-font.py（fontTools4.60.1，可选重建），正常pnpm fixture直接使用已提交TTF，不要求Python。该字体不是完整CJK字库。
