document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.piece-nav');
  if (!nav) return;

  var series = nav.dataset.series;
  var currentPart = parseInt(nav.dataset.part, 10);
  var isClosing = nav.dataset.closing === 'true';
  var nextWrap = nav.querySelector('.piece-nav-next-wrap');
  var nextLink = nav.querySelector('.piece-nav-next--locked');

  if (!nextLink && !isClosing) return;

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
  var stickyBtn = document.getElementById('sticky-next');
  var duration = 30;
  var startDelay = 2000;
  var started = false;

  var storageKey = isClosing
    ? 'mt_' + series + '_closing'
    : 'mt_' + series + '_reflected_' + currentPart;

  // ── CLOSING REFLECTION MODE ────────────────────────────────

  if (isClosing) {

    // Already completed — don't show again
    if (MT.get(storageKey)) return;

    function showClosingOverlay() {
      if (started) return;
      started = true;

      setTimeout(function () {
        // Configure overlay text for the closing spell
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

        if (overlay) overlay.style.display = 'flex';
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
              overlayContinue.addEventListener('click', function () {
                if (overlay) overlay.classList.add('mt-reflect-overlay--fade');
                setTimeout(function () {
                  if (overlay) {
                    overlay.style.display = 'none';
                    overlay.classList.remove('mt-reflect-overlay--fade');
                  }
                }, 600);
              });
            }
          }
        }, 1000);
      }, startDelay);
    }

    var closingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showClosingOverlay();
          closingObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    closingObserver.observe(nav);
    return;
  }

  // ── INTER-PIECE REFLECTION MODE ────────────────────────────

  function unlock() {
    MT.set(storageKey);

    if (countdownEl) countdownEl.textContent = '';
    if (messageEl) messageEl.textContent = 'Now you can\'t unknow it.';

    if (overlayTimer) overlayTimer.style.display = 'none';
    if (overlayUnlock) overlayUnlock.style.display = 'none';
    if (overlayReady) overlayReady.style.display = 'block';
    if (overlayContinue) overlayContinue.style.display = 'inline-block';

    nextLink.href = nextLink.dataset.href;
    nextLink.classList.remove('piece-nav-next--locked');

    if (overlayContinue) {
      overlayContinue.addEventListener('click', function () {
        if (overlay) overlay.classList.add('mt-reflect-overlay--fade');
        setTimeout(function () {
          if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('mt-reflect-overlay--fade');
          }
        }, 600);
      });
    }
  }

  // Already reflected — unlock immediately, hide prompt
  if (MT.get(storageKey)) {
    nextLink.href = nextLink.dataset.href;
    nextLink.classList.remove('piece-nav-next--locked');
    if (nextWrap) {
      var prompt = nextWrap.querySelector('.reflect-prompt');
      if (prompt) prompt.style.display = 'none';
    }
    if (stickyBtn) {
      stickyBtn.addEventListener('click', function () {
        window.location.href = stickyBtn.dataset.href;
      });
    }
    return;
  }

  function startCountdown() {
    if (started) return;
    started = true;

    if (stickyBtn) stickyBtn.style.display = 'none';

    setTimeout(function () {
      var remaining = duration;

      // Ensure inter-piece overlay text is set correctly
      if (overlayTitle) overlayTitle.textContent = 'Something in you already knew this.';
      if (overlaySub) overlaySub.textContent = 'The part that brought you here.';
      if (overlayInstruction) overlayInstruction.textContent = 'Stay with it. Let it move through you.';
      if (overlayUnlock) overlayUnlock.style.display = '';
      if (overlayContinue) overlayContinue.textContent = 'Continue';

      if (overlay) overlay.style.display = 'flex';
      if (overlayTimer) overlayTimer.textContent = remaining;
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
    }, startDelay);
  }

  if (stickyBtn) {
    stickyBtn.addEventListener('click', function () {
      startCountdown();
    });
  }

  var bodyEnd = document.getElementById('piece-body-end');
  if (stickyBtn && bodyEnd) {
    var bodyEndObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          stickyBtn.style.display = 'block';
          bodyEndObserver.disconnect();
        }
      });
    }, { threshold: 0 });
    bodyEndObserver.observe(bodyEnd);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        startCountdown();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(nav);
});
