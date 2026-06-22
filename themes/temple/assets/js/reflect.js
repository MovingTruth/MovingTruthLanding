document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.piece-nav');
  if (!nav) return;

  var series = nav.dataset.series;
  var currentPart = parseInt(nav.dataset.part, 10);
  var isClosing = nav.dataset.closing === 'true';
  var isFinal = nav.dataset.final === 'true';
  var isBlessing = nav.dataset.blessing === 'true';
  var seriesPage = nav.dataset.seriesPage || '/series';
  var nextWrap = nav.querySelector('.piece-nav-next-wrap');
  var nextLink = nav.querySelector('.piece-nav-next--locked');

  if (!nextLink && !isClosing && !isFinal && !isBlessing) return;

  var countdownEl = nav.querySelector('.reflect-countdown');
  var messageEl = nav.querySelector('.reflect-message');
  var overlay = document.getElementById('mt-reflect-overlay');
  var overlayTitle = overlay ? overlay.querySelector('.mt-reflect-title') : null;
  var overlaySub = overlay ? overlay.querySelector('.mt-reflect-sub') : null;
  var overlayInstruction = overlay ? overlay.querySelector('.mt-reflect-instruction') : null;
  var overlayTimer = document.getElementById('mt-reflect-timer');
  var overlayUnlock = overlay ? overlay.querySelector('.mt-reflect-unlock') : null;
  var overlayReady = document.getElementById('mt-reflect-ready');
  var overlayContinue = document.getElementById('mt-reflect-continue');
  var duration = 30;
  var started = false;

  var storageKey = isClosing
    ? 'mt_' + series + '_closing'
    : isBlessing
      ? 'mt_' + series + '_accepted_' + currentPart
      : 'mt_' + series + '_reflected_' + currentPart;

  // ── BLESSING MODE ──────────────────────────────────────────

  if (isBlessing) {
    var blessingWrap = document.getElementById('piece-blessing-wrap');
    var blessingBtn  = document.getElementById('piece-blessing-btn');
    var blessingInterval = null;

    var alreadyAccepted = MT.get(storageKey);

    function onBlessingContinue() {
      if (overlay) overlay.classList.add('mt-reflect-overlay--fade');
      setTimeout(function () {
        window.location.href = seriesPage;
        setTimeout(function () {
          if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('mt-reflect-overlay--fade');
          }
        }, 800);
      }, 600);
    }

    function showBlessingOverlay() {
      if (blessingInterval) clearInterval(blessingInterval);

      if (overlayTitle)       overlayTitle.textContent = 'Let it in.';
      if (overlaySub)         overlaySub.textContent = 'You are being held.';
      if (overlayInstruction) overlayInstruction.textContent = 'Give it thirty seconds to reach you.';
      if (overlayUnlock)      overlayUnlock.style.display = 'none';
      if (overlayReady)       overlayReady.style.display = 'none';
      if (overlayContinue) {
        overlayContinue.style.display = 'none';
        overlayContinue.textContent = 'I receive this.';
        overlayContinue.removeEventListener('click', onBlessingContinue);
      }

      if (overlay)      { overlay.style.display = 'flex'; overlay.focus(); }
      if (overlayTimer) { overlayTimer.textContent = 30; overlayTimer.style.display = ''; }

      var remaining = 30;
      blessingInterval = setInterval(function () {
        remaining -= 1;
        if (overlayTimer) overlayTimer.textContent = remaining;

        if (remaining <= 0) {
          clearInterval(blessingInterval);
          blessingInterval = null;
          MT.set(storageKey);
          MT.set('mt_' + series + '_reflected_' + currentPart);
          if (overlayTimer) overlayTimer.style.display = 'none';
          if (overlayReady) {
            overlayReady.textContent = 'This blessing is yours.';
            overlayReady.style.display = 'block';
          }
          if (overlayContinue) {
            overlayContinue.style.display = 'inline-block';
            overlayContinue.focus();
            overlayContinue.addEventListener('click', onBlessingContinue);
          }
        }
      }, 1000);
      window.addEventListener('pagehide', function () { clearInterval(blessingInterval); }, { once: true });
    }

    var bodyEndObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (blessingWrap) blessingWrap.style.display = 'flex';
          bodyEndObserver.disconnect();
        }
      });
    }, { threshold: 0 });

    var bodyEnd = document.getElementById('piece-body-end');
    if (bodyEnd) bodyEndObserver.observe(bodyEnd);

    if (blessingBtn) {
      if (alreadyAccepted) {
        blessingBtn.textContent = 'Accept this blessing again';
      }
      blessingBtn.addEventListener('click', function () {
        showBlessingOverlay();
      });
    }

    return;
  }

  // ── CLOSING REFLECTION MODE ────────────────────────────────

  if (isClosing) {

    // Already completed — don't show again
    if (MT.get(storageKey)) return;

    function showClosingOverlay() {
      if (started) return;
      started = true;

      if (overlayTitle) overlayTitle.textContent = 'Let it work.';
      if (overlaySub) overlaySub.textContent = 'The words have been spoken.';
      if (overlayInstruction) overlayInstruction.textContent = 'Give them thirty seconds.';
      if (overlayUnlock) overlayUnlock.style.display = 'none';
      if (overlayReady) overlayReady.style.display = 'none';
      if (overlayContinue) {
        overlayContinue.style.display = 'none';
        overlayContinue.textContent = 'I am free.';
        overlayContinue.classList.add('mt-reflect-continue--closing');
      }

      if (overlay) { overlay.style.display = 'flex'; overlay.focus(); }
      if (overlayTimer) overlayTimer.textContent = duration;

      var remaining = duration;
      var interval = setInterval(function () {
        remaining -= 1;
        if (overlayTimer) overlayTimer.textContent = remaining;

        if (remaining <= 0) {
          clearInterval(interval);
          MT.set(storageKey);
          MT.set('mt_' + series + '_reflected_' + currentPart);
          if (overlayTimer) overlayTimer.style.display = 'none';
          if (overlayReady) {
            overlayReady.textContent = 'You are free.';
            overlayReady.style.display = 'block';
          }
          if (overlayContinue) {
            overlayContinue.style.display = 'inline-block';
            overlayContinue.focus();
            overlayContinue.addEventListener('click', function () {
              if (overlay) overlay.classList.add('mt-reflect-overlay--fade');
              setTimeout(function () {
                window.location.href = seriesPage;
                setTimeout(function () {
                  if (overlay) {
                    overlay.style.display = 'none';
                    overlay.classList.remove('mt-reflect-overlay--fade');
                  }
                }, 800);
              }, 600);
            }, { once: true });
          }
        }
      }, 1000);
      window.addEventListener('pagehide', function () { clearInterval(interval); }, { once: true });
    }

    var closingWrap = document.getElementById('piece-closing-wrap');
    var closingBtn = document.getElementById('piece-closing-btn');
    if (closingBtn) {
      closingBtn.addEventListener('click', function () {
        showClosingOverlay();
      });
    }

    var closingEndObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (closingWrap) closingWrap.style.display = 'flex';
          closingEndObserver.disconnect();
        }
      });
    }, { threshold: 0 });

    var bodyEnd = document.getElementById('piece-body-end');
    if (bodyEnd) closingEndObserver.observe(bodyEnd);
    return;
  }

  // ── INTER-PIECE / FINAL REFLECTION MODE ────────────────────────────

  function unlock() {
    MT.set(storageKey);

    if (countdownEl) countdownEl.textContent = '';
    if (messageEl) messageEl.textContent = 'Now you can\'t unknow it.';

    if (overlayTimer) overlayTimer.style.display = 'none';
    if (overlayUnlock) overlayUnlock.style.display = 'none';
    if (overlayReady) overlayReady.style.display = 'block';
    if (overlayContinue) { overlayContinue.style.display = 'inline-block'; overlayContinue.focus(); }

    if (!isFinal && nextLink) {
      nextLink.href = nextLink.dataset.href;
      nextLink.classList.remove('piece-nav-next--locked');
    }

    if (overlayContinue) {
      overlayContinue.addEventListener('click', function () {
        if (overlay) overlay.classList.add('mt-reflect-overlay--fade');
        setTimeout(function () {
          if (isFinal) {
            window.location.href = seriesPage;
            setTimeout(function () {
              if (overlay) {
                overlay.style.display = 'none';
                overlay.classList.remove('mt-reflect-overlay--fade');
              }
            }, 800);
          } else {
            if (overlay) {
              overlay.style.display = 'none';
              overlay.classList.remove('mt-reflect-overlay--fade');
            }
            var supportLink = document.querySelector('.support-link');
            if (supportLink) {
              supportLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
              void supportLink.offsetWidth;
              supportLink.classList.add('support-link--pulse');
              supportLink.addEventListener('animationend', function () {
                supportLink.classList.remove('support-link--pulse');
              }, { once: true });
            }
          }
        }, 600);
      }, { once: true });
    }
  }

  // Already reflected — unlock immediately, hide prompt
  if (MT.get(storageKey)) {
    if (!isFinal && nextLink) {
      nextLink.href = nextLink.dataset.href;
      nextLink.classList.remove('piece-nav-next--locked');
      if (nextWrap) {
        var prompt = nextWrap.querySelector('.reflect-prompt');
        if (prompt) prompt.style.display = 'none';
      }
    }
    return;
  }

  function startCountdown() {
    if (started) return;
    started = true;

    var remaining = duration;

    if (overlayTitle) overlayTitle.textContent = 'Something in you already knew this.';
    if (overlaySub) overlaySub.textContent = 'The part that brought you here.';
    if (overlayInstruction) overlayInstruction.textContent = 'Stay with it. Let it move through you.';
    if (overlayUnlock) {
      overlayUnlock.textContent = isFinal
        ? 'Take a moment. Then we\'ll bring you back to choose your next path.'
        : 'The next piece unlocks when this reaches zero.';
      overlayUnlock.style.display = '';
    }
    if (overlayContinue) overlayContinue.textContent = 'Continue';

    if (overlay) { overlay.style.display = 'flex'; overlay.focus(); }
    if (overlayTimer) {
      overlayTimer.textContent = remaining;
      overlayTimer.style.display = '';
    }
    if (countdownEl) countdownEl.textContent = remaining + 's';

    var interval = setInterval(function () {
      remaining -= 1;
      if (overlayTimer) overlayTimer.textContent = remaining;
      if (countdownEl) countdownEl.textContent = remaining + 's';

      if (remaining <= 0) {
        clearInterval(interval);
        unlock();
      }
    }, 1000);
    window.addEventListener('pagehide', function () { clearInterval(interval); }, { once: true });
  }

  var actionWrap = document.getElementById('piece-action-wrap');
  var actionBtn = document.getElementById('piece-action-btn');
  if (actionBtn) {
    actionBtn.addEventListener('click', function () {
      startCountdown();
    });
  }

  var bodyEnd = document.getElementById('piece-body-end');
  if (actionWrap && bodyEnd) {
    var bodyEndObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          actionWrap.style.display = 'flex';
          bodyEndObserver.disconnect();
        }
      });
    }, { threshold: 0 });
    bodyEndObserver.observe(bodyEnd);
  }

});
