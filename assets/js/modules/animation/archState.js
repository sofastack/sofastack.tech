
function extendState(rawState, extend) {
  const state = JSON.parse(JSON.stringify(rawState))

  for (let i in extend) {
    for (let j in extend[i]) {
      for (let k in extend[i][j]) {
        const rawVal = state[i][j][k]
        const val = extend[i][j][k]

        if (typeof val === "function") {
          state[i][j][k] = val(rawVal, rawState[i])
        } else {
          state[i][j][k] = val
        }
      }
    }
  }

  return state
}

// ----- CONSTANTS -----

export const BGColor = '#2e73d7'
export const GrayColor = '#929292'

const CIRCLE_DEFAULT = {
  r: 60.56,
  fill: '#83c2ff',
}
const CIRCLE_SELECTED = {
  r: 110,
  fill: BGColor,
}

const ICON_DEFAULT = {
  fill: '#000',
}
const ICON_SELECTED = {
  fill: '#fff',
}
const ICON_NOT_SELECTED = {
  fill: GrayColor,
}

const TEXT_DEFAULT = {
  fill: '#000',
  hasBG: false,
}
const TEXT_SELECTED = {
  fill: '#fff',
  hasBG: true,
}
const TEXT_NOT_SELECTED = {
  fill: GrayColor,
}


// -----  STATE -----

export const INITstate = {
  TL: {
    circle: {
      pos: [440.53, 236.83],
      ...CIRCLE_DEFAULT,
    },
    icon: {
      pos: [172, 232],
      ...ICON_DEFAULT,
    },
    text: {
      dmove: [110, 0],
      ...TEXT_DEFAULT,
    },
  },
  TR: {
    circle: {
      pos: [1504.6, 227.44],
      ...CIRCLE_DEFAULT,
    },
    icon: {
      pos: [1713, 229],
      ...ICON_DEFAULT,
    },
    text: {
      dmove: [-140, 0],
      ...TEXT_DEFAULT,
    },
  },
  BR: {
    circle: {
      pos: [1665.77, 1241.44],
      ...CIRCLE_DEFAULT,
    },
    icon: {
      pos: [1851, 1244],
      ...ICON_DEFAULT,
    },
    text: {
      dmove: [-800, -60],
      ...TEXT_DEFAULT,
    },
  },
  BL: {
    circle: {
      pos: [613.44, 1241.44],
      ...CIRCLE_DEFAULT,
    },
    icon: {
      pos: [172, 1244],
      ...ICON_DEFAULT,
    },
    text: {
      dmove: [620, -80],
      ...TEXT_DEFAULT,
    },
  },
}

export const TLstate = extendState(INITstate, {
  TL: {
    circle: {
      pos: val => [val[0] - 100, val[1] - 100],
      ...CIRCLE_SELECTED,
    },
    icon: {
      pos: (_, val) => [val.circle.pos[0] - 100, val.circle.pos[1] - 100],
      ...ICON_SELECTED,
    },
    text: {
      ...TEXT_SELECTED,
    }
  },
  TR: {
    circle: {
      pos: val => [val[0] - 40, val[1] + 40],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  BR: {
    circle: {
      pos: val => [val[0] - 100, val[1] - 100],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  BL: {
    circle: {
      pos: val => [val[0] + 50, val[1] - 50],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
})

export const TRstate = extendState(INITstate, {
  TR: {
    circle: {
      pos: val => [val[0] + 100, val[1] - 100],
      ...CIRCLE_SELECTED,
    },
    icon: {
      pos: (_, val) => [val.circle.pos[0] + 100, val.circle.pos[1] - 100],
      ...ICON_SELECTED,
    },
    text: {
      ...TEXT_SELECTED,
    }
  },
  TL: {
    circle: {
      pos: val => [val[0] + 50, val[1] + 50],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  BR: {
    circle: {
      pos: val => [val[0] - 100, val[1] - 100],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  BL: {
    circle: {
      pos: val => [val[0] + 50, val[1] - 50],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
})

export const BRstate = extendState(INITstate, {
  BR: {
    circle: {
      pos: val => [val[0] + 70, val[1] + 70],
      ...CIRCLE_SELECTED,
    },
    icon: {
      pos: (_, val) => [val.circle.pos[0] + 70, val.circle.pos[1] + 70],
      ...ICON_SELECTED,
    },
    text: {
      ...TEXT_SELECTED,
    }
  },
  TR: {
    circle: {
      pos: val => [val[0] - 60, val[1] + 60],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  TL: {
    circle: {
      pos: val => [val[0] + 100, val[1] + 100],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  BL: {
    circle: {
      pos: val => [val[0] + 60, val[1] - 60],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
})

export const BLstate = extendState(INITstate, {
  BL: {
    circle: {
      pos: val => [val[0] - 100, val[1] + 100],
      ...CIRCLE_SELECTED,
    },
    icon: {
      pos: (_, val) => [val.circle.pos[0] - 100, val.circle.pos[1] + 100],
      ...ICON_SELECTED,
    },
    text: {
      ...TEXT_SELECTED,
    }
  },
  TR: {
    circle: {
      pos: val => [val[0] - 60, val[1] + 60],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  BR: {
    circle: {
      pos: val => [val[0] - 100, val[1] - 100],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
  TL: {
    circle: {
      pos: val => [val[0] + 60, val[1] + 60],
    },
    icon: {
      ...ICON_NOT_SELECTED
    },
    text: {
      ...TEXT_NOT_SELECTED,
    }
  },
})