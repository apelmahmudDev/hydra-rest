(function (app) {
  'use strict';

  const { RING_CIRCUMFERENCE } = app.constants;

  function updateWaterProgress() {
    const entry = app.storage.getEntry(app.state.appData, app.date.getTodayDate());
    const consumed = entry.water || 0;
    const goal = app.state.goals.water || 2500;
    const rawPercent = goal > 0 ? (consumed / goal) * 100 : 0;
    const visualPercent = Math.min(100, Math.max(0, rawPercent));

    app.el.waterConsumed.textContent = consumed;
    app.el.waterRemaining.textContent = Math.max(0, goal - consumed);
    app.el.waterPercent.textContent = `${Math.round(Math.min(100, rawPercent))}%`;

    setRingProgress(app.el.waterRing, visualPercent);
  }

  function updateSleepProgress() {
    const entry = app.storage.getEntry(app.state.appData, app.date.getTodayDate());
    const hours = entry.sleep || 0;
    const goal = app.state.goals.sleep || 8;
    const rawPercent = goal > 0 ? (hours / goal) * 100 : 0;
    const visualPercent = Math.min(100, Math.max(0, rawPercent));

    app.el.sleepHoursDisplay.textContent = hours > 0 ? `${hours}h` : '0h';
    app.el.sleepPercent.textContent = `${Math.round(Math.min(100, rawPercent))}%`;

    if (hours <= 0) {
      app.el.sleepStatus.textContent = '—';
      app.el.sleepStatus.className = 'stat-value status-pill';
    } else if (hours >= goal) {
      app.el.sleepStatus.textContent = 'Goal met';
      app.el.sleepStatus.className = 'stat-value status-pill status-met';
    } else {
      app.el.sleepStatus.textContent = 'Under goal';
      app.el.sleepStatus.className = 'stat-value status-pill status-missed';
    }

    setRingProgress(app.el.sleepRing, visualPercent);
  }

  function setRingProgress(ringEl, percent) {
    const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
    ringEl.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    ringEl.style.strokeDashoffset = `${offset}`;
  }

  app.progress = {
    updateWaterProgress,
    updateSleepProgress
  };
})(window.HydraRest);
