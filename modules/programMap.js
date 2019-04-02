const content = {
  'line-n': {
    cmd: 'rotatePuffVertically',
    args: ['0']
  },
  'line-s': {
    cmd: 'rotatePuffVertically',
    args: ['0', 1]
  },
  'line-e': {
    cmd: 'rotatePuffHorizontally',
    args: ['0', 1]
  },
  'line-w': {
    cmd: 'rotatePuffHorizontally',
    args: ['0']
  },
  'line-nw': {
    cmd: 'rotatePuffDiagonally',
    args: ['0', 1]
  },
  'line-ne': {
    cmd: 'rotatePuffDiagonally',
    args: ['0', 2]
  },
  'line-sw': {
    cmd: 'rotatePuffDiagonally',
    args: ['0', 3]
  },
  'line-se': {
    cmd: 'rotatePuffDiagonally',
    args: ['0', 4]
  },
  'random': {
    cmd: 'random',
    args: ['0', 1, true]
  },
  'randomTwo': {
    cmd: 'random',
    args: ['0', 2, true]
  },
  'randomThree': {
    cmd: 'random',
    args: ['0', 3, true]
  },
  'randomFour': {
    cmd: 'random',
    args: ['0', 1, false]
  },
  'randomFive': {
    cmd: 'random',
    args: ['0', 2, false]
  },
  'randomSix': {
    cmd: 'random',
    args: ['0', 3, false]
  },
  'allOn': {
    cmd: 'allOn',
    args: ['0']
  },
  'allOff': {
    cmd: 'allOff',
    args: ['0']
  }
};

exports.content = content;