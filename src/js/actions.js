(function (app) {
  'use strict';

  function addWater(amount) {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) return;

    const today = app.date.getTodayDate();
    const entry = app.storage.getEntry(app.state.appData, today);
    entry.water = Math.round((entry.water || 0) + num);
    app.state.appData[today] = entry;

    app.storage.saveData(app.state.appData);
    app.refresh.refreshAll();
  }

  function saveSleepHours() {
    const raw = app.el.sleepHoursInput.value;
    const num = Number(raw);
    if (raw === '' || !Number.isFinite(num) || num < 0) return;

    const today = app.date.getTodayDate();
    const entry = app.storage.getEntry(app.state.appData, today);
    entry.sleep = Math.min(24, Math.round(num * 10) / 10);
    app.state.appData[today] = entry;

    app.storage.saveData(app.state.appData);
    app.el.sleepHoursInput.value = '';
    app.refresh.refreshAll();
  }

  function updateWaterGoal() {
    const num = Number(app.el.waterGoalInput.value);
    if (!Number.isFinite(num) || num <= 0) {
      app.el.waterGoalInput.value = app.state.goals.water;
      return;
    }

    app.state.goals.water = Math.round(num);
    app.storage.saveGoals(app.state.goals);
    app.refresh.refreshAll();
  }

  function updateSleepGoal() {
    const num = Number(app.el.sleepGoalInput.value);
    if (!Number.isFinite(num) || num <= 0) {
      app.el.sleepGoalInput.value = app.state.goals.sleep;
      return;
    }

    app.state.goals.sleep = Math.round(num * 10) / 10;
    app.storage.saveGoals(app.state.goals);
    app.refresh.refreshAll();
  }

  function resetDataByDate(dateKey) {
    if (app.state.appData[dateKey]) {
      delete app.state.appData[dateKey];
      app.storage.saveData(app.state.appData);
    }

    app.refresh.refreshAll();
  }

  function resetAllData() {
    app.state.appData = {};
    app.storage.saveData(app.state.appData);
    app.refresh.refreshAll();
  }

  app.actions = {
    addWater,
    saveSleepHours,
    updateWaterGoal,
    updateSleepGoal,
    resetDataByDate,
    resetAllData
  };
})(window.HydraRest);
