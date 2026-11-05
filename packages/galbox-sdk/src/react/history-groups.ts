import type {BacklogItem} from '../player/index.js';

/** Presentation only. A clipped leading append never invents its missing parent. */
export function groupHistoryEntries<T extends Pick<BacklogItem,'text'>>(entries:readonly T[]):readonly (readonly T[])[]{
 const groups:T[][]=[];
 for(const row of entries){const previous=groups.at(-1);if(row.text.rich?.historyAppend===true&&previous)previous.push(row);else groups.push([row]);}
 return Object.freeze(groups.map(group=>Object.freeze(group)));
}
