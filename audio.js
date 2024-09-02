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
}
