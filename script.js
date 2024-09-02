let userName = ''; // Store the player's name
const gameRoot = document.getElementById('game-root');
const splashScreen = document.getElementById('splash-screen');
const startButton = document.getElementById('start-button');
const usernameInput = document.getElementById('username');
const pointsDisplay = document.getElementById('points-display'); // Points display element
const muteButton = document.getElementById('mute-button'); // Mute button element
let shells = [];
let ballIndex = Math.floor(Math.random() * 3); // Initial ball position
let gameOver = false;
let points = 0;
let consecutiveWins = 0; // Track consecutive wins
let shuffleInterval = 1000; // Initial shuffle interval in milliseconds
let isShuffling = false; // Flag to indicate if shells are currently being shuffled
let canClickShells = false; // Flag to control shell clickability

// Three.js variables
let scene, camera, renderer;
let gridFloor, fogColor, backgroundAnimationStarted = false;

// Audio variables
let backgroundMusic; // Variable to store the background music
let isMuted = false; // Track mute state

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
  gridFloor.rotation.z = Math.PI / 1; // Rotate the grid to be flat on the XZ plane
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
  camera.position.x -= 0.003; // Move forward
  camera.position.z -= 0.003; // Move forward
  camera.lookAt(new THREE.Vector3(0, 0, -10)); // Keep the camera looking ahead
  
  renderer.render(scene, camera);
}

// Adjust Three.js on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize background music
function initMusic() {
  backgroundMusic = new Audio('sounds/stranger-things.mp3'); // Path to your music file
  backgroundMusic.loop = true; // Set music to loop
  backgroundMusic.volume = 0.5; // Adjust volume (0.0 to 1.0)
}

// Pause background music
function pauseMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
}

// Resume background music
function resumeMusic() {
  if (backgroundMusic && backgroundMusic.paused) {
    backgroundMusic.play();
  }
}

// Toggle mute functionality
function toggleMute() {
  if (isMuted) {
    // Unmute
    backgroundMusic.volume = 0.5; // Restore volume to previous level
    muteButton.querySelector('.front').textContent = 'Mute';
  } else {
    // Mute
    backgroundMusic.volume = 0; // Set volume to 0 (mute)
    muteButton.querySelector('.front').textContent = 'Unmute';
  }
  isMuted = !isMuted; // Toggle mute state
}

// Start the game
startButton.addEventListener('click', () => {
  startGame();
});

// Initialize mute button
muteButton.addEventListener('click', toggleMute);

function startGame() {
  userName = usernameInput.value.trim(); // Get the user's name
  if (userName === '') {
    alert('Please enter your name to start the game.');
    return;
  }

  splashScreen.style.display = 'none'; // Hide splash screen
  gameRoot.style.display = 'flex'; // Show game area
  muteButton.style.display = 'block'; // Show mute button
  initializeGame();
  resumeMusic(); // Start playing music only after the game starts
}

// Initialize game elements and state
function initializeGame() {
  shells = [];
  ballIndex = Math.floor(Math.random() * 3); // Reset ball position
  gameOver = false;
  isShuffling = false; // Reset shuffling flag
  canClickShells = false; // Disable shell clicks at the start

  // Create shells and add to the game root
  gameRoot.innerHTML = ''; // Clear previous shell containers
  for (let i = 0; i < 3; i++) {
    const shell = document.createElement('div');
    shell.classList.add('shell');
    shell.dataset.index = i;
    shell.addEventListener('click', () => handleShellClick(i));
    gameRoot.appendChild(shell);
    shells.push(shell);
  }

  // Create the ball and add it to the initial shell
  const ball = document.createElement('div');
  ball.classList.add('ball');
  shells[ballIndex].appendChild(ball); // Place the ball initially under one shell

  setTimeout(() => {
    ball.style.opacity = '0'; // Hide the ball after showing it briefly
    shuffleShells(); // Start the shuffle after the ball is hidden
  }, 1000); // Display the ball for 1 second
}

// Handle shell click
function handleShellClick(index) {
  if (gameOver || isShuffling || !canClickShells) return; // Prevent clicking if the game is over, shuffling is in progress, or shells are not clickable
  const correctGuess = index === ballIndex;

  // Update points based on guess result
  if (correctGuess) {
    points += 10;
    updatePointsDisplay();
    consecutiveWins++;

    // Increase speed after three consecutive wins
    if (consecutiveWins > 2) {
      shuffleInterval = Math.max(shuffleInterval - 200, 500); // Increase speed, but keep it above 500ms
    }

    // Show confirmation message and continue playing
    showConfirmMessage(true);
  } else {
    points = 0;
    updatePointsDisplay();
    consecutiveWins = 0; // Reset consecutive wins
    shuffleInterval = 1000; // Reset shuffle interval
    pauseMusic(); // Pause music on incorrect guess
    backgroundAnimationStarted = false; // Reset background animation flag

    // Show options to guess again or quit
    showConfirmMessage(false);
  }

  gameOver = true;
}

