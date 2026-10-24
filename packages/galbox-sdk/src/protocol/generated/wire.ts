/* Generated from schema/protocol.json. Do not edit. */

export type ValueKind = 'i32' | 'bool' | 'string';
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
    };
export type Operand =
  | {
      literal: Value;
    }
  | {
      slot: string;
    };
export type TaskStatus = 'running' | 'blocked' | 'completed' | 'cancelled' | 'superseded' | 'failed';
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
    };

export interface Wire {
  program: Program;
  snapshot: Snapshot;
  profile: Profile;
}
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
}
export interface Asset {
  id: string;
  kind: 'image' | 'audio';
  path: string;
  sha256: string;
  mime: 'image/svg+xml' | 'image/png' | 'audio/wav';
}
export interface Slot {
  id: string;
  kind: ValueKind;
  initial: Value;
}
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
export interface Option {
  id: string;
  text: string;
  target: string;
}
export interface StageObject {
  id: string;
  asset: string;
  position: Position;
  z: number;
}
export interface Position {
  x: number;
  y: number;
  alpha: number;
}
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
}
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
export interface TextState {
  textId: string;
  revision: string;
  speaker: string;
  content: string;
  revealed: number;
  prompt: number;
}
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
}
export interface TaskGroup {
  id: string;
  /**
   * @maxItems 64
   */
  members: string[];
  consumed: boolean;
}
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
