(function (app) {
  'use strict';

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;

    const savedTheme = localStorage.getItem(app.constants.THEME_KEY) || 'light';
    app.theme.applyTheme(savedTheme);

    app.el.todayDate.textContent = app.date.formatPrettyDate(app.date.getTodayDate());
    app.el.waterGoalInput.value = app.state.goals.water;
    app.el.sleepGoalInput.value = app.state.goals.sleep;
    app.state.selectedDetailDate = app.date.getTodayDate();

    bindEvents();
    app.refresh.refreshAll();
  }

  function bindEvents() {
    document.querySelectorAll('.water-btn').forEach((btn) => {
      btn.addEventListener('click', () => app.actions.addWater(btn.dataset.amount));
    });

    app.el.addCustomWater.addEventListener('click', () => {
      app.actions.addWater(app.el.customWaterInput.value);
      app.el.customWaterInput.value = '';
    });

    app.el.customWaterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        app.actions.addWater(app.el.customWaterInput.value);
        app.el.customWaterInput.value = '';
      }
    });

    app.el.saveSleepBtn.addEventListener('click', app.actions.saveSleepHours);
    app.el.sleepHoursInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') app.actions.saveSleepHours();
    });

    app.el.waterGoalInput.addEventListener('change', app.actions.updateWaterGoal);
    app.el.sleepGoalInput.addEventListener('change', app.actions.updateSleepGoal);

    app.el.prevMonthBtn.addEventListener('click', app.calendar.goToPrevMonth);
    app.el.nextMonthBtn.addEventListener('click', app.calendar.goToNextMonth);

    app.el.resetDayBtn.addEventListener('click', () => {
      if (app.state.selectedDetailDate) app.actions.resetDataByDate(app.state.selectedDetailDate);
    });

    app.el.resetTodayBtn.addEventListener('click', () => app.actions.resetDataByDate(app.date.getTodayDate()));

    app.el.resetAllBtn.addEventListener('click', () => {
      app.el.confirmModal.hidden = false;
    });

    app.el.cancelResetAll.addEventListener('click', () => {
      app.el.confirmModal.hidden = true;
    });

    app.el.confirmResetAll.addEventListener('click', () => {
      app.actions.resetAllData();
      app.el.confirmModal.hidden = true;
    });

    app.el.confirmModal.addEventListener('click', (e) => {
      if (e.target === app.el.confirmModal) app.el.confirmModal.hidden = true;
    });

    app.el.themeToggleBtn.addEventListener('click', app.theme.toggleTheme);
  }

  app.app = {
    init
  };
})(window.HydraRest);
