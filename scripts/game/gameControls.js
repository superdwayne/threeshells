// scripts/game/gameControls.js

let userName = ''; // Store the player's name
const gameRoot = document.getElementById('game-root');
const splashScreen = document.getElementById('splash-screen');
const startButton = document.getElementById('start-button');
const usernameInput = document.getElementById('username');
const pointsDisplay = document.getElementById('points-display'); // Points display element
let shells = [];
let ballIndex = Math.floor(Math.random() * 3); // Initial ball position
let gameOver = false;
let points = 0;
let consecutiveWins = 0; // Track consecutive wins
let shuffleInterval = 1000; // Initial shuffle interval in milliseconds
let isShuffling = false; // Flag to indicate if shells are currently being shuffled
let canClickShells = false; // Flag to control shell clickability

export function startGame() {
  userName = usernameInput.value.trim(); // Get the user's name
  if (userName === '') {
    alert('Please enter your name to start the game.');
    return;
  }

  splashScreen.style.display = 'none'; // Hide splash screen
  gameRoot.style.display = 'flex'; // Show game area
  initializeGame();
}

function initializeGame() {
  shells = [];
  ballIndex = Math.floor(Math.random() * 3); // Reset ball position
  gameOver = false;
  isShuffling = false; // Reset shuffling flag
  canClickShells = false; // Disable shell clicks at the start

  gameRoot.innerHTML = ''; // Clear previous shell containers
  for (let i = 0; i < 3; i++) {
    const shell = document.createElement('div');
    shell.classList.add('shell');
    shell.dataset.index = i;
    shell.addEventListener('click', () => handleShellClick(i));
    gameRoot.appendChild(shell);
    shells.push(shell);
  }

  const ball = document.createElement('div');
  ball.classList.add('ball');
  shells[ballIndex].appendChild(ball); // Place the ball initially under one shell

  setTimeout(() => {
    ball.style.opacity = '0'; // Hide the ball after showing it briefly
    shuffleShells(); // Start the shuffle after the ball is hidden
  }, 1000); // Display the ball for 1 second
}

function handleShellClick(index) {
  if (gameOver || isShuffling || !canClickShells) return; // Prevent clicking if the game is over, shuffling is in progress, or shells are not clickable
  const correctGuess = index === ballIndex;

  if (correctGuess) {
    points += 10;
    updatePointsDisplay();
    consecutiveWins++;

    if (consecutiveWins > 2) {
      shuffleInterval = Math.max(shuffleInterval - 200, 500); // Increase speed, but keep it above 500ms
    }

    showConfirmMessage(true);
  } else {
    points = 0;
    updatePointsDisplay();
    consecutiveWins = 0; // Reset consecutive wins
    shuffleInterval = 1000; // Reset shuffle interval
    stopBackgroundAnimation(); // Stop background movement on wrong guess
    pauseMusic(); // Pause music on incorrect guess
    backgroundAnimationStarted = false; // Reset background animation flag

    showConfirmMessage(false);
  }

  gameOver = true;
}

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
    setTimeout(() => {
      confirmElement.remove();
      initializeGame(); // Restart the game without resetting points
      canClickShells = true; // Enable shell clicks after initializing game
      resumeMusic(); // Resume music after winning
    }, 2000); // Show the win message for 2 seconds before restarting
  } else {
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

export function resetGameToSplashScreen() {
  gameOver = false;
  points = 0;
  consecutiveWins = 0;
  shuffleInterval = 1000;
  updatePointsDisplay(); // Reset points display

  userName = ''; // Clear user name
  usernameInput.value = ''; // Clear input field

  gameRoot.style.display = 'none'; // Hide game area
  splashScreen.style.display = 'flex'; // Show splash screen
  stopBackgroundAnimation(); // Stop background movement on quit
  resumeMusic(); // Start music again on quit
}

function updatePointsDisplay() {
  pointsDisplay.textContent = `Points: ${points}`;
}
