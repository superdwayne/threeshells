// scripts/game/initThreeJS.js
import * as THREE from 'three';

let scene, camera, renderer;
let gridFloor, fogColor;

export function initThreeJS() {
  scene = new THREE.Scene();

  fogColor = new THREE.Color(0x000000); // Dark color to simulate a tunnel effect
  scene.background = fogColor;
  scene.fog = new THREE.Fog(fogColor, 0.1, 50); // Start fog close to camera, ends far away

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 10); // Start slightly above and looking down the tunnel

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const gridSize = 100; // Grid size (width and height)
  const gridDivisions = 100; // Number of divisions for the grid
  const gridColor = new THREE.Color(0xffffff); // Grid color

  gridFloor = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
  gridFloor.rotation.z = Math.PI / 1; // Rotate the grid to be flat on the XZ plane
  scene.add(gridFloor);

  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 50, 0); // Place the light above the center
  scene.add(pointLight);

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  camera.position.x -= 0.003; // Move forward
  camera.position.z -= 0.003; // Move forward
  camera.lookAt(new THREE.Vector3(0, 0, -10)); // Keep the camera looking ahead

  renderer.render(scene, camera);
}

export function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleResize);
