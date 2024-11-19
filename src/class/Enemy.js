// Enemy.js
import Player from './Player.js'
import * as THREE from 'three'

export default class Enemy extends Player {
  constructor(x, y, scene, type, size, subdivise, grid, rotation) {
    super(x, y, scene, type, size, subdivise, grid, rotation)
    this.isEnemy = true
    this.stats = {
      health: 80, // Enemies have less health than players
      attack: 15, // Enemies have higher attack
      defense: 3, // Enemies have lower defense
      speed: 2,
    }
  }

  async initEnemy() {
    // Call initPlayer, which loads models and sets up the mesh
    console.log('Initializing enemy...')
    await this.initPlayer()

    // Apply specific settings for enemies, such as a different color or material
  }

  // Override move logic to make enemies move differently
  moveRandomly() {
    const randomDirection = Math.floor(Math.random() * 4)
    switch (randomDirection) {
      case 0:
        this.moveForward()
        break
      case 1:
        this.moveBackward()
        break
      case 2:
        this.moveLeft()
        break
      case 3:
        this.moveRight()
        break
      default:
        break
    }
  }

  // Enemy-specific behavior, such as attacking a player
  attackPlayer(player) {
    if (this.isInRange(player)) {
      player.stats.health -= this.stats.attack
      console.log(`Enemy attacked player! Player health: ${player.stats.health}`)
    }
  }

  // Check if the player is within attack range
  isInRange(player) {
    const distanceX = Math.abs(this.gridX - player.gridX)
    const distanceY = Math.abs(this.gridY - player.gridY)
    return distanceX <= 1 && distanceY <= 1
  }
}
