// Three.js variables
let scene, camera, renderer, gridFloor, fogColor;

// Initialize Three.js
function initThreeJS() {
    scene = new THREE.Scene();
    fogColor = new THREE.Color(0x000000);
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 0.1, 50);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createGridFloor();
    addLights();
    animate();
}

// Create grid floor
function createGridFloor() {
    const gridSize = 100;
    const gridDivisions = 100;
    const gridColor = new THREE.Color(0xffffff);

    gridFloor = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
    gridFloor.rotation.z = Math.PI / 1;
    scene.add(gridFloor);
}

// Add lights to the scene
function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 50, 0);
    scene.add(pointLight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize Three.js and Music when the window loads
window.onload = () => {
  initThreeJS();
  initMusic();
  muteButton.style.display = 'none';
};
