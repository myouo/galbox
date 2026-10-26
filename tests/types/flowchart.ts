import {flowNode,flowChapter,flowchart,flowEdge,visitNode,unlockNode,ProgramBuilder,expr} from 'galbox-sdk/port-kit';
import type {Player} from 'galbox-sdk/player';
export function flowTypes(player:Player){const one=flowNode('one',{chapter:'main',title:'序章',entry:'one',unlock:expr.flag(true)}),two=flowNode('two',{chapter:'main',title:'第二章',row:1,requires:[one],gate:expr.flag(true)});new ProgramBuilder({gameId:'typed-map',release:'one',entry:'main'}).flowchart(flowchart('map','v1',[flowChapter('main','章节')],[one,two],[flowEdge(one,two)]));visitNode('at',one);unlockNode('unlock',two);void player.enterNode(one.id,player.getSnapshot().epoch);
 // @ts-expect-error Conditions must be boolean expressions.
 flowNode('bad',{chapter:'main',title:'bad',gate:expr.integer(1)});
 // @ts-expect-error A string is not a node reference made by the factory.
 visitNode('bad','one');
 // @ts-expect-error Edges require real node references.
 flowEdge(one,{id:'forged'});
 // @ts-expect-error Public graph views do not grant mutable ownership.
 player.getSnapshot().flowchart!.nodes[0]!.title='changed';
}
