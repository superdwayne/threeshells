// Game Variables
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

// Event Listeners
startButton.addEventListener('click', startGame);


// Start the game
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
  canClickShells = false;

  gameRoot.innerHTML = '';
  createShells();
  createBall();

  setTimeout(() => {
    hideBall();
    shuffleShells();
  }, 1000);
}

// Create shells and add event listeners
function createShells() {
  for (let i = 0; i < 3; i++) {
    const shell = document.createElement('div');
    shell.classList.add('shell');
    shell.dataset.index = i;
    shell.addEventListener('click', () => handleShellClick(i));
    gameRoot.appendChild(shell);
    shells.push(shell);
  }
}

// Create and place the ball under a shell
function createBall() {
  const ball = document.createElement('div');
  ball.classList.add('ball');
  shells[ballIndex].appendChild(ball);
}

// Hide the ball
function hideBall() {
  const ball = document.querySelector('.ball');
  if (ball) {
    ball.style.opacity = '0';
  }
}

// Handle shell click
function handleShellClick(index) {
  if (gameOver || isShuffling || !canClickShells) return;
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
    showConfirmMessage(true);
  } else {
    points = 0;
    consecutiveWins = 0;
    shuffleInterval = 1000;
    pauseMusic();
    showConfirmMessage(false);
  }

  updatePointsDisplay();
  gameOver = true;
}

// Update points display
function updatePointsDisplay() {
  pointsDisplay.textContent = `Points: ${points}`;
}

// Shuffle shells with animation
function shuffleShells() {
  if (gameOver) return;

  isShuffling = true;
  canClickShells = false;
  const shuffleSteps = 5;
  let currentStep = 0;

  const interval = setInterval(() => {
    const [shell1, shell2] = getRandomShells();
    swapShellsAndAnimate(shell1, shell2);

    currentStep++;
    if (currentStep >= shuffleSteps) {
      clearInterval(interval);
      isShuffling = false;
      canClickShells = true;
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
  const rect1 = shell1.getBoundingClientRect();
  const rect2 = shell2.getBoundingClientRect();

  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;

  shell1.style.transition = 'transform 0.5s ease';
  shell2.style.transition = 'transform 0.5s ease';

  shell1.style.transform = `translate(${dx}px, ${dy}px)`;
  shell2.style.transform = `translate(${-dx}px, ${-dy}px)`;

  setTimeout(() => {
    const temp = document.createElement('div');
    shell1.parentNode.insertBefore(temp, shell1);
    shell2.parentNode.insertBefore(shell1, shell2);
    shell2.parentNode.insertBefore(shell2, temp);
    temp.remove();

    shell1.style.transform = '';
    shell2.style.transform = '';
    shell1.style.transition = '';
    shell2.style.transition = '';

    if (shell1.contains(document.querySelector('.ball'))) {
      ballIndex = parseInt(shell1.dataset.index, 10);
    } else if (shell2.contains(document.querySelector('.ball'))) {
      ballIndex = parseInt(shell2.dataset.index, 10);
    }

    console.log('Current position of the ball is under shell index:', ballIndex);
  }, 500);
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
    setTimeout(() => {
      confirmElement.remove();
      initializeGame();
      canClickShells = true;
      resumeMusic();
    }, 2000);
  } else {
    document.getElementById('play-again').addEventListener('click', () => {
      confirmElement.remove();
      initializeGame();
      canClickShells = true;
      resumeMusic();
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
  updatePointsDisplay();

  userName = '';
  usernameInput.value = '';

  gameRoot.style.display = 'none';
  splashScreen.style.display = 'flex';
  muteButton.style.display = 'none';
  pauseMusic();
}

// Initialize game on window load
window.onload = () => {
  muteButton.style.display = 'none';
};
