/*
  series-progress.js
  Runs on series index pages (.series-index[data-series]).
  Reads localStorage (via MT helper) to mark parts as reflected or locked.

  Storage keys per part:
    mt_{slug}_reflected_{part}  — set by reflect.js after the 30-second timer completes,
                                  or by the blessing flow after "Accept this blessing."
    mt_{slug}_accepted_{part}   — set by the blessing flow specifically; tracks whether
                                  a blessing has been accepted (drives the "Accept this
                                  blessing again" label). Cleared alongside _reflected_
                                  on reset so a reset piece doesn't still read "again."

  Part states applied at runtime (CSS classes on .part-card):
    part-card--reflected  — reader has completed this part
    part-card--locked     — prerequisite part not yet reflected; href is removed

  freeAccess mode (data-free-access="true" on .series-index):
    Set via freeAccess: true in the section _index.md front matter.
    Skips sequential locking entirely — all parts remain clickable regardless of progress.
    Used for Blessings (and any future sections where order doesn't matter).
    DO NOT set freeAccess on ordered narrative series — it would bypass the intended gating.
*/
document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('.series-index[data-series]');
  if (!section) return;

  var slug = section.dataset.series;
  var cards = section.querySelectorAll('.part-card[data-part]');
  if (!cards.length) return;

  var total = cards.length;
  var reflected = 0;
  // freeAccess: set via data-free-access on the section element (from freeAccess: true in _index.md).
  // Skips sequential locking so all parts are accessible in any order (e.g. Blessings).
  var freeAccess = section.dataset.freeAccess === 'true';

  cards.forEach(function (card) {
    var part = parseInt(card.dataset.part, 10);
    var key = 'mt_' + slug + '_reflected_' + part;
    var prevKey = 'mt_' + slug + '_reflected_' + (part - 1);
    var isReflected = MT.get(key);
    var prereqMet = freeAccess || part === 1 || MT.get(prevKey);

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
      var reflectedPrefix = 'mt_' + slug + '_reflected_';
      var acceptedPrefix = 'mt_' + slug + '_accepted_';
      MT.keysStartingWith(reflectedPrefix).forEach(function (k) { MT.remove(k); });
      MT.keysStartingWith(acceptedPrefix).forEach(function (k) { MT.remove(k); });
      for (var i = 1; i <= total + 5; i++) {
        MT.remove(reflectedPrefix + i);
        MT.remove(acceptedPrefix + i);
      }
      MT.remove('mt_' + slug + '_closing');
      window.location.reload();
    });
  }
});
