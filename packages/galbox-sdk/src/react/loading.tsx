import type {Player,PlayerView} from '../player/index.js';
export function ResourceLoading({player,view,retry}:{player:Player;view:PlayerView;retry?:()=>void}) {
 if(view.loading.phase==='idle')return null;
 return <div className="galbox-resource-wait" role="status"><div><p>{view.loading.phase==='failed'?'这一幕暂时未能加载，当前画面已保留。':'正在准备下一幕…'}</p>{view.loading.phase==='failed'&&<button onClick={retry??(()=>{void player.retryResources().catch(()=>{});})}>重试加载</button>}</div></div>;
}
