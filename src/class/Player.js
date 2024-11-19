// Player.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Player {
  constructor(x, y, scene, type, size, subdivise, grid, rotation = null) {
    this.x = x
    this.y = y
    this.z = 0.5 // Ajoutez z avec la valeur par défaut souhaitée
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
    this.playerModel = null
    this.loader = new GLTFLoader()
    this.rotation = rotation

    this.stats = {
      health: 100,
      attack: 10,
      defense: 5,
      speed: 3,
    }
    this.hover = false
    this.selected = false
  }

  resetMaterial() {
    if (this.type === 'barbarian') {
      this.material = new THREE.MeshPhongMaterial({ color: 0xff0000 })
    }
    if (this.type === 'wizard') {
      this.material = new THREE.MeshPhongMaterial({ color: 0x0000ff })
    }

    if (this.type === 'archer') {
      this.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 })
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

  async loadModel(type) {
    await new Promise((resolve) => {
      this.loader.load(
        `assets/3dModel/entity/${type}.glb`,
        (gltf) => {
          this.playerModel = gltf.scene
          this.playerModel.traverse((child) => {
            if (child.isMesh) {
              const material = child.material
              if (
                !(material instanceof THREE.MeshStandardMaterial) &&
                !(material instanceof THREE.MeshPhysicalMaterial)
              ) {
                child.material = new THREE.MeshPhongMaterial({
                  color: material.color || 0xffffff,
                })
              }
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          console.log(`Model ${type} loaded`)
          resolve()
        },
        (xhr) => {},
        (error) => {},
      )
    })
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
    this.mesh.position.set(this.x, this.z, this.y)
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

  rotateLeft() {
    this.mesh.rotation.y += Math.PI / 2
  }

  rotateRight() {
    this.mesh.rotation.y -= Math.PI / 2
  }

  async initPlayer() {
    new Promise(async (resolve) => {
      console.log(`Initializing player... ${this.type} ${this.rotation}`)
      this.setCoordonate(this.x, this.y)

      let playerSize = (this.size / this.subdivise) * 0.8

      this.geometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize)

      playerSize = (this.size / this.subdivise) * 0.8
      if (this.playerModel === null) {
        await this.loadModel(this.type)
      }
      this.z = 0.5
      this.mesh = this.playerModel
      this.mesh.scale.set(playerSize, playerSize, playerSize)
      this.mesh.position.set(this.x, this.z, this.y)
      this.mesh.rotation.y = Math.PI
      this.mesh.castShadow = true
      if (this.rotation) {
        if (this.rotation === 'left') {
          this.mesh.rotation.y = Math.PI / 2
        }
        if (this.rotation === 'right') {
          this.mesh.rotation.y = -Math.PI / 2
        }
        if (this.rotation === 'down') {
          this.mesh.rotation.y = 0
        }
        if (this.rotation === 'up') {
          this.mesh.rotation.y = Math.PI
        }
      }
      console.log(`rotation ${this.type}`, this.mesh.rotation, this.mesh.rotation.z)
      this.scene.add(this.mesh)
      resolve()
    })
  }

  // Méthode pour obtenir la position du joueur
  getPosition() {
    return { x: this.x, y: this.y }
  }
}
