(function (app) {
  'use strict';

  app.el = {
    todayDate: document.getElementById('todayDate'),

    waterRing: document.getElementById('waterRing'),
    waterPercent: document.getElementById('waterPercent'),
    waterConsumed: document.getElementById('waterConsumed'),
    waterRemaining: document.getElementById('waterRemaining'),
    waterGoalInput: document.getElementById('waterGoalInput'),
    customWaterInput: document.getElementById('customWaterInput'),
    addCustomWater: document.getElementById('addCustomWater'),

    sleepRing: document.getElementById('sleepRing'),
    sleepPercent: document.getElementById('sleepPercent'),
    sleepHoursDisplay: document.getElementById('sleepHoursDisplay'),
    sleepStatus: document.getElementById('sleepStatus'),
    sleepHoursInput: document.getElementById('sleepHoursInput'),
    sleepGoalInput: document.getElementById('sleepGoalInput'),
    saveSleepBtn: document.getElementById('saveSleepBtn'),

    currentStreak: document.getElementById('currentStreak'),
    bestStreak: document.getElementById('bestStreak'),

    avgWater: document.getElementById('avgWater'),
    avgSleep: document.getElementById('avgSleep'),
    waterGoalDays: document.getElementById('waterGoalDays'),
    sleepGoalDays: document.getElementById('sleepGoalDays'),
    perfectDays: document.getElementById('perfectDays'),
    weeklyBars: document.getElementById('weeklyBars'),
    weeklyAxisWater: document.getElementById('weeklyAxisWater'),
    weeklyAxisSleep: document.getElementById('weeklyAxisSleep'),

    calendarMonthLabel: document.getElementById('calendarMonthLabel'),
    calendarGrid: document.getElementById('calendarGrid'),
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),

    dayDetailTitle: document.getElementById('dayDetailTitle'),
    dayDetailContent: document.getElementById('dayDetailContent'),
    resetDayBtn: document.getElementById('resetDayBtn'),

    resetTodayBtn: document.getElementById('resetTodayBtn'),
    resetAllBtn: document.getElementById('resetAllBtn'),
    confirmModal: document.getElementById('confirmModal'),
    cancelResetAll: document.getElementById('cancelResetAll'),
    confirmResetAll: document.getElementById('confirmResetAll'),

    themeToggleBtn: document.getElementById('themeToggleBtn')
  };
})(window.HydraRest);
