/* Generated from schema/protocol.json. */
export const operationSpecs = {
  "control.jump": {
    "opcode": "control.jump",
    "parameters": [
      "at",
      "target"
    ],
    "required": [
      "at",
      "target"
    ]
  },
  "control.branch": {
    "opcode": "control.branch",
    "parameters": [
      "at",
      "left",
      "cmp",
      "right",
      "yes",
      "no"
    ],
    "required": [
      "at",
      "left",
      "cmp",
      "right",
      "yes",
      "no"
    ]
  },
  "control.call": {
    "opcode": "control.call",
    "parameters": [
      "at",
      "function",
      "args",
      "dest"
    ],
    "required": [
      "at",
      "function",
      "args"
    ]
  },
  "control.return": {
    "opcode": "control.return",
    "parameters": [
      "at",
      "value"
    ],
    "required": [
      "at"
    ]
  },
  "control.end": {
    "opcode": "control.end",
    "parameters": [
      "at"
    ],
    "required": [
      "at"
    ]
  },
  "value.set": {
    "opcode": "value.set",
    "parameters": [
      "at",
      "dest",
      "value"
    ],
    "required": [
      "at",
      "dest",
      "value"
    ]
  },
  "i32.add.checked": {
    "opcode": "i32.add.checked",
    "parameters": [
      "at",
      "dest",
      "left",
      "right"
    ],
    "required": [
      "at",
      "dest",
      "left",
      "right"
    ]
  },
  "text.page": {
    "opcode": "text.page",
    "parameters": [
      "at",
      "textId",
      "revision",
      "speaker",
      "content"
    ],
    "required": [
      "at",
      "textId",
      "revision",
      "speaker",
      "content"
    ]
  },
  "text.clear": {
    "opcode": "text.clear",
    "parameters": [
      "at"
    ],
    "required": [
      "at"
    ]
  },
  "choice": {
    "opcode": "choice",
    "parameters": [
      "at",
      "options",
      "dest"
    ],
    "required": [
      "at",
      "options",
      "dest"
    ]
  },
  "stage.put": {
    "opcode": "stage.put",
    "parameters": [
      "at",
      "object"
    ],
    "required": [
      "at",
      "object"
    ]
  },
  "stage.remove": {
    "opcode": "stage.remove",
    "parameters": [
      "at",
      "id"
    ],
    "required": [
      "at",
      "id"
    ]
  },
  "stage.animate": {
    "opcode": "stage.animate",
    "parameters": [
      "at",
      "task",
      "id",
      "to",
      "duration",
      "policy"
    ],
    "required": [
      "at",
      "task",
      "id",
      "to",
      "duration",
      "policy"
    ]
  },
  "task.join": {
    "opcode": "task.join",
    "parameters": [
      "at",
      "group",
      "members"
    ],
    "required": [
      "at",
      "group",
      "members"
    ]
  },
  "wait.delay": {
    "opcode": "wait.delay",
    "parameters": [
      "at",
      "task",
      "duration"
    ],
    "required": [
      "at",
      "task",
      "duration"
    ]
  },
  "audio.play": {
    "opcode": "audio.play",
    "parameters": [
      "at",
      "task",
      "asset",
      "channel",
      "gain",
      "loop",
      "restore"
    ],
    "required": [
      "at",
      "task",
      "asset",
      "channel",
      "gain",
      "loop",
      "restore"
    ]
  },
  "audio.stop": {
    "opcode": "audio.stop",
    "parameters": [
      "at",
      "channel"
    ],
    "required": [
      "at",
      "channel"
    ]
  },
  "audio.gain": {
    "opcode": "audio.gain",
    "parameters": [
      "at",
      "channel",
      "gain"
    ],
    "required": [
      "at",
      "channel",
      "gain"
    ]
  },
  "profile.set": {
    "opcode": "profile.set",
    "parameters": [
      "at",
      "key",
      "value"
    ],
    "required": [
      "at",
      "key",
      "value"
    ]
  },
  "profile.flush": {
    "opcode": "profile.flush",
    "parameters": [
      "at"
    ],
    "required": [
      "at"
    ]
  },
  "checkpoint": {
    "opcode": "checkpoint",
    "parameters": [
      "at"
    ],
    "required": [
      "at"
    ]
  },
  "save.policy": {
    "opcode": "save.policy",
    "parameters": [
      "at",
      "allow"
    ],
    "required": [
      "at",
      "allow"
    ]
  },
  "extension.invoke": {
    "opcode": "extension.invoke",
    "parameters": [
      "at",
      "operation",
      "version",
      "argsSchema",
      "args"
    ],
    "required": [
      "at",
      "operation",
      "version",
      "argsSchema",
      "args"
    ]
  },
  "profile.i32.add.checked": {
    "opcode": "profile.i32.add.checked",
    "parameters": [
      "at",
      "key",
      "delta"
    ],
    "required": [
      "at",
      "key",
      "delta"
    ]
  },
  "text.template": {
    "opcode": "text.template",
    "parameters": [
      "at",
      "textId",
      "revision",
      "speaker",
      "content"
    ],
    "required": [
      "at",
      "textId",
      "revision",
      "speaker",
      "content"
    ]
  },
  "random.i32": {
    "opcode": "random.i32",
    "parameters": [
      "at",
      "dest",
      "min",
      "max"
    ],
    "required": [
      "at",
      "dest",
      "min",
      "max"
    ]
  },
  "rng.seed": {
    "opcode": "rng.seed",
    "parameters": [
      "at",
      "seed"
    ],
    "required": [
      "at",
      "seed"
    ]
  },
  "text.rich": {
    "opcode": "text.rich",
    "parameters": [
      "at",
      "textId",
      "revision",
      "speaker",
      "runs"
    ],
    "required": [
      "at",
      "textId",
      "revision",
      "speaker",
      "runs"
    ]
  },
  "text.window.select": {
    "opcode": "text.window.select",
    "parameters": [
      "at",
      "window"
    ],
    "required": [
      "at",
      "window"
    ]
  },
  "text.window.clear": {
    "opcode": "text.window.clear",
    "parameters": [
      "at",
      "window"
    ],
    "required": [
      "at",
      "window"
    ]
  },
  "text.window.visible": {
    "opcode": "text.window.visible",
    "parameters": [
      "at",
      "window",
      "visible"
    ],
    "required": [
      "at",
      "window",
      "visible"
    ]
  },
  "text.window.theme": {
    "opcode": "text.window.theme",
    "parameters": [
      "at",
      "window",
      "theme"
    ],
    "required": [
      "at",
      "window",
      "theme"
    ]
  },
  "profile.expression": {
    "opcode": "profile.expression",
    "parameters": [
      "at",
      "key",
      "value"
    ],
    "required": [
      "at",
      "key",
      "value"
    ]
  }
} as const;
export const recoveryOpcodes = ["value.set","i32.add.checked","stage.put","stage.remove","text.clear","audio.play","audio.stop","audio.gain","profile.set","profile.i32.add.checked","extension.invoke","profile.expression"] as const;
