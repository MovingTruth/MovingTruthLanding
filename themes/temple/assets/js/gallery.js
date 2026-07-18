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
    img.setAttribute('aria-label', (current + 1) + ' of ' + MT_GALLERY.length + (item.title ? ': ' + item.title : ''));
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

    if (lbOpen) lbLoad(item.src, item.title || '');
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });

  thumbBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      goTo(parseInt(btn.dataset.index, 10));
    });
  });

  document.addEventListener('keydown', function (e) {
    if (lbOpen) {
      if (e.key === 'Escape')      { closeLb(); return; }
      if (e.key === 'ArrowLeft')   { resetZoom(); goTo(current - 1); return; }
      if (e.key === 'ArrowRight')  { resetZoom(); goTo(current + 1); return; }
      if (e.key === 'Tab') {
        // Trap focus inside the lightbox while it's open.
        var focusable = [lbPrev, lbClose, lbNext].filter(function (el) { return el && !el.disabled; });
        if (!focusable.length) return;
        var first = focusable[0];
        var last  = focusable[focusable.length - 1];
        var outside = !lb.contains(document.activeElement);
        if (e.shiftKey) {
          if (outside || document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (outside || document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    } else {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    }
  });

  var swipeStartX = 0;
  var imageWrap = document.getElementById('gallery-image-wrap');
  imageWrap.addEventListener('touchstart', function (e) {
    swipeStartX = e.touches[0].clientX;
  }, { passive: true });
  imageWrap.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  // ── LIGHTBOX ─────────────────────────────────────────────────

  var lbOpen = false;
  var lbZoom = 1;
  var lbPanX = 0, lbPanY = 0;
  var lbDragging = false;
  var lbDragStartX, lbDragStartY, lbPanStartX, lbPanStartY;
  var lbDragMoved = false;
  var pinchStartDist = 0, pinchStartZoom = 1;
  var lbSwipeStartX = 0;

  var lb = document.createElement('div');
  lb.id = 'gallery-lightbox';
  lb.className = 'gallery-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML =
    '<button class="gallery-lightbox__close" id="lb-close" aria-label="Close">×</button>' +
    '<button class="gallery-lightbox__arrow gallery-lightbox__prev" id="lb-prev" aria-label="Previous image">←</button>' +
    '<div class="gallery-lightbox__img-wrap" id="lb-img-wrap">' +
    '  <img class="gallery-lightbox__img" id="lb-img" src="" alt="" draggable="false" />' +
    '</div>' +
    '<button class="gallery-lightbox__arrow gallery-lightbox__next" id="lb-next" aria-label="Next image">→</button>';
  document.body.appendChild(lb);

  var lbImgWrap = document.getElementById('lb-img-wrap');
  var lbImg     = document.getElementById('lb-img');
  var lbClose   = document.getElementById('lb-close');
  var lbPrev    = document.getElementById('lb-prev');
  var lbNext    = document.getElementById('lb-next');

  function setTransform() {
    lbImg.style.transform = 'scale(' + lbZoom + ') translate(' + (lbPanX / lbZoom) + 'px, ' + (lbPanY / lbZoom) + 'px)';
    lbImgWrap.style.cursor = lbZoom > 1 ? (lbDragging ? 'grabbing' : 'grab') : 'zoom-in';
  }

  function resetZoom() {
    lbZoom = 1; lbPanX = 0; lbPanY = 0;
    setTransform();
  }

  function lbLoad(src, alt) {
    lbImg.style.opacity = '0';
    lbImg.alt = alt;
    lbImg.onload = function () { lbImg.style.opacity = '1'; };
    lbImg.src = src;
    if (lbImg.complete && lbImg.naturalWidth) lbImg.style.opacity = '1';
  }

  function openLb() {
    lbOpen = true;
    resetZoom();
    var item = MT_GALLERY[current];
    lbLoad(item.src, item.title || '');
    lb.style.display = 'flex';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { lb.classList.add('gallery-lightbox--open'); });
    });
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLb() {
    lbOpen = false;
    lb.classList.remove('gallery-lightbox--open');
    setTimeout(function () { lb.style.display = 'none'; }, 200);
    document.body.style.overflow = '';
  }

  img.addEventListener('click', function () { if (img.src && img.naturalWidth) openLb(); });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  lbPrev.addEventListener('click', function () { resetZoom(); goTo(current - 1); });
  lbNext.addEventListener('click', function () { resetZoom(); goTo(current + 1); });

  // Click to toggle zoom
  lbImgWrap.addEventListener('click', function () {
    if (lbDragMoved) return;
    if (lbZoom > 1) { resetZoom(); } else { lbZoom = 2.5; setTransform(); }
  });

  // Scroll wheel zoom
  lbImgWrap.addEventListener('wheel', function (e) {
    e.preventDefault();
    lbZoom = Math.max(1, Math.min(6, lbZoom * (e.deltaY < 0 ? 1.12 : 0.9)));
    if (lbZoom === 1) { lbPanX = 0; lbPanY = 0; }
    setTransform();
  }, { passive: false });

  // Mouse drag to pan
  lbImgWrap.addEventListener('mousedown', function (e) {
    if (lbZoom <= 1) return;
    lbDragging = true; lbDragMoved = false;
    lbDragStartX = e.clientX; lbDragStartY = e.clientY;
    lbPanStartX = lbPanX; lbPanStartY = lbPanY;
    setTransform();
    e.preventDefault();
  });
  window.addEventListener('mousemove', function (e) {
    if (!lbDragging) return;
    var dx = e.clientX - lbDragStartX, dy = e.clientY - lbDragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) lbDragMoved = true;
    lbPanX = lbPanStartX + dx; lbPanY = lbPanStartY + dy;
    setTransform();
  });
  window.addEventListener('mouseup', function () {
    if (!lbDragging) return;
    lbDragging = false; setTransform();
    setTimeout(function () { lbDragMoved = false; }, 0);
  });

  // Touch: pinch to zoom + drag to pan + swipe to navigate
  function touchDist(t) {
    var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  lbImgWrap.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      pinchStartDist = touchDist(e.touches);
      pinchStartZoom = lbZoom;
      e.preventDefault();
    } else if (e.touches.length === 1) {
      lbSwipeStartX = e.touches[0].clientX;
      if (lbZoom > 1) {
        lbDragging = true; lbDragMoved = false;
        lbDragStartX = e.touches[0].clientX; lbDragStartY = e.touches[0].clientY;
        lbPanStartX = lbPanX; lbPanStartY = lbPanY;
      }
    }
  }, { passive: false });

  lbImgWrap.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
      lbZoom = Math.max(1, Math.min(6, pinchStartZoom * (touchDist(e.touches) / pinchStartDist)));
      setTransform();
      e.preventDefault();
    } else if (lbDragging && e.touches.length === 1) {
      var dx = e.touches[0].clientX - lbDragStartX, dy = e.touches[0].clientY - lbDragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) lbDragMoved = true;
      lbPanX = lbPanStartX + dx; lbPanY = lbPanStartY + dy;
      setTransform();
      e.preventDefault();
    }
  }, { passive: false });

  lbImgWrap.addEventListener('touchend', function (e) {
    if (lbDragging) {
      lbDragging = false; setTransform();
      setTimeout(function () { lbDragMoved = false; }, 0);
      return;
    }
    if (lbZoom <= 1 && e.changedTouches.length === 1) {
      var dx = e.changedTouches[0].clientX - lbSwipeStartX;
      if (Math.abs(dx) > 50) { resetZoom(); goTo(dx < 0 ? current + 1 : current - 1); }
    }
    if (lbZoom < 1.05) resetZoom();
  }, { passive: true });

  goTo(0);
});
