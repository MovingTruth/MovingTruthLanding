/* Language switcher + browser auto-detect */
(function () {

  /* ── Auto-detect (runs on first visit, no stored preference) ── */
  var stored = MT.getValue('mt_lang');

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
        MT.setValue('mt_lang', detected);
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
        MT.setValue('mt_lang', this.dataset.lang);
      });
    });
  });

  /* Same for menu language links */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.mt-menu-lang-link[data-lang]').forEach(function (link) {
      link.addEventListener('click', function () {
        MT.setValue('mt_lang', this.dataset.lang);
      });
    });
  });

})();
