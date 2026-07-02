(function () {
  var audio = document.getElementById('ambient');
  var btn = document.getElementById('audioToggle');
  if (!audio || !btn) return;

  var playing = false;

  window.toggleAudio = function () {
    if (playing) {
      audio.pause();
      btn.style.opacity = '0.5';
      playing = false;
    } else {
      audio.play();
      btn.style.opacity = '1';
      playing = true;
    }
  };
})();
