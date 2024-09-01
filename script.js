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

// Start button click event to start the game
startButton.addEventListener('click', startGame);

function startGame() {
  userName = usernameInput.value.trim(); // Get the user's name
  if (userName === '') {
    alert('Please enter your name to start the game.');
    return;
  }

  splashScreen.style.display = 'none'; // Hide splash screen
  gameRoot.style.display = 'flex'; // Show game area
  initializeGame();
}

// Initialize game elements and state
function initializeGame() {
  shells = [];
  ballIndex = Math.floor(Math.random() * 3); // Reset ball position
  gameOver = false;
  isShuffling = false; // Reset shuffling flag

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
  if (gameOver || isShuffling) return; // Prevent clicking if the game is over or if shuffling is in progress
  const correctGuess = index === ballIndex;

  // Display a message to the user
  showMessage(correctGuess ? 'You Win!' : `${userName}, You Lose!`, correctGuess);

  // Update points based on guess result
  if (correctGuess) {
    points += 10;
    updatePointsDisplay();
    consecutiveWins++;

    // Increase speed after three consecutive wins
    if (consecutiveWins > 3) {
      shuffleInterval = Math.max(shuffleInterval - 200, 500); // Increase speed, but keep it above 500ms
    }
  } else {
    points = 0;
    updatePointsDisplay();
    consecutiveWins = 0; // Reset consecutive wins
    shuffleInterval = 1000; // Reset shuffle interval
  }

  gameOver = true;

  // Show options to guess again or quit
  showConfirmMessage(correctGuess);
}

// Display a message to the user
function showMessage(message, isWin) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.textContent = message;
  gameRoot.appendChild(messageElement);
  messageElement.style.color = isWin ? 'green' : 'red';
}

// Show the confirmation message with options to play again or quit
function showConfirmMessage(isWin) {
  const confirmElement = document.createElement('div');
  confirmElement.classList.add('confirm-message');
  confirmElement.innerHTML = `
    ${isWin ? `You guessed correctly! Your points: ${points}.` : 'Do you want to guess again or quit?'}
    <br><br>
    <button id="play-again">Play Again</button>
    <button id="quit">Quit</button>
  `;
  gameRoot.appendChild(confirmElement);

  document.getElementById('play-again').addEventListener('click', () => {
    confirmElement.remove();
    initializeGame(); // Restart the game without resetting points
  });

  document.getElementById('quit').addEventListener('click', () => {
    if (confirm('Are you sure you want to quit? All progress will be lost.')) {
      confirmElement.remove();
      resetGameToSplashScreen();
    }
  });
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
}

// Update points display
function updatePointsDisplay() {
  pointsDisplay.textContent = `Points: ${points}`;
}

// Shuffle shells with animation
function shuffleShells() {
  if (gameOver) return;

  isShuffling = true; // Set shuffling flag to true
  const shuffleSteps = 5; // Number of shuffle steps
  let currentStep = 0;

  const interval = setInterval(() => {
    const [shell1, shell2] = getRandomShells();
    swapShellsAndAnimate(shell1, shell2);

    currentStep++;
    if (currentStep >= shuffleSteps) {
      clearInterval(interval);
      isShuffling = false; // Reset shuffling flag after shuffling is complete

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
