// Store the player's name
let userName = '';
const gameRoot = document.getElementById('game-root');
const splashScreen = document.getElementById('splash-screen');
const startButton = document.getElementById('start-button');
const usernameInput = document.getElementById('username');
const pointsDisplay = document.getElementById('points-display');
const muteButton = document.getElementById('mute-button');
let shells = [];
let ballIndex = Math.floor(Math.random() * 3);
let gameOver = false;
let points = 0;
let consecutiveWins = 0;
let shuffleInterval = 1000;
let isShuffling = false;
let canClickShells = false;

// Three.js variables
let scene, camera, renderer, gridFloor, fogColor;
let backgroundAnimationStarted = false;

// Audio variables
let backgroundMusic;
let isMuted = false;

function onMouseClick(event) {
  if (!canClickShells || gameOver) return; // Prevent clicks when shuffling or game over

  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  

  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse positions
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(shells);

  if (intersects.length > 0) {
    const clickedShell = intersects[0].object;
    const clickedIndex = shells.indexOf(clickedShell);

    if (clickedIndex !== -1) {
      handleShellClick(clickedIndex);
    }
  }
}


// Initialize Three.js
function initThreeJS() {
  scene = new THREE.Scene();
  fogColor = new THREE.Color(0x000000);
  scene.background = fogColor;
  scene.fog = new THREE.Fog(fogColor, 0.1, 50);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 3, 15);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  

  createGridFloor();
  addLights();
  animate();

  // Add mouse click event listener for detecting clicks on cones
  window.addEventListener('click', onMouseClick, false);
}



// Create grid floor
function createGridFloor() {
  const gridSize = 100;
  const gridDivisions = 100;
  const gridColor = new THREE.Color(0xffffff);

  gridFloor = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
  // gridFloor.rotation.z = Math.PI / 1;
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
  // camera.position.x -= 0.003;
  // camera.position.z -= 0.003;
  camera.lookAt(new THREE.Vector3(0, 0, -10));
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize background music
function initMusic() {
  backgroundMusic = new Audio('sounds/stranger-things.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
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
  isMuted = !isMuted;
  backgroundMusic.volume = isMuted ? 0 : 0.5;
  muteButton.querySelector('.front').textContent = isMuted ? 'Unmute' : 'Mute';
}

// Start the game
startButton.addEventListener('click', () => {
  startGame();
});

// Initialize mute button
muteButton.addEventListener('click', toggleMute);

function startGame() {
  userName = usernameInput.value.trim();
  if (userName === '') {
    alert('Please enter your name to start the game.');
    return;
  }

  splashScreen.style.display = 'none';
  gameRoot.style.display = 'flex';
  muteButton.style.display = 'block';
  initializeGame();
  resumeMusic();
}

// Initialize game elements and state
function initializeGame() {
  shells = [];
  ballIndex = Math.floor(Math.random() * 3);
  gameOver = false;
  isShuffling = false;
  canClickShells = false; // Initially, clicking is not allowed

  // Clear previous shells and ball if any
  shells.forEach((shell) => scene.remove(shell));
  if (ball) scene.remove(ball);

  gameRoot.innerHTML = ''; // Clear the game root for new elements
  
  createShells(); // Create the shells first
  createBall(); // Then create the ball underneath one of them

  // The drop animation and shuffle will handle themselves after initialization
}





function createShells() {
  const coneGeometry = new THREE.ConeGeometry(1, 3, 32); // Parameters: radius, height, segments
  const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  const spacing = 4; // Increase spacing between cones
  
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(i * spacing - spacing, 5, 0); // Start cones higher up (y = 5)
    cone.rotation.x =  6; // Ensure cones are standing up

    scene.add(cone);
    shells.push(cone); // Store references to the shells
  }

  // Animate the cones dropping down to cover the ball
  dropDownCones();
}

// Function to animate the cones dropping down
function dropDownCones() {
  shells.forEach((shell, index) => {
    const targetY = 1.5; // Target Y position for the shells to drop down to
    const duration = 1000; // Duration in milliseconds

    // Create a function to handle the animation
    const dropAnimation = () => {
      const startTime = Date.now();

      function animateDrop() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Progress from 0 to 1
        shell.position.y = 5 - (progress * (5 - targetY)); // Animate y position from 5 to 1.5

        if (progress < 1) {
          requestAnimationFrame(animateDrop);
        } else {
          // Animation complete for this shell
          if (index === shells.length - 1) {
            // Ensure shuffling starts only after the last shell has dropped
            hideBall(); // Optionally hide the ball to reset its position
            setTimeout(() => {
              shuffleShells(); // Call shuffle function here to ensure shuffling after drop
              canClickShells = true; // Enable clicking after shuffling
            }, 500); // Delay to ensure visual separation
          }
        }
      }

      animateDrop();
    };

    dropAnimation();
  });
}






