import {ensure,GalboxError} from '../protocol/index.js';
export interface ResidentAsset {readonly bytes:number;dispose():void;}
export interface AssetUse {readonly ready:Promise<void>;release():void;}
interface Entry {id:string;refs:number;priority:number;order:number;used:number;state:'queued'|'loading'|'ready';bytes:number;abort:AbortController;value?:ResidentAsset;promise:Promise<void>;resolve:()=>void;reject:(e:unknown)=>void;}
/** Owned by one Host. Ready resources are evictable only after every use releases. */
export class AssetCache {
 private readonly entries=new Map<string,Entry>();private active=0;private order=0;private used=0;private disposed=false;private bytes=0;
 readonly stats={residentBytes:0,peakResidentBytes:0,hits:0,misses:0,evictions:0,active:0,queued:0};
 constructor(private readonly concurrency:number,private readonly maximum:number,private readonly load:(id:string,signal:AbortSignal,reserve:(bytes:number)=>void)=>Promise<ResidentAsset>){}
 has(ids:readonly string[]):boolean {return ids.every(id=>this.entries.get(id)?.state==='ready');}
 acquire(ids:readonly string[],signal:AbortSignal,priority=0):AssetUse {
  ensure(!this.disposed&&!signal.aborted,'ASSET_CANCELLED','Resource request cancelled');const entries:Entry[]=[];
  for(const id of new Set(ids)){let entry=this.entries.get(id);if(entry){entry.priority=Math.min(entry.priority,priority);entry.refs++;entry.used=++this.used;this.stats.hits++;}else{let resolve=()=>{},reject:(e:unknown)=>void=()=>{};const promise=new Promise<void>((a,b)=>{resolve=a;reject=b;});entry={id,refs:1,priority,order:++this.order,used:++this.used,state:'queued',bytes:0,abort:new AbortController(),promise,resolve,reject};this.entries.set(id,entry);this.stats.misses++;}entries.push(entry);}
  let released=false,rejectAbort:(e:unknown)=>void=()=>{};const cancelled=new Promise<never>((_r,reject)=>{rejectAbort=reject;}),release=()=>{if(released)return;released=true;signal.removeEventListener('abort',abort);for(const entry of entries){entry.refs--;if(entry.refs===0&&entry.state!=='ready'){entry.abort.abort();entry.reject(new GalboxError('ASSET_CANCELLED',entry.id));if(this.entries.get(entry.id)===entry)this.entries.delete(entry.id);}}this.update();},abort=()=>{rejectAbort(new GalboxError('ASSET_CANCELLED','Resource use cancelled'));release();};
  signal.addEventListener('abort',abort,{once:true});let failed=false,failure:unknown;const ready=Promise.race([Promise.all(entries.map(e=>e.promise.catch(error=>{if(!failed){failed=true;failure=error;}release();throw failure;}))).then(()=>{}),cancelled]);this.pump();return {ready,release};
 }
 private update():void {this.stats.residentBytes=this.bytes;this.stats.peakResidentBytes=Math.max(this.stats.peakResidentBytes,this.bytes);this.stats.active=this.active;this.stats.queued=[...this.entries.values()].filter(e=>e.state==='queued').length;}
 private reserve(entry:Entry,bytes:number):void {
  ensure(!this.disposed&&!entry.abort.signal.aborted,'ASSET_CANCELLED',entry.id);ensure(Number.isSafeInteger(bytes)&&bytes>=0,'RESOURCE_RESIDENT_BUDGET','Invalid resource estimate');
  while(this.bytes-entry.bytes+bytes>this.maximum){const candidate=[...this.entries.values()].filter(e=>e!==entry&&e.state==='ready'&&e.refs===0).sort((a,b)=>a.used-b.used)[0];ensure(candidate,'RESOURCE_RESIDENT_BUDGET','Pinned current and incoming resources exceed the resident budget');this.remove(candidate);this.stats.evictions++;}
  this.bytes+=bytes-entry.bytes;entry.bytes=bytes;this.update();
 }
 private remove(entry:Entry):void {if(this.entries.get(entry.id)===entry)this.entries.delete(entry.id);entry.value?.dispose();delete entry.value;this.bytes-=entry.bytes;entry.bytes=0;this.update();}
 private pump():void {if(this.disposed)return;for(;;){if(this.active>=this.concurrency)break;const entry=[...this.entries.values()].filter(e=>e.state==='queued').sort((a,b)=>a.priority-b.priority||a.order-b.order)[0];if(!entry)break;entry.state='loading';this.active++;void this.load(entry.id,entry.abort.signal,n=>this.reserve(entry,n)).then(value=>{if(this.disposed||entry.abort.signal.aborted){value.dispose();throw new GalboxError('ASSET_CANCELLED',entry.id);}entry.value=value;entry.state='ready';entry.resolve();},error=>{throw error;}).catch(error=>{this.remove(entry);entry.reject(error);}).finally(()=>{this.active--;this.update();this.pump();});}this.update();}
 dispose():void {if(this.disposed)return;this.disposed=true;for(const entry of [...this.entries.values()]){entry.abort.abort();entry.reject(new GalboxError('ASSET_CANCELLED','Cache disposed'));this.remove(entry);}this.update();}
}
