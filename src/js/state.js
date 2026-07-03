(function (app) {
  'use strict';

  app.state = {
    appData: app.storage.loadData(),
    goals: app.storage.loadGoals(),
    selectedDetailDate: null,
    calendarViewDate: new Date()
  };
})(window.HydraRest);
