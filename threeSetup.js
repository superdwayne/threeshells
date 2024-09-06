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
    addPalmTrees(); // Add palm trees
    createBeach();
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

let palmTrees = [];

// Add palm trees to the scene
function addPalmTrees() {
    const palmTreeCount = 50; // Number of palm trees
    const trunkHeight = 5;
    const trunkRadius = 0.2;
    const leafCount = 10;
    const leafRadius = 1;

    for (let i = 0; i < palmTreeCount; i++) {
        // Random positions for palm trees
        const x = Math.random() * 50 - 25; // Range between -25 and 25
        const z = Math.random() * 50 - 25; // Range between -25 and 25

        // Create palm tree
        const palmTree = new THREE.Group();

        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        palmTree.add(trunk);

        // Create leaves
        for (let j = 0; j < leafCount; j++) {
            const leafGeometry = new THREE.CylinderGeometry(0, leafRadius, 2, 8);
            const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.y = trunkHeight + 1; // Position leaves above the trunk
            leaf.rotation.z = Math.random() * Math.PI * 2;
            leaf.rotation.y = Math.random() * Math.PI * 2;
            leaf.position.x = Math.cos(j * Math.PI / leafCount) * leafRadius;
            leaf.position.z = Math.sin(j * Math.PI / leafCount) * leafRadius;
            palmTree.add(leaf);
        }

        // Set position of the palm tree
        palmTree.position.set(x, 0, z);
        scene.add(palmTree);
    }
}

function createBeach() {
  const sandGeometry = new THREE.PlaneGeometry(100, 100); // Size of the beach
  const sandMaterial = new THREE.MeshPhongMaterial({ color: 0xF4A460 }); // Sandy color
  const sand = new THREE.Mesh(sandGeometry, sandMaterial);
  sand.rotation.x = -Math.PI / 2; // Make the plane horizontal
  sand.position.y = -0.1; // Position it slightly below the grid
  scene.add(sand);
}


// Add lights to the scene
function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 50, 0);
    scene.add(pointLight);
}

function animate() {
  requestAnimationFrame(animate);
  camera.position.x -= 0.001;
  camera.position.z -= 0.001;
  camera.lookAt(new THREE.Vector3(0, 0, -10));
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
  const howToPlayLink = document.getElementById('how-to-play-link');
  const howToPlayModal = document.getElementById('how-to-play-modal');
  const closeModal = document.getElementById('close-modal');

  // Show the How to Play modal when the link is clicked
  howToPlayLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    howToPlayModal.style.display = 'block';
  });

  // Close the modal when the close button (×) is clicked
  closeModal.addEventListener('click', () => {
    howToPlayModal.style.display = 'none';
  });

  // Close the modal if the user clicks outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === howToPlayModal) {
      howToPlayModal.style.display = 'none';
    }
  });
};

