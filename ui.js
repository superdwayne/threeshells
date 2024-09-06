// UI Variables
let isMuted = false;
const musicSpeedFactor = 1.2; // Speed-up factor for the music
let backgroundMusic;

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

// Increase music speed
function speedUpMusic() {
  if (backgroundMusic) {
    backgroundMusic.playbackRate *= musicSpeedFactor; // Increase playback rate
  }
}

// Toggle mute functionality
function toggleMute() {
  isMuted = !isMuted;
  backgroundMusic.volume = isMuted ? 0 : 0.5;
  muteButton.querySelector('.front').textContent = isMuted ? 'Unmute' : 'Mute';
}

// Initialize UI elements
function initUI() {
  // Initialize mute button
  muteButton.style.display = 'none';
  muteButton.addEventListener('click', toggleMute);
}

window.onload = () => {
    initThreeJS();
    initMusic(); // Assuming initMusic is defined in audio.js
    muteButton.style.display = 'none';
  };