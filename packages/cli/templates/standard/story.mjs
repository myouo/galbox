import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
export default function buildProgram(){return new ProgramBuilder({gameId:'new-project',release:'dev-1',entry:'main',title:'New project'}).function({id:'main',entry:'main:end',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.end',{at:'main:end'})]}).build();}
