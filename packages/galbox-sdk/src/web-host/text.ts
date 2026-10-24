import type { DeepReadonly, Snapshot } from '../protocol/index.js';
export class TextController {
  private readonly box=document.createElement('section');
  private readonly speaker=document.createElement('div');
  private readonly content=document.createElement('p');
  constructor(mount:HTMLElement){this.box.className='galbox-text';this.speaker.className='galbox-speaker';this.content.dataset.testid='story-text';this.box.append(this.speaker,this.content);mount.append(this.box);}
  render(run:DeepReadonly<Snapshot>):void {const text=run.text;this.box.hidden=!text;this.speaker.textContent=text?.speaker??'';this.content.textContent=text?Array.from(text.content).slice(0,text.revealed).join(''):'';}
  dispose():void {this.box.remove();}
}
