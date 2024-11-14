<template>
  <div id="three-container" ref="threeContainer"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Player from './../class/Player';
import Grid from './../class/Grid';
import Stats from 'three/addons/libs/stats.module.js'
  import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";



export default {
  mounted() {
    this.initScene();
    this.initPlayer();
  },
  methods: {
    initScene() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.threeContainer.appendChild(this.renderer.domElement);
      const stats = new Stats();
      this.$refs.threeContainer.appendChild(stats.dom);

      // Add grid
      this.size = 40;
      this.divisions = 20;
      this.grid = new Grid(this.divisions, this.divisions,this.scene,this.size,this.divisions);



      const axesHelper = new THREE.AxesHelper(5);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(this.size * 10, this.size * 10),
        new THREE.MeshStandardMaterial({ color: new THREE.Color("rgb(255,255,255)"), side: THREE.DoubleSide })
      );
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(this.size, this.size),
        new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide })
      );

      axesHelper.position.y = 2;

      let elementDisplay = [
        axesHelper,
        floor,
        board
      ]
      board.rotation.x = Math.PI / 2;
      floor.rotation.x = Math.PI / 2;
      floor.position.y = -0.5;
      board.position.y = -0.5;
      //set gridHelper to be behind the board
      for (let element of elementDisplay) {
        this.scene.add(element);
      }


      // Add simple lighting
      const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(50, 50, 50);



      let lights = [
        ambientLight,
        pointLight,
        directionalLight
      ]
      for (let light of lights) {
        this.scene.add(light);
      }

      // Add OrbitControls for camera
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      this.controls.dampingFactor = 0.25;
      this.controls.screenSpacePanning = false;
      this.controls.maxPolarAngle = Math.PI / 2;

      this.camera.position.set(0, 10, 10);
      this.controls.update();

      this.animate();



      window.addEventListener('click', this.onMouseClick.bind(this), false);
      document.addEventListener('keydown', this.onKeyDown.bind(this), false);
      window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
      window.addEventListener('resize', this.onWindowResize.bind(this), false);

    },
    addUpdateCell(x,z,type) {

    },

    addLabel(text, x, y, z) {
      console.log(`adding label at ${x}, ${y}, ${z} with text: ${text}`);
        const div = document.createElement("div");
        div.className = "label";
        div.textContent = text;
        div.style.color = "black";
        div.style.fontSize = "12px";
        div.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
        div.style.padding = "2px 5px";
        div.style.borderRadius = "3px";
        div.style.position = "absolute";
        div.style.transform = "translate(-50%, -50%)";

        const label = new CSS2DObject(div);
        label.position.set(x, y, z);
        this.scene.add(label);
      },
    initPlayer() {
      this.players = []
      this.players.push(new Player(10, 10, this.scene, 'archer', this.size, this.divisions, this.grid));

      for (let player of this.players) {
        player.initPlayer();
      }
    },

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

    },

    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);


    },

    onMouseClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Create a raycaster and set its position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      let user_interact = false;
      if (intersects.length > 0) {
        const intersect = intersects[0];
        console.log(intersect);
        const object = intersect.object;

        // Check if the intersected object is a player
        this.players.forEach(player => {
          if (player.mesh === object) {
            user_interact = true;
            // Apply click effect (e.g., change color)
            console.log('player clicked',player);
            if(player.selected){
              player.selected = false;
              this.grid.clearAllHighlights();
              player.resetMaterial();
              return;
            }
            player.selected = true;
            player.mesh.material.color.set(0xff0000);
            this.grid.highlightCellsInRange(player.gridX, player.gridY, player.stats.speed);
          }
        });

      }


    },

    onMouseMove(event) {

      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Create a raycaster and set its position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(this.scene.children, true);

      // Reset scale of all players
      this.players.forEach(player => {
        if (player.hover == false) {
          player.mesh.position.y = 0.5;
        }
      });

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;

        // Check if the intersected object is a player
        this.players.forEach(player => {
          if (player.mesh === object) {
            // Apply hover effect (e.g., scale up)

            //apply a hover effect and reset the position of the player


            player.hoverAnimation();
          }
        });
      }

    },
    onKeyDown(event) {
      if (event.key === 'z' || event.key === 'ArrowUp') {
        this.players[0].moveForward();
      } else if (event.key === 's' || event.key === 'ArrowDown') {
        this.players[0].moveBackward();
      } else if (event.key === 'q' || event.key === 'ArrowLeft') {
        this.players[0].moveLeft();
      } else if (event.key === 'd' || event.key === 'ArrowRight') {
        this.players[0].moveRight();
      }
    }
  }
}

</script>

<style>
#three-container {
  width: 100%;
  height: 100vh;
}
</style>