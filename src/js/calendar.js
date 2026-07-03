(function (app) {
  'use strict';

  function renderCalendar() {
    const year = app.state.calendarViewDate.getFullYear();
    const month = app.state.calendarViewDate.getMonth();

    app.el.calendarMonthLabel.textContent = app.state.calendarViewDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });

    app.el.calendarGrid.innerHTML = '';

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = app.date.getTodayDate();

    for (let i = 0; i < startWeekday; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day empty';
      app.el.calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateKey = app.date.formatDateKey(dateObj);
      const entry = app.state.appData[dateKey];

      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', app.date.formatPrettyDate(dateKey));

      if (dateKey === todayKey) cell.classList.add('is-today');
      if (dateKey === app.state.selectedDetailDate) cell.classList.add('selected');

      const num = document.createElement('span');
      num.textContent = day;
      cell.appendChild(num);

      if (entry && (entry.water > 0 || entry.sleep > 0)) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        if (app.goals.bothGoalsMet(entry)) dot.classList.add('both');
        else if (app.goals.waterGoalMet(entry)) dot.classList.add('water');
        else if (app.goals.sleepGoalMet(entry)) dot.classList.add('sleep');
        else dot.classList.add('missed');
        cell.appendChild(dot);
      }

      cell.addEventListener('click', () => selectDetailDate(dateKey));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectDetailDate(dateKey);
        }
      });

      app.el.calendarGrid.appendChild(cell);
    }
  }

  function goToPrevMonth() {
    app.state.calendarViewDate.setMonth(app.state.calendarViewDate.getMonth() - 1);
    renderCalendar();
  }

  function goToNextMonth() {
    app.state.calendarViewDate.setMonth(app.state.calendarViewDate.getMonth() + 1);
    renderCalendar();
  }

  function selectDetailDate(dateKey) {
    app.state.selectedDetailDate = dateKey;
    app.detail.renderDetailPanel(dateKey);
    renderCalendar();
  }

  app.calendar = {
    renderCalendar,
    goToPrevMonth,
    goToNextMonth,
    selectDetailDate
  };
})(window.HydraRest);
