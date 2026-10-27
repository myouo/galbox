export type ProtoNode=
 |{kind:'alias';target:string}|{kind:'constant';value:unknown}
 |{kind:'union';variants:readonly {tag:number;target:string;field:string}[]}
 |{kind:'array'|'map';target:string}
 |{kind:'object';fields:readonly {field:string;tag:number;target:string;required:boolean}[]}
 |{kind:'string'|'number'|'integer'|'boolean'|'null';values?:readonly unknown[]};
export interface ProtoPlan {nodes:Readonly<Record<string,ProtoNode>>;envelope:readonly {kind:string;field:string;tag:number;target:string}[];}
