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

  var d = overlay ? overlay.dataset : {};
  var suffix = d.secondsSuffix || 's';

  var storageKey = isClosing
    ? 'mt_' + series + '_closing'
    : isBlessing
      ? 'mt_' + series + '_accepted_' + currentPart
      : 'mt_' + series + '_reflected_' + currentPart;

  function dismissOverlay() {
    if (overlay) overlay.classList.add('mt-reflect-overlay--fade');
    setTimeout(function () {
      if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('mt-reflect-overlay--fade');
      }
    }, 600);
  }

  // ── BLESSING MODE ──────────────────────────────────────────

  if (isBlessing) {
    var blessingWrap = document.getElementById('piece-blessing-wrap');
    var blessingBtn  = document.getElementById('piece-blessing-btn');
    var blessingInterval = null;

    var alreadyAccepted = MT.get(storageKey);

    function showBlessingOverlay() {
      if (blessingInterval) clearInterval(blessingInterval);

      if (overlayTitle)       overlayTitle.textContent = d.blessingTitle;
      if (overlaySub)         overlaySub.textContent = d.blessingSub;
      if (overlayInstruction) overlayInstruction.textContent = d.blessingInstruction;
      if (overlayUnlock)      overlayUnlock.style.display = 'none';
      if (overlayReady)       overlayReady.style.display = 'none';

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
            overlayReady.textContent = d.blessingReady;
            overlayReady.style.display = 'block';
          }
          if (blessingWrap) blessingWrap.style.display = 'none';
          setTimeout(function () { dismissOverlay(); }, 1500);
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
        blessingBtn.textContent = blessingBtn.dataset.blessingAgain;
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

      if (overlayTitle) overlayTitle.textContent = d.closingTitle;
      if (overlaySub) overlaySub.textContent = d.closingSub;
      if (overlayInstruction) overlayInstruction.textContent = d.closingInstruction;
      if (overlayUnlock) overlayUnlock.style.display = 'none';
      if (overlayReady) overlayReady.style.display = 'none';
      if (overlayContinue) {
        overlayContinue.style.display = 'none';
        overlayContinue.textContent = d.closingContinue;
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
            overlayReady.textContent = d.closingReady;
            overlayReady.style.display = 'block';
          }
          var closingWrapEl = document.getElementById('piece-closing-wrap');
          if (closingWrapEl) closingWrapEl.style.display = 'none';
          setTimeout(function () { dismissOverlay(); }, 1500);
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
    if (messageEl) messageEl.textContent = d.ready;

    if (overlayTimer) overlayTimer.style.display = 'none';
    if (overlayUnlock) overlayUnlock.style.display = 'none';
    if (overlayReady) overlayReady.style.display = 'block';

    if (!isFinal && nextLink) {
      nextLink.href = nextLink.dataset.href;
      nextLink.classList.remove('piece-nav-next--locked');
    }

    var actionWrapEl = document.getElementById('piece-action-wrap');
    if (actionWrapEl) actionWrapEl.style.display = 'none';

    setTimeout(function () {
      dismissOverlay();
      if (!isFinal) {
        setTimeout(function () {
          var supportLink = document.querySelector('.support-link');
          if (supportLink) {
            supportLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
            void supportLink.offsetWidth;
            supportLink.classList.add('support-link--pulse');
            supportLink.addEventListener('animationend', function () {
              supportLink.classList.remove('support-link--pulse');
            }, { once: true });
          }
        }, 700);
      }
    }, 1500);
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

    if (overlayUnlock) {
      if (isFinal) overlayUnlock.textContent = d.unlockFinal;
      overlayUnlock.style.display = '';
    }

    if (overlay) { overlay.style.display = 'flex'; overlay.focus(); }
    if (overlayTimer) {
      overlayTimer.textContent = remaining;
      overlayTimer.style.display = '';
    }
    if (countdownEl) countdownEl.textContent = remaining + suffix;

    var interval = setInterval(function () {
      remaining -= 1;
      if (overlayTimer) overlayTimer.textContent = remaining;
      if (countdownEl) countdownEl.textContent = remaining + suffix;

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
