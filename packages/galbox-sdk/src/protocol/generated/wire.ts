/* Generated from schema/protocol.json. Do not edit. */

/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ValueKind".
 */
export type ValueKind = 'i32' | 'bool' | 'string';
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Value".
 */
export type Value =
  | {
      kind: 'i32';
      value: number;
    }
  | {
      kind: 'bool';
      value: boolean;
    }
  | {
      kind: 'string';
      value: string;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Instruction".
 */
export type Instruction =
  | {
      at: string;
      op: 'control.jump';
      target: string;
    }
  | {
      at: string;
      op: 'control.branch';
      left: Operand;
      cmp: 'eq' | 'lt';
      right: Operand;
      yes: string;
      no: string;
    }
  | {
      at: string;
      op: 'control.call';
      function: string;
      /**
       * @maxItems 32
       */
      args: Operand[];
      dest?: string;
    }
  | {
      at: string;
      op: 'control.return';
      value?: Operand;
    }
  | {
      at: string;
      op: 'control.end';
    }
  | {
      at: string;
      op: 'value.set';
      dest: string;
      value: Operand;
    }
  | {
      at: string;
      op: 'i32.add.checked';
      dest: string;
      left: Operand;
      right: Operand;
    }
  | {
      at: string;
      op: 'text.page';
      textId: string;
      revision: string;
      speaker: string;
      content: string;
    }
  | {
      at: string;
      op: 'text.clear';
    }
  | {
      at: string;
      op: 'choice';
      /**
       * @maxItems 16
       */
      options: Option[];
      dest: string;
    }
  | {
      at: string;
      op: 'stage.put';
      object: StageObject;
    }
  | {
      at: string;
      op: 'stage.remove';
      id: string;
    }
  | {
      at: string;
      op: 'stage.animate';
      task: string;
      id: string;
      to: Position;
      duration: number;
      policy: 'replace' | 'reject';
    }
  | {
      at: string;
      op: 'task.join';
      group: string;
      /**
       * @maxItems 64
       */
      members: string[];
    }
  | {
      at: string;
      op: 'wait.delay';
      task: string;
      duration: number;
    }
  | {
      at: string;
      op: 'audio.play';
      task: string;
      asset: string;
      channel: 'bgm' | 'voice' | 'sfx';
      gain: number;
      loop: boolean;
      restore: 'replay' | 'stop';
    }
  | {
      at: string;
      op: 'audio.stop';
      channel: 'bgm' | 'voice' | 'sfx';
    }
  | {
      at: string;
      op: 'audio.gain';
      channel: 'bgm' | 'voice' | 'sfx';
      gain: number;
    }
  | {
      at: string;
      op: 'profile.set';
      key: string;
      value: Value;
    }
  | {
      at: string;
      op: 'profile.flush';
    }
  | {
      at: string;
      op: 'checkpoint';
    }
  | {
      at: string;
      op: 'save.policy';
      allow: boolean;
    }
  | {
      at: string;
      op: 'extension.invoke';
      operation: string;
      version: number;
      argsSchema: SchemaRef;
      args: JsonValue;
    }
  | {
      at: string;
      op: 'profile.i32.add.checked';
      key: string;
      delta: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Operand".
 */
export type Operand =
  | {
      literal: Value;
    }
  | {
      slot: string;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "JsonValue".
 */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };
/**
 * @maxItems 10000
 *
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SourceMap".
 */
export type SourceMap = {
  at: string;
  source: SourceLocation;
}[];
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TaskStatus".
 */
export type TaskStatus = 'running' | 'blocked' | 'completed' | 'cancelled' | 'superseded' | 'failed';
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Wait".
 */
export type Wait =
  | {
      kind: 'text';
      at: string;
      prompt: number;
    }
  | {
      kind: 'choice';
      at: string;
      prompt: number;
      /**
       * @maxItems 16
       */
      options: Option[];
      dest: string;
    }
  | {
      kind: 'group';
      at: string;
      group: string;
    }
  | {
      kind: 'delay';
      at: string;
      task: string;
    }
  | {
      kind: 'flush';
      at: string;
    }
  | {
      kind: 'operation';
      at: string;
      invocation: string;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "OperationAction".
 */
export type OperationAction =
  | {
      type: 'set';
      dest: string;
      value: Value;
    }
  | {
      type: 'profile.set';
      key: string;
      value: Value;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "OperationFlow".
 */
export type OperationFlow =
  | {
      kind: 'continue';
    }
  | {
      kind: 'jump';
      target: string;
    }
  | {
      kind: 'wait';
      wait: OperationWait;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "RecipeOpcode".
 */
export type RecipeOpcode =
  | 'value.set'
  | 'i32.add.checked'
  | 'stage.put'
  | 'stage.remove'
  | 'text.clear'
  | 'audio.play'
  | 'audio.stop'
  | 'audio.gain'
  | 'profile.set'
  | 'profile.i32.add.checked'
  | 'extension.invoke';
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ProgressChangeWire".
 */
export type ProgressChangeWire =
  | {
      seq: number;
      type: 'read';
      unit: string;
    }
  | {
      seq: number;
      type: 'set';
      key: string;
      value: Value;
    };

export interface Wire {
  program: Program;
  snapshot: Snapshot;
  profile: Profile;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Program".
 */
export interface Program {
  version: 1;
  gameId: string;
  release: string;
  entry: string;
  /**
   * @maxItems 32
   */
  capabilities: string[];
  /**
   * @maxItems 256
   */
  assets: Asset[];
  /**
   * @maxItems 128
   */
  globals: Slot[];
  /**
   * @maxItems 256
   */
  functions: Function[];
  title: string;
  sourceMap?: SourceMap;
  /**
   * @maxItems 10000
   */
  obligations?: PortObligation[];
  /**
   * @maxItems 10000
   */
  behaviorMappings?: BehaviorMapping[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Asset".
 */
export interface Asset {
  id: string;
  kind: 'image' | 'audio';
  path: string;
  sha256: string;
  mime: 'image/svg+xml' | 'image/png' | 'audio/wav';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Slot".
 */
export interface Slot {
  id: string;
  kind: ValueKind;
  initial: Value;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Function".
 */
export interface Function {
  id: string;
  layout: 1;
  /**
   * @maxItems 32
   */
  params: Slot[];
  /**
   * @maxItems 128
   */
  locals: Slot[];
  returns: 'void' | 'i32' | 'string' | 'bool';
  entry: string;
  /**
   * @maxItems 10000
   */
  code: Instruction[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Option".
 */
export interface Option {
  id: string;
  text: string;
  target: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageObject".
 */
export interface StageObject {
  id: string;
  asset: string;
  position: Position;
  z: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Position".
 */
export interface Position {
  x: number;
  y: number;
  alpha: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SchemaRef".
 */
export interface SchemaRef {
  id: string;
  signature: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SourceLocation".
 */
export interface SourceLocation {
  file: string;
  line: number;
  column: number;
  locator?: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PortObligation".
 */
export interface PortObligation {
  id: string;
  kind: 'behavior';
  required: boolean;
  description: string;
  source: SourceLocation;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "BehaviorMapping".
 */
export interface BehaviorMapping {
  obligation: string;
  /**
   * @minItems 1
   * @maxItems 256
   */
  addresses: [string, ...string[]];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Snapshot".
 */
export interface Snapshot {
  version: 1;
  release: string;
  /**
   * @maxItems 64
   */
  frames: Frame[];
  globals: {
    [k: string]: Value;
  };
  /**
   * @maxItems 128
   */
  stage: StageObject[];
  text: TextState | null;
  /**
   * @maxItems 10000
   */
  history: TextState[];
  /**
   * @maxItems 256
   */
  tasks: Task[];
  /**
   * @maxItems 256
   */
  groups: TaskGroup[];
  wait: Wait | null;
  saveAllowed: boolean;
  status: 'running' | 'waiting' | 'ended' | 'failed';
  counter: number;
  profileBasis: number;
  logicalTime: number;
  /**
   * @maxItems 256
   */
  invocations?: SavedInvocation[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Frame".
 */
export interface Frame {
  functionId: string;
  layout: 1;
  pc: string;
  locals: {
    [k: string]: Value;
  };
  returnTo?: {
    callAt: string;
    returnAt: string;
    dest?: string;
  };
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextState".
 */
export interface TextState {
  textId: string;
  revision: string;
  speaker: string;
  content: string;
  revealed: number;
  prompt: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Task".
 */
export interface Task {
  id: string;
  status: TaskStatus;
  kind: 'animation' | 'delay' | 'audio';
  elapsed: number;
  duration: number;
  attempt: number;
  target?: string;
  from?: Position;
  to?: Position;
  asset?: string;
  channel?: 'bgm' | 'voice' | 'sfx';
  gain?: number;
  loop?: boolean;
  restore?: 'replay' | 'stop';
  name: string;
  at?: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TaskGroup".
 */
export interface TaskGroup {
  id: string;
  /**
   * @maxItems 64
   */
  members: string[];
  consumed: boolean;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SavedInvocation".
 */
export interface SavedInvocation {
  id: string;
  operation: string;
  version: number;
  implementation: string;
  at: string;
  frameDepth: number;
  argsSchema: SchemaRef;
  stateSchema: SchemaRef;
  resumeSchema: SchemaRef;
  args: JsonValue;
  state: JsonValue;
  phase: 'waiting' | 'completed';
  wait: OperationWait | null;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "OperationWait".
 */
export interface OperationWait {
  resumeKind: string;
  schema: SchemaRef;
  request: string;
  attempt: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Profile".
 */
export interface Profile {
  revision: number;
  values: {
    [k: string]: Value;
  };
  /**
   * @maxItems 20000
   */
  read: string[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "OperationEffect".
 */
export interface OperationEffect {
  type: 'audio';
  task: string;
  asset: string;
  channel: 'bgm' | 'voice' | 'sfx';
  gain: number;
  loop: boolean;
  restore: 'replay' | 'stop';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "OperationOutcome".
 */
export interface OperationOutcome {
  state: JsonValue;
  /**
   * @maxItems 64
   */
  actions: OperationAction[];
  /**
   * @maxItems 16
   */
  effects: OperationEffect[];
  flow: OperationFlow;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "OperationResume".
 */
export interface OperationResume {
  type: 'operation';
  invocation: string;
  request: string;
  attempt: number;
  schema: SchemaRef;
  data: JsonValue;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "RestoreRecipe".
 */
export interface RestoreRecipe {
  version: 1;
  id: string;
  maxSteps: number;
  /**
   * @maxItems 128
   */
  steps: Instruction[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SlotMetadata".
 */
export interface SlotMetadata {
  profileId: string;
  label: string;
  recipe?: RestoreRecipe;
  onLoad?: RestoreRecipe;
  provenance?: JsonValue;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StoreImport".
 */
export interface StoreImport {
  id: string;
  slot: string;
  snapshot: Snapshot;
  profile: Profile;
  metadata: SlotMetadata;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StoreImportReceipt".
 */
export interface StoreImportReceipt {
  id: string;
  slot: string;
  profileId: string;
  revision: number;
  signature: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ProgressBatchWire".
 */
export interface ProgressBatchWire {
  id: string;
  baseRevision: number;
  through: number;
  /**
   * @maxItems 10000
   */
  changes: ProgressChangeWire[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "BackupProfile".
 */
export interface BackupProfile {
  id: string;
  profile: Profile;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "BackupSlot".
 */
export interface BackupSlot {
  slot: string;
  revision: number;
  snapshot: Snapshot;
  previous: Snapshot | null;
  metadata: SlotMetadata;
  previousMetadata?: SlotMetadata;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PortableBackup".
 */
export interface PortableBackup {
  format: 'galbox-backup';
  version: 1;
  gameId: string;
  series: string;
  /**
   * @maxItems 64
   */
  profiles: BackupProfile[];
  /**
   * @maxItems 128
   */
  slots: BackupSlot[];
  release: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StoreBackupRestore".
 */
export interface StoreBackupRestore {
  id: string;
  backup: PortableBackup;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "BackupRestoreReceipt".
 */
export interface BackupRestoreReceipt {
  id: string;
  signature: string;
  /**
   * @maxItems 64
   */
  profiles: {
    id: string;
    restoredId: string;
  }[];
  /**
   * @maxItems 128
   */
  slots: {
    slot: string;
    restoredSlot: string;
  }[];
}
