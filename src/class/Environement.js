import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Enviroment {
  constructor(scene, grid, size, subdivise) {
    this.scene = scene
    this.grid = grid
    this.size = size
    this.subdivise = subdivise
    this.walls = []
    this.loader = new GLTFLoader()
    this.wallModel = null
    this.wallCornerModel = null
  }

  async loadWallCornerModel() {
    await new Promise((resolve) => {
      this.loader.load(
        'assets/3dModel/walls/wall_corner.glb',
        (gltf) => {
          this.wallCornerModel = gltf.scene
          this.wallCornerModel.traverse((child) => {
            if (child.isMesh) {
              const material = child.material
              if (
                !(material instanceof THREE.MeshStandardMaterial) &&
                !(material instanceof THREE.MeshPhysicalMaterial)
              ) {
                child.material = new THREE.MeshStandardMaterial({
                  color: material.color || 0xffffff,
                  roughness: 0.5,
                  metalness: 0.5,
                })
              }
              child.castShadow = true
              child.receiveShadow = true
              child.material.roughness = 0.5
              child.material.metalness = 0.1
            }
          })
          console.log('Wall corner model loaded successfully')

          resolve()
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.error('Error loading wall corner model:', error)
        },
      )
    })
  }

  async loadWallModel() {
    await new Promise((resolve) => {
      this.loader.load(
        'assets/3dModel/walls/wall_1.glb',
        (gltf) => {
          this.wallModel = gltf.scene
          this.wallModel.traverse((child) => {
            if (child.isMesh) {
              const material = child.material
              if (
                !(material instanceof THREE.MeshStandardMaterial) &&
                !(material instanceof THREE.MeshPhysicalMaterial)
              ) {
                child.material = new THREE.MeshStandardMaterial({
                  color: material.color || 0xffffff,
                  roughness: 0.5,
                  metalness: 0.5,
                })
              }
              child.castShadow = true
              child.receiveShadow = true
              child.material.roughness = 0.5
              child.material.metalness = 0.1
            }
          })
          console.log('Wall model loaded successfully')

          resolve()
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.error('Error loading wall model:', error)
        },
      )
    })
  }

  createWall(x, y, type) {
    this.grid.set(x, y, this)
    this.displayWall(x, y, type)
  }

  displayWallCorner(x, y, type, orientation) {
    const blockSize = this.size / this.subdivise
    const posX = x * blockSize - this.size / 2 + blockSize / 2
    const posY = blockSize / 2
    const posZ = y * blockSize - this.size / 2 + blockSize / 2

    if (this.wallCornerModel) {
      const corner = this.wallCornerModel.clone()
      corner.position.set(posX, posY, posZ)
      corner.scale.set(0.4, 0.4, 0.4) // Adjust the scale if necessary
      console.log('corner', corner, orientation, () => {
        switch (orientation) {
          case 'topLeft':
            return 0
          case 'topRight':
            return Math.PI / 2
          case 'bottomLeft':
            return -Math.PI / 2
          case 'bottomRight':
            return Math.PI
          default:
            return 0
        }
      })
      corner.rotation.y = (() => {
        if (orientation === 'topLeft') {
          return Math.PI / 2
        } else if (orientation === 'topRight') {
          return 0
        } else if (orientation === 'bottomLeft') {
          return Math.PI
        } else if (orientation === 'bottomRight') {
          return -Math.PI / 2
        }
      })()
      console.log('corner', corner, orientation, corner.rotation.y)
      this.scene.add(corner)
      this.walls.push(corner)
    } else {
      console.error('Wall corner model not loaded yet')
    }
  }

  displayWall(x, y, type, orientation = null) {
    console.log('displayWall', x, y, type)
    let gridX = x
    let gridY = y
    this.type = type
    x = (x / this.subdivise) * this.size - this.size / 2
    y = (y / this.subdivise) * this.size - this.size / 2
    // get the center of the case and set the wall on it
    x += this.size / this.subdivise / 2
    y += this.size / this.subdivise / 2

    if (this.wallModel) {
      const wall = this.wallModel.clone()
      wall.position.set(x, this.size / this.subdivise / 2, y)
      wall.scale.set(0.4, 0.4, 0.4) // Adjust the scale if necessary
      // console.log('Mur ajouté', {
      //   userData: wall.userData,
      //   name: wall.name,
      //   rotate: wall.rotation.y,
      // })
      wall.rotation.y = (() => {
        console.log('gridY', gridY, this.size - 1, this.subdivise)
        console.log('gridX', gridX, this.size - 1)
        if (gridX === 0) {
          return Math.PI / 2
        }
        if (gridX === this.subdivise - 1) {
          return -Math.PI / 2
        }
        if (gridY === 0) {
          return Math.PI
        }
        if (gridY === this.subdivise - 1) {
          console.log('gridY === this.size - 1')
          return Math.PI
        }
        return 0
      })()
      wall.userData = {
        x,
        y,
        orientation,
      }
      wall.name = 'wall ' + x + ' ' + y + ' ' + orientation
      // console.log('Mur ajouté', {
      //   userData: wall.userData,
      //   name: wall.name,
      //   rotate: wall.rotation.y,
      // })
      this.scene.add(wall)

      this.walls.push(wall)
    } else {
      console.error('Wall model not loaded yet')
    }
  }

  async initWalls() {
    if (!this.wallModel) {
      console.error('Wall model not loaded yet')
      await this.loadWallModel()
    }
    if (!this.wallCornerModel) {
      console.error('Wall corner model not loaded yet')
      await this.loadWallCornerModel()
    }
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
      for (let j = 0; j < this.subdivise; j++) {
        // Exclure les coins
        if (
          (i === 0 && j === 0) || // Coin haut gauche
          (i === 0 && j === this.subdivise - 1) || // Coin bas gauche
          (i === this.subdivise - 1 && j === 0) || // Coin haut droit
          (i === this.subdivise - 1 && j === this.subdivise - 1) // Coin bas droit
        ) {
          continue // Passer les coins
        }

        // Ajouter les murs des bords
        if (i === 0) this.createWall(i, j, 'wall') // Bord gauche
        if (i === this.subdivise - 1) this.createWall(i, j, 'wall', 'horizontal') // Bord droit
        if (j === 0) this.createWall(i, j, 'wall') // Bord bas
        if (j === this.subdivise - 1) this.createWall(i, j, 'wall', 'horizontal') // Bord haut
      }
    }

    // Afficher les murs spéciaux pour les coins (si nécessaire)
    this.displayWallCorner(0, 0, 'wallCorner', 'topLeft')
    this.displayWallCorner(this.subdivise - 1, 0, 'wallCorner', 'topRight')
    this.displayWallCorner(0, this.subdivise - 1, 'wallCorner', 'bottomLeft')
    this.displayWallCorner(this.subdivise - 1, this.subdivise - 1, 'wallCorner', 'bottomRight')
  }
}
