(function (app) {
  'use strict';

  function renderDetailPanel(dateKey) {
    const entry = app.storage.getEntry(app.state.appData, dateKey);
    const waterPct = Math.min(100, app.state.goals.water > 0 ? Math.round((entry.water / app.state.goals.water) * 100) : 0);
    const sleepPct = Math.min(100, app.state.goals.sleep > 0 ? Math.round((entry.sleep / app.state.goals.sleep) * 100) : 0);

    app.el.dayDetailTitle.textContent = app.date.formatPrettyDate(dateKey);
    app.el.dayDetailContent.innerHTML = '';

    const waterRow = buildDetailRow({
      icon: 'icon-droplet',
      iconClass: 'card-icon-water',
      label: 'Water',
      value: `${entry.water || 0} / ${app.state.goals.water} ml`,
      percent: waterPct,
      barClass: 'detail-progress-water'
    });

    const sleepRow = buildDetailRow({
      icon: 'icon-moon',
      iconClass: 'card-icon-sleep',
      label: 'Sleep',
      value: `${entry.sleep || 0} / ${app.state.goals.sleep} h`,
      percent: sleepPct,
      barClass: 'detail-progress-sleep'
    });

    const perfect = app.goals.bothGoalsMet(entry);
    const hasData = entry.water || entry.sleep;
    const statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    statusRow.innerHTML = `
      <span class="detail-row-icon ${perfect ? 'card-icon-weekly' : 'card-icon-streak'}">
        <svg class="icon icon-sm"><use href="#${perfect ? 'icon-check' : 'icon-x'}"></use></svg>
      </span>
      <span class="detail-row-text">
        <strong>${perfect ? 'Perfect day' : (hasData ? 'Partial day' : 'No data')}</strong>
        <small>Status</small>
      </span>`;

    app.el.dayDetailContent.appendChild(waterRow);
    app.el.dayDetailContent.appendChild(sleepRow);
    app.el.dayDetailContent.appendChild(statusRow);

    app.el.resetDayBtn.hidden = !hasData;
  }

  function buildDetailRow({ icon, iconClass, label, value, percent, barClass }) {
    const row = document.createElement('div');
    row.className = 'detail-row';
    row.innerHTML = `
      <span class="detail-row-icon ${iconClass}">
        <svg class="icon icon-sm"><use href="#${icon}"></use></svg>
      </span>
      <span class="detail-row-text">
        <span class="detail-row-top"><strong>${label}</strong><strong class="detail-row-value">${value}</strong></span>
        <span class="detail-progress-track">
          <span class="detail-progress-fill ${barClass}" style="width:${percent}%"></span>
        </span>
      </span>`;

    return row;
  }

  app.detail = {
    renderDetailPanel
  };
})(window.HydraRest);
