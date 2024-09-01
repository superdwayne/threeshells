// Three.js variables
let scene, camera, renderer;
let gridFloor, fogColor;

// Initialize Three.js
function initThreeJS() {
  scene = new THREE.Scene();

  // Set the fog color to match the background
  fogColor = new THREE.Color(0x000000); // Dark color to simulate a tunnel effect
  scene.background = fogColor;
  scene.fog = new THREE.Fog(fogColor, 0.1, 50); // Start fog close to camera, ends far away

  // Create a perspective camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 10); // Start slightly above and looking down the tunnel

  // Initialize the WebGL renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add a grid floor to the scene
  const gridSize = 100; // Grid size (width and height)
  const gridDivisions = 100; // Number of divisions for the grid
  const gridColor = new THREE.Color(0xffffff); // Grid color

  gridFloor = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
  gridFloor.rotation.x = Math.PI / 2; // Rotate the grid to be flat on the XZ plane
  scene.add(gridFloor);

  // Add ambient light for subtle overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  // Add a point light to simulate a light source in the distance
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 50, 0); // Place the light above the center
  scene.add(pointLight);

  // Start the animation loop
  animate();
}

function animate() {
    requestAnimationFrame(animate);
  
    // Move the camera forward slowly to create a sense of movement
    camera.position.z -= 0.05; // Move forward
  
    // Optional: Slight camera sway for a more dynamic effect
    // camera.position.x = Math.sin(Date.now() * 0.001) * 2; // Sway left and right
    camera.position.z = 5 + Math.sin(Date.now() * 0.0001) * 4.5; // Sway up and down
  
    camera.lookAt(new THREE.Vector3(0, 0, -10)); // Keep the camera looking ahead
  
    renderer.render(scene, camera);
  }
  

// Adjust Three.js on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize Three.js when the window loads
window.onload = initThreeJS;
