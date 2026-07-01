document.addEventListener('DOMContentLoaded', function () {
  var notice = document.getElementById('mt-notice');
  var btn = document.getElementById('mt-notice-btn');
  var trigger = document.getElementById('mt-show-notice');
  if (!notice) return;

  var autoShown = false;

  function showNotice(auto) {
    autoShown = !!auto;
    notice.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (btn) btn.focus();
  }

  function hideNotice() {
    notice.style.display = 'none';
    document.body.style.overflow = '';
    // Only return focus to the footer trigger when the user opened it manually.
    // On auto-show (first visit), returning focus scrolls the page to the footer.
    if (!autoShown && trigger) trigger.focus();
  }

  notice.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { hideNotice(); return; }
    if (e.key === 'Tab') { e.preventDefault(); if (btn) btn.focus(); }
  });

  if (!MT.get('mt_noticed')) showNotice(true);

  if (btn) {
    btn.addEventListener('click', function () {
      MT.set('mt_noticed');
      hideNotice();
    });
  }

  if (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      showNotice();
    });
  }

  function doReset(e) {
    if (e) e.preventDefault();
    var msg = (window.MT_I18N || {}).reset_confirm || 'Reset all reading progress across every series? You\'ll start fresh.';
    if (!confirm(msg)) return;
    MT.keysStartingWith('mt_').forEach(function (k) {
      if (k !== 'mt_theme' && k !== 'mt_theme_remember') MT.remove(k);
    });
    window.location.reload();
  }

  ['mt-reset-all', 'mt-reset-menu'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', doReset);
  });
});
