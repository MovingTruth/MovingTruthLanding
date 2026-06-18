(function () {
  var THEME_KEY  = 'mt_theme';
  var REMEMBER_KEY = 'mt_theme_remember';

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
  }

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || sessionStorage.getItem(THEME_KEY);
  }

  function isRemembered() {
    return !!localStorage.getItem(REMEMBER_KEY);
  }

  function pickTheme(t, remember) {
    sessionStorage.setItem(THEME_KEY, t);
    if (remember) {
      localStorage.setItem(THEME_KEY, t);
      localStorage.setItem(REMEMBER_KEY, '1');
    } else {
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
    applyTheme(t);
  }

  // Apply immediately — runs from <head> before first paint
  var stored = getTheme();
  if (stored) applyTheme(stored);

  window.addEventListener('DOMContentLoaded', function () {

    // ── Theme picker (landing page only) ──────────────────────
    var picker = document.getElementById('mt-theme-picker');
    if (picker) {
      var shouldShow = !sessionStorage.getItem(THEME_KEY) && !isRemembered();

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

    // ── "Change theme" link (inner pages) ─────────────────────
    var changeLink = document.getElementById('mt-change-theme');
    if (changeLink) {
      changeLink.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem(THEME_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        sessionStorage.removeItem(THEME_KEY);
        window.location.href = changeLink.getAttribute('href');
      });
    }

  });
})();
