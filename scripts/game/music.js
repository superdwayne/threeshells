// scripts/game/music.js

const music = new Audio('sounds/stranger-things.mp3');

export function initMusic() {
  music.loop = true;
  music.volume = 0.2; // Adjust volume as needed
  music.play();
}

export function pauseMusic() {
  music.pause();
}

export function resumeMusic() {
  music.play();
}
