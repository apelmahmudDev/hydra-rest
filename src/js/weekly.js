(function (app) {
  'use strict';

  function renderWeeklySummary() {
    const days = [];
    const cursor = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() - i);
      days.push(app.date.formatDateKey(d));
    }

    let waterTotal = 0;
    let sleepTotal = 0;
    let waterDaysMet = 0;
    let sleepDaysMet = 0;
    let perfect = 0;

    days.forEach((key) => {
      const entry = app.storage.getEntry(app.state.appData, key);
      waterTotal += entry.water || 0;
      sleepTotal += entry.sleep || 0;
      if (app.goals.waterGoalMet(entry)) waterDaysMet++;
      if (app.goals.sleepGoalMet(entry)) sleepDaysMet++;
      if (app.goals.bothGoalsMet(entry)) perfect++;
    });

    app.el.avgWater.textContent = `${Math.round(waterTotal / days.length)} ml`;
    app.el.avgSleep.textContent = `${Math.round((sleepTotal / days.length) * 10) / 10} h`;
    app.el.waterGoalDays.textContent = `${waterDaysMet}/7`;
    app.el.sleepGoalDays.textContent = `${sleepDaysMet}/7`;
    app.el.perfectDays.textContent = `${perfect}/7`;

    renderWeeklyBars(days);
  }

  function renderWeeklyBars(days) {
    app.el.weeklyBars.innerHTML = '';

    const waterMax = app.state.goals.water > 0 ? app.state.goals.water : 1;
    const sleepMax = app.state.goals.sleep > 0 ? app.state.goals.sleep : 1;
    const todayKey = app.date.getTodayDate();

    days.forEach((key) => {
      const entry = app.storage.getEntry(app.state.appData, key);
      const waterPct = Math.min(100, (entry.water / waterMax) * 100);
      const sleepPct = Math.min(100, (entry.sleep / sleepMax) * 100);

      const col = document.createElement('div');
      col.className = 'weekly-bar-col';

      const group = document.createElement('div');
      group.className = 'weekly-bar-group';

      const waterBar = document.createElement('div');
      waterBar.className = 'weekly-bar weekly-bar-water';
      waterBar.style.height = `${waterPct}%`;

      const sleepBar = document.createElement('div');
      sleepBar.className = 'weekly-bar weekly-bar-sleep';
      sleepBar.style.height = `${sleepPct}%`;

      group.appendChild(waterBar);
      group.appendChild(sleepBar);

      const label = document.createElement('span');
      label.className = 'weekly-bar-day';
      label.textContent = String(Number(key.split('-')[2]));
      if (key === todayKey) label.classList.add('is-today-label');

      col.appendChild(group);
      col.appendChild(label);
      app.el.weeklyBars.appendChild(col);
    });

    app.el.weeklyAxisWater.innerHTML =
      `<span>${waterMax}</span><span>${Math.round(waterMax / 2)}</span><span>0</span>`;
    app.el.weeklyAxisSleep.innerHTML =
      `<span>${sleepMax}</span><span>${Math.round((sleepMax / 2) * 10) / 10}</span><span>0</span>`;
  }

  app.weekly = {
    renderWeeklySummary
  };
})(window.HydraRest);
