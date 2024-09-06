// Global variables for audi
let playHolding;
let backgroundMusic;
let musicSpeedFactor = 1.1;

// Initialize background music
function initMusic() {
  backgroundMusic = new Audio('sounds/beach.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
}

// Pause background music
function pauseMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
}

// Play game over sound
function playGameOverSound() {
  const gameOverSound = new Audio('sounds/gameover.mp3');
  gameOverSound.volume = 0.5;
  gameOverSound.play();
}

// Play holding music
function playHoldingMusic() {
  playHolding = new Audio('sounds/holding.mp3');
  playHolding.volume = 0.5;
  playHolding.play();
}

// Pause holding music
function pauseHolding() {
  if (playHolding) {
    playHolding.pause();
  }
}

// Resume background music
function resumeMusic() {
  if (backgroundMusic && backgroundMusic.paused) {
    backgroundMusic.play();
  }
}

// Increase music speed
function speedUpMusic() {
  if (backgroundMusic) {
    backgroundMusic.playbackRate *= musicSpeedFactor; // Increase playback rate
  }
}