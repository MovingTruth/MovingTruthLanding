document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('.series-index[data-series]');
  if (!section) return;

  var slug = section.dataset.series;
  var cards = section.querySelectorAll('.part-card[data-part]');
  if (!cards.length) return;

  var total = cards.length;
  var reflected = 0;

  cards.forEach(function (card) {
    var part = parseInt(card.dataset.part, 10);
    var key = 'mt_' + slug + '_reflected_' + part;
    var prevKey = 'mt_' + slug + '_reflected_' + (part - 1);
    var isReflected = MT.get(key);
    var prereqMet = part === 1 || MT.get(prevKey);

    if (isReflected) {
      reflected++;
      card.classList.add('part-card--reflected');
    } else if (!prereqMet) {
      card.classList.add('part-card--locked');
      card.removeAttribute('href');
    }
  });

  if (reflected > 0) {
    var progressEl = document.getElementById('series-progress');
    var textEl = document.getElementById('progress-text');
    if (progressEl && textEl) {
      textEl.textContent = reflected + ' of ' + total + ' complete';
      progressEl.style.display = 'flex';
    }
  }

  var resetBtn = document.getElementById('reset-progress');
  if (resetBtn && reflected > 0) {
    resetBtn.addEventListener('click', function () {
      if (!confirm('Reset your progress for this series? You\'ll need to read through in order again.')) return;
      var prefix = 'mt_' + slug + '_reflected_';
      MT.keysStartingWith(prefix).forEach(function (k) { MT.remove(k); });
      for (var i = 1; i <= total + 5; i++) {
        MT.remove(prefix + i);
      }
      window.location.reload();
    });
  }
});
