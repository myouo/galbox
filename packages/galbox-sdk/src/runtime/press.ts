/** Transient physical gesture, never part of a narrative snapshot. */
export class PressGesture {
 private held:{identity:string;source:'pointer'|'key';id:number|string;x:number;y:number}|null=null;
 cancel():void {this.held=null;}
 pointerDown(identity:string,id:number,x:number,y:number,primary=true):void {if(this.held||!primary)return;this.held={identity,source:'pointer',id,x,y};}
 pointerMove(id:number,x:number,y:number):void {const h=this.held;if(h?.source==='pointer'&&h.id===id&&Math.hypot(x-h.x,y-h.y)>12)this.cancel();}
 pointerUp(identity:string,id:number,x:number,y:number,rect:{left:number;top:number;right:number;bottom:number}):boolean {const h=this.held;if(!h||h.source!=='pointer'||h.id!==id)return false;this.cancel();return h.identity===identity&&Math.hypot(x-h.x,y-h.y)<=12&&x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;}
 keyDown(identity:string,code:string,repeat:boolean):void {if(this.held||repeat)return;this.held={identity,source:'key',id:code,x:0,y:0};}
 keyUp(identity:string,code:string):boolean {const h=this.held;if(h?.source!=='key'||h.id!==code)return false;this.cancel();return h.identity===identity;}
}
