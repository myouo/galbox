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
  },
  "stage.image": {
    "opcode": "stage.image",
    "parameters": [
      "at",
      "id",
      "asset",
      "pose",
      "style"
    ],
    "required": [
      "at",
      "id",
      "asset",
      "pose"
    ]
  },
  "stage.pose": {
    "opcode": "stage.pose",
    "parameters": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "id",
      "to",
      "relative"
    ],
    "required": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "id",
      "to",
      "relative"
    ]
  },
  "stage.filter": {
    "opcode": "stage.filter",
    "parameters": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "target",
      "to"
    ],
    "required": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "target",
      "to"
    ]
  },
  "stage.camera": {
    "opcode": "stage.camera",
    "parameters": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "to"
    ],
    "required": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "to"
    ]
  },
  "stage.fade": {
    "opcode": "stage.fade",
    "parameters": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "color",
      "alpha"
    ],
    "required": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "color",
      "alpha"
    ]
  },
  "stage.transition": {
    "opcode": "stage.transition",
    "parameters": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "id",
      "asset"
    ],
    "required": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "id",
      "asset"
    ]
  },
  "stage.shake": {
    "opcode": "stage.shake",
    "parameters": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "target",
      "amplitudeX",
      "amplitudeY",
      "periodMs"
    ],
    "required": [
      "at",
      "task",
      "duration",
      "policy",
      "easing",
      "target",
      "amplitudeX",
      "amplitudeY",
      "periodMs"
    ]
  },
  "stage.style": {
    "opcode": "stage.style",
    "parameters": [
      "at",
      "id",
      "style"
    ],
    "required": [
      "at",
      "id",
      "style"
    ]
  },
  "task.cancel": {
    "opcode": "task.cancel",
    "parameters": [
      "at",
      "task"
    ],
    "required": [
      "at",
      "task"
    ]
  },
  "task.finish": {
    "opcode": "task.finish",
    "parameters": [
      "at",
      "task"
    ],
    "required": [
      "at",
      "task"
    ]
  },
  "audio.track": {
    "opcode": "audio.track",
    "parameters": [
      "at",
      "task",
      "asset",
      "channel",
      "gain",
      "loop",
      "loopStartMs",
      "loopEndMs",
      "restore"
    ],
    "required": [
      "at",
      "task",
      "asset",
      "channel",
      "gain",
      "loop",
      "loopStartMs",
      "loopEndMs",
      "restore"
    ]
  },
  "audio.fade": {
    "opcode": "audio.fade",
    "parameters": [
      "at",
      "task",
      "channel",
      "to",
      "duration",
      "easing",
      "policy"
    ],
    "required": [
      "at",
      "task",
      "channel",
      "to",
      "duration",
      "easing",
      "policy"
    ]
  },
  "audio.duck": {
    "opcode": "audio.duck",
    "parameters": [
      "at",
      "enabled",
      "level",
      "attackMs",
      "releaseMs"
    ],
    "required": [
      "at",
      "enabled",
      "level",
      "attackMs",
      "releaseMs"
    ]
  },
  "audio.policy": {
    "opcode": "audio.policy",
    "parameters": [
      "at",
      "stopVoiceOnAdvance"
    ],
    "required": [
      "at",
      "stopVoiceOnAdvance"
    ]
  },
  "audio.wait": {
    "opcode": "audio.wait",
    "parameters": [
      "at",
      "task"
    ],
    "required": [
      "at",
      "task"
    ]
  },
  "interaction.prompt": {
    "opcode": "interaction.prompt",
    "parameters": [
      "at",
      "dest",
      "label",
      "options",
      "deadlineMs",
      "timeout"
    ],
    "required": [
      "at",
      "dest",
      "label",
      "options",
      "deadlineMs",
      "timeout"
    ]
  },
  "video.play": {
    "opcode": "video.play",
    "parameters": [
      "at",
      "task",
      "asset",
      "rect",
      "gain",
      "skippable",
      "restore"
    ],
    "required": [
      "at",
      "task",
      "asset",
      "rect",
      "gain",
      "skippable",
      "restore"
    ]
  },
  "flow.node": {
    "opcode": "flow.node",
    "parameters": [
      "at",
      "node"
    ],
    "required": [
      "at",
      "node"
    ]
  },
  "flow.unlock": {
    "opcode": "flow.unlock",
    "parameters": [
      "at",
      "node"
    ],
    "required": [
      "at",
      "node"
    ]
  },
  "extras.unlock": {
    "opcode": "extras.unlock",
    "parameters": [
      "at",
      "entry"
    ],
    "required": [
      "at",
      "entry"
    ]
  },
  "extras.check": {
    "opcode": "extras.check",
    "parameters": [
      "at"
    ],
    "required": [
      "at"
    ]
  },
  "extras.scene": {
    "opcode": "extras.scene",
    "parameters": [
      "at",
      "entry"
    ],
    "required": [
      "at",
      "entry"
    ]
  }
} as const;
export const recoveryOpcodes = ["value.set","i32.add.checked","stage.put","stage.remove","text.clear","audio.play","audio.stop","audio.gain","profile.set","profile.i32.add.checked","extension.invoke","profile.expression"] as const;
