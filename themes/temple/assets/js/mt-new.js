document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('mt-all-pieces');
  var container = document.getElementById('mt-unread-list');
  if (!el) return;

  var pieces;
  try { pieces = JSON.parse(el.textContent); } catch (e) { if (container) container.innerHTML = ''; return; }

  // Build series map: slug → array of pieces sorted by part number
  var seriesMap = {};
  pieces.forEach(function (p) {
    if (!seriesMap[p.slug]) seriesMap[p.slug] = [];
    seriesMap[p.slug].push(p);
  });
  Object.keys(seriesMap).forEach(function (slug) {
    seriesMap[slug].sort(function (a, b) { return a.part - b.part; });
  });

  // Given a target piece, return the correct entry point:
  // the first unread part before it, or the piece itself if all prior parts are done.
  function entryPoint(target) {
    var list = seriesMap[target.slug] || [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p.part >= target.part) break;
      if (!MT.get('mt_' + p.slug + '_reflected_' + p.part)) return p;
    }
    return target;
  }

  // Return the first unread piece in a series, or null if all complete.
  function firstUnread(slug) {
    var list = seriesMap[slug] || [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!MT.get('mt_' + p.slug + '_reflected_' + p.part)) return p;
    }
    return null;
  }

  // ── "Added in last 14 days" — intercept links, redirect if prerequisites unread ──
  var recentList = document.getElementById('mt-recent-list');
  if (recentList) {
    recentList.querySelectorAll('.new-item').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href) return;
        var target = null;
        pieces.forEach(function (p) {
          try {
            if (new URL(p.url).pathname === new URL(href, window.location.href).pathname) target = p;
          } catch (_) {
            if (p.url === href) target = p;
          }
        });
        if (!target) return;
        var entry = entryPoint(target);
        if (entry.url !== target.url) {
          e.preventDefault();
          var msg = document.querySelector('.new-page').dataset.redirectMsg;
          if (msg) MT.setSessionValue('mt_redirect_notice', msg);
          window.location.href = entry.url;
        }
      });
    });
  }

  // ── "You haven't read yet" — show first unread piece per series ──
  if (!container) return;

  var unreadEntries = [];
  Object.keys(seriesMap).forEach(function (slug) {
    var p = firstUnread(slug);
    if (p) unreadEntries.push(p);
  });

  if (!unreadEntries.length) {
    container.innerHTML = '<p class="new-empty">You\'re all caught up.</p>';
    return;
  }

  unreadEntries.sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });

  var frag = document.createDocumentFragment();
  unreadEntries.forEach(function (p) {
    var a = document.createElement('a');
    a.href = p.url;
    a.className = 'new-item';

    var seriesSpan = document.createElement('span');
    seriesSpan.className = 'new-item__series';
    seriesSpan.textContent = p.series;

    var dot = document.createElement('span');
    dot.className = 'new-item__dot';
    dot.textContent = '·';

    var titleSpan = document.createElement('span');
    titleSpan.className = 'new-item__title';
    titleSpan.textContent = p.title;

    a.appendChild(seriesSpan);
    a.appendChild(dot);
    a.appendChild(titleSpan);
    frag.appendChild(a);
  });

  container.appendChild(frag);
});
