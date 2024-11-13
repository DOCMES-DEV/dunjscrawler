<template>
  <div id="three-container" ref="threeContainer"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Personnage from './../class/Personnage';


export default {
  mounted() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.$refs.threeContainer.appendChild(renderer.domElement);

    // Add grid
    const size = 20;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color("rgb(255,255,255)"), new THREE.Color("rgb(255,255,255)"));
    const axesHelper = new THREE.AxesHelper(5);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(size*10, size*10),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(255,255,255)"), side: THREE.DoubleSide })
    );
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(size, size),
      new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide })
    );

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
    for(let element of elementDisplay){
        scene.add(element);
    }


    // Add simple lighting
const light = new THREE.AmbientLight( 0xB1E1FF,2 );
const pointLight = new THREE.PointLight(0xffffff, 0.1);

pointLight.position.x = 2;

pointLight.position.y = 3;

pointLight.position.z = 4;

pointLight.intensity = 2;

    let lights = [
        light,
        pointLight
    ]
    for(let light of lights){
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


    let personnages = []
    personnages.push(new Personnage(5,5,scene,'archer'));
    personnages.push(new Personnage(5,-5,scene,'barbarian'));
    personnages.push(new Personnage(-5,5,scene,'wizard'));
    for(let personnage of personnages){
        personnage.initPersonnage();
    }


    const animate = function () {
      requestAnimationFrame(animate);

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

      renderer.render(scene, camera);
    };

    animate();
  }
};
</script>

<style>
#three-container {
  width: 100%;
  height: 100vh;
}
</style>