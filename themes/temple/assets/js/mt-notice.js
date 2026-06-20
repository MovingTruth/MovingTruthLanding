document.addEventListener('DOMContentLoaded', function () {
  var notice = document.getElementById('mt-notice');
  var btn = document.getElementById('mt-notice-btn');
  var trigger = document.getElementById('mt-show-notice');
  if (!notice) return;

  function showNotice() {
    notice.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideNotice() {
    notice.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (!MT.get('mt_noticed')) showNotice();

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

  var resetAll = document.getElementById('mt-reset-all');
  if (resetAll) {
    resetAll.addEventListener('click', function (e) {
      e.preventDefault();
      if (!confirm('Reset all reading progress across every series? You\'ll start fresh.')) return;
      MT.keysStartingWith('mt_').forEach(function (k) {
        if (k !== 'mt_theme' && k !== 'mt_theme_remember') MT.remove(k);
      });
      window.location.reload();
    });
  }
});
