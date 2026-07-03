(function (app) {
  'use strict';

  app.constants = {
    DATA_KEY: 'hydrarest_data',
    GOALS_KEY: 'hydrarest_goals',
    THEME_KEY: 'hydrarest_theme',
    DEFAULT_GOALS: {
      water: 2500,
      sleep: 8
    },
    RING_CIRCUMFERENCE: 2 * Math.PI * 60
  };
})(window.HydraRest);
