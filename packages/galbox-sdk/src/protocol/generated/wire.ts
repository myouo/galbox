/* Generated from schema/protocol.json. Do not edit. */

/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ValueKind".
 */
export type ValueKind = 'i32' | 'bool' | 'string' | 'i64' | 'f64' | 'null' | 'list' | 'dict';
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
    }
  | I64Value
  | F64Value
  | NullValue
  | ListValue
  | DictValue;
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
    }
  | {
      at: string;
      op: 'text.template';
      textId: string;
      revision: string;
      speaker: StringExpression;
      content: StringExpression;
    }
  | {
      at: string;
      op: 'random.i32';
      dest: string;
      min: I32Expression;
      max: I32Expression;
    }
  | {
      at: string;
      op: 'rng.seed';
      seed: number;
    }
  | {
      at: string;
      op: 'text.rich';
      textId: string;
      revision: string;
      speaker: StringExpression;
      /**
       * @minItems 1
       * @maxItems 128
       */
      runs: [RichTextSourceRun, ...RichTextSourceRun[]];
    }
  | {
      at: string;
      op: 'text.window.select';
      window: string;
    }
  | {
      at: string;
      op: 'text.window.clear';
      window: string;
    }
  | {
      at: string;
      op: 'text.window.visible';
      window: string;
      visible: boolean;
    }
  | {
      at: string;
      op: 'text.window.theme';
      window: string;
      theme: string;
    }
  | {
      op: 'profile.expression';
      at: string;
      key: string;
      value: Expression;
    }
  | {
      op: 'stage.image';
      at: string;
      id: string;
      asset: string;
      pose: StagePoseExpressions;
      style?: StageStyle;
    }
  | {
      op: 'stage.pose';
      at: string;
      task: string;
      duration: I32Expression;
      policy: 'reject' | 'replace';
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      id: string;
      to: StagePoseExpressions;
      relative: boolean;
    }
  | {
      op: 'stage.filter';
      at: string;
      task: string;
      duration: I32Expression;
      policy: 'reject' | 'replace';
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      target: StageTarget;
      to: StageFiltersExpressions;
    }
  | {
      op: 'stage.camera';
      at: string;
      task: string;
      duration: I32Expression;
      policy: 'reject' | 'replace';
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      to: StageCameraExpressions;
    }
  | {
      op: 'stage.fade';
      at: string;
      task: string;
      duration: I32Expression;
      policy: 'reject' | 'replace';
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      color: string;
      alpha: StageNumberExpression;
    }
  | {
      op: 'stage.transition';
      at: string;
      task: string;
      duration: I32Expression;
      policy: 'reject' | 'replace';
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      id: string;
      asset: string;
    }
  | {
      op: 'stage.shake';
      at: string;
      task: string;
      duration: I32Expression;
      policy: 'reject' | 'replace';
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      target: StageTarget;
      amplitudeX: StageNumberExpression;
      amplitudeY: StageNumberExpression;
      periodMs: I32Expression;
    }
  | {
      op: 'stage.style';
      at: string;
      id: string;
      style: StageStyle;
    }
  | {
      op: 'task.cancel';
      at: string;
      task: string;
    }
  | {
      op: 'task.finish';
      at: string;
      task: string;
    }
  | {
      op: 'audio.track';
      at: string;
      task: string;
      asset: string;
      channel: 'bgm' | 'voice' | 'sfx';
      gain: StageNumberExpression;
      loop: boolean;
      loopStartMs: I32Expression;
      loopEndMs: I32Expression | null;
      restore: 'replay' | 'stop';
    }
  | {
      op: 'audio.fade';
      at: string;
      task: string;
      channel: 'bgm' | 'voice' | 'sfx';
      to: StageNumberExpression;
      duration: I32Expression;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      policy: 'reject' | 'replace';
    }
  | {
      op: 'audio.duck';
      at: string;
      enabled: boolean;
      level: StageNumberExpression;
      attackMs: I32Expression;
      releaseMs: I32Expression;
    }
  | {
      op: 'audio.policy';
      at: string;
      stopVoiceOnAdvance: boolean;
    }
  | {
      op: 'audio.wait';
      at: string;
      task: string;
    }
  | {
      at: string;
      op: 'interaction.prompt';
      dest: string;
      label: string;
      /**
       * @minItems 1
       * @maxItems 16
       */
      options: [InteractionOption, ...InteractionOption[]];
      deadlineMs: null | I32Expression;
      timeout: null | {
        id: string;
        target: string;
      };
    }
  | {
      at: string;
      op: 'video.play';
      task: string;
      asset: string;
      rect: InteractionRect;
      gain: number;
      skippable: boolean;
      restore: 'replay' | 'forbid';
    }
  | {
      op: 'flow.node';
      at: string;
      node: string;
    }
  | {
      op: 'flow.unlock';
      at: string;
      node: string;
    }
  | {
      op: 'extras.unlock';
      at: string;
      entry: string;
    }
  | {
      op: 'extras.check';
      at: string;
    }
  | {
      op: 'extras.scene';
      at: string;
      entry: string;
    }
  | {
      op: 'ui.show';
      at: string;
      screen: string;
    }
  | {
      op: 'ui.hide';
      at: string;
    }
  | {
      op: 'ui.wait';
      at: string;
      screen: string;
      dest: string;
      /**
       * @minItems 1
       * @maxItems 64
       */
      buttons: [UIButtonBinding, ...UIButtonBinding[]];
      /**
       * @minItems 0
       * @maxItems 64
       */
      fields: UIFieldBinding[];
    }
  | {
      op: 'ui.text';
      at: string;
      screen: string;
      control: string;
      value: StringExpression;
    }
  | {
      op: 'ui.visible';
      at: string;
      screen: string;
      control: string;
      value: BoolExpression;
    }
  | {
      op: 'ui.enabled';
      at: string;
      screen: string;
      control: string;
      value: BoolExpression;
    }
  | {
      op: 'ui.toggle';
      at: string;
      screen: string;
      control: string;
      value: BoolExpression;
    }
  | {
      op: 'ui.range';
      at: string;
      screen: string;
      control: string;
      value: I32Expression;
    }
  | {
      op: 'ui.input';
      at: string;
      screen: string;
      control: string;
      value: StringExpression;
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
    }
  | {
      expression: Expression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Expression".
 */
export type Expression =
  | I32Expression
  | BoolExpression
  | StringExpression
  | I64Expression
  | F64Expression
  | NullExpression
  | ListExpression
  | DictExpression;
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "I32Expression".
 */
export type I32Expression =
  | {
      kind: 'i32';
      op: 'literal';
      value: number;
    }
  | {
      kind: 'i32';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'i32';
      op: 'profile';
      key: string;
      fallback: number;
    }
  | {
      kind: 'i32';
      op: 'if';
      condition: BoolExpression;
      yes: I32Expression;
      no: I32Expression;
    }
  | {
      kind: 'i32';
      op: 'add' | 'sub' | 'mul' | 'div' | 'mod' | 'min' | 'max';
      left: I32Expression;
      right: I32Expression;
    }
  | {
      kind: 'i32';
      op: 'neg' | 'abs';
      value: I32Expression;
    }
  | {
      kind: 'i32';
      op: 'length';
      text: StringExpression;
    }
  | {
      kind: 'i32';
      op: 'convert';
      sourceKind: 'i64';
      value: I64Expression;
    }
  | {
      kind: 'i32';
      op: 'convert';
      sourceKind: 'f64';
      value: F64Expression;
    }
  | {
      kind: 'i32';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'i32';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    }
  | {
      kind: 'i32';
      op: 'list.length';
      list: ListExpression;
    }
  | {
      kind: 'i32';
      op: 'dict.size';
      dictionary: DictExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "BoolExpression".
 */
export type BoolExpression =
  | {
      kind: 'bool';
      op: 'literal';
      value: boolean;
    }
  | {
      kind: 'bool';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'bool';
      op: 'profile';
      key: string;
      fallback: boolean;
    }
  | {
      kind: 'bool';
      op: 'if';
      condition: BoolExpression;
      yes: BoolExpression;
      no: BoolExpression;
    }
  | {
      kind: 'bool';
      op: 'and' | 'or';
      left: BoolExpression;
      right: BoolExpression;
    }
  | {
      kind: 'bool';
      op: 'not';
      value: BoolExpression;
    }
  | {
      kind: 'bool';
      op: 'contains' | 'startsWith' | 'endsWith';
      text: StringExpression;
      search: StringExpression;
    }
  | {
      kind: 'bool';
      op: 'read';
      textId: string;
      revision: string;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';
      operandKind: 'i32';
      left: I32Expression;
      right: I32Expression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne';
      operandKind: 'bool';
      left: BoolExpression;
      right: BoolExpression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';
      operandKind: 'string';
      left: StringExpression;
      right: StringExpression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';
      operandKind: 'i64';
      left: I64Expression;
      right: I64Expression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';
      operandKind: 'f64';
      left: F64Expression;
      right: F64Expression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne';
      operandKind: 'null';
      left: NullExpression;
      right: NullExpression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne';
      operandKind: 'list';
      left: ListExpression;
      right: ListExpression;
    }
  | {
      kind: 'bool';
      op: 'eq' | 'ne';
      operandKind: 'dict';
      left: DictExpression;
      right: DictExpression;
    }
  | {
      kind: 'bool';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'bool';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    }
  | {
      kind: 'bool';
      op: 'dict.has';
      dictionary: DictExpression;
      key: StringExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StringExpression".
 */
export type StringExpression =
  | {
      kind: 'string';
      op: 'literal';
      value: string;
    }
  | {
      kind: 'string';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'string';
      op: 'profile';
      key: string;
      fallback: string;
    }
  | {
      kind: 'string';
      op: 'if';
      condition: BoolExpression;
      yes: StringExpression;
      no: StringExpression;
    }
  | {
      kind: 'string';
      op: 'concat';
      /**
       * @minItems 1
       * @maxItems 64
       */
      parts: [StringExpression, ...StringExpression[]];
    }
  | {
      kind: 'string';
      op: 'slice';
      text: StringExpression;
      start: I32Expression;
      end: I32Expression;
    }
  | {
      kind: 'string';
      op: 'format';
      operandKind: 'i32';
      value: I32Expression;
    }
  | {
      kind: 'string';
      op: 'format';
      operandKind: 'bool';
      value: BoolExpression;
    }
  | {
      kind: 'string';
      op: 'format';
      operandKind: 'i64';
      value: I64Expression;
    }
  | {
      kind: 'string';
      op: 'format';
      operandKind: 'f64';
      value: F64Expression;
    }
  | {
      kind: 'string';
      op: 'format';
      operandKind: 'null';
      value: NullExpression;
    }
  | {
      kind: 'string';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'string';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "I64Expression".
 */
export type I64Expression =
  | {
      kind: 'i64';
      op: 'literal';
      value: string;
    }
  | {
      kind: 'i64';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'i64';
      op: 'profile';
      key: string;
      fallback: string;
    }
  | {
      kind: 'i64';
      op: 'if';
      condition: BoolExpression;
      yes: I64Expression;
      no: I64Expression;
    }
  | {
      kind: 'i64';
      op: 'add' | 'sub' | 'mul' | 'div' | 'mod' | 'min' | 'max';
      left: I64Expression;
      right: I64Expression;
    }
  | {
      kind: 'i64';
      op: 'neg' | 'abs';
      value: I64Expression;
    }
  | {
      kind: 'i64';
      op: 'convert';
      sourceKind: 'i32';
      value: I32Expression;
    }
  | {
      kind: 'i64';
      op: 'convert';
      sourceKind: 'f64';
      value: F64Expression;
    }
  | {
      kind: 'i64';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'i64';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "F64Expression".
 */
export type F64Expression =
  | {
      kind: 'f64';
      op: 'literal';
      value: string;
    }
  | {
      kind: 'f64';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'f64';
      op: 'profile';
      key: string;
      fallback: string;
    }
  | {
      kind: 'f64';
      op: 'if';
      condition: BoolExpression;
      yes: F64Expression;
      no: F64Expression;
    }
  | {
      kind: 'f64';
      op: 'add' | 'sub' | 'mul' | 'div' | 'mod' | 'min' | 'max';
      left: F64Expression;
      right: F64Expression;
    }
  | {
      kind: 'f64';
      op: 'neg' | 'abs' | 'floor' | 'ceil' | 'trunc';
      value: F64Expression;
    }
  | {
      kind: 'f64';
      op: 'convert';
      sourceKind: 'i32';
      value: I32Expression;
    }
  | {
      kind: 'f64';
      op: 'convert';
      sourceKind: 'i64';
      value: I64Expression;
    }
  | {
      kind: 'f64';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'f64';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ListExpression".
 */
export type ListExpression =
  | {
      kind: 'list';
      op: 'literal';
      /**
       * @maxItems 256
       */
      value: Value[];
    }
  | {
      kind: 'list';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'list';
      op: 'profile';
      key: string;
      /**
       * @maxItems 256
       */
      fallback: Value[];
    }
  | {
      kind: 'list';
      op: 'if';
      condition: BoolExpression;
      yes: ListExpression;
      no: ListExpression;
    }
  | {
      kind: 'list';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'list';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    }
  | {
      kind: 'list';
      op: 'list';
      /**
       * @maxItems 256
       */
      items: Expression[];
    }
  | {
      kind: 'list';
      op: 'list.set';
      list: ListExpression;
      index: I32Expression;
      item: Expression;
    }
  | {
      kind: 'list';
      op: 'list.push';
      list: ListExpression;
      item: Expression;
    }
  | {
      kind: 'list';
      op: 'list.slice';
      list: ListExpression;
      start: I32Expression;
      end: I32Expression;
    }
  | {
      kind: 'list';
      op: 'list.concat';
      left: ListExpression;
      right: ListExpression;
    }
  | {
      kind: 'list';
      op: 'dict.keys';
      dictionary: DictExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "DictExpression".
 */
export type DictExpression =
  | {
      kind: 'dict';
      op: 'literal';
      /**
       * @maxItems 64
       */
      value: {
        key: string;
        value: Value;
      }[];
    }
  | {
      kind: 'dict';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'dict';
      op: 'profile';
      key: string;
      /**
       * @maxItems 64
       */
      fallback: {
        key: string;
        value: Value;
      }[];
    }
  | {
      kind: 'dict';
      op: 'if';
      condition: BoolExpression;
      yes: DictExpression;
      no: DictExpression;
    }
  | {
      kind: 'dict';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'dict';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
    }
  | {
      kind: 'dict';
      op: 'dict';
      /**
       * @maxItems 64
       */
      entries: {
        key: string;
        value: Expression;
      }[];
    }
  | {
      kind: 'dict';
      op: 'dict.set';
      dictionary: DictExpression;
      key: StringExpression;
      item: Expression;
    }
  | {
      kind: 'dict';
      op: 'dict.remove';
      dictionary: DictExpression;
      key: StringExpression;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "NullExpression".
 */
export type NullExpression =
  | {
      kind: 'null';
      op: 'literal';
      value: null;
    }
  | {
      kind: 'null';
      op: 'slot';
      id: string;
    }
  | {
      kind: 'null';
      op: 'profile';
      key: string;
      fallback: null;
    }
  | {
      kind: 'null';
      op: 'if';
      condition: BoolExpression;
      yes: NullExpression;
      no: NullExpression;
    }
  | {
      kind: 'null';
      op: 'list.at';
      list: ListExpression;
      index: I32Expression;
    }
  | {
      kind: 'null';
      op: 'dict.get';
      dictionary: DictExpression;
      key: StringExpression;
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
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "RichTextSourceRun".
 */
export type RichTextSourceRun =
  | {
      kind: 'text';
      content: StringExpression;
      style?: TextStyle;
    }
  | {
      kind: 'ruby';
      content: StringExpression;
      reading: StringExpression;
      style?: TextStyle;
    }
  | {
      kind: 'break';
    }
  | {
      kind: 'pause';
      duration: number;
    }
  | {
      kind: 'speed';
      intervalMs: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextEffect".
 */
export type TextEffect =
  | {
      kind: 'fade';
      duration: number;
    }
  | {
      kind: 'wave';
      amplitude: number;
      periodMs: number;
    }
  | {
      kind: 'shake';
      amplitude: number;
      periodMs: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageNumberExpression".
 */
export type StageNumberExpression = I32Expression | F64Expression;
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageTarget".
 */
export type StageTarget =
  | {
      kind: 'object';
      id: string;
    }
  | {
      kind: 'camera';
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
 * via the `definition` "RngConfig".
 */
export type RngConfig =
  | {
      algorithm: 'lcg32@1';
      seed: number;
    }
  | {
      algorithm: 'lcg32@1';
      seedSource: 'host';
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextFont".
 */
export type TextFont =
  | {
      kind: 'system';
      family: 'serif' | 'sans-serif' | 'monospace';
    }
  | {
      kind: 'asset';
      asset: string;
      fallback: 'serif' | 'sans-serif' | 'monospace';
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ExtraEntry".
 */
export type ExtraEntry =
  | {
      id: string;
      title: string;
      description: string;
      unlock: BoolExpression;
      reveal: 'always' | 'unlocked';
      kind: 'cg';
      /**
       * @minItems 1
       * @maxItems 16
       */
      images: [string, ...string[]];
    }
  | {
      id: string;
      title: string;
      description: string;
      unlock: BoolExpression;
      reveal: 'always' | 'unlocked';
      kind: 'music';
      asset: string;
      gain: number;
      loop: boolean;
    }
  | {
      id: string;
      title: string;
      description: string;
      unlock: BoolExpression;
      reveal: 'always' | 'unlocked';
      kind: 'scene';
      entry: string;
    }
  | {
      id: string;
      title: string;
      description: string;
      unlock: BoolExpression;
      reveal: 'always' | 'unlocked';
      kind: 'achievement';
      icon: string | null;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIControl".
 */
export type UIControl =
  | {
      id: string;
      rect: InteractionRect;
      text: string;
      visible: boolean;
      enabled: boolean;
      style: UIStyle;
      kind: 'label';
    }
  | {
      id: string;
      rect: InteractionRect;
      text: string;
      visible: boolean;
      enabled: boolean;
      style: UIStyle;
      kind: 'image';
      asset: string;
    }
  | {
      id: string;
      rect: InteractionRect;
      text: string;
      visible: boolean;
      enabled: boolean;
      style: UIStyle;
      kind: 'button';
    }
  | {
      id: string;
      rect: InteractionRect;
      text: string;
      visible: boolean;
      enabled: boolean;
      style: UIStyle;
      kind: 'toggle';
      value: boolean;
    }
  | {
      id: string;
      rect: InteractionRect;
      text: string;
      visible: boolean;
      enabled: boolean;
      style: UIStyle;
      kind: 'range';
      value: number;
      min: number;
      max: number;
      step: number;
    }
  | {
      id: string;
      rect: InteractionRect;
      text: string;
      visible: boolean;
      enabled: boolean;
      style: UIStyle;
      kind: 'input';
      value: string;
      maxLength: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextRun".
 */
export type TextRun =
  | {
      kind: 'text';
      content: string;
      style?: TextStyle;
    }
  | {
      kind: 'ruby';
      content: string;
      reading: string;
      style?: TextStyle;
    }
  | {
      kind: 'break';
    }
  | {
      kind: 'pause';
      duration: number;
    }
  | {
      kind: 'speed';
      intervalMs: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TaskStatus".
 */
export type TaskStatus = 'running' | 'blocked' | 'completed' | 'cancelled' | 'superseded' | 'failed';
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageTaskState".
 */
export type StageTaskState =
  | {
      type: 'pose';
      signature: string;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      target: string;
      /**
       * @minItems 1
       * @maxItems 12
       */
      fields: [
        (
          | 'x'
          | 'y'
          | 'alpha'
          | 'scaleX'
          | 'scaleY'
          | 'rotation'
          | 'skewX'
          | 'skewY'
          | 'pivotX'
          | 'pivotY'
          | 'anchorX'
          | 'anchorY'
        ),
        ...(
          | 'x'
          | 'y'
          | 'alpha'
          | 'scaleX'
          | 'scaleY'
          | 'rotation'
          | 'skewX'
          | 'skewY'
          | 'pivotX'
          | 'pivotY'
          | 'anchorX'
          | 'anchorY'
        )[]
      ];
      from: StagePose;
      to: StagePose;
    }
  | {
      type: 'filter';
      signature: string;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      target: StageTarget;
      /**
       * @minItems 1
       * @maxItems 3
       */
      fields: ['blur' | 'brightness' | 'grayscale', ...('blur' | 'brightness' | 'grayscale')[]];
      from: StageFilters;
      to: StageFilters;
    }
  | {
      type: 'camera';
      signature: string;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      /**
       * @minItems 1
       * @maxItems 4
       */
      fields: ['x' | 'y' | 'zoom' | 'rotation', ...('x' | 'y' | 'zoom' | 'rotation')[]];
      from: StageCamera;
      to: StageCamera;
    }
  | {
      type: 'fade';
      signature: string;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      from: number;
      to: number;
      color: string;
    }
  | {
      type: 'transition';
      signature: string;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      target: string;
      /**
       * @minItems 1
       * @maxItems 4
       */
      from: [StageLayer, ...StageLayer[]];
      to: string;
    }
  | {
      type: 'shake';
      signature: string;
      easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
      target: StageTarget;
      amplitudeX: number;
      amplitudeY: number;
      periodMs: number;
    };
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
    }
  | {
      kind: 'media';
      at: string;
      task: string;
    }
  | InteractionWait
  | {
      kind: 'video';
      at: string;
      prompt: number;
      task: string;
    }
  | UIWait;
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
  | 'extension.invoke'
  | 'profile.expression';
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
    }
  | {
      seq: number;
      type: 'flow';
      value: FlowProgress;
    }
  | {
      seq: number;
      type: 'extras';
      value: ExtrasProgress;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ResourceFact".
 */
export type ResourceFact =
  | {
      kind: 'image';
      id: string;
      bytes: number;
      width: number;
      height: number;
    }
  | {
      kind: 'audio';
      id: string;
      bytes: number;
      channels: number;
      sampleRate: number;
      frames: number;
      encoding?: 'wav' | 'mp3' | 'vorbis' | 'opus';
      playback?: 'buffer' | 'element';
    }
  | {
      id: string;
      kind: 'font';
      bytes: number;
      format: 'truetype';
      glyphs: number;
    }
  | {
      kind: 'video';
      id: string;
      bytes: number;
      format: 'webm';
      codec: 'vp8';
      width: number;
      height: number;
      durationMs: number;
      audio: 'none' | 'opus' | 'vorbis';
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PreferencesValue".
 */
export type PreferencesValue = LegacyPlayerPreferences | PlayerPreferences;
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StoredPreferencesRecord".
 */
export type StoredPreferencesRecord = LegacyPreferencesRecord | PreferencesRecord;
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "InteractionEvent".
 */
export type InteractionEvent =
  | {
      type: 'interaction.activate';
      prompt: number;
      attempt: number;
    }
  | {
      type: 'interaction.choose';
      prompt: number;
      attempt: number;
      inputId: string;
      option: string;
    }
  | {
      type: 'interaction.point';
      prompt: number;
      attempt: number;
      inputId: string;
      x: number;
      y: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ResolvedStreamIdentity".
 */
export type ResolvedStreamIdentity =
  | {
      gameId: string;
      release: string;
      catalogSha256: string;
      assetId: string;
      expectedSha256: string;
      version: string;
      kind: 'audio';
      mime: 'audio/wav' | 'audio/mpeg' | 'audio/ogg';
    }
  | {
      gameId: string;
      release: string;
      catalogSha256: string;
      assetId: string;
      expectedSha256: string;
      version: string;
      kind: 'video';
      mime: 'video/webm';
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "IntegrityEvidence".
 */
export type IntegrityEvidence =
  | {
      level: 'expected';
      expectedSha256: string;
    }
  | {
      level: 'digest-verified';
      expectedSha256: string;
      verifiedSha256: string;
      bytes: number;
    }
  | {
      level: 'versioned-url';
      expectedSha256: string;
      version: string;
      etag: string;
      bytes: number;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIAction".
 */
export type UIAction =
  | {
      type: 'ui.click';
      control: string;
    }
  | {
      type: 'ui.toggle';
      control: string;
      value: boolean;
    }
  | {
      type: 'ui.range';
      control: string;
      value: number;
    }
  | {
      type: 'ui.input';
      control: string;
      value: string;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIEvent".
 */
export type UIEvent =
  | {
      type: 'ui.activate';
      prompt: number;
      attempt: number;
      generation: number;
    }
  | {
      type: 'ui.click';
      control: string;
      prompt: number;
      attempt: number;
      generation: number;
      inputId: string;
    }
  | {
      type: 'ui.toggle';
      control: string;
      value: boolean;
      prompt: number;
      attempt: number;
      generation: number;
      inputId: string;
    }
  | {
      type: 'ui.range';
      control: string;
      value: number;
      prompt: number;
      attempt: number;
      generation: number;
      inputId: string;
    }
  | {
      type: 'ui.input';
      control: string;
      value: string;
      prompt: number;
      attempt: number;
      generation: number;
      inputId: string;
    };
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SystemScreen".
 */
export type SystemScreen =
  'story' | 'title' | 'menu' | 'save' | 'load' | 'history' | 'settings' | 'flowchart' | 'extras' | 'data';
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ToolbarAction".
 */
export type ToolbarAction = 'menu' | 'history' | 'auto' | 'quick-save' | 'voice' | 'skip';

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
  rng?: RngConfig;
  textLayout?: TextLayout;
  flowchart?: Flowchart;
  extras?: ExtrasCatalog;
  ui?: UICatalog;
  presentation?: GamePresentation;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Asset".
 */
export interface Asset {
  id: string;
  kind: 'image' | 'audio' | 'font' | 'video';
  path: string;
  sha256: string;
  mime: 'image/svg+xml' | 'image/png' | 'audio/wav' | 'font/ttf' | 'audio/mpeg' | 'audio/ogg' | 'video/webm';
  playback?: 'buffer' | 'element';
  transport?: {
    kind: 'versioned-url';
    version: string;
  };
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
 * via the `definition` "I64Value".
 */
export interface I64Value {
  kind: 'i64';
  value: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "F64Value".
 */
export interface F64Value {
  kind: 'f64';
  value: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "NullValue".
 */
export interface NullValue {
  kind: 'null';
  value: null;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ListValue".
 */
export interface ListValue {
  kind: 'list';
  /**
   * @maxItems 256
   */
  value: Value[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "DictValue".
 */
export interface DictValue {
  kind: 'dict';
  /**
   * @maxItems 64
   */
  value: {
    key: string;
    value: Value;
  }[];
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
  returns: 'void' | 'i32' | 'string' | 'bool' | 'i64' | 'f64' | 'null' | 'list' | 'dict';
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
  transform?: StageTransform;
  filters?: StageFilters;
  parent?: string;
  clip?: StageClip;
  blend?: 'normal' | 'add' | 'multiply' | 'screen';
  visible?: boolean;
  /**
   * @minItems 1
   * @maxItems 4
   */
  layers?: [StageLayer, ...StageLayer[]];
  shake?: StageOffset;
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
 * via the `definition` "StageTransform".
 */
export interface StageTransform {
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
  pivotX: number;
  pivotY: number;
  anchorX: number;
  anchorY: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageFilters".
 */
export interface StageFilters {
  blur: number;
  brightness: number;
  grayscale: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageClip".
 */
export interface StageClip {
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageLayer".
 */
export interface StageLayer {
  asset: string;
  weight: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageOffset".
 */
export interface StageOffset {
  x: number;
  y: number;
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
 * via the `definition` "TextStyle".
 */
export interface TextStyle {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  scale?: number;
  effect?: TextEffect;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StagePoseExpressions".
 */
export interface StagePoseExpressions {
  x?: StageNumberExpression;
  y?: StageNumberExpression;
  alpha?: StageNumberExpression;
  scaleX?: StageNumberExpression;
  scaleY?: StageNumberExpression;
  rotation?: StageNumberExpression;
  skewX?: StageNumberExpression;
  skewY?: StageNumberExpression;
  pivotX?: StageNumberExpression;
  pivotY?: StageNumberExpression;
  anchorX?: StageNumberExpression;
  anchorY?: StageNumberExpression;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageStyle".
 */
export interface StageStyle {
  parent?: string | null;
  z?: StageNumberExpression;
  blend?: 'normal' | 'add' | 'multiply' | 'screen';
  clip?: StageClip | null;
  visible?: boolean;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageFiltersExpressions".
 */
export interface StageFiltersExpressions {
  blur?: StageNumberExpression;
  brightness?: StageNumberExpression;
  grayscale?: StageNumberExpression;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageCameraExpressions".
 */
export interface StageCameraExpressions {
  x?: StageNumberExpression;
  y?: StageNumberExpression;
  zoom?: StageNumberExpression;
  rotation?: StageNumberExpression;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "InteractionOption".
 */
export interface InteractionOption {
  id: string;
  label: string;
  target: string;
  enabled: BoolExpression;
  rect?: InteractionRect;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "InteractionRect".
 */
export interface InteractionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIButtonBinding".
 */
export interface UIButtonBinding {
  control: string;
  target: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIFieldBinding".
 */
export interface UIFieldBinding {
  control: string;
  dest: string;
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
 * via the `definition` "TextLayout".
 */
export interface TextLayout {
  version: 1;
  initialWindow: string;
  /**
   * @minItems 1
   * @maxItems 16
   */
  themes: [TextTheme, ...TextTheme[]];
  /**
   * @minItems 1
   * @maxItems 8
   */
  windows: [TextWindow, ...TextWindow[]];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextTheme".
 */
export interface TextTheme {
  id: string;
  font: TextFont;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  speakerColor: string;
  background: string;
  backgroundOpacity: number;
  borderColor: string;
  borderWidth: number;
  padding: number;
  align: 'left' | 'center' | 'right';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextWindow".
 */
export interface TextWindow {
  id: string;
  mode: 'adv' | 'nvl';
  theme: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  z: number;
  visible: boolean;
  maxEntries: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Flowchart".
 */
export interface Flowchart {
  id: string;
  revision: string;
  /**
   * @minItems 1
   * @maxItems 16
   */
  chapters: [FlowChapter, ...FlowChapter[]];
  /**
   * @minItems 1
   * @maxItems 128
   */
  nodes: [FlowNode, ...FlowNode[]];
  /**
   * @minItems 0
   * @maxItems 256
   */
  edges: FlowEdge[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "FlowChapter".
 */
export interface FlowChapter {
  id: string;
  title: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "FlowNode".
 */
export interface FlowNode {
  id: string;
  chapter: string;
  title: string;
  description: string;
  column: number;
  row: number;
  entry: string | null;
  /**
   * @minItems 0
   * @maxItems 128
   */
  requires: string[];
  unlock: BoolExpression;
  gate: BoolExpression;
  reveal: 'always' | 'unlocked';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "FlowEdge".
 */
export interface FlowEdge {
  from: string;
  to: string;
  label: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ExtrasCatalog".
 */
export interface ExtrasCatalog {
  id: string;
  revision: string;
  /**
   * @minItems 1
   * @maxItems 128
   */
  entries: [ExtraEntry, ...ExtraEntry[]];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UICatalog".
 */
export interface UICatalog {
  id: string;
  revision: string;
  /**
   * @minItems 1
   * @maxItems 16
   */
  screens: [UIScreen, ...UIScreen[]];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIScreen".
 */
export interface UIScreen {
  id: string;
  title: string;
  background: string;
  /**
   * @minItems 1
   * @maxItems 64
   */
  controls: [UIControl, ...UIControl[]];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIStyle".
 */
export interface UIStyle {
  foreground: string;
  background: string;
  border: string;
  fontSize: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "GamePresentation".
 */
export interface GamePresentation {
  version: 1;
  id: string;
  revision: string;
  palette: GamePalette;
  radius: number;
  fontSize: number;
  font: {
    family: 'serif' | 'sans';
    asset: string | null;
  };
  title: {
    subtitle: string;
    credit: string;
    background: string | null;
    logo: string | null;
  };
  labels: GameLabels;
  /**
   * @minItems 1
   * @maxItems 6
   */
  toolbar: [
    'menu' | 'history' | 'auto' | 'quick-save' | 'voice' | 'skip',
    ...('menu' | 'history' | 'auto' | 'quick-save' | 'voice' | 'skip')[]
  ];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "GamePalette".
 */
export interface GamePalette {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "GameLabels".
 */
export interface GameLabels {
  start: string;
  continue: string;
  menu: string;
  save: string;
  load: string;
  history: string;
  settings: string;
  flowchart: string;
  extras: string;
  data: string;
  back: string;
  title: string;
  auto: string;
  quickSave: string;
  voice: string;
  skip: string;
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
  rng?: RngState;
  textLayout?: TextLayoutState;
  scene?: StageScene;
  audioState?: AudioState;
  streamCatalog?: string;
  historySession?: string;
  flow?: FlowRun;
  extrasSignature?: string;
  replayScene?: string;
  ui?: UIState;
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
  template?: {
    signature: string;
    at: string;
  };
  rich?: RichTextState;
  window?: {
    id: string;
    at: string;
  };
  voice?: VoiceRecipe;
  historyId?: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "RichTextState".
 */
export interface RichTextState {
  version: 1;
  segmentation: 'uax29-17.0.0@1';
  at: string;
  signature: string;
  /**
   * @minItems 1
   * @maxItems 128
   */
  runs: [TextRun, ...TextRun[]];
  cursor: number;
  elapsedMs: number;
  remainderMs: number;
  pauseRemainingMs: number;
  baseIntervalMs: number;
  /**
   * @maxItems 4096
   */
  revealedAt: (number | null)[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "VoiceRecipe".
 */
export interface VoiceRecipe {
  asset: string;
  at: string;
  signature: string;
  gain: number;
  restore: 'replay' | 'stop';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "Task".
 */
export interface Task {
  id: string;
  status: TaskStatus;
  kind: 'animation' | 'delay' | 'audio' | 'stage' | 'media' | 'audio-fade' | 'video';
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
  stageTask?: StageTaskState;
  mediaTask?: MediaTaskState;
  audioFade?: AudioFadeState;
  videoTask?: VideoTaskState;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StagePose".
 */
export interface StagePose {
  x: number;
  y: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
  pivotX: number;
  pivotY: number;
  anchorX: number;
  anchorY: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageCamera".
 */
export interface StageCamera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "MediaTaskState".
 */
export interface MediaTaskState {
  version: 1;
  signature: string;
  phase: 'pending' | 'playing' | 'ended' | 'blocked' | 'failed' | 'cancelled' | 'superseded';
  loopStartMs: number;
  loopEndMs: number | null;
  replay: boolean;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "AudioFadeState".
 */
export interface AudioFadeState {
  signature: string;
  channel: 'bgm' | 'voice' | 'sfx';
  from: number;
  to: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "VideoTaskState".
 */
export interface VideoTaskState {
  version: 1;
  signature: string;
  phase: 'pending' | 'playing' | 'ended' | 'skipped' | 'blocked' | 'failed';
  rect: InteractionRect;
  skippable: boolean;
  restore: 'replay' | 'forbid';
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
 * via the `definition` "InteractionWait".
 */
export interface InteractionWait {
  kind: 'interaction';
  at: string;
  prompt: number;
  attempt: number;
  phase: 'prepared' | 'active';
  dest: string;
  label: string;
  /**
   * @minItems 1
   * @maxItems 16
   */
  options: [ResolvedInteractionOption, ...ResolvedInteractionOption[]];
  signature: string;
  deadlineMs: null | number;
  elapsedMs: number;
  activeAt: null | number;
  timeout: null | {
    id: string;
    target: string;
  };
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ResolvedInteractionOption".
 */
export interface ResolvedInteractionOption {
  id: string;
  label: string;
  target: string;
  enabled: boolean;
  rect?: InteractionRect;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIWait".
 */
export interface UIWait {
  kind: 'ui';
  at: string;
  prompt: number;
  attempt: number;
  generation: number;
  phase: 'prepared' | 'active';
  signature: string;
  screen: string;
  dest: string;
  /**
   * @minItems 1
   * @maxItems 64
   */
  buttons: [UIButtonBinding, ...UIButtonBinding[]];
  /**
   * @minItems 0
   * @maxItems 64
   */
  fields: UIFieldBinding[];
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
 * via the `definition` "RngState".
 */
export interface RngState {
  algorithm: 'lcg32@1';
  state: number;
  draws: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextLayoutState".
 */
export interface TextLayoutState {
  version: 1;
  signature: string;
  active: string;
  /**
   * @minItems 1
   * @maxItems 8
   */
  windows: [
    {
      id: string;
      theme: string;
      visible: boolean;
      /**
       * @maxItems 32
       */
      entries: TextState[];
    },
    ...{
      id: string;
      theme: string;
      visible: boolean;
      /**
       * @maxItems 32
       */
      entries: TextState[];
    }[]
  ];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StageScene".
 */
export interface StageScene {
  version: 1;
  camera: StageCamera;
  filters: StageFilters;
  overlay: {
    color: string;
    alpha: number;
  };
  shake?: StageOffset;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "AudioState".
 */
export interface AudioState {
  version: 1;
  gains: {
    bgm: number;
    voice: number;
    sfx: number;
  };
  duck: {
    enabled: boolean;
    level: number;
    attackMs: number;
    releaseMs: number;
    value: number;
    from: number;
    to: number;
    elapsed: number;
    duration: number;
  };
  stopVoiceOnAdvance: boolean;
  pendingVoice?: VoiceRecipe;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "FlowRun".
 */
export interface FlowRun {
  signature: string;
  entryNode: string | null;
  current: string | null;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIState".
 */
export interface UIState {
  signature: string;
  active: UIActive | null;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "UIActive".
 */
export interface UIActive {
  at: string;
  generation: number;
  screen: UIScreen;
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
  flow?: FlowProgress;
  extras?: ExtrasProgress;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "FlowProgress".
 */
export interface FlowProgress {
  graphId: string;
  revision: string;
  signature: string;
  /**
   * @minItems 0
   * @maxItems 128
   */
  visited: string[];
  /**
   * @minItems 0
   * @maxItems 128
   */
  unlocked: string[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ExtrasProgress".
 */
export interface ExtrasProgress {
  catalogId: string;
  revision: string;
  signature: string;
  /**
   * @maxItems 128
   */
  unlocked: string[];
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
  kind?: 'manual' | 'quick' | 'auto';
  capture?: SaveCapture;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SaveCapture".
 */
export interface SaveCapture {
  id: string;
  sequence: number;
  logicalTime: number;
  createdAt: number;
  speaker: string;
  text: string;
  textId: string | null;
  thumbnail?: SaveThumbnail;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SaveThumbnail".
 */
export interface SaveThumbnail {
  width: 320;
  height: 180;
  dataURL: string;
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
  /**
   * @maxItems 128
   */
  histories?: {
    profileId: string;
    record: HistoryRecord;
  }[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "HistoryRecord".
 */
export interface HistoryRecord {
  revision: number;
  /**
   * @maxItems 64
   */
  entries: HistoryEntry[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "HistoryEntry".
 */
export interface HistoryEntry {
  id: string;
  release: string;
  text: TextState;
  snapshot: Snapshot | null;
  reason: string | null;
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
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ResourceBudget".
 */
export interface ResourceBudget {
  maxAssetBytes: number;
  maxEncodedBytes: number;
  maxTextureBytes: number;
  maxAudioBytes: number;
  maxImageSide: number;
  maxAudioMs: number;
  maxMediaMs?: number;
  maxVideoMs?: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "ReleaseManifest".
 */
export interface ReleaseManifest {
  format: 'galbox-release';
  version: 1;
  sdk: '0.1.0';
  protocol: 1;
  semantics: 'galbox-core@1';
  gameId: string;
  release: string;
  series: string;
  programSha256: string;
  registrySha256: string;
  assetsSha256: string;
  /**
   * @maxItems 256
   */
  resources: ResourceFact[];
  limits: ResourceBudget;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "AudioPreferences".
 */
export interface AudioPreferences {
  master: number;
  bgm: number;
  voice: number;
  sfx: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "TextPreferences".
 */
export interface TextPreferences {
  intervalMs: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PlayerPreferences".
 */
export interface PlayerPreferences {
  version: 2;
  audio: AudioPreferences;
  text: TextPreferences;
  playback: PlaybackPreferences;
  input: InputPreferences;
  display: DisplayPreferences;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PlaybackPreferences".
 */
export interface PlaybackPreferences {
  autoDelayMs: number;
  skipUnread: boolean;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "InputPreferences".
 */
export interface InputPreferences {
  /**
   * @maxItems 4
   */
  advance: (
    | 'Enter'
    | 'Space'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'KeyA'
    | 'KeyB'
    | 'KeyC'
    | 'KeyD'
    | 'KeyE'
    | 'KeyF'
    | 'KeyG'
    | 'KeyH'
    | 'KeyI'
    | 'KeyJ'
    | 'KeyK'
    | 'KeyL'
    | 'KeyM'
    | 'KeyN'
    | 'KeyO'
    | 'KeyP'
    | 'KeyQ'
    | 'KeyR'
    | 'KeyS'
    | 'KeyT'
    | 'KeyU'
    | 'KeyV'
    | 'KeyW'
    | 'KeyX'
    | 'KeyY'
    | 'KeyZ'
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
  )[];
  /**
   * @maxItems 4
   */
  menu: (
    | 'Enter'
    | 'Space'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'KeyA'
    | 'KeyB'
    | 'KeyC'
    | 'KeyD'
    | 'KeyE'
    | 'KeyF'
    | 'KeyG'
    | 'KeyH'
    | 'KeyI'
    | 'KeyJ'
    | 'KeyK'
    | 'KeyL'
    | 'KeyM'
    | 'KeyN'
    | 'KeyO'
    | 'KeyP'
    | 'KeyQ'
    | 'KeyR'
    | 'KeyS'
    | 'KeyT'
    | 'KeyU'
    | 'KeyV'
    | 'KeyW'
    | 'KeyX'
    | 'KeyY'
    | 'KeyZ'
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
  )[];
  /**
   * @maxItems 4
   */
  auto: (
    | 'Enter'
    | 'Space'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'KeyA'
    | 'KeyB'
    | 'KeyC'
    | 'KeyD'
    | 'KeyE'
    | 'KeyF'
    | 'KeyG'
    | 'KeyH'
    | 'KeyI'
    | 'KeyJ'
    | 'KeyK'
    | 'KeyL'
    | 'KeyM'
    | 'KeyN'
    | 'KeyO'
    | 'KeyP'
    | 'KeyQ'
    | 'KeyR'
    | 'KeyS'
    | 'KeyT'
    | 'KeyU'
    | 'KeyV'
    | 'KeyW'
    | 'KeyX'
    | 'KeyY'
    | 'KeyZ'
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
  )[];
  /**
   * @maxItems 4
   */
  skip: (
    | 'Enter'
    | 'Space'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'KeyA'
    | 'KeyB'
    | 'KeyC'
    | 'KeyD'
    | 'KeyE'
    | 'KeyF'
    | 'KeyG'
    | 'KeyH'
    | 'KeyI'
    | 'KeyJ'
    | 'KeyK'
    | 'KeyL'
    | 'KeyM'
    | 'KeyN'
    | 'KeyO'
    | 'KeyP'
    | 'KeyQ'
    | 'KeyR'
    | 'KeyS'
    | 'KeyT'
    | 'KeyU'
    | 'KeyV'
    | 'KeyW'
    | 'KeyX'
    | 'KeyY'
    | 'KeyZ'
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
  )[];
  /**
   * @maxItems 4
   */
  quickSave: (
    | 'Enter'
    | 'Space'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'KeyA'
    | 'KeyB'
    | 'KeyC'
    | 'KeyD'
    | 'KeyE'
    | 'KeyF'
    | 'KeyG'
    | 'KeyH'
    | 'KeyI'
    | 'KeyJ'
    | 'KeyK'
    | 'KeyL'
    | 'KeyM'
    | 'KeyN'
    | 'KeyO'
    | 'KeyP'
    | 'KeyQ'
    | 'KeyR'
    | 'KeyS'
    | 'KeyT'
    | 'KeyU'
    | 'KeyV'
    | 'KeyW'
    | 'KeyX'
    | 'KeyY'
    | 'KeyZ'
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
  )[];
  /**
   * @maxItems 4
   */
  quickLoad: (
    | 'Enter'
    | 'Space'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Escape'
    | 'KeyA'
    | 'KeyB'
    | 'KeyC'
    | 'KeyD'
    | 'KeyE'
    | 'KeyF'
    | 'KeyG'
    | 'KeyH'
    | 'KeyI'
    | 'KeyJ'
    | 'KeyK'
    | 'KeyL'
    | 'KeyM'
    | 'KeyN'
    | 'KeyO'
    | 'KeyP'
    | 'KeyQ'
    | 'KeyR'
    | 'KeyS'
    | 'KeyT'
    | 'KeyU'
    | 'KeyV'
    | 'KeyW'
    | 'KeyX'
    | 'KeyY'
    | 'KeyZ'
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
  )[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "DisplayPreferences".
 */
export interface DisplayPreferences {
  fontScale: number;
  windowOpacity: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PreferencesRecord".
 */
export interface PreferencesRecord {
  revision: number;
  value: PlayerPreferences;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "PreferencesPatch".
 */
export interface PreferencesPatch {
  audio?: {
    master?: number;
    bgm?: number;
    voice?: number;
    sfx?: number;
  };
  text?: {
    intervalMs?: number;
  };
  playback?: {
    autoDelayMs?: number;
    skipUnread?: boolean;
  };
  input?: {
    /**
     * @maxItems 4
     */
    advance?: (
      | 'Enter'
      | 'Space'
      | 'ArrowLeft'
      | 'ArrowRight'
      | 'Escape'
      | 'KeyA'
      | 'KeyB'
      | 'KeyC'
      | 'KeyD'
      | 'KeyE'
      | 'KeyF'
      | 'KeyG'
      | 'KeyH'
      | 'KeyI'
      | 'KeyJ'
      | 'KeyK'
      | 'KeyL'
      | 'KeyM'
      | 'KeyN'
      | 'KeyO'
      | 'KeyP'
      | 'KeyQ'
      | 'KeyR'
      | 'KeyS'
      | 'KeyT'
      | 'KeyU'
      | 'KeyV'
      | 'KeyW'
      | 'KeyX'
      | 'KeyY'
      | 'KeyZ'
      | 'Digit0'
      | 'Digit1'
      | 'Digit2'
      | 'Digit3'
      | 'Digit4'
      | 'Digit5'
      | 'Digit6'
      | 'Digit7'
      | 'Digit8'
      | 'Digit9'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'F1'
      | 'F2'
      | 'F3'
      | 'F4'
      | 'F5'
      | 'F6'
      | 'F7'
      | 'F8'
      | 'F9'
      | 'F10'
      | 'F11'
      | 'F12'
    )[];
    /**
     * @maxItems 4
     */
    menu?: (
      | 'Enter'
      | 'Space'
      | 'ArrowLeft'
      | 'ArrowRight'
      | 'Escape'
      | 'KeyA'
      | 'KeyB'
      | 'KeyC'
      | 'KeyD'
      | 'KeyE'
      | 'KeyF'
      | 'KeyG'
      | 'KeyH'
      | 'KeyI'
      | 'KeyJ'
      | 'KeyK'
      | 'KeyL'
      | 'KeyM'
      | 'KeyN'
      | 'KeyO'
      | 'KeyP'
      | 'KeyQ'
      | 'KeyR'
      | 'KeyS'
      | 'KeyT'
      | 'KeyU'
      | 'KeyV'
      | 'KeyW'
      | 'KeyX'
      | 'KeyY'
      | 'KeyZ'
      | 'Digit0'
      | 'Digit1'
      | 'Digit2'
      | 'Digit3'
      | 'Digit4'
      | 'Digit5'
      | 'Digit6'
      | 'Digit7'
      | 'Digit8'
      | 'Digit9'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'F1'
      | 'F2'
      | 'F3'
      | 'F4'
      | 'F5'
      | 'F6'
      | 'F7'
      | 'F8'
      | 'F9'
      | 'F10'
      | 'F11'
      | 'F12'
    )[];
    /**
     * @maxItems 4
     */
    auto?: (
      | 'Enter'
      | 'Space'
      | 'ArrowLeft'
      | 'ArrowRight'
      | 'Escape'
      | 'KeyA'
      | 'KeyB'
      | 'KeyC'
      | 'KeyD'
      | 'KeyE'
      | 'KeyF'
      | 'KeyG'
      | 'KeyH'
      | 'KeyI'
      | 'KeyJ'
      | 'KeyK'
      | 'KeyL'
      | 'KeyM'
      | 'KeyN'
      | 'KeyO'
      | 'KeyP'
      | 'KeyQ'
      | 'KeyR'
      | 'KeyS'
      | 'KeyT'
      | 'KeyU'
      | 'KeyV'
      | 'KeyW'
      | 'KeyX'
      | 'KeyY'
      | 'KeyZ'
      | 'Digit0'
      | 'Digit1'
      | 'Digit2'
      | 'Digit3'
      | 'Digit4'
      | 'Digit5'
      | 'Digit6'
      | 'Digit7'
      | 'Digit8'
      | 'Digit9'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'F1'
      | 'F2'
      | 'F3'
      | 'F4'
      | 'F5'
      | 'F6'
      | 'F7'
      | 'F8'
      | 'F9'
      | 'F10'
      | 'F11'
      | 'F12'
    )[];
    /**
     * @maxItems 4
     */
    skip?: (
      | 'Enter'
      | 'Space'
      | 'ArrowLeft'
      | 'ArrowRight'
      | 'Escape'
      | 'KeyA'
      | 'KeyB'
      | 'KeyC'
      | 'KeyD'
      | 'KeyE'
      | 'KeyF'
      | 'KeyG'
      | 'KeyH'
      | 'KeyI'
      | 'KeyJ'
      | 'KeyK'
      | 'KeyL'
      | 'KeyM'
      | 'KeyN'
      | 'KeyO'
      | 'KeyP'
      | 'KeyQ'
      | 'KeyR'
      | 'KeyS'
      | 'KeyT'
      | 'KeyU'
      | 'KeyV'
      | 'KeyW'
      | 'KeyX'
      | 'KeyY'
      | 'KeyZ'
      | 'Digit0'
      | 'Digit1'
      | 'Digit2'
      | 'Digit3'
      | 'Digit4'
      | 'Digit5'
      | 'Digit6'
      | 'Digit7'
      | 'Digit8'
      | 'Digit9'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'F1'
      | 'F2'
      | 'F3'
      | 'F4'
      | 'F5'
      | 'F6'
      | 'F7'
      | 'F8'
      | 'F9'
      | 'F10'
      | 'F11'
      | 'F12'
    )[];
    /**
     * @maxItems 4
     */
    quickSave?: (
      | 'Enter'
      | 'Space'
      | 'ArrowLeft'
      | 'ArrowRight'
      | 'Escape'
      | 'KeyA'
      | 'KeyB'
      | 'KeyC'
      | 'KeyD'
      | 'KeyE'
      | 'KeyF'
      | 'KeyG'
      | 'KeyH'
      | 'KeyI'
      | 'KeyJ'
      | 'KeyK'
      | 'KeyL'
      | 'KeyM'
      | 'KeyN'
      | 'KeyO'
      | 'KeyP'
      | 'KeyQ'
      | 'KeyR'
      | 'KeyS'
      | 'KeyT'
      | 'KeyU'
      | 'KeyV'
      | 'KeyW'
      | 'KeyX'
      | 'KeyY'
      | 'KeyZ'
      | 'Digit0'
      | 'Digit1'
      | 'Digit2'
      | 'Digit3'
      | 'Digit4'
      | 'Digit5'
      | 'Digit6'
      | 'Digit7'
      | 'Digit8'
      | 'Digit9'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'F1'
      | 'F2'
      | 'F3'
      | 'F4'
      | 'F5'
      | 'F6'
      | 'F7'
      | 'F8'
      | 'F9'
      | 'F10'
      | 'F11'
      | 'F12'
    )[];
    /**
     * @maxItems 4
     */
    quickLoad?: (
      | 'Enter'
      | 'Space'
      | 'ArrowLeft'
      | 'ArrowRight'
      | 'Escape'
      | 'KeyA'
      | 'KeyB'
      | 'KeyC'
      | 'KeyD'
      | 'KeyE'
      | 'KeyF'
      | 'KeyG'
      | 'KeyH'
      | 'KeyI'
      | 'KeyJ'
      | 'KeyK'
      | 'KeyL'
      | 'KeyM'
      | 'KeyN'
      | 'KeyO'
      | 'KeyP'
      | 'KeyQ'
      | 'KeyR'
      | 'KeyS'
      | 'KeyT'
      | 'KeyU'
      | 'KeyV'
      | 'KeyW'
      | 'KeyX'
      | 'KeyY'
      | 'KeyZ'
      | 'Digit0'
      | 'Digit1'
      | 'Digit2'
      | 'Digit3'
      | 'Digit4'
      | 'Digit5'
      | 'Digit6'
      | 'Digit7'
      | 'Digit8'
      | 'Digit9'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'F1'
      | 'F2'
      | 'F3'
      | 'F4'
      | 'F5'
      | 'F6'
      | 'F7'
      | 'F8'
      | 'F9'
      | 'F10'
      | 'F11'
      | 'F12'
    )[];
  };
  display?: {
    fontScale?: number;
    windowOpacity?: number;
  };
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "LegacyPlayerPreferences".
 */
export interface LegacyPlayerPreferences {
  version: 1;
  audio: AudioPreferences;
  text: TextPreferences;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "LegacyPreferencesRecord".
 */
export interface LegacyPreferencesRecord {
  revision: number;
  value: LegacyPlayerPreferences;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "AudioPlaybackEvent".
 */
export interface AudioPlaybackEvent {
  epoch: number;
  task: string;
  attempt: number;
  state: 'ended';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "GraphicsOptions".
 */
export interface GraphicsOptions {
  renderer: 'auto' | 'webgl' | 'canvas';
  maxCanvasBytes?: number;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StreamDescriptor".
 */
export interface StreamDescriptor {
  identity: ResolvedStreamIdentity;
  uri: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "StreamingOptions".
 */
export interface StreamingOptions {
  integrity: 'versioned-url';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SavePolicy".
 */
export interface SavePolicy {
  manualSlots: number;
  autoSlots: number;
  auto: 'off' | 'on-prompt';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SaveGameOptions".
 */
export interface SaveGameOptions {
  slot?: string;
  expectedRevision?: number;
  label?: string;
  kind?: 'manual' | 'quick' | 'auto';
  image?: 'required' | 'none';
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SaveCommit".
 */
export interface SaveCommit {
  id: string;
  slot: string;
  expectedRevision: number;
  snapshot: Snapshot;
  metadata: SlotMetadata;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "SaveReceipt".
 */
export interface SaveReceipt {
  id: string;
  slot: string;
  revision: number;
  signature: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "HistoryPolicy".
 */
export interface HistoryPolicy {
  maxEntries: number;
  maxCharacters: number;
  rollback: boolean;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "HistoryCommit".
 */
export interface HistoryCommit {
  id: string;
  profileId: string;
  baseRevision: number;
  /**
   * @maxItems 64
   */
  entries: HistoryEntry[];
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "HistoryReceipt".
 */
export interface HistoryReceipt {
  id: string;
  profileId: string;
  authority: string | null;
  revision: number;
  signature: string;
}
/**
 * This interface was referenced by `Wire`'s JSON-Schema
 * via the `definition` "LoadingOptions".
 */
export interface LoadingOptions {
  mode: 'eager' | 'demand' | 'balanced' | 'chapter';
  concurrency?: number;
  maxResidentBytes?: number;
  lookahead?: number;
  /**
   * @maxItems 64
   */
  chapters?: {
    id: string;
    /**
     * @minItems 1
     * @maxItems 256
     */
    functions: [string, ...string[]];
    /**
     * @maxItems 256
     */
    assets: string[];
  }[];
}
