import {wireDigest} from '../protocol/digest.js';
import {ensure,GalboxError,parseSaveCommit,parseSaveReceipt,parseSaveGameOptions,parseSavePolicy} from '../protocol/index.js';
import type {SaveCommit,SaveReceipt,SaveGameOptions,SavePolicy} from '../protocol/index.js';
import type {Store,SlotSummary} from '../runtime/ports.js';
export {parseSaveGameOptions,parseSavePolicy};
export type {SaveCommit,SaveReceipt,SaveGameOptions,SavePolicy};
export const defaultSavePolicy:Readonly<SavePolicy>=Object.freeze({manualSlots:12,autoSlots:3,auto:'off'});
export class SaveOutcomeError extends GalboxError {
 constructor(readonly commitId:string,readonly slot:string,readonly outcome:'unknown'|'not-committed',reason:string){super(outcome==='unknown'?'SAVE_COMMIT_UNKNOWN':'SAVE_COMMIT_FAILED',`${reason}; commit=${commitId}`);}
}
export function profileSlot(profileId:string,name:string):string {return profileId==='main'?name:`${profileId}:${name}`;}
export function selectSaveSlot(rows:readonly SlotSummary[],profileId:string,policy:SavePolicy,input:SaveGameOptions):{slot:string;revision:number;kind:'manual'|'quick'|'auto'} {
 const kind=input.kind??'manual',relevant=rows.filter(r=>r.metadata.profileId===profileId);let slot=input.slot;
 if(kind==='quick'){const fixed=profileSlot(profileId,'quick');ensure(!slot||slot===fixed,'SAVE_SLOT_POLICY','Quick slot is fixed per profile');slot=fixed;}
 if(kind==='auto'){
  ensure(!slot,'SAVE_SLOT_POLICY','Automatic slot is selected by policy');const candidates=Array.from({length:policy.autoSlots},(_,i)=>profileSlot(profileId,`auto:${i+1}`));slot=candidates.find(s=>!rows.some(r=>r.slot===s))??candidates.map(s=>rows.find(r=>r.slot===s)).filter((r):r is SlotSummary=>!!r).sort((a,b)=>(a.metadata.capture?.createdAt??0)-(b.metadata.capture?.createdAt??0)||a.slot.localeCompare(b.slot))[0]?.slot;
 }
 if(kind==='manual'){
  ensure(!slot||slot!==profileSlot(profileId,'quick')&&!slot.startsWith(profileSlot(profileId,'auto:')),'SAVE_SLOT_POLICY','Quick and auto slot names are reserved');
  if(!slot)slot=Array.from({length:policy.manualSlots},(_,i)=>profileSlot(profileId,`manual:${i+1}`)).find(s=>!rows.some(r=>r.slot===s));
  const existing=rows.find(r=>r.slot===slot);ensure(slot,'SAVE_SLOTS_FULL','Choose an existing slot to overwrite');ensure(existing||relevant.filter(r=>r.metadata.kind==='manual').length<policy.manualSlots,'SAVE_SLOTS_FULL','Manual slot limit reached');
 }
 ensure(slot,'SAVE_SLOT_POLICY','No slot selected');const row=rows.find(r=>r.slot===slot);ensure(!row||row.metadata.profileId===profileId,'SLOT_PROFILE_CONFLICT','Cannot overwrite another profile');ensure(!row?.metadata.kind||row.metadata.kind===kind,'SAVE_SLOT_POLICY','Cannot change an existing slot kind');return {slot,revision:input.expectedRevision??row?.revision??0,kind};
}
export async function submitSave(store:Store,input:SaveCommit):Promise<{receipt:SaveReceipt;reconciled:boolean}> {
 const data=parseSaveCommit(input),commit=store.commitSave?.bind(store),read=store.saveReceipt?.bind(store);ensure(commit&&read,'SAVE_SYSTEM_UNSUPPORTED','Store needs atomic save and receipt ports');const signature=wireDigest(data);
 function receipt(input:unknown):SaveReceipt {const r=parseSaveReceipt(input);ensure(r.id===data.id&&r.slot===data.slot&&r.signature===signature&&r.revision===data.expectedRevision+1,'SAVE_RECEIPT','Receipt differs from immutable save');return r;}
 try{return {receipt:receipt(await commit(data)),reconciled:false};}
 catch(error){
  let recorded:SaveReceipt|null;try{recorded=await read(data.id);}catch{throw new SaveOutcomeError(data.id,data.slot,'unknown','Cannot read the durable receipt');}
  if(recorded)return {receipt:receipt(recorded),reconciled:true};
  if(error instanceof GalboxError)throw error;
  throw new SaveOutcomeError(data.id,data.slot,'not-committed',error instanceof Error?error.message:String(error));
 }
}
