(function (app) {
  'use strict';

  const { DATA_KEY, DEFAULT_GOALS, GOALS_KEY } = app.constants;

  function loadData() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('HydraRest: could not parse saved data, starting fresh.', e);
      return {};
    }
  }

  function saveData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  function loadGoals() {
    try {
      const raw = localStorage.getItem(GOALS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};

      return {
        water: parsed.water > 0 ? parsed.water : DEFAULT_GOALS.water,
        sleep: parsed.sleep > 0 ? parsed.sleep : DEFAULT_GOALS.sleep
      };
    } catch (e) {
      return { ...DEFAULT_GOALS };
    }
  }

  function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  function getEntry(data, dateKey) {
    return data[dateKey] || { water: 0, sleep: 0 };
  }

  app.storage = {
    loadData,
    saveData,
    loadGoals,
    saveGoals,
    getEntry
  };
})(window.HydraRest);
