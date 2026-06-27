document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('mt-all-pieces');
  var container = document.getElementById('mt-unread-list');
  if (!el || !container) return;

  var pieces;
  try { pieces = JSON.parse(el.textContent); } catch (e) { container.innerHTML = ''; return; }

  var unread = pieces.filter(function (p) {
    return !MT.get('mt_' + p.slug + '_reflected_' + p.part);
  });

  if (!unread.length) {
    container.innerHTML = '<p class="new-empty">You\'re all caught up.</p>';
    return;
  }

  unread.sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; });

  var html = '';
  unread.forEach(function (p) {
    html += '<a href="' + p.url + '" class="new-item">'
      + '<span class="new-item__series">' + p.series + '</span>'
      + '<span class="new-item__dot">·</span>'
      + '<span class="new-item__title">' + p.title + '</span>'
      + '</a>';
  });

  container.innerHTML = html;
});
