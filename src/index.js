const tetrominos = []
const gridSize = [10, 18]
const blockSize = 8
let gameSpeed = 500
let activeTetremino = null

// coordinate space to pixel
const c = x => x * blockSize;

const possibleShapes = [
  [
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
  ],
  [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  [
    [1,1],
    [1,1],
  ],
  [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ],
  [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
]

function drawDebugBlock(ctx, x, y) {
  ctx.save()
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.fillRect(x, y, blockSize, blockSize)
  ctx.restore()
}

class Pos extends Array {
  constructor(x, y) {
    super(x, y)
  }
}

class Shape {
  constructor (pos, shape) {
    this.pos = pos
    this.shape = shape
  }

  get shapeHeight() {
    return this.shape.length
  }

  get shapeWidth() {
    return this.shape[0].length
  }

  get left() {
    return this.pos[0]
  }

  get right() {
    return this.pos[0] + this.shapeWidth
  }

  get top() {
    return this.pos[1]
  }

  get bottom() {
    return this.pos[1] + this.shapeHeight
  }
}

class Tetremino extends Shape {
  constructor() {
    const pos = new Pos(0, 0)
    const shapeIndex = Math.floor(Math.random() * possibleShapes.length)
    const shape = possibleShapes[shapeIndex]
    
    super(pos, shape)
  }

  moveRight() {
    this.pos[0] += 1
  }

  moveLeft() {
    this.pos[0] -= 1
  }

  moveDown() {
    this.pos[1] += 1
  }

  rotate() {
    const {shape} = this
    const rotated = []
    const n = shape.length

    for (let y = 0; y < n; y++) {
      rotated[y] = rotated[y] || []

      for (let x = 0; x < n; x++) {
        rotated[y][x] = shape[n - x - 1][y]
      }
    }

    this.shape = rotated
  }

  isColliding(object) {
    const {pos: [xPos, yPos], shape} = this
    const {pos: [xPosO, yPosO], shapeO} = object

    if (object.top > this.bottom) return false
    if (object.right <= this.left || object.left >= this.right) return false

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue

        const yToCheck = (this.top + y) - object.top + 1
        const xToCheck = (this.left + x) - object.left
        const objectRow = object.shape[yToCheck]
        const objectBlockBeneath = objectRow && objectRow[xToCheck]

        if (objectBlockBeneath) return true
      }
    }

    return false
  }

  render(ctx) {
    const {shape, pos: [xPos, yPos]} = this
    
    ctx.save()
    ctx.translate(c(xPos), c(yPos))
    ctx.fillStyle = 'white'

    for (let y = 0; y < this.shapeHeight; y++) {
      for (let x = 0; x < this.shapeWidth; x++) {
        if (!shape[y][x]) {
          // drawDebugBlock(ctx, c(x), c(y))
          continue
        }

        ctx.fillRect(c(x), c(y), blockSize, blockSize)
      }
    }

    ctx.restore()
  }
}

const floor = new Shape(
  new Pos(0, gridSize[1]),
  [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
)

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
let prev = Date.now()
let time = 0

const gameLoop = () => {
  const now = Date.now()
  const delta = now - prev
  const {width, height} = canvas

  prev = now
  time += delta 

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, height)

  if (time >= gameSpeed) {
    time = 0
    activeTetremino.moveDown()
  }

  if (activeTetremino.isColliding(floor)) {
    tetrominos.push(activeTetremino)
    activeTetremino = new Tetremino()
  } else {
    for (let tetremino of tetrominos) {
      if (activeTetremino.isColliding(tetremino)) {
        tetrominos.push(activeTetremino)
        activeTetremino = new Tetremino()
        break
      }
    }
  }

  tetrominos.forEach(t => t.render(ctx))
  activeTetremino.render(ctx)

  requestAnimationFrame(gameLoop)
}

activeTetremino = new Tetremino()

window.addEventListener('keydown', event => {
  switch (event.keyCode) {
    case 39:
      // right
      return activeTetremino.moveRight()
    case 37:
      // left
      return activeTetremino.moveLeft()
    case 38:
      // up
      return activeTetremino.rotate()
    case 40:
      // down
      return activeTetremino.moveDown()
  }
})

gameLoop()