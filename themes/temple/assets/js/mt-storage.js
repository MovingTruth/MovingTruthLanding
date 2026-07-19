var MT = {
  get: function (key) {
    try { if (localStorage.getItem(key)) return true; } catch (e) {}
    return document.cookie.indexOf(key + '=1') !== -1;
  },
  set: function (key) {
    try { localStorage.setItem(key, '1'); } catch (e) {}
    var exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = key + '=1; expires=' + exp + '; path=/; SameSite=Lax; Secure';
  },
  remove: function (key) {
    try { localStorage.removeItem(key); } catch (e) {}
    document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure';
  },
  keysStartingWith: function (prefix) {
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) keys.push(k);
      }
    } catch (e) {}
    document.cookie.split(';').forEach(function (pair) {
      var k = pair.trim().split('=')[0];
      if (k && k.indexOf(prefix) === 0 && keys.indexOf(k) === -1) keys.push(k);
    });
    return keys;
  },

  // ── Durable value storage — for prefs that need a real value, not just a flag ──
  getValue: function (key) {
    try {
      var v = localStorage.getItem(key);
      if (v) return v;
    } catch (e) {}
    var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  },
  setValue: function (key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
    var exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = key + '=' + encodeURIComponent(value) + '; expires=' + exp + '; path=/; SameSite=Lax; Secure';
  },

  // ── Session-scoped storage — cleared when the browser session actually ends,
  //    unlike get/set which persist for a year. Session cookie (no expires) is
  //    the fallback so this still degrades gracefully if sessionStorage is blocked. ──
  getSessionValue: function (key) {
    try {
      var v = sessionStorage.getItem(key);
      if (v) return v;
    } catch (e) {}
    var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  },
  setSessionValue: function (key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) {}
    document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; SameSite=Lax; Secure';
  },
  removeSessionValue: function (key) {
    try { sessionStorage.removeItem(key); } catch (e) {}
    document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure';
  }
};

// ── Redirect notice toast ──────────────────────────────────────
// Anything that redirects a reader instead of honoring their click (the
// sequential-reading gate in reflect.js, the out-of-order intercept in
// mt-new.js) sets mt_redirect_notice before navigating. Shown once, here,
// on whatever page the redirect lands on — decoupled from either caller
// since the landing page is never the same file as the one that redirected.
document.addEventListener('DOMContentLoaded', function () {
  var msg = MT.getSessionValue('mt_redirect_notice');
  if (!msg) return;
  MT.removeSessionValue('mt_redirect_notice');

  var toast = document.createElement('div');
  toast.className = 'new-redirect-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('new-redirect-toast--visible');
  });
  setTimeout(function () {
    toast.classList.remove('new-redirect-toast--visible');
    setTimeout(function () { toast.remove(); }, 300);
  }, 4000);
});
