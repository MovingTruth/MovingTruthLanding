document.addEventListener('DOMContentLoaded', function () {
  if (!window.MT_GALLERY || !MT_GALLERY.length) return;

  var current   = 0;
  var img       = document.getElementById('gallery-img');
  var titleEl   = document.getElementById('gallery-item-title');
  var captionEl = document.getElementById('gallery-item-caption');
  var infoEl    = document.getElementById('gallery-info');
  var thumbBtns = document.querySelectorAll('.gallery-thumb-btn');
  var prevBtn   = document.getElementById('gallery-prev');
  var nextBtn   = document.getElementById('gallery-next');

  function goTo(index) {
    if (index < 0) index = MT_GALLERY.length - 1;
    if (index >= MT_GALLERY.length) index = 0;
    current = index;

    var item = MT_GALLERY[current];

    img.style.opacity = '0';
    img.onload = function () { img.style.opacity = '1'; };
    img.src = item.src;
    img.alt = item.title || '';
    if (img.complete && img.naturalWidth) img.style.opacity = '1';

    titleEl.textContent   = item.title || '';
    captionEl.textContent = item.caption || '';
    infoEl.style.display  = (item.title || item.caption) ? '' : 'none';

    thumbBtns.forEach(function (btn, i) {
      btn.classList.toggle('gallery-thumb-btn--active', i === current);
    });

    if (thumbBtns[current]) {
      thumbBtns[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });

  thumbBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      goTo(parseInt(btn.dataset.index, 10));
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  var touchStartX = 0;
  var imageWrap   = document.getElementById('gallery-image-wrap');
  imageWrap.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  imageWrap.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  goTo(0);
});
