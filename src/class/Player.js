// Player.js
import * as THREE from 'three'
export default class Player {
  constructor(x, y, scene, type, size, subdivise, grid) {
    this.x = x
    this.y = y
    this.scene = scene
    this.type = type
    this.geometry = null
    this.material = null
    this.mesh = null
    this.size = size
    this.subdivise = subdivise
    this.gridX = x
    this.gridY = y
    this.grid = grid
    this.stats = {
      health: 100,
      attack: 10,
      defense: 5,
      speed: 1,
    }
    this.hover = false
    this.selected = false
  }

  resetMaterial() {
    if (this.type === 'barbarian') {
      this.material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    }
    if (this.type === 'wizard') {
      this.material = new THREE.MeshStandardMaterial({ color: 0x0000ff })
    }

    if (this.type === 'archer') {
      this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    }
    this.mesh.material = this.material
  }

  hoverAnimation() {
    if (this.hover) {
      this.mesh.position.y += 0.01
      if (this.mesh.position.y > 1.1) {
        this.hover = false
      }
    } else {
      this.mesh.position.y -= 0.01
      if (this.mesh.position.y < 1) {
        this.hover = true
      }
    }
  }

  setCoordonate(x, y) {
    this.grid.clear(this.gridX, this.gridY)

    this.gridX = x
    this.gridY = y
    this.grid.set(this.gridX, this.gridY, this)
    if (x < 0) {
      x = 0
    }
    if (y < 0) {
      y = 0
    }
    if (x > this.subdivise) {
      x = this.size / 2
    }

    if (y > this.subdivise) {
      y = this.size / 2
    }
    // 0 is -size / 2
    // 1 is size / 2
    x = (x / this.subdivise) * this.size - this.size / 2
    y = (y / this.subdivise) * this.size - this.size / 2
    // get the center of the case and set the player on it
    x += this.size / this.subdivise / 2
    y += this.size / this.subdivise / 2

    this.x = x
    this.y = y
  }

  movePlayer(x, y) {
    this.setCoordonate(x, y)
    this.mesh.position.set(this.x, 0.5, this.y)
  }

  moveForward() {
    if (this.gridY > 0) {
      this.movePlayer(this.gridX, this.gridY - 1)
    }
  }

  moveBackward() {
    if (this.gridY + 1 < this.subdivise) {
      this.movePlayer(this.gridX, this.gridY + 1)
    }
  }

  moveLeft() {
    if (this.gridX > 0) {
      this.movePlayer(this.gridX - 1, this.gridY)
    }
  }

  moveRight() {
    if (this.gridX + 1 < this.subdivise) {
      this.movePlayer(this.gridX + 1, this.gridY)
    }
  }

  initPlayer() {
    this.setCoordonate(this.x, this.y)
    let playerSize = (this.size / this.subdivise) * 0.4

    this.geometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize)
    if (this.type === 'barbarian') {
      this.material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    }
    if (this.type === 'wizard') {
      this.material = new THREE.MeshStandardMaterial({ color: 0x0000ff })
    }

    if (this.type === 'archer') {
      this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    }
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(this.x, 0.5, this.y)
    this.scene.add(this.mesh)
  }

  // Méthode pour obtenir la position du joueur
  getPosition() {
    return { x: this.x, y: this.y }
  }
}
