export default class Grid {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.cells = new Array(width * height).fill(null)
  }
  get(x, y) {
    return this.cells[x + y * this.width]
  }
  set(x, y, value) {
    this.cells[x + y * this.width] = value
    this.logGrid()
  }

  logGrid() {
    let str = ''
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] === null) {
        str += '0'
      } else {
        str += '1'
      }
      if (i % this.width === this.width - 1) {
        str += '\n'
      }
    }
    console.clear()
    console.log(str)
  }

  getGridCoordonate(x, y) {
    if (x < 0) {
      x = 0
    }
    if (y < 0) {
      y = 0
    }
    if (x > this.width) {
      x = this.width
    }

    if (y > this.height) {
      y = this.height
    }
    return {
      x: x,
      y: y,
    }
  }

  clear(x, y) {
    this.cells[x + y * this.width] = null
  }
}
