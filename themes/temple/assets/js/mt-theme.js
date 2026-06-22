(function () {
  var THEME_KEY  = 'mt_theme';
  var REMEMBER_KEY = 'mt_theme_remember';

  function storageGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(storage, key, val) {
    try { storage.setItem(key, val); } catch (e) {}
  }

  function storageRemove(storage, key) {
    try { storage.removeItem(key); } catch (e) {}
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
  }

  function getTheme() {
    return storageGet(localStorage, THEME_KEY) || storageGet(sessionStorage, THEME_KEY);
  }

  function isRemembered() {
    return !!storageGet(localStorage, REMEMBER_KEY);
  }

  function pickTheme(t, remember) {
    storageSet(sessionStorage, THEME_KEY, t);
    if (remember) {
      storageSet(localStorage, THEME_KEY, t);
      storageSet(localStorage, REMEMBER_KEY, '1');
    } else {
      storageRemove(localStorage, THEME_KEY);
      storageRemove(localStorage, REMEMBER_KEY);
    }
    applyTheme(t);
  }

  // Apply stored theme immediately (before first paint)
  var stored = getTheme();
  if (stored) applyTheme(stored);

  window.addEventListener('DOMContentLoaded', function () {

    // ── Theme picker (landing page only) ──────────────────────
    var picker = document.getElementById('mt-theme-picker');
    if (picker) {
      var shouldShow = !storageGet(sessionStorage, THEME_KEY) && !isRemembered();

      if (!shouldShow) {
        applyTheme(getTheme() || 'dark');
        picker.style.display = 'none';
      } else {
        picker.style.display = 'flex';

        var remember = false;
        var rememberCheck = document.getElementById('mt-theme-remember');
        if (rememberCheck) {
          rememberCheck.addEventListener('change', function () {
            remember = this.checked;
          });
        }

        document.querySelectorAll('.mt-theme-btn[data-theme]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            pickTheme(this.dataset.theme, remember);
            picker.style.display = 'none';
          });
        });
      }
    }

    // ── Hamburger menu ────────────────────────────────────────
    var menuBtn     = document.getElementById('mt-menu-btn');
    var menuPanel   = document.getElementById('mt-menu-panel');
    var menuOverlay = document.getElementById('mt-menu-overlay');
    var menuClose   = document.getElementById('mt-menu-close');

    function openMenu() {
      menuPanel.classList.add('mt-menu-panel--open');
      menuOverlay.classList.add('mt-menu-overlay--open');
      menuBtn.classList.add('mt-menu-btn--open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuPanel.setAttribute('aria-hidden', 'false');
      menuOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuPanel.classList.remove('mt-menu-panel--open');
      menuOverlay.classList.remove('mt-menu-overlay--open');
      menuBtn.classList.remove('mt-menu-btn--open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuPanel.setAttribute('aria-hidden', 'true');
      menuOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (menuBtn)     menuBtn.addEventListener('click', openMenu);
    if (menuClose)   menuClose.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // ── Random pulse on header support button ─────────────────
    var navSupport = document.querySelector('.nav-support');
    if (navSupport) {
      function scheduleNavPulse() {
        var delay = Math.floor(Math.random() * 80000) + 10000;
        setTimeout(function () {
          navSupport.classList.add('nav-support--pulsing');
          navSupport.addEventListener('animationend', function onEnd() {
            navSupport.removeEventListener('animationend', onEnd);
            navSupport.classList.remove('nav-support--pulsing');
            scheduleNavPulse();
          }, { once: true });
        }, delay);
      }
      scheduleNavPulse();
    }

    // ── "Change theme" link (inner pages) ─────────────────────
    var changeLink = document.getElementById('mt-change-theme');
    if (changeLink) {
      changeLink.addEventListener('click', function (e) {
        e.preventDefault();
        storageRemove(localStorage, THEME_KEY);
        storageRemove(localStorage, REMEMBER_KEY);
        storageRemove(sessionStorage, THEME_KEY);
        window.location.href = changeLink.getAttribute('href');
      });
    }

  });
})();
