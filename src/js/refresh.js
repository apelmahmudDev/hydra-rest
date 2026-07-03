(function (app) {
  'use strict';

  function refreshAll() {
    app.progress.updateWaterProgress();
    app.progress.updateSleepProgress();
    app.streaks.calculateStreaks();
    app.weekly.renderWeeklySummary();
    app.calendar.renderCalendar();

    if (app.state.selectedDetailDate) {
      app.detail.renderDetailPanel(app.state.selectedDetailDate);
    }
  }

  app.refresh = {
    refreshAll
  };
})(window.HydraRest);
