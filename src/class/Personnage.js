// Personnage.js
import * as THREE from 'three'
export default class Personnage {
  constructor(x, y, scene, type) {
    this.x = x
    this.y = y
    this.scene = scene
    this.type = type
    this.geometry = null
    this.material = null
    this.mesh = null
  }

  initPersonnage() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1)
    if (this.type === 'barbarian') {
      this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    }
    if (this.type === 'wizard') {
      this.material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
    }

    if (this.type === 'archer') {
      this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    }
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(this.x, 0.5, this.y)
    this.scene.add(this.mesh)
  }

  // Méthode pour obtenir la position du personnage
  getPosition() {
    return { x: this.x, y: this.y }
  }
}
