(function (app) {
  'use strict';

  function applyTheme(theme) {
    const isDark = theme === 'dark';

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    app.el.themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    app.el.themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function setTheme(theme) {
    localStorage.setItem(app.constants.THEME_KEY, theme);
    applyTheme(theme);
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  }

  app.theme = {
    applyTheme,
    setTheme,
    toggleTheme
  };
})(window.HydraRest);