// Create and place the ball under a shell
let ball; // Define the ball variable

function createBall() {
  const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Sphere with radius 0.5
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, transparent: true }); // Yellow color for the ball with transparency enabled
  ball = new THREE.Mesh(ballGeometry, ballMaterial);

  // Position the ball under the initial shell
  ball.position.copy(shells[ballIndex].position); 
  ball.position.y = 0.5; // Adjust height to be at ground level

  scene.add(ball); // Add the ball to the scene
}

// Hide the ball
function hideBall() {
  if (ball) {
    ball.visible = false; // Make the ball invisible by setting visibility
  }
}

// Show the ball (if you need to show it after hiding)
function showBall() {
  if (ball) {
    ball.visible = true; // Make the ball visible again
  }
}

function clearCurrentConesAndBall() {
  // Remove all current shells from the scene
  shells.forEach((shell) => scene.remove(shell));
  shells = []; // Clear the shells array

  // Remove the ball from the scene
  if (ball) {
    scene.remove(ball);
    ball = null; // Reset the ball variable
  }
}
function createNewConesAndBall() {
  clearCurrentConesAndBall(); // First, clear existing elements

  createShells(); // Create new cones
  createBall(); // Create a new ball under a random shell
}



function handleShellClick(index) {
  if (gameOver || isShuffling || !canClickShells) return; // Prevent clicks when not allowed

  const correctGuess = index === ballIndex;

  if (correctGuess) {
      points += 10;
      consecutiveWins++;
      if (consecutiveWins > 2) {
          shuffleInterval = Math.max(shuffleInterval - 200, 500);
      }
      if (consecutiveWins > 3) {
          speedUpMusic(); // Speed up the music after more than 3 consecutive wins
      }
      showConfirmMessage(true); // Show win message and handle next round
  } else {
      points = 0;
      consecutiveWins = 0;
      shuffleInterval = 1000;
      pauseMusic();
      showConfirmMessage(false); // Show lose message and handle retry/quit


      // Play game over sound
      playGameOverSound();
  }

  updatePointsDisplay();
  gameOver = true;

  // Show the ball again under the correct shell
  ball.material.opacity = 1; // Make the ball visible
  ball.position.copy(shells[ballIndex].position); // Reposition the ball under the correct shell
  ball.position.y = 0.5; // Adjust height if necessary
  showBall(); // Show the ball
}



function showConfirmMessage(isWin) {
  const confirmElement = document.createElement('div');
  confirmElement.classList.add('confirm-message');
  confirmElement.innerHTML = `
    ${isWin ? `${userName}, you guessed correctly!` : `GAME OVER ${userName}`}
    <br><br>
    ${isWin ? '' : `
      <button class="pushable" id="play-again">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">Play again</span>
      </button>
    `}
  `;
  gameRoot.appendChild(confirmElement);

  if (isWin) {
    setTimeout(() => {
      confirmElement.remove();
      canClickShells = false; // Disable clicking until reshuffling is done

      // Animate shells up
      shells.forEach((shell) => {
        gsap.to(shell.position, { y: 2, duration: 0.5 });
      });

      // After the shells are up, reshuffle and then drop them
      setTimeout(() => {
        ballIndex = Math.floor(Math.random() * 3);
        ball.position.copy(shells[ballIndex].position);
        ball.position.y = 0.5; // Ensure ball is at ground level

        shuffleShells(); // Shuffle the shells

        // Animate shells down after shuffling
        setTimeout(() => {
          shells.forEach((shell) => {
            gsap.to(shell.position, { y: 0, duration: 0.5 });
          });

          setTimeout(() => {
            canClickShells = true; // Re-enable clicking after the animation
          }, 500); // Wait for the shells to drop before re-enabling clicks
        }, 500); // Allow time for the shuffle before dropping shells
      }, 500); // Allow time for shells to rise before shuffling
    }, 2000); // Time delay before reshuffling after correct guess
  } else {
    document.getElementById('play-again').addEventListener('click', () => {
      confirmElement.remove();
      initializeGame();
      canClickShells = true;
      resumeMusic();
    });
  }
}





function playGameOverSound() {
    const gameOverSound = new Audio('sounds/gameover.mp3');
    gameOverSound.play();
}


// Initialize game elements and state
function initializeGame() {
  shells = [];
  ballIndex = Math.floor(Math.random() * 3);
  gameOver = false;
  isShuffling = false;
  canClickShells = false; // Initially, clicking is not allowed

  // Clear previous shells and ball if any
  clearCurrentConesAndBall();
  
  createShells(); // Create the shells first
  createBall(); // Then create the ball underneath one of them

  // The drop animation and shuffle will handle themselves after initialization
}


