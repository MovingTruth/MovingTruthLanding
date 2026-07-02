(function () {
  var THRESHOLD   = 3;
  var PROMPT_KEY  = 'mt_support_prompted';

  function countReflected() {
    return MT.keysStartingWith('mt_').filter(function (k) {
      return k.indexOf('_reflected_') !== -1;
    }).length;
  }

  function i18n(key, fallback) {
    return (window.MT_SUPPORT_I18N || {})[key] || fallback;
  }

  // ── TOAST (new reader — just crossed the threshold mid-session) ──────────
  function showToast() {
    // Delay so the reflect overlay has time to clear first
    setTimeout(function () {
      var url  = i18n('prompt_url', '/support/');
      var text = i18n('prompt_text', "You have read three pieces. There is something I’d like you to see.");
      var btn  = i18n('prompt_btn', 'Read it');

      var el = document.createElement('div');
      el.className = 'mt-support-prompt';
      el.setAttribute('role', 'complementary');
      el.innerHTML =
        '<p class="mt-support-prompt__text">' + text + '</p>' +
        '<div class="mt-support-prompt__actions">' +
          '<a href="' + url + '" class="mt-support-prompt__btn">' + btn + '</a>' +
          '<button class="mt-support-prompt__close" aria-label="Dismiss">&times;</button>' +
        '</div>';

      document.body.appendChild(el);
      requestAnimationFrame(function () {
        el.classList.add('mt-support-prompt--visible');
      });

      el.querySelector('.mt-support-prompt__close').addEventListener('click', function () {
        el.classList.remove('mt-support-prompt--visible');
        setTimeout(function () { el.remove(); }, 400);
      });
    }, 3500);
  }

  // ── INTERRUPTION (existing reader — already had 3+ on arrival) ──────────
  function showInterruption() {
    var url     = i18n('prompt_url', '/support/');
    var heading = i18n('interrupt_heading', 'I’m sorry to stop you here.');
    var body    = i18n('interrupt_body', 'You’ve been reading — and that already means something. Before you continue, there is something I need to ask you to see. It will take two minutes.');
    var btnGo   = i18n('interrupt_btn', 'I’ll read it');
    var btnDeny = i18n('interrupt_dismiss', 'Not right now');

    var overlay = document.createElement('div');
    overlay.className = 'mt-support-interrupt';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="mt-support-interrupt__box">' +
        '<p class="mt-support-interrupt__heading">' + heading + '</p>' +
        '<p class="mt-support-interrupt__body">' + body + '</p>' +
        '<div class="mt-support-interrupt__actions">' +
          '<a href="' + url + '" class="mt-support-interrupt__btn-go">' + btnGo + '</a>' +
          '<button class="mt-support-interrupt__btn-deny">' + btnDeny + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      overlay.classList.add('mt-support-interrupt--visible');
    });

    function dismiss() {
      overlay.classList.remove('mt-support-interrupt--visible');
      document.body.style.overflow = '';
      setTimeout(function () { overlay.remove(); }, 400);
    }

    overlay.querySelector('.mt-support-interrupt__btn-deny').addEventListener('click', dismiss);
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') dismiss();
    });
  }

  // ── WRAP MT.set to catch readers who cross the threshold mid-session ─────
  var _origSet = MT.set;
  MT.set = function (key) {
    _origSet.call(MT, key);
    if (key === PROMPT_KEY) return;
    if (key.indexOf('_reflected_') !== -1 && !MT.get(PROMPT_KEY)) {
      if (countReflected() >= THRESHOLD) {
        _origSet.call(MT, PROMPT_KEY);
        showToast();
      }
    }
  };

  // ── ON LOAD — check if already past threshold (existing reader) ──────────
  document.addEventListener('DOMContentLoaded', function () {
    if (MT.get(PROMPT_KEY)) return;
    if (countReflected() >= THRESHOLD) {
      _origSet.call(MT, PROMPT_KEY);
      showInterruption();
    }
  });
})();
