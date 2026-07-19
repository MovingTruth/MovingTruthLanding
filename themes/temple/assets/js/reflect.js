// A reflect countdown can't resume from a bfcache restore (DOMContentLoaded doesn't
// fire again, so the interval/started state below never re-initializes) — force a
// reload so the page re-checks stored progress and rebuilds the timer cleanly.
window.addEventListener('pageshow', function (e) {
  if (e.persisted) window.location.reload();
});

document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.piece-nav');
  if (!nav) return;

  var series = nav.dataset.series;
  var currentPart = parseInt(nav.dataset.part, 10);
  var freeAccess = nav.dataset.freeAccess === 'true';
  var isClosing = nav.dataset.closing === 'true';
  var isFinal = nav.dataset.final === 'true';
  var isBlessing = nav.dataset.blessing === 'true';
  var seriesPage = nav.dataset.seriesPage || '/series';
  var nextWrap = nav.querySelector('.piece-nav-next-wrap');
  var nextLink = nav.querySelector('.piece-nav-next--locked');

  // ── SEQUENTIAL-READING GATE ─────────────────────────────────
  // The series-index page can only hide/remove a link — it can't stop someone
  // landing here directly (search engine, shared link, bookmark, typed URL).
  // This is the real enforcement point. Finds the first unread part before this
  // one and redirects there in a single hop, with a toast (shown by mt-storage.js
  // on the landing page) explaining why.
  if (!freeAccess && currentPart > 1) {
    var partsEl = document.getElementById('mt-series-parts');
    var parts = [];
    if (partsEl) {
      try { parts = JSON.parse(partsEl.textContent); } catch (e) {}
    }
    parts.sort(function (a, b) { return a.part - b.part; });
    var entry = null;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].part >= currentPart) break;
      if (!MT.get('mt_' + series + '_reflected_' + parts[i].part)) { entry = parts[i]; break; }
    }
    if (entry) {
      MT.setSessionValue('mt_redirect_notice', (window.MT_I18N || {}).new_out_of_order || 'This series has a beginning. Taking you there.');
      window.location.replace(entry.url);
      return;
    }
  }

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
    var blessingRunning = false;

    var alreadyAccepted = MT.get(storageKey);

    function showBlessingOverlay() {
      // Guard against double-invocation while a countdown is already running
      // (e.g. rapid re-clicks) — still allows a later, legitimate re-acceptance
      // once the current cycle finishes or the page is left.
      if (blessingRunning) return;
      blessingRunning = true;

      var i18n = window.MT_I18N || {};
      if (overlayTitle)       overlayTitle.textContent = i18n.blessing_title || 'Let it in.';
      if (overlaySub)         overlaySub.textContent = i18n.blessing_sub || 'You are being held.';
      if (overlayInstruction) overlayInstruction.textContent = i18n.blessing_instruction || 'Give it thirty seconds to reach you.';
      if (overlayUnlock)      overlayUnlock.style.display = 'none';
      if (overlayReady)       overlayReady.style.display = 'none';
      if (overlayContinue) {
        overlayContinue.style.display = 'none';
        overlayContinue.textContent = (window.MT_I18N || {}).blessing_continue || 'I receive this.';
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
          blessingRunning = false;
          MT.set(storageKey);
          MT.set('mt_' + series + '_reflected_' + currentPart);
          if (overlayTimer) overlayTimer.style.display = 'none';
          if (overlayReady) {
            overlayReady.textContent = (window.MT_I18N || {}).blessing_done || 'This blessing is yours.';
            overlayReady.style.display = 'block';
          }
          if (blessingWrap) blessingWrap.style.display = 'none';
          if (overlayContinue) {
            overlayContinue.style.display = '';
            overlayContinue.addEventListener('click', function () {
              dismissOverlay();
              setTimeout(function () { window.location.href = seriesPage; }, 600);
            }, { once: true });
          }
        }
      }, 1000);
      window.addEventListener('pagehide', function () {
        clearInterval(blessingInterval);
        blessingRunning = false;
      }, { once: true });
    }

    var blessingBodyEndObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (blessingWrap) blessingWrap.style.display = 'flex';
          blessingBodyEndObserver.disconnect();
        }
      });
    }, { threshold: 0 });

    var blessingBodyEnd = document.getElementById('piece-body-end');
    if (blessingBodyEnd) blessingBodyEndObserver.observe(blessingBodyEnd);

    if (blessingBtn) {
      if (alreadyAccepted) {
        blessingBtn.textContent = (window.MT_I18N || {}).blessing_accept_again || 'Accept this blessing again';
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

      var i18n = window.MT_I18N || {};
      if (overlayTitle) overlayTitle.textContent = i18n.closing_title || 'Let it work.';
      if (overlaySub) overlaySub.textContent = i18n.closing_sub || 'The words have been spoken.';
      if (overlayInstruction) overlayInstruction.textContent = i18n.closing_instruction || 'Give them thirty seconds.';
      if (overlayUnlock) overlayUnlock.style.display = 'none';
      if (overlayReady) overlayReady.style.display = 'none';
      if (overlayContinue) {
        overlayContinue.style.display = 'none';
        overlayContinue.textContent = i18n.closing_continue || 'I am free.';
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
            overlayReady.textContent = (window.MT_I18N || {}).closing_done || 'You are free.';
            overlayReady.style.display = 'block';
          }
          var closingWrapEl = document.getElementById('piece-closing-wrap');
          if (closingWrapEl) closingWrapEl.style.display = 'none';
          if (overlayContinue) {
            overlayContinue.style.display = '';
            overlayContinue.addEventListener('click', function () {
              dismissOverlay();
              setTimeout(function () { window.location.href = seriesPage; }, 600);
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

    var closingBodyEnd = document.getElementById('piece-body-end');
    if (closingBodyEnd) closingEndObserver.observe(closingBodyEnd);
    return;
  }

  // ── INTER-PIECE / FINAL REFLECTION MODE ────────────────────────────

  function unlock() {
    MT.set(storageKey);

    if (countdownEl) countdownEl.textContent = '';
    if (messageEl) messageEl.textContent = (window.MT_I18N || {}).reflect_message || 'Now you can\'t unknow it.';

    if (overlayTimer) overlayTimer.style.display = 'none';
    if (overlayUnlock) overlayUnlock.style.display = 'none';
    if (overlayReady) overlayReady.style.display = 'block';

    if (!isFinal && nextLink) {
      nextLink.href = nextLink.dataset.href;
      nextLink.classList.remove('piece-nav-next--locked');
    }

    var actionWrapEl = document.getElementById('piece-action-wrap');
    if (actionWrapEl) actionWrapEl.style.display = 'none';

    if (overlayContinue) {
      overlayContinue.style.display = '';
      overlayContinue.addEventListener('click', function () {
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

    var i18n = window.MT_I18N || {};
    if (overlayTitle) overlayTitle.textContent = i18n.reflect_title || 'Something in you already knew this.';
    if (overlaySub) overlaySub.textContent = i18n.reflect_sub || 'The part that brought you here.';
    if (overlayInstruction) overlayInstruction.textContent = i18n.reflect_instruction || 'Stay with it. Let it move through you.';
    if (overlayUnlock) {
      overlayUnlock.textContent = isFinal
        ? (i18n.reflect_unlock_final || 'Take a moment. Your next path is yours to choose.')
        : (i18n.reflect_unlock || 'The next piece unlocks when this reaches zero.');
      overlayUnlock.style.display = '';
    }
    if (overlayContinue) overlayContinue.textContent = i18n.reflect_continue || 'Continue';

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
