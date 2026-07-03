(function (app) {
  'use strict';

  function calculateStreaks() {
    let current = 0;
    const cursor = new Date();

    let dateKey = app.date.formatDateKey(cursor);
    if (!app.goals.bothGoalsMet(app.state.appData[dateKey])) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      dateKey = app.date.formatDateKey(cursor);
      if (!app.goals.bothGoalsMet(app.state.appData[dateKey])) break;

      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    const allDates = Object.keys(app.state.appData).sort();
    let best = 0;
    let run = 0;
    let prevDate = null;

    allDates.forEach((key) => {
      if (!app.goals.bothGoalsMet(app.state.appData[key])) {
        run = 0;
        prevDate = null;
        return;
      }

      const thisDate = new Date(`${key}T00:00:00`);
      if (prevDate) {
        const diffDays = Math.round((thisDate - prevDate) / 86400000);
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }

      best = Math.max(best, run);
      prevDate = thisDate;
    });

    app.el.currentStreak.textContent = current;
    app.el.bestStreak.textContent = Math.max(best, current);
  }

  app.streaks = {
    calculateStreaks
  };
})(window.HydraRest);
