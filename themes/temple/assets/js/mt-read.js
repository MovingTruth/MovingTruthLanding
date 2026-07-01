(function () {
  var READ_CODE = '144K';

  var params = new URLSearchParams(window.location.search);
  if (params.get('read') !== READ_CODE) return;

  // Override MT — no storage reads or writes for this session
  MT.get    = function () { return true; };
  MT.set    = function () {};
  MT.remove = function () {};

  function injectReadParam(url) {
    if (!url || url.charAt(0) === '#') return url;
    if (url.indexOf('http') === 0 || url.indexOf('mailto') === 0) return url;
    try {
      var u = new URL(url, window.location.origin);
      u.searchParams.set('read', READ_CODE);
      return u.pathname + u.search + u.hash;
    } catch (e) { return url; }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      var u = injectReadParam(h);
      if (u !== h) a.setAttribute('href', u);
    });
    document.querySelectorAll('[data-href]').forEach(function (el) {
      var h = el.getAttribute('data-href');
      var u = injectReadParam(h);
      if (u !== h) el.setAttribute('data-href', u);
    });
  });
})();
