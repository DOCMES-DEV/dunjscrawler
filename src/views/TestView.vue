<template>
  <div id="three-container" ref="threeContainer"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Player from './../class/Player';
import Grid from './../class/Grid';


export default {
  mounted() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.$refs.threeContainer.appendChild(renderer.domElement);

    // Add grid
    const size = 40;
    const divisions = 10;
    const grid = new Grid(divisions, divisions);
    const gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color("rgb(255,255,255)"), new THREE.Color("rgb(255,255,255)"));
    const axesHelper = new THREE.AxesHelper(5);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(size * 10, size * 10),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("rgb(255,255,255)"), side: THREE.DoubleSide })
    );
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(size, size),
      new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide })
    );

    axesHelper.position.y = 2;

    let elementDisplay = [
      gridHelper,
      axesHelper,
      floor,
      board
    ]
    board.rotation.x = Math.PI / 2;
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.5;
    board.position.y = -0.5;
    //set gridHelper to be behind the board
    gridHelper.position.y = +0.01;
    for (let element of elementDisplay) {
      scene.add(element);
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
      scene.add(light);
    }

    // Add OrbitControls for camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    camera.position.set(0, 10, 10);
    controls.update();


    let players = []
    players.push(new Player(1, 1, scene, 'archer', size, divisions, grid));

    for (let player of players) {
      player.initPlayer();
    }




    document.addEventListener('keydown', (event) => {
      if (event.key === 'z') {
        players[0].moveForward();
      } else if (event.key === 's') {
        players[0].moveBackward();
      } else if (event.key === 'q') {
        players[0].moveLeft();
      } else if (event.key === 'd') {
        players[0].moveRight();
      }
    });

    const animate = function () {
      requestAnimationFrame(animate);

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

      renderer.render(scene, camera);
    };

    animate();

    const onMouseClick = (event) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Create a raycaster and set its position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children, true);
      let user_interact = false;
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;

        // Check if the intersected object is a player
        players.forEach(player => {
          if (player.mesh === object) {
            user_interact = true;
            // Apply click effect (e.g., change color)
            player.mesh.material.color.set(0xff0000);
          }
        });

      }
      if (!user_interact) {
        players.forEach(player => {
          player.resetMaterial();
        });
      }
    }

    window.addEventListener('click', onMouseClick.bind(this), false);

    const onMouseMove = (event) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Create a raycaster and set its position
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Reset scale of all players
      players.forEach(player => {
        player.mesh.scale.set(1, 1, 1);
      });

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const object = intersect.object;

        // Check if the intersected object is a player
        players.forEach(player => {
          if (player.mesh === object) {
            // Apply hover effect (e.g., scale up)
            player.mesh.scale.set(1.2, 1.2, 1.2);
          }
        });
      }
    }
    window.addEventListener('mousemove', onMouseMove.bind(this), false);
  }
}

</script>

<style>
#three-container {
  width: 100%;
  height: 100vh;
}
</style>