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
});
