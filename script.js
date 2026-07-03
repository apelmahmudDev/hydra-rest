(function () {
  'use strict';

  const files = [
    'namespace.js',
    'constants.js',
    'date.js',
    'storage.js',
    'state.js',
    'dom.js',
    'goals.js',
    'progress.js',
    'streaks.js',
    'weekly.js',
    'detail.js',
    'calendar.js',
    'refresh.js',
    'actions.js',
    'theme.js',
    'app.js',
    'main.js'
  ];

  function loadNext(index) {
    if (index >= files.length) return;

    const script = document.createElement('script');
    script.src = `src/js/${files[index]}`;
    script.onload = () => loadNext(index + 1);
    script.onerror = () => {
      console.error(`HydraRest: failed to load src/js/${files[index]}`);
    };

    document.head.appendChild(script);
  }

  loadNext(0);
})();
