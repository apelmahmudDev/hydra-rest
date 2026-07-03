(function (app) {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.app.init);
  } else {
    app.app.init();
  }
})(window.HydraRest);
