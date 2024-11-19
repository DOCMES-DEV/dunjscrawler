<template>
  <div id="three-container" ref="threeContainer"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Player from './../class/Player'
import Grid from './../class/Grid'
import Stats from 'three/addons/libs/stats.module.js'
import Enviroment from './../class/Environement'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { GUI } from 'dat.gui'
import Enemy from './../class/Enemy'
export default {
  mounted() {
    this.objects = []
    this.initScene()
    this.initPlayer()
    this.initWall()
    this.initGUI()
  },
  methods: {
     load3DModels() {

    },
    initGUI() {
      this.gui = new GUI()
      const objectFolder = this.gui.addFolder('Objects')
      console.log(this.objects)
      this.objects.forEach((object, index) => {
        objectFolder
          .add({ focus: () => this.focusOnObject(object) }, 'focus')
          .name(`Object ${index + 1}`)
      })
      objectFolder.open()

      // Folder for ambient light
      const ambientFolder = this.gui.addFolder('Ambient Light')
      ambientFolder.add(this.ambientLight, 'intensity', 0, 2).name('Intensity')
      ambientFolder.addColor(this.ambientLight, 'color').name('Color')
      ambientFolder.add(this.ambientLight.position, 'x', -20, 20).name('Position X')
      ambientFolder.add(this.ambientLight.position, 'y', -20, 20).name('Position Y')
      ambientFolder.add(this.ambientLight.position, 'z', -20, 20).name('Position Z')

      ambientFolder.open()

      // Folder for directional light
      const directionalFolder = this.gui.addFolder('Directional Light')
      directionalFolder.add(this.directionalLight, 'intensity', 0, 2).name('Intensity')
      directionalFolder.add(this.directionalLight.position, 'x', -20, 20).name('Position X')
      directionalFolder.add(this.directionalLight.position, 'y', -20, 20).name('Position Y')
      directionalFolder.add(this.directionalLight.position, 'z', -20, 20).name('Position Z')
      directionalFolder.add(this.directionalLight, 'castShadow').name('Cast Shadow')

      directionalFolder.open()

      // Folder for point light
      const pointFolder = this.gui.addFolder('Point Light')
      pointFolder.add(this.pointLight, 'intensity', 0, 2).name('Intensity')
      pointFolder.add(this.pointLight.position, 'x', -20, 20).name('Position X')
      pointFolder.add(this.pointLight.position, 'y', -20, 20).name('Position Y')
      pointFolder.add(this.pointLight.position, 'z', -20, 20).name('Position Z')
      pointFolder.open()

      // Folder for hemisphere light
      const hemisphereFolder = this.gui.addFolder('Hemisphere Light')
      hemisphereFolder.add(this.hemisphereLight, 'intensity', 0, 2).name('Intensity')
      hemisphereFolder.addColor(this.hemisphereLight, 'skyColor').name('Sky Color')
      hemisphereFolder.addColor(this.hemisphereLight, 'groundColor').name('Ground Color')
      hemisphereFolder.open()
    },
    focusOnObject(object) {
      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      this.controls.target.copy(center)
      this.camera.position.set(center.x, center.y + 2, center.z + 2)
      this.controls.update()
    },
    initScene() {
      this.raycastList = []
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      )
      this.renderer = new THREE.WebGLRenderer()
      this.renderer.physicallyCorrectLights = true // Active un comportement physique pour les lumières
      this.renderer.outputEncoding = THREE.sRGBEncoding // Corrige les couleurs pour un rendu plus réaliste
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping // Meilleur rendu pour les lumières intenses
      this.renderer.toneMappingExposure = 1 // Ajuste l'exposition globale
      this.renderer.shadowMap.enabled = true // Active les ombres
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // Ombres douces
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.$refs.threeContainer.appendChild(this.renderer.domElement)
      const stats = new Stats()
      this.$refs.threeContainer.appendChild(stats.dom)

      // Add grid
      this.size = 40
      this.divisions = 20
      this.grid = new Grid(this.divisions, this.divisions, this.scene, this.size, this.divisions)

      const axesHelper = new THREE.AxesHelper(5)
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(this.size * 10, this.size * 10),
        new THREE.MeshPhongMaterial({
          color: new THREE.Color('rgb(255,255,255)'),
          side: THREE.DoubleSide,
        }),
      )
      floor.receiveShadow = true
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(this.size, this.size),
        new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide }),
      )
      board.receiveShadow = true

      axesHelper.position.y = 2

      let elementDisplay = [floor, board]
      board.rotation.x = Math.PI / 2

      floor.rotation.x = Math.PI / 2
      floor.position.y = -2
      board.position.y = -1.5
      //set gridHelper to be behind the board
      for (let element of elementDisplay) {
        this.scene.add(element)
      }

      // Add simple lighting

      // Add directional light
      this.directionalLight = new THREE.DirectionalLight(0xffffff, 3)
      this.directionalLight.position.set(10, 20, 10)
      this.directionalLight.target.position.set(0, 0, 0)
      this.directionalLight.shadow.camera.near = 0.1
      this.directionalLight.shadow.camera.far = 500
      this.directionalLight.shadow.camera.left = -50
      this.directionalLight.shadow.camera.right = 50
      this.directionalLight.shadow.camera.top = 50
      this.directionalLight.shadow.camera.bottom = -50
      this.directionalLight.shadow.mapSize.width = 1024
      this.directionalLight.shadow.mapSize.height = 1024
      this.directionalLight.castShadow = true

      // Add point light

      // Add Hemisphere light
      this.hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.5)

      let lights = [this.directionalLight, this.hemisphereLight]
      for (let light of lights) {
        this.scene.add(light)
      }

      // Add helpers for each light
      const directionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 2)
      const hemisphereLightHelper = new THREE.HemisphereLightHelper(this.hemisphereLight, 2)

      // this.scene.add(directionalLightHelper)
      // this.scene.add(pointLightHelper);
      // this.scene.add(hemisphereLightHelper)

      // Add OrbitControls for camera
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.25
      this.controls.screenSpacePanning = false
      this.controls.maxPolarAngle = Math.PI / 2

      this.camera.position.set(0, 10, 10)
      this.controls.update()

      this.animate()

      window.addEventListener('click', this.onMouseClick.bind(this), false)
      document.addEventListener('keydown', this.onKeyDown.bind(this), false)
      window.addEventListener('mousemove', this.onMouseMove.bind(this), false)
      window.addEventListener('resize', this.onWindowResize.bind(this), false)
    },
    addUpdateCell(x, z, type) {},

    addLabel(text, x, y, z) {
      console.log(`adding label at ${x}, ${y}, ${z} with text: ${text}`)
      const div = document.createElement('div')
      div.className = 'label'
      div.textContent = text
      div.style.color = 'black'
      div.style.fontSize = '12px'
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
      div.style.padding = '2px 5px'
      div.style.borderRadius = '3px'
      div.style.position = 'absolute'
      div.style.transform = 'translate(-50%, -50%)'

      const label = new CSS2DObject(div)
      label.position.set(x, y, z)
      this.scene.add(label)
    },
    initPlayer() {
      this.players = []
      this.players.push(
        new Player(10, 10, this.scene, 'barbarian', this.size, this.divisions, this.grid,'left'),
      )

      this.players.push(
        new Player(10, 15, this.scene, 'archer', this.size, this.divisions, this.grid),
      )
      this.players.push(
        new Player(15, 10, this.scene, 'mage', this.size, this.divisions, this.grid,'right'),
      )

      for (let player of this.players) {
        player.initPlayer()
      }

      this.initEnemy()
    },

    async initEnemy() {
      this.enemies = []
      this.enemies.push(
        new Enemy(5, 5, this.scene, 'goblin', this.size, this.divisions, this.grid,'down'),
      )



      for (let enemy of this.enemies) {
        await enemy.initEnemy()
      }

    },

    initWall() {
      this.environement = new Enviroment(this.scene, this.grid, this.size, this.divisions)
      this.environement.initWalls()
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },

    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },

    onMouseClick(event) {
      // if click is right click, return
      if (event.button === 2) {
        return
      }

      // if click is hold and drag, return

      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Create a raycaster and set its position
      const raycaster = new THREE.Raycaster()
      raycaster.layers.set(0)
      raycaster.setFromCamera(mouse, this.camera)

      // Calculate objects intersecting the picking ray

      //display the raycast

      const intersects = raycaster.intersectObjects(this.scene.children, true)

      const geometry = new THREE.BufferGeometry().setFromPoints([
        raycaster.ray.origin,
        raycaster.ray.origin.clone().add(raycaster.ray.direction.multiplyScalar(1000)),
      ])
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
      const line = new THREE.Line(geometry, material)
      line.name = 'raycast-line'
      line.isRaycastLine = true
      if (this.raycastList.length > 0) {
        this.raycastList.forEach((raycast) => {
          this.scene.remove(raycast)
        })
      }
      this.raycastList = []
      this.raycastList.push(line)

      this.scene.add(line)

      let user_interact = false
      intersects.filter((intersect) => !intersect.object.name.includes('raycast-line'))
      if (intersects.length > 0) {
        console.log(intersects[0].object)
        const intersect = intersects[0]
        console.log(intersect)
        const object = intersect.object

        let outline_clicked = this.grid.cells.filter((cell) => cell.outline.uuid === object.uuid)
        console.log('outline clicked', outline_clicked)
        if (outline_clicked.length > 0) {
          let cell = outline_clicked[0]
          console.log('cell clicked', cell)
          if (cell.type === 'movableDestination') {
            console.log('cell highlighted')
            this.players.forEach((player) => {
              if (player.selected) {
                player.movePlayer(cell.x, cell.y)
                player.resetMaterial()
                player.selected = false
                this.grid.clearAllHighlights()
              }
            })
          }
        }

        // Check if the intersected object is a player
        this.players.forEach((player) => {
          if (player.mesh === object) {
            user_interact = true
            // Apply click effect (e.g., change color)
            console.log('player clicked', player)
            if (player.selected) {
              user_interact = false
              player.selected = false
              this.grid.clearAllHighlights()
              player.resetMaterial()
              return
            }
            player.selected = true
            player.mesh.material.color.set(0xff0000)
            this.grid.highlightCellsInRange(player.gridX, player.gridY, player.stats.speed)
          }
        })
      }
    },

    onMouseMove(event) {
      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Create a raycaster and set its position
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, this.camera)

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.scene.children, true)



      if (intersects.length > 0) {
        const intersect = intersects[0]
        const object = intersect.object

        // Check if the intersected object is a player
        this.players.forEach((player) => {
          if (player.mesh === object) {
            // Apply hover effect (e.g., scale up)

            //apply a hover effect and reset the position of the player

            player.hoverAnimation()
          }
        })
      }
    },
    onKeyDown(event) {
      if (event.key === 'z' || event.key === 'ArrowUp') {
        this.players[0].moveForward()
      } else if (event.key === 's' || event.key === 'ArrowDown') {
        this.players[0].moveBackward()
      } else if (event.key === 'q' || event.key === 'ArrowLeft') {
        this.players[0].moveLeft()
      } else if (event.key === 'd' || event.key === 'ArrowRight') {
        this.players[0].moveRight()
      }
    },
  },
}
</script>

<style>
#three-container {
  width: 100%;
  height: 100vh;
}
</style>