// Show the confirmation message with options to play again or quit
function showConfirmMessage(isWin) {
  const confirmElement = document.createElement('div');
  confirmElement.classList.add('confirm-message');
  confirmElement.innerHTML = `
    ${isWin ? `${userName}, you guessed correctly!` : `GAME OVER ${userName}`}
    <br><br>
    ${isWin ? '' : `
      <button class="pushable" id="play-again">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front">Play again</span>
      </button>

    `}
  `;
  gameRoot.appendChild(confirmElement);

  if (isWin) {
    setTimeout(() => {
      confirmElement.remove();
      createNewConesAndBall(); // Create new cones and ball instead of reinitializing the game
      canClickShells = false; // Disable clicking until cones are dropped and shuffled
      dropDownCones(); // Drop new cones and start shuffle after dropping
      resumeMusic();

      // Shuffle shells after they drop down to start new round
      setTimeout(() => {
        shuffleShells(); // Shuffle after dropping down
        canClickShells = true; // Enable clicking after shuffling
      }, 2000); // Adjust timing as necessary to fit the animation duration
    }, 2000);
  } else {
    document.getElementById('play-again').addEventListener('click', () => {
      confirmElement.remove();
      initializeGame();
      canClickShells = true;
      resumeMusic();
    });

  ;
  }
}





// Update points display
function updatePointsDisplay() {
  pointsDisplay.textContent = `Points: ${points}`;
}




// Reset the game to the splash screen and clear all details
function resetGameToSplashScreen() {
  gameOver = false;
  points = 0;
  consecutiveWins = 0;
  shuffleInterval = 1000;
  updatePointsDisplay();

  userName = '';
  usernameInput.value = '';

  gameRoot.style.display = 'none';
  splashScreen.style.display = 'flex';
  muteButton.style.display = 'none';
  pauseMusic();
}

function dropDownCones() {
  shells.forEach((shell, index) => {
    const targetY = 1.5; // Target Y position for the shells to drop down to
    const duration = 1000; // Duration in milliseconds

    // Create a function to handle the animation
    const dropAnimation = () => {
      const startTime = Date.now();

      function animateDrop() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Progress from 0 to 1
        shell.position.y = 5 - (progress * (5 - targetY)); // Animate y position from 5 to 1.5

        if (progress < 1) {
          requestAnimationFrame(animateDrop);
        } else {
          // Animation complete for this shell
          if (index === shells.length - 1) {
            // Ensure shuffling starts only after the last shell has dropped
            hideBall(); // Optionally hide the ball to reset its position
            setTimeout(() => {
              shuffleShells(); // Call shuffle function here to ensure shuffling after drop
              canClickShells = true; // Enable clicking after shuffling
            }, 500); // Delay to ensure visual separation
          }
        }
      }

      animateDrop();
    };

    dropAnimation();
  });
}


// Shuffle shells with animation
function shuffleShells() {
  if (gameOver) return; // Prevent shuffling if the game is over

  isShuffling = true;
  canClickShells = false; // Disable clicking during shuffling
  const shuffleSteps = 5; // Number of shuffle moves
  let currentStep = 0;

  const interval = setInterval(() => {
    const [shell1, shell2] = getRandomShells(); // Get two random shells to swap
    swapShellsAndAnimate(shell1, shell2); // Perform the swap animation

    currentStep++;
    if (currentStep >= shuffleSteps) {
      clearInterval(interval); // Stop shuffling after defined steps
      isShuffling = false;
      canClickShells = true; // Enable clicking after shuffling
      console.log('Final position of the ball is under shell index:', ballIndex);
    }
  }, shuffleInterval);
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
  const shell1StartPosition = shell1.position.clone();
  const shell2StartPosition = shell2.position.clone();
  
  const duration = 500; // Duration in milliseconds
  const startTime = Date.now();

  function animateSwap() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1); // Ensure progress doesn't exceed 1

    // Linear interpolation between the starting and target positions
    shell1.position.lerpVectors(shell1StartPosition, shell2StartPosition, progress);
    shell2.position.lerpVectors(shell2StartPosition, shell1StartPosition, progress);

    if (progress < 1) {
      requestAnimationFrame(animateSwap); // Continue the animation
    } else {
      // Swap completed, update shell positions directly
      shell1.position.copy(shell2StartPosition);
      shell2.position.copy(shell1StartPosition);

      // Ensure shells' data is updated for next shuffle
      const tempIndex = shell1.userData.index;
      shell1.userData.index = shell2.userData.index;
      shell2.userData.index = tempIndex;
    }
  }

  if (shell1.userData.index === ballIndex) {
    ball.position.copy(shell1.position);
    ball.position.y = 0.5; // Adjust height to be at ground level
  } else if (shell2.userData.index === ballIndex) {
    ball.position.copy(shell2.position);
    ball.position.y = 0.5; // Adjust height to be at ground level
  }
  

  animateSwap(); // Start the animation
}



// Initialize Three.js and Music when the window loads
window.onload = () => {
  initThreeJS();
  initMusic();
  muteButton.style.display = 'none';
};
