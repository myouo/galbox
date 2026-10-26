import {parseFlowChapter,parseFlowNode,parseFlowEdge,parseFlowchart,ensure} from '../protocol/index.js';
import type {FlowChapter,FlowNode,Flowchart,FlowEdge,Instruction} from '../protocol/index.js';
import {expr,expressionWire} from './expressions.js';
import type {TypedExpression} from './expressions.js';
import {instruction} from './linker.js';
const nodeBrand:unique symbol=Symbol('flow-node');
export interface FlowNodeRef {readonly [nodeBrand]:true;readonly id:string;}
const nodes=new WeakMap<FlowNodeRef,FlowNode>();
export interface FlowNodeOptions {chapter:string;title:string;entry?:string|null;description?:string;column?:number;row?:number;requires?:readonly FlowNodeRef[];unlock?:TypedExpression<'bool'>;gate?:TypedExpression<'bool'>;reveal?:FlowNode['reveal'];}
function nodeWire(ref:FlowNodeRef):FlowNode {const value=nodes.get(ref);ensure(value,'FLOW_FACTORY','Use flowNode to create a reference');return parseFlowNode(value);}
export function flowChapter(id:string,title:string):FlowChapter {return parseFlowChapter({id,title});}
export function flowNode(id:string,options:FlowNodeOptions):FlowNodeRef {const value=parseFlowNode({id,chapter:options.chapter,title:options.title,entry:options.entry??null,description:options.description??'',column:options.column??0,row:options.row??0,requires:(options.requires??[]).map(r=>nodeWire(r).id),unlock:expressionWire(options.unlock??expr.flag(false)),gate:expressionWire(options.gate??expr.flag(true)),reveal:options.reveal??'unlocked'});const ref=Object.freeze({[nodeBrand]:true as const,id:value.id});nodes.set(ref,value);return ref;}
export function flowEdge(from:FlowNodeRef,to:FlowNodeRef,label=''):FlowEdge {return parseFlowEdge({from:nodeWire(from).id,to:nodeWire(to).id,label});}
export function flowchart(id:string,revision:string,chapters:readonly FlowChapter[],refs:readonly FlowNodeRef[],edges:readonly FlowEdge[]=[]):Flowchart {return parseFlowchart({id,revision,chapters:[...chapters],nodes:refs.map(nodeWire),edges:[...edges]});}
export function visitNode(at:string,node:FlowNodeRef):Extract<Instruction,{op:'flow.node'}> {return instruction('flow.node',{at,node:nodeWire(node).id});}
export function unlockNode(at:string,node:FlowNodeRef):Extract<Instruction,{op:'flow.unlock'}> {return instruction('flow.unlock',{at,node:nodeWire(node).id});}
