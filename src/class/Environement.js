import * as THREE from 'three'

export default class Enviroment {
  constructor(scene, grid, size, subdivise) {
    this.scene = scene
    this.grid = grid
    this.size = size
    this.subdivise = subdivise
    this.walls = []
  }

  createWall(x, y, type) {
    this.grid.set(x, y, this)
    this.displayWall(x, y, type)
  }

  displayWall(x, y, type, orientation = null) {
    console.log('displayWall', x, y, type)
    this.type = type
    x = (x / this.subdivise) * this.size - this.size / 2
    y = (y / this.subdivise) * this.size - this.size / 2
    // get the center of the case and set the wall on it
    x += this.size / this.subdivise / 2
    y += this.size / this.subdivise / 2

    this.geometry = new THREE.BoxGeometry(
      this.size / this.subdivise,
      this.size / this.subdivise,
      this.size / this.subdivise,
    )
    if (this.type === 'wall') {
      this.material = new THREE.MeshBasicMaterial({ color: 0x8b4513 }) // Brown color for walls
      this.wall = new THREE.Mesh(this.geometry, this.material)
      this.wall.position.set(x, this.size / this.subdivise / 2, y)
      this.scene.add(this.wall)
      this.walls.push(this.wall)
    }
    if (this.type === 'openWall') {
      const blockSize = this.size / this.subdivise
      const positions = [
        { x: 0, y: 0 }, // Left block
        { x: 2 * blockSize, y: 0 }, // Right block
        { x: blockSize, y: blockSize }, // Top block
      ]

      positions.forEach((pos) => {
        const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize)
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }) // Black color for open walls
        const wall = new THREE.Mesh(geometry, material)

        if (orientation === 'horizontal') {
          wall.position.set(
            (x / this.subdivise) * this.size - this.size / 2 + pos.x + blockSize / 2,
            blockSize / 2,
            (y / this.subdivise) * this.size - this.size / 2 + pos.y + blockSize / 2,
          )
        } else if (orientation === 'vertical') {
          wall.position.set(
            (x / this.subdivise) * this.size - this.size / 2 + pos.y + blockSize / 2,
            blockSize / 2,
            (y / this.subdivise) * this.size - this.size / 2 + pos.x + blockSize / 2,
          )
        }

        this.scene.add(wall)
        this.walls.push(wall)
      })
    }
  }

  initWalls() {
    this.initBorderWalls()
    // Example of creating walls
    console.log('initWalls')
    this.createWall(2, 2, 'wall')
    this.createWall(3, 2, 'wall')
    this.createWall(4, 2, 'wall')
    // this.createWall(5, 2, 'openWall', 'horizontal')
  }

  initBorderWalls() {
    for (let i = 0; i < this.subdivise; i++) {
      this.createWall(0, i, 'wall')
      this.createWall(this.subdivise - 1, i, 'wall')
      this.createWall(i, 0, 'wall')
      this.createWall(i, this.subdivise - 1, 'wall')
    }
  }
}