// Show the confirmation message with options to play again or quit
function showConfirmMessage(isWin) {
  const confirmElement = document.createElement('div');
  confirmElement.classList.add('confirm-message');
  confirmElement.innerHTML = `
    ${isWin ? `${userName}, you guessed correctly!` : `Oops, try again ${userName}`}
    <br><br>
    ${isWin ? '' : `
      <button class="pushable" id="play-again">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">Try again</span>
      </button>
      <button class="pushable" id="quit">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">Quit</span>
      </button>
    `}
  `;
  gameRoot.appendChild(confirmElement);

  if (isWin) {
    // Automatically restart the game after showing the win message
    setTimeout(() => {
      confirmElement.remove();
      initializeGame(); // Restart the game without resetting points
      canClickShells = true; // Enable shell clicks after initializing game
      resumeMusic(); // Resume music after winning
    }, 2000); // Show the win message for 2 seconds before restarting
  } else {
    // Handle play again and quit button clicks for losing state
    document.getElementById('play-again').addEventListener('click', () => {
      confirmElement.remove();
      initializeGame(); // Restart the game without resetting points
      canClickShells = true; // Enable shell clicks after initializing game
      resumeMusic(); // Resume music if the player chooses to play again
    });

    document.getElementById('quit').addEventListener('click', () => {
      if (confirm('Are you sure you want to quit? All progress will be lost.')) {
        confirmElement.remove();
        resetGameToSplashScreen();
      }
    });
  }
}

// Reset the game to the splash screen and clear all details
function resetGameToSplashScreen() {
  gameOver = false;
  points = 0;
  consecutiveWins = 0;
  shuffleInterval = 1000;
  updatePointsDisplay(); // Reset points display

  userName = ''; // Clear user name
  usernameInput.value = ''; // Clear input field

  gameRoot.style.display = 'none'; // Hide game area
  splashScreen.style.display = 'flex'; // Show splash screen
  muteButton.style.display = 'none'; // Hide mute button
  pauseMusic(); // Pause music on quit
}

// Update points display
function updatePointsDisplay() {
  pointsDisplay.textContent = `Points: ${points}`;
}

// Shuffle shells with animation
function shuffleShells() {
  if (gameOver) return;

  isShuffling = true; // Set shuffling flag to true
  canClickShells = false; // Disable shell clicks while shuffling
  const shuffleSteps = 5; // Number of shuffle steps
  let currentStep = 0;

  const interval = setInterval(() => {
    const [shell1, shell2] = getRandomShells();
    swapShellsAndAnimate(shell1, shell2);

    currentStep++;
    if (currentStep >= shuffleSteps) {
      clearInterval(interval);
      isShuffling = false; // Reset shuffling flag
      canClickShells = true; // Re-enable shell clicks after shuffling

      // Log the final position of the ball
      console.log('Final position of the ball is under shell index:', ballIndex);
    }
  }, shuffleInterval); // Use variable shuffleInterval
}

// Get two random shells to swap
function getRandomShells() {
  const indexes = [0, 1, 2];
  const i1 = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
  const i2 = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
  return [shells[i1], shells[i2]];
}

// Swap the positions of two shells with animation
function swapShellsAndAnimate(shell1, shell2) {
  // Calculate their positions relative to the parent container
  const rect1 = shell1.getBoundingClientRect();
  const rect2 = shell2.getBoundingClientRect();

  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;

  // Apply CSS animation for moving shells
  shell1.style.transition = 'transform 0.5s ease';
  shell2.style.transition = 'transform 0.5s ease';

  // Move the shells by translating them
  shell1.style.transform = `translate(${dx}px, ${dy}px)`;
  shell2.style.transform = `translate(${-dx}px, ${-dy}px)`;

  setTimeout(() => {
    // Swap the shell's positions in the DOM after animation completes
    const temp = document.createElement('div');
    shell1.parentNode.insertBefore(temp, shell1);
    shell2.parentNode.insertBefore(shell1, shell2);
    shell2.parentNode.insertBefore(shell2, temp);
    temp.remove();

    // Reset transformations
    shell1.style.transform = '';
    shell2.style.transform = '';
    shell1.style.transition = '';
    shell2.style.transition = '';

    // Check if the ball is under one of the swapped shells and update ballIndex
    if (shell1.contains(document.querySelector('.ball'))) {
      ballIndex = parseInt(shell1.dataset.index, 10);
    } else if (shell2.contains(document.querySelector('.ball'))) {
      ballIndex = parseInt(shell2.dataset.index, 10);
    }

    // Log the current position of the ball after each shuffle
    console.log('Current position of the ball is under shell index:', ballIndex);
  }, 500); // Match the animation duration
}

// Initialize Three.js and Music when the window loads
window.onload = () => {
  initThreeJS();
  initMusic(); // Initialize music
  muteButton.style.display = 'none'; // Hide the mute button initially
};
