var audio = document.getElementById('ambient');
var btn = document.getElementById('audioToggle');
var playing = false;

function toggleAudio() {
  if (playing) {
    audio.pause();
    btn.style.opacity = '0.5';
    playing = false;
  } else {
    audio.play();
    btn.style.opacity = '1';
    playing = true;
  }
}
