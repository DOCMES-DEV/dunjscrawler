<template>
    <div ref="container" class="three-container">
      <!-- The 3D scene will render here -->
    </div>
  </template>

  <script>
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

  export default {
    name: "ThreeGridWithCoordinates",
    mounted() {
      this.initScene();
      this.animate();
      window.addEventListener("resize", this.onWindowResize);
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.onWindowResize);
      cancelAnimationFrame(this.animationFrameId);
    },
    methods: {
      initScene() {
        // Set up scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(50, 50, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.$refs.container.appendChild(this.renderer.domElement);

        // Set up CSS2DRenderer for coordinate labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = "absolute";
        this.labelRenderer.domElement.style.top = "0";
        this.$refs.container.appendChild(this.labelRenderer.domElement);

        // Add OrbitControls for camera interaction
        this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
        this.controls.enableDamping = true;

        // Offset the grid so the bottom-left is at (0,0,0)
        const gridHelper = new THREE.GridHelper(100, 10); // 100 units wide with 10 divisions
        gridHelper.position.set(50, 0, 50); // Offset by half grid size on X and Z
        this.scene.add(gridHelper);

        // Add coordinate labels with (0,0,0) at the bottom-left corner
        const gridSize = 10; // Size of each cell
        const divisions = 10; // Number of cells in one direction

        for (let x = 0; x <= divisions; x++) {
          for (let z = 0; z <= divisions; z++) {
            const labelText = `(${x * gridSize}, 0, ${z * gridSize})`;
            this.addLabel(labelText, x * gridSize, 0, z * gridSize);
          }
        }
      },
      addLabel(text, x, y, z) {
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
      onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
      },
      animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
      }
    }
  };
  </script>

  <style scoped>
  .three-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .label {
    color: black;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.7);
    padding: 2px 5px;
    border-radius: 3px;
    position: absolute;
    transform: translate(-50%, -50%);
  }
  </style>
