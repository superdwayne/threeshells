// Game Variables
let userName = '';
let shells = [];
let ballIndex = 0;
let gameOver = false;
let points = 0;
let consecutiveWins = 0;
let shuffleInterval = 1000;
let isShuffling = false;
let canClickShells = false;

// DOM Elements
const gameRoot = document.getElementById('game-root');
const splashScreen = document.getElementById('splash-screen');
const startButton = document.getElementById('start-button');
const usernameInput = document.getElementById('username');
const pointsDisplay = document.getElementById('points-display');
const muteButton = document.getElementById('mute-button');

// Event Listeners
startButton.addEventListener('click', startGame);

// Game Functions
function startGame() {
  userName = usernameInput.value.trim();
  if (!userName) {
    alert('Please enter your name to start the game.');
    return;
  }

  splashScreen.style.display = 'none';
  gameRoot.style.display = 'flex';
  initializeGame();
  resumeMusic();
}

function initializeGame() {
  resetGameState();
  createGameElements();
  setTimeout(() => {
    hideBall();
    shuffleShells();
  }, 1000);
}

function resetGameState() {
  shells = [];
  ballIndex = Math.floor(Math.random() * 3);
  gameOver = false;
  isShuffling = false;
  canClickShells = false;
  gameRoot.innerHTML = '';
}

function createGameElements() {
  createShells();
  createBall();
}

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

function createBall() {
  const ball = document.createElement('div');
  ball.classList.add('ball');
  shells[ballIndex].appendChild(ball);
}

function hideBall() {
  const ball = document.querySelector('.ball');
  if (ball) {
    ball.style.opacity = '0';
  }
}

function handleShellClick(index) {
  if (gameOver || isShuffling || !canClickShells) return;
  
  const correctGuess = index === ballIndex;
  updateGameState(correctGuess);
  showConfirmMessage(correctGuess);
  updatePointsDisplay();
  gameOver = true;
}

// Update game state based on correct or incorrect guess
function updateGameState(correctGuess) {
    if (correctGuess) {
      points += 10;
      consecutiveWins++;
      shuffleInterval = Math.max(shuffleInterval - 200, 500);
  
      if (consecutiveWins > 2) {
        speedUpMusic(); // Speed up the music after more than 3 consecutive wins
      }
    } else {
      consecutiveWins = 0;
      shuffleInterval = 1000;
      pauseMusic();
      playHoldingMusic();
    }
  }

function updatePointsDisplay() {
  pointsDisplay.textContent = `Points: ${points}`;
}

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
    }
  }, shuffleInterval);
}

function getRandomShells() {
  const indexes = [0, 1, 2];
  const i1 = indexes.splice(Math.floor(Math.random() * indexes.length), 1)[0];
  const i2 = indexes[Math.floor(Math.random() * indexes.length)];
  return [shells[i1], shells[i2]];
}

function swapShellsAndAnimate(shell1, shell2) {
  const rect1 = shell1.getBoundingClientRect();
  const rect2 = shell2.getBoundingClientRect();
  const dx = rect2.left - rect1.left;
  const dy = rect2.top - rect1.top;

  animateShellSwap(shell1, shell2, dx, dy);

  setTimeout(() => {
    swapShellPositions(shell1, shell2);
    updateBallIndex(shell1, shell2);
  }, 500);
}

function animateShellSwap(shell1, shell2, dx, dy) {
  shell1.style.transition = shell2.style.transition = 'transform 0.5s ease';
  shell1.style.transform = `translate(${dx}px, ${dy}px)`;
  shell2.style.transform = `translate(${-dx}px, ${-dy}px)`;
}

function swapShellPositions(shell1, shell2) {
  const temp = document.createElement('div');
  shell1.parentNode.insertBefore(temp, shell1);
  shell2.parentNode.insertBefore(shell1, shell2);
  shell2.parentNode.insertBefore(shell2, temp);
  temp.remove();

  shell1.style.transform = shell2.style.transform = '';
  shell1.style.transition = shell2.style.transition = '';
}

function updateBallIndex(shell1, shell2) {
  if (shell1.contains(document.querySelector('.ball'))) {
    ballIndex = parseInt(shell1.dataset.index, 10);
  } else if (shell2.contains(document.querySelector('.ball'))) {
    ballIndex = parseInt(shell2.dataset.index, 10);
  }
  console.log('Current position of the ball is under shell index:', ballIndex);
}

function showConfirmMessage(isWin) {
  const confirmElement = document.createElement('div');
  confirmElement.classList.add('confirm-message');

  if (isWin) {
    handleWin(confirmElement);
    document.body.appendChild(confirmElement);
  } else {
    handleLoss(confirmElement);
  }
}

function handleWin(confirmElement) {
    confirmElement.innerHTML = `<p>${userName}, Correct!</p>`;
    confirmElement.style.position = 'absolute';
    confirmElement.style.top = '2%';
    confirmElement.style.left = '50%';
    confirmElement.style.transform = 'translate(-50%, -50%)';

    confirmElement.style.color = 'white';
    confirmElement.style.textAlign = 'center';
    
    setTimeout(() => {
      confirmElement.remove(); // Remove message after 2 seconds
      initializeGame(); // Restart the game after showing the message
      canClickShells = true;
      resumeMusic();
    }, 2000); // 2 seconds duration
  }

function handleLoss(confirmElement) {
  confirmElement.innerHTML = `
    <p>GAME OVER ${userName}</p>
    <p>Do you want to save your score?</p>
    <button class="pushable" id="save-score">
      <span class="shadow"></span>
      <span class="edge"></span>
      <span class="front">Save Score</span>
    </button>
    <button class="pushable" id="discard-score">
      <span class="shadow"></span>
      <span class="edge"></span>
      <span class="front">Discard Score</span>
    </button>
  `;
  gameRoot.appendChild(confirmElement);

  document.getElementById('save-score').addEventListener('click', saveScore);
  document.getElementById('discard-score').addEventListener('click', discardScore);
}

async function saveScore() {
  try {
    const { data, error } = await _supabase
      .from('scores')
      .insert([{ username: userName, points: points }]);

    if (error) {
      console.error('Error saving data:', error);
      alert('Failed to save your score. Please try again.');
    } else {
      console.log('Data saved successfully:', data);
      alert('Your score has been saved!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('Failed to save your score. Please try again.');
  } finally {
    resetGameToSplashScreen();
  }
}

function discardScore() {
  pauseHolding();
  pauseMusic();
  points = 0;
  updatePointsDisplay();
  resetGameToSplashScreen();
}

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

  pauseMusic();
  pauseHolding();
}


