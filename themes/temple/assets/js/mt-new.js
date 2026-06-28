document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('mt-all-pieces');
  var container = document.getElementById('mt-unread-list');
  if (!el) return;

  var pieces;
  try { pieces = JSON.parse(el.textContent); } catch (e) { if (container) container.innerHTML = ''; return; }

  // ── CLICK GUARD ──────────────────────────────────────────────
  // Before navigating to any piece, check all prior parts are reflected.
  // If not, redirect to the first unread piece in the series instead.

  function findEntryPoint(slug, targetPart) {
    var seriesPieces = pieces
      .filter(function (p) { return p.slug === slug && p.part; })
      .sort(function (a, b) { return a.part - b.part; });

    for (var i = 0; i < seriesPieces.length; i++) {
      var p = seriesPieces[i];
      if (p.part >= targetPart) break;
      if (!MT.get('mt_' + slug + '_reflected_' + p.part)) {
        return p.url;
      }
    }
    return null; // all prior pieces read — access granted
  }

  var redirectMsg = (document.querySelector('.new-page') || {}).dataset
    ? document.querySelector('.new-page').dataset.redirectMsg : '';

  function showToast(msg, then) {
    var toast = document.createElement('div');
    toast.className = 'new-redirect-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('new-redirect-toast--visible'); });
    });
    setTimeout(then, 1800);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('.new-item[data-part]');
    if (!link) return;
    var slug = link.dataset.slug;
    var part = parseInt(link.dataset.part, 10);
    if (!slug || !part || link.dataset.free === 'true' || part <= 1) return;

    var entry = findEntryPoint(slug, part);
    if (entry) {
      e.preventDefault();
      showToast(redirectMsg, function () { window.location.href = entry; });
    }
  });

  // ── UNREAD LIST ───────────────────────────────────────────────

  if (!container) return;

  var unread = pieces.filter(function (p) {
    return !MT.get('mt_' + p.slug + '_reflected_' + p.part);
  });

  if (!unread.length) {
    container.innerHTML = '<p class="new-empty">' + (container.dataset.caughtUp || '') + '</p>';
    return;
  }

  unread.sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });

  var html = '';
  unread.forEach(function (p) {
    html += '<a href="' + p.url + '" class="new-item"'
      + ' data-slug="' + p.slug + '"'
      + ' data-part="' + p.part + '"'
      + (p.free ? ' data-free="true"' : '')
      + '>'
      + '<span class="new-item__series">' + p.series + '</span>'
      + '<span class="new-item__dot">·</span>'
      + '<span class="new-item__title">' + p.title + '</span>'
      + '</a>';
  });

  container.innerHTML = html;
});
