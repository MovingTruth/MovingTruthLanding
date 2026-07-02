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

      var textEl = document.createElement('p');
      textEl.className = 'mt-support-prompt__text';
      textEl.textContent = text;

      var actions = document.createElement('div');
      actions.className = 'mt-support-prompt__actions';

      var linkEl = document.createElement('a');
      linkEl.href = url;
      linkEl.className = 'mt-support-prompt__btn';
      linkEl.textContent = btn;

      var closeEl = document.createElement('button');
      closeEl.className = 'mt-support-prompt__close';
      closeEl.setAttribute('aria-label', 'Dismiss');
      closeEl.textContent = '×';

      actions.appendChild(linkEl);
      actions.appendChild(closeEl);
      el.appendChild(textEl);
      el.appendChild(actions);

      document.body.appendChild(el);
      requestAnimationFrame(function () {
        el.classList.add('mt-support-prompt--visible');
      });

      closeEl.addEventListener('click', function () {
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

    var box = document.createElement('div');
    box.className = 'mt-support-interrupt__box';

    var headingEl = document.createElement('p');
    headingEl.className = 'mt-support-interrupt__heading';
    headingEl.textContent = heading;

    var bodyEl = document.createElement('p');
    bodyEl.className = 'mt-support-interrupt__body';
    bodyEl.textContent = body;

    var actionsEl = document.createElement('div');
    actionsEl.className = 'mt-support-interrupt__actions';

    var goEl = document.createElement('a');
    goEl.href = url;
    goEl.className = 'mt-support-interrupt__btn-go';
    goEl.textContent = btnGo;

    var denyEl = document.createElement('button');
    denyEl.className = 'mt-support-interrupt__btn-deny';
    denyEl.textContent = btnDeny;

    actionsEl.appendChild(goEl);
    actionsEl.appendChild(denyEl);
    box.appendChild(headingEl);
    box.appendChild(bodyEl);
    box.appendChild(actionsEl);
    overlay.appendChild(box);

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

    denyEl.addEventListener('click', dismiss);
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); dismiss(); }
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
