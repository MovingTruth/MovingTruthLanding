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
  }
};
