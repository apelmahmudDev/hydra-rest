(function (app) {
  'use strict';

  function waterGoalMet(entry) {
    return entry && entry.water > 0 && entry.water >= app.state.goals.water;
  }

  function sleepGoalMet(entry) {
    return entry && entry.sleep > 0 && entry.sleep >= app.state.goals.sleep;
  }

  function bothGoalsMet(entry) {
    return waterGoalMet(entry) && sleepGoalMet(entry);
  }

  app.goals = {
    waterGoalMet,
    sleepGoalMet,
    bothGoalsMet
  };
})(window.HydraRest);
