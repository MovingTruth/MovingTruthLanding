/* Language switcher + browser auto-detect */
(function () {

  /* ── Auto-detect (runs on first visit, no stored preference) ── */
  var stored = MT.get ? null : null; // MT may not be loaded yet; use localStorage directly
  try { stored = localStorage.getItem('mt_lang'); } catch (e) {}

  if (!stored) {
    var lang = (navigator.language || '').toLowerCase();
    var map = {
      'es': 'es', 'es-419': 'es',
      'fr': 'fr',
      'pt': 'pt', 'pt-br': 'pt', 'pt-pt': 'pt',
      'de': 'de',
      'ja': 'ja',
      'ru': 'ru',
      'zh': 'zh', 'zh-cn': 'zh', 'zh-tw': 'zh', 'zh-hk': 'zh'
    };
    var detected = map[lang] || map[lang.split('-')[0]];
    if (detected) {
      var path = window.location.pathname;
      var alreadyOn = path === '/' + detected + '/' || path.indexOf('/' + detected + '/') === 0;
      if (!alreadyOn) {
        try { localStorage.setItem('mt_lang', detected); } catch (e) {}
        window.location.replace('/' + detected + '/');
        return;
      }
    }
  }

  /* ── Switcher panel toggle ── */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('mt-lang-btn');
    var panel = document.getElementById('mt-lang-panel');
    if (!btn || !panel) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.getAttribute('aria-hidden') === 'false';
      panel.setAttribute('aria-hidden', open ? 'true' : 'false');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });

    document.addEventListener('click', function () {
      panel.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
    });

    /* Store language choice when user selects one */
    panel.querySelectorAll('[data-lang]').forEach(function (link) {
      link.addEventListener('click', function () {
        try { localStorage.setItem('mt_lang', this.dataset.lang); } catch (e) {}
      });
    });
  });

  /* Same for menu language links */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.mt-menu-lang-link[data-lang]').forEach(function (link) {
      link.addEventListener('click', function () {
        try { localStorage.setItem('mt_lang', this.dataset.lang); } catch (e) {}
      });
    });
  });

})();
