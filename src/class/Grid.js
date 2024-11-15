import * as THREE from 'three'

class Cell {
  constructor(x, y, type, data) {
    this.x = x
    this.y = y
    this.type = type
    this.data = data
    this.geometry = null
    this.material = null
    this.mesh = null
    this.display = false
  }

  initCell(size, subdivise, scene) {
    if (!scene || typeof scene.add !== 'function') {
      // console.error('scene is not a THREE.Scene')
      return
    }
    // console.log(size, subdivise, scene)
    let x = this.x
    let y = this.y
    x = (x / subdivise) * size - size / 2
    y = (y / subdivise) * size - size / 2
    // get the center of the case and set the player on it
    x += size / subdivise / 2
    y += size / subdivise / 2
    this.geometry = new THREE.PlaneGeometry(size / subdivise, size / subdivise, size / subdivise)
    this.material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.rotation.x = Math.PI / 2
    this.plane.position.set(x, 0.1, y)
    this.plane.visible = false
    scene.add(this.plane)

    this.edgeGeometry = new THREE.EdgesGeometry(this.geometry)
    this.edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    this.outline = new THREE.LineSegments(this.edgeGeometry, this.edgeMaterial)
    this.outline.rotation.x = Math.PI / 2
    this.outline.position.set(x, 0.2, y)
    scene.add(this.outline)
  }

  onClick(event) {}

  displayCell(type) {
    if (this.display) {
      return
    }
  }

  setType(type) {
    this.type = type
  }

  setOutilineColor(color) {
    this.outline.material.color.set(color)
  }

  setData(data) {
    this.data = data
  }

  getData() {
    return this.data
  }
}
export default class Grid {
  constructor(width, height, scene, size, subdivise) {
    this.width = width
    this.height = height
    this.cells = new Array(width * height).fill(null)
    this.scene = scene
    this.size = size
    this.subdivise = subdivise
    this.initCells()
  }

  initCells() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const cell = new Cell(x, y, 'empty', null)
        this.cells[x + y * this.width] = cell
        cell.initCell(this.size, this.subdivise, this.scene)
      }
    }
  }

  get(x, y) {
    return this.cells[x + y * this.width].getData()
  }
  set(x, y, value) {
    this.cells[x + y * this.width].setData(value)
  }

  displayCell(x, y, type, subdivise, size) {
    this.cells[x + y * this.width].displayCell(size, subdivise, type, this.scene)
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

  highlightCellsInRange(playerX, playerY, speed) {
    this.clearAllHighlights()
    console.log(playerX, playerY, speed)
    for (let x = playerX - speed; x <= playerX + speed; x++) {
      for (let y = playerY - speed; y <= playerY + speed; y++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          // console.log(this.cells[x + y * this.width])
          this.cells[x + y * this.width].setOutilineColor(0xff0000)
          this.cells[x + y * this.width].setType('movableDestination')
        }
      }
    }
  }

  clearAllHighlights() {
    this.cells.forEach((cell) => {
      if (cell) {
        cell.setOutilineColor(0xffffff)
        cell.setType('empty')
      }
    })
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
    this.cells[x + y * this.width].setData(null)
  }
}
