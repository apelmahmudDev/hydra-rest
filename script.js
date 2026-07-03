/* =========================================================
   HydraRest — script.js
   Vanilla JS water + sleep tracker. No frameworks.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Storage keys ---------- */
  const DATA_KEY = 'hydrarest_data';   // { "YYYY-MM-DD": { water: number, sleep: number } }
  const GOALS_KEY = 'hydrarest_goals'; // { water: number, sleep: number }
  const THEME_KEY = 'hydrarest_theme'; // "light" | "dark"

  const WATER_CIRC = 2 * Math.PI * 60; // ring circumference (r=60)

  /* =========================================================
     Date helpers
     ========================================================= */

  // Returns today's date as "YYYY-MM-DD" (local time, not UTC).
  function getTodayDate() {
    return formatDateKey(new Date());
  }

  // Converts a Date object into a "YYYY-MM-DD" string using local time.
  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatPrettyDate(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  /* =========================================================
     Storage: load / save
     ========================================================= */

  // Loads the full history object from localStorage. Returns {} if none/broken.
  function loadData() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('HydraRest: could not parse saved data, starting fresh.', e);
      return {};
    }
  }

  // Persists the full history object to localStorage.
  function saveData(data) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }

  // Loads saved goals, falling back to defaults (2500ml water / 8h sleep).
  function loadGoals() {
    try {
      const raw = localStorage.getItem(GOALS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        water: parsed.water > 0 ? parsed.water : 2500,
        sleep: parsed.sleep > 0 ? parsed.sleep : 8
      };
    } catch (e) {
      return { water: 2500, sleep: 8 };
    }
  }

  function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  // Returns the entry for a given date key, defaulting to zeroed values.
  function getEntry(data, dateKey) {
    return data[dateKey] || { water: 0, sleep: 0 };
  }

  /* =========================================================
     App state
     ========================================================= */

  let appData = loadData();
  let goals = loadGoals();
  let selectedDetailDate = null;      // date key currently shown in the detail panel
  let calendarViewDate = new Date();  // month currently displayed on the calendar

  /* =========================================================
     DOM references
     ========================================================= */

  const el = {
    todayDate: document.getElementById('todayDate'),

    // Water
    waterRing: document.getElementById('waterRing'),
    waterPercent: document.getElementById('waterPercent'),
    waterConsumed: document.getElementById('waterConsumed'),
    waterRemaining: document.getElementById('waterRemaining'),
    waterGoalInput: document.getElementById('waterGoalInput'),
    customWaterInput: document.getElementById('customWaterInput'),
    addCustomWater: document.getElementById('addCustomWater'),

    // Sleep
    sleepRing: document.getElementById('sleepRing'),
    sleepPercent: document.getElementById('sleepPercent'),
    sleepHoursDisplay: document.getElementById('sleepHoursDisplay'),
    sleepStatus: document.getElementById('sleepStatus'),
    sleepHoursInput: document.getElementById('sleepHoursInput'),
    sleepGoalInput: document.getElementById('sleepGoalInput'),
    saveSleepBtn: document.getElementById('saveSleepBtn'),

    // Streak
    currentStreak: document.getElementById('currentStreak'),
    bestStreak: document.getElementById('bestStreak'),

    // Weekly
    avgWater: document.getElementById('avgWater'),
    avgSleep: document.getElementById('avgSleep'),
    waterGoalDays: document.getElementById('waterGoalDays'),
    sleepGoalDays: document.getElementById('sleepGoalDays'),
    perfectDays: document.getElementById('perfectDays'),
    weeklyBars: document.getElementById('weeklyBars'),

    // Calendar
    calendarMonthLabel: document.getElementById('calendarMonthLabel'),
    calendarGrid: document.getElementById('calendarGrid'),
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),

    // Day detail
    dayDetailTitle: document.getElementById('dayDetailTitle'),
    dayDetailContent: document.getElementById('dayDetailContent'),
    resetDayBtn: document.getElementById('resetDayBtn'),

    // Reset
    resetTodayBtn: document.getElementById('resetTodayBtn'),
    resetAllBtn: document.getElementById('resetAllBtn'),
    confirmModal: document.getElementById('confirmModal'),
    cancelResetAll: document.getElementById('cancelResetAll'),
    confirmResetAll: document.getElementById('confirmResetAll'),

    // Theme
    darkModeToggle: document.getElementById('darkModeToggle')
  };

  /* =========================================================
     Water progress
     ========================================================= */

  // Recomputes and redraws the water ring/stats for today's entry.
  function updateWaterProgress() {
    const today = getTodayDate();
    const entry = getEntry(appData, today);
    const consumed = entry.water || 0;
    const goal = goals.water || 2500;

    // Clamp visual percentage to 100% even if the user drank more than the goal.
    const rawPercent = goal > 0 ? (consumed / goal) * 100 : 0;
    const visualPercent = Math.min(100, Math.max(0, rawPercent));

    el.waterConsumed.textContent = consumed;
    el.waterRemaining.textContent = Math.max(0, goal - consumed);
    el.waterPercent.textContent = `${Math.round(Math.min(100, rawPercent))}%`;

    setRingProgress(el.waterRing, visualPercent);
  }

  /* =========================================================
     Sleep progress
     ========================================================= */

  // Recomputes and redraws the sleep ring/stats for today's entry.
  function updateSleepProgress() {
    const today = getTodayDate();
    const entry = getEntry(appData, today);
    const hours = entry.sleep || 0;
    const goal = goals.sleep || 8;

    const rawPercent = goal > 0 ? (hours / goal) * 100 : 0;
    const visualPercent = Math.min(100, Math.max(0, rawPercent));

    el.sleepHoursDisplay.textContent = hours > 0 ? `${hours}h` : '0h';
    el.sleepPercent.textContent = `${Math.round(Math.min(100, rawPercent))}%`;

    if (hours <= 0) {
      el.sleepStatus.textContent = '—';
      el.sleepStatus.className = 'stat-value status-pill';
    } else if (hours >= goal) {
      el.sleepStatus.textContent = 'Goal met';
      el.sleepStatus.className = 'stat-value status-pill status-met';
    } else {
      el.sleepStatus.textContent = 'Under goal';
      el.sleepStatus.className = 'stat-value status-pill status-missed';
    }

    setRingProgress(el.sleepRing, visualPercent);
  }

  // Shared helper to animate an SVG progress ring to a given percent (0-100).
  function setRingProgress(ringEl, percent) {
    const offset = WATER_CIRC - (percent / 100) * WATER_CIRC;
    ringEl.style.strokeDasharray = `${WATER_CIRC}`;
    ringEl.style.strokeDashoffset = `${offset}`;
  }

  /* =========================================================
     Goal completion helpers
     ========================================================= */

  function waterGoalMet(entry) {
    return entry && entry.water > 0 && entry.water >= goals.water;
  }

  function sleepGoalMet(entry) {
    return entry && entry.sleep > 0 && entry.sleep >= goals.sleep;
  }

  function bothGoalsMet(entry) {
    return waterGoalMet(entry) && sleepGoalMet(entry);
  }

  /* =========================================================
     Streak calculation
     ========================================================= */

  // Walks backward day-by-day from today counting the current streak,
  // then scans all history to find the best streak ever recorded.
  function calculateStreaks() {
    // --- current streak: consecutive days (ending today or yesterday) with both goals met ---
    let current = 0;
    const cursor = new Date();

    // If today isn't complete yet, the streak still "counts" from yesterday backward,
    // so we only require today to count if it's actually met; otherwise start from yesterday.
    let dateKey = formatDateKey(cursor);
    if (!bothGoalsMet(appData[dateKey])) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      dateKey = formatDateKey(cursor);
      if (bothGoalsMet(appData[dateKey])) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    // --- best streak: scan every stored date in chronological order ---
    const allDates = Object.keys(appData).sort(); // "YYYY-MM-DD" sorts chronologically as strings
    let best = 0;
    let run = 0;
    let prevDate = null;

    allDates.forEach((key) => {
      if (!bothGoalsMet(appData[key])) {
        run = 0;
        prevDate = null;
        return;
      }
      const thisDate = new Date(key + 'T00:00:00');
      if (prevDate) {
        const diffDays = Math.round((thisDate - prevDate) / 86400000);
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      best = Math.max(best, run);
      prevDate = thisDate;
    });

    best = Math.max(best, current);

    el.currentStreak.textContent = current;
    el.bestStreak.textContent = best;
  }

  /* =========================================================
     Weekly summary (last 7 days, including today)
     ========================================================= */

  function renderWeeklySummary() {
    const days = [];
    const cursor = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() - i);
      days.push(formatDateKey(d));
    }

    let waterTotal = 0;
    let sleepTotal = 0;
    let waterDaysMet = 0;
    let sleepDaysMet = 0;
    let perfect = 0;

    days.forEach((key) => {
      const entry = getEntry(appData, key);
      waterTotal += entry.water || 0;
      sleepTotal += entry.sleep || 0;
      if (waterGoalMet(entry)) waterDaysMet++;
      if (sleepGoalMet(entry)) sleepDaysMet++;
      if (bothGoalsMet(entry)) perfect++;
    });

    const avgWater = Math.round(waterTotal / days.length);
    const avgSleep = Math.round((sleepTotal / days.length) * 10) / 10;

    el.avgWater.textContent = `${avgWater} ml`;
    el.avgSleep.textContent = `${avgSleep} h`;
    el.waterGoalDays.textContent = `${waterDaysMet}/7`;
    el.sleepGoalDays.textContent = `${sleepDaysMet}/7`;
    el.perfectDays.textContent = `${perfect}/7`;

    renderWeeklyBars(days);
  }

  // Draws a simple CSS-only stacked bar (water portion + sleep portion) per day.
  function renderWeeklyBars(days) {
    el.weeklyBars.innerHTML = '';

    days.forEach((key) => {
      const entry = getEntry(appData, key);
      const waterPct = Math.min(100, goals.water > 0 ? (entry.water / goals.water) * 100 : 0);
      const sleepPct = Math.min(100, goals.sleep > 0 ? (entry.sleep / goals.sleep) * 100 : 0);

      const col = document.createElement('div');
      col.className = 'weekly-bar-col';

      const stack = document.createElement('div');
      stack.className = 'weekly-bar-stack';

      const waterSeg = document.createElement('div');
      waterSeg.className = 'weekly-bar-seg weekly-bar-water';
      waterSeg.style.height = `${waterPct / 2}%`;

      const sleepSeg = document.createElement('div');
      sleepSeg.className = 'weekly-bar-seg weekly-bar-sleep';
      sleepSeg.style.height = `${sleepPct / 2}%`;

      stack.appendChild(waterSeg);
      stack.appendChild(sleepSeg);

      const label = document.createElement('span');
      label.className = 'weekly-bar-day';
      const [, , d] = key.split('-');
      label.textContent = String(Number(d));

      col.appendChild(stack);
      col.appendChild(label);
      el.weeklyBars.appendChild(col);
    });
  }

  /* =========================================================
     Calendar rendering
     ========================================================= */

  function renderCalendar() {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth(); // 0-indexed

    el.calendarMonthLabel.textContent = calendarViewDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });

    el.calendarGrid.innerHTML = '';

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = getTodayDate();

    // Leading blanks so day 1 lands on the correct weekday column.
    for (let i = 0; i < startWeekday; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day empty';
      el.calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateKey = formatDateKey(dateObj);
      const entry = appData[dateKey];

      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', formatPrettyDate(dateKey));

      if (dateKey === todayKey) cell.classList.add('is-today');
      if (dateKey === selectedDetailDate) cell.classList.add('selected');

      const num = document.createElement('span');
      num.textContent = day;
      cell.appendChild(num);

      // Status dot: both / water-only / sleep-only / missed. No dot if no data at all.
      if (entry && (entry.water > 0 || entry.sleep > 0)) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        if (bothGoalsMet(entry)) dot.classList.add('both');
        else if (waterGoalMet(entry)) dot.classList.add('water');
        else if (sleepGoalMet(entry)) dot.classList.add('sleep');
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

      el.calendarGrid.appendChild(cell);
    }
  }

  function goToPrevMonth() {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  }

  function goToNextMonth() {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  }

  /* =========================================================
     Day detail panel
     ========================================================= */

  function selectDetailDate(dateKey) {
    selectedDetailDate = dateKey;
    const entry = getEntry(appData, dateKey);

    el.dayDetailTitle.textContent = formatPrettyDate(dateKey);
    el.dayDetailContent.innerHTML = '';

    const waterRow = document.createElement('div');
    waterRow.className = 'detail-row';
    waterRow.innerHTML = `<span>💧 Water</span><strong>${entry.water || 0} / ${goals.water} ml</strong>`;

    const sleepRow = document.createElement('div');
    sleepRow.className = 'detail-row';
    sleepRow.innerHTML = `<span>🌙 Sleep</span><strong>${entry.sleep || 0} / ${goals.sleep} h</strong>`;

    const statusRow = document.createElement('div');
    statusRow.className = 'detail-row';
    const statusText = bothGoalsMet(entry) ? 'Perfect day ✅' : (entry.water || entry.sleep ? 'Partial' : 'No data');
    statusRow.innerHTML = `<span>Status</span><strong>${statusText}</strong>`;

    el.dayDetailContent.appendChild(waterRow);
    el.dayDetailContent.appendChild(sleepRow);
    el.dayDetailContent.appendChild(statusRow);

    el.resetDayBtn.hidden = !(entry.water || entry.sleep);
    renderCalendar(); // refresh selection highlight
  }

  /* =========================================================
     Reset by date
     ========================================================= */

  // Removes the stored entry for one specific date (does not touch other days).
  function resetDataByDate(dateKey) {
    if (appData[dateKey]) {
      delete appData[dateKey];
      saveData(appData);
    }
    refreshAll();
    if (selectedDetailDate === dateKey) {
      selectDetailDate(dateKey);
    }
  }

  function resetAllData() {
    appData = {};
    saveData(appData);
    refreshAll();
    if (selectedDetailDate) selectDetailDate(selectedDetailDate);
  }

  /* =========================================================
     Input handling / validation
     ========================================================= */

  function addWater(amount) {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) return; // reject empty/negative/invalid
    const today = getTodayDate();
    const entry = getEntry(appData, today);
    entry.water = Math.round((entry.water || 0) + num);
    appData[today] = entry;
    saveData(appData);
    refreshAll();
  }

  function saveSleepHours() {
    const raw = el.sleepHoursInput.value;
    const num = Number(raw);
    if (raw === '' || !Number.isFinite(num) || num < 0) return; // reject empty/negative/invalid
    const today = getTodayDate();
    const entry = getEntry(appData, today);
    entry.sleep = Math.min(24, Math.round(num * 10) / 10);
    appData[today] = entry;
    saveData(appData);
    el.sleepHoursInput.value = '';
    refreshAll();
  }

  function updateWaterGoal() {
    const num = Number(el.waterGoalInput.value);
    if (!Number.isFinite(num) || num <= 0) {
      el.waterGoalInput.value = goals.water; // revert to last valid goal
      return;
    }
    goals.water = Math.round(num);
    saveGoals(goals);
    refreshAll();
  }

  function updateSleepGoal() {
    const num = Number(el.sleepGoalInput.value);
    if (!Number.isFinite(num) || num <= 0) {
      el.sleepGoalInput.value = goals.sleep;
      return;
    }
    goals.sleep = Math.round(num * 10) / 10;
    saveGoals(goals);
    refreshAll();
  }

  /* =========================================================
     Theme (dark mode)
     ========================================================= */

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      el.darkModeToggle.setAttribute('aria-pressed', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      el.darkModeToggle.setAttribute('aria-pressed', 'false');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /* =========================================================
     Master refresh
     ========================================================= */

  function refreshAll() {
    updateWaterProgress();
    updateSleepProgress();
    calculateStreaks();
    renderWeeklySummary();
    renderCalendar();
  }

  /* =========================================================
     Init
     ========================================================= */

  function init() {
    // Theme
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);

    // Today banner
    el.todayDate.textContent = formatPrettyDate(getTodayDate());

    // Goal inputs reflect saved goals
    el.waterGoalInput.value = goals.water;
    el.sleepGoalInput.value = goals.sleep;

    // Water quick-add buttons
    document.querySelectorAll('.water-btn').forEach((btn) => {
      btn.addEventListener('click', () => addWater(btn.dataset.amount));
    });
    el.addCustomWater.addEventListener('click', () => {
      addWater(el.customWaterInput.value);
      el.customWaterInput.value = '';
    });
    el.customWaterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addWater(el.customWaterInput.value);
        el.customWaterInput.value = '';
      }
    });

    // Sleep
    el.saveSleepBtn.addEventListener('click', saveSleepHours);
    el.sleepHoursInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveSleepHours();
    });

    // Goals
    el.waterGoalInput.addEventListener('change', updateWaterGoal);
    el.sleepGoalInput.addEventListener('change', updateSleepGoal);

    // Calendar navigation
    el.prevMonthBtn.addEventListener('click', goToPrevMonth);
    el.nextMonthBtn.addEventListener('click', goToNextMonth);

    // Day detail reset
    el.resetDayBtn.addEventListener('click', () => {
      if (selectedDetailDate) resetDataByDate(selectedDetailDate);
    });

    // Reset today
    el.resetTodayBtn.addEventListener('click', () => resetDataByDate(getTodayDate()));

    // Reset all (with confirmation modal)
    el.resetAllBtn.addEventListener('click', () => { el.confirmModal.hidden = false; });
    el.cancelResetAll.addEventListener('click', () => { el.confirmModal.hidden = true; });
    el.confirmResetAll.addEventListener('click', () => {
      resetAllData();
      el.confirmModal.hidden = true;
    });
    el.confirmModal.addEventListener('click', (e) => {
      if (e.target === el.confirmModal) el.confirmModal.hidden = true;
    });

    // Theme toggle
    el.darkModeToggle.addEventListener('click', toggleTheme);

    // Initial paint
    refreshAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
