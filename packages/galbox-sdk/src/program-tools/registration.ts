import {ensure} from '../protocol/index.js';
import {OperationRegistry,emptyOperations} from '../core/operations.js';
import {SaveBindingRegistry,createSaveBindingRegistry} from '../save-bridge/index.js';
export interface PortRegistration {readonly operations:OperationRegistry;readonly bindings:SaveBindingRegistry;}
const registrations=new WeakSet<object>();
export function createPortRegistration(input:{operations?:OperationRegistry;bindings?:SaveBindingRegistry}={}):PortRegistration {
 const operations=input.operations??emptyOperations,bindings=input.bindings??createSaveBindingRegistry([]);
 ensure(operations instanceof OperationRegistry&&Object.isFrozen(operations)&&bindings instanceof SaveBindingRegistry&&Object.isFrozen(bindings),'PORT_REGISTRATION','Use frozen SDK registries');
 const result=Object.freeze({operations,bindings});registrations.add(result);return result;
}
export function readPortRegistration(input:unknown):PortRegistration {
 function registered(value:unknown):value is PortRegistration {return typeof value==='object'&&value!==null&&registrations.has(value);}
 ensure(registered(input),'PORT_REGISTRATION','Expected a registration from this SDK instance');return input;
}
