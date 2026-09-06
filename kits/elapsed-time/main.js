(function () {
  'use strict';

  const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;
  const STORAGE_KEY = 'elapsed-time-start-date-v1';

  const elements = {
    form: document.getElementById('date-form'),
    startDate: document.getElementById('start-date'),
    datePicker: document.getElementById('date-picker'),
    datePickerTrigger: document.getElementById('date-picker-trigger'),
    presetButtons: Array.from(document.querySelectorAll('[data-date]')),
    todayLabel: document.getElementById('today-label'),
    errorMessage: document.getElementById('error-message'),
    emptyState: document.getElementById('empty-state'),
    results: document.getElementById('results'),
    totalDays: document.getElementById('total-days'),
    calendarMonths: document.getElementById('calendar-months'),
    monthRemainder: document.getElementById('month-remainder'),
    calendarDuration: document.getElementById('calendar-duration'),
    weekDuration: document.getElementById('week-duration'),
    dateRange: document.getElementById('date-range'),
  };

  function getTodayParts() {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }

  function toIsoDate(parts) {
    return [
      String(parts.year).padStart(4, '0'),
      String(parts.month).padStart(2, '0'),
      String(parts.day).padStart(2, '0'),
    ].join('-');
  }

  function parseIsoDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const parts = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };
    const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    if (
      check.getUTCFullYear() !== parts.year
      || check.getUTCMonth() + 1 !== parts.month
      || check.getUTCDate() !== parts.day
    ) {
      return null;
    }
    return parts;
  }

  function parseDateInput(value) {
    const input = String(value || '').trim();
    const compactMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(input);
    const separatedMatch = /^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/.exec(input);
    const match = compactMatch || separatedMatch;
    if (!match) {
      return null;
    }
    return parseIsoDate([
      match[1],
      String(Number(match[2])).padStart(2, '0'),
      String(Number(match[3])).padStart(2, '0'),
    ].join('-'));
  }

  function toDayNumber(parts) {
    return Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_MILLISECONDS;
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function addCalendarMonths(parts, monthCount) {
    const monthIndex = parts.year * 12 + (parts.month - 1) + monthCount;
    const year = Math.floor(monthIndex / 12);
    const month = monthIndex - year * 12 + 1;
    return {
      year,
      month,
      day: Math.min(parts.day, daysInMonth(year, month)),
    };
  }

  function getElapsed(start, end) {
    const totalDays = toDayNumber(end) - toDayNumber(start);
    let completeMonths = (end.year - start.year) * 12 + end.month - start.month;
    let monthAnniversary = addCalendarMonths(start, completeMonths);

    if (toDayNumber(monthAnniversary) > toDayNumber(end)) {
      completeMonths -= 1;
      monthAnniversary = addCalendarMonths(start, completeMonths);
    }

    return {
      totalDays,
      completeMonths,
      remainingDays: toDayNumber(end) - toDayNumber(monthAnniversary),
      years: Math.floor(completeMonths / 12),
      months: completeMonths % 12,
      weeks: Math.floor(totalDays / 7),
      weekDays: totalDays % 7,
    };
  }

  function formatDate(parts) {
    return `${parts.year} 年 ${parts.month} 月 ${parts.day} 日`;
  }

  function formatCalendarDuration(elapsed) {
    return `${elapsed.years} 年 ${elapsed.months} 个月 ${elapsed.remainingDays} 天`;
  }

  function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.hidden = false;
    elements.startDate.setAttribute('aria-invalid', 'true');
    elements.results.hidden = true;
    elements.emptyState.hidden = false;
  }

  function clearError() {
    elements.errorMessage.textContent = '';
    elements.errorMessage.hidden = true;
    elements.startDate.removeAttribute('aria-invalid');
  }

  function updatePresetSelection(value) {
    elements.presetButtons.forEach((button) => {
      const selected = button.dataset.date === value;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.querySelector('.preset-state').textContent = selected ? '已选' : '选择';
    });
  }

  function renderResult(start, today) {
    const elapsed = getElapsed(start, today);

    elements.totalDays.textContent = elapsed.totalDays.toLocaleString('zh-CN');
    elements.calendarMonths.textContent = elapsed.completeMonths.toLocaleString('zh-CN');
    elements.monthRemainder.textContent = `再加 ${elapsed.remainingDays} 天`;
    elements.calendarDuration.textContent = formatCalendarDuration(elapsed);
    elements.weekDuration.textContent = `${elapsed.weeks.toLocaleString('zh-CN')} 周 ${elapsed.weekDays} 天`;
    elements.dateRange.textContent = `${formatDate(start)} → ${formatDate(today)}`;
    elements.emptyState.hidden = true;
    elements.results.hidden = false;
  }

  function saveStartDate(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // 本地存储不可用时，计算功能仍可正常使用。
    }
  }

  function updateAddress(value) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('from', value);
      window.history.replaceState(null, '', url);
    } catch (error) {
      // 不支持 History API 时忽略，结果不受影响。
    }
  }

  function calculate(options) {
    const settings = options || {};
    const today = getTodayParts();
    const todayIso = toIsoDate(today);
    const start = parseDateInput(elements.startDate.value);

    elements.datePicker.max = todayIso;
    elements.todayLabel.textContent = `基准：${formatDate(today)}，本地时间 0 点`;
    const normalizedDate = start ? toIsoDate(start) : '';
    updatePresetSelection(normalizedDate);

    if (!start) {
      if (!settings.silent) {
        showError('请先选择一个有效的开始日期。');
      }
      return;
    }
    if (toDayNumber(start) > toDayNumber(today)) {
      showError('开始日期不能晚于今天。');
      return;
    }

    clearError();
    elements.startDate.value = normalizedDate;
    elements.datePicker.value = normalizedDate;
    renderResult(start, today);
    saveStartDate(normalizedDate);
    updateAddress(normalizedDate);
  }

  function getInitialDate() {
    const queryDate = new URLSearchParams(window.location.search).get('from');
    if (parseIsoDate(queryDate || '')) {
      return queryDate;
    }
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY);
      return parseIsoDate(savedDate || '') ? savedDate : '';
    } catch (error) {
      return '';
    }
  }

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
  });

  elements.startDate.addEventListener('change', () => {
    if (elements.startDate.value) {
      calculate();
    } else {
      updatePresetSelection('');
      elements.datePicker.value = '';
      elements.results.hidden = true;
      elements.emptyState.hidden = false;
      clearError();
    }
  });

  elements.startDate.addEventListener('input', () => {
    const parsed = parseDateInput(elements.startDate.value);
    updatePresetSelection(parsed ? toIsoDate(parsed) : '');
  });

  elements.datePicker.addEventListener('change', () => {
    if (!elements.datePicker.value) {
      return;
    }
    elements.startDate.value = elements.datePicker.value;
    calculate();
  });

  elements.datePickerTrigger.addEventListener('click', () => {
    try {
      if (typeof elements.datePicker.showPicker === 'function') {
        elements.datePicker.showPicker();
      } else {
        elements.datePicker.click();
      }
    } catch (error) {
      elements.datePicker.click();
    }
  });

  elements.presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      elements.startDate.value = button.dataset.date;
      elements.datePicker.value = button.dataset.date;
      calculate();
    });
  });

  const initialDate = getInitialDate();
  elements.startDate.value = initialDate;
  elements.datePicker.value = initialDate;
  updatePresetSelection(initialDate);
  calculate({ silent: !initialDate });

  window.setInterval(() => {
    const previousMax = elements.startDate.max;
    const currentToday = toIsoDate(getTodayParts());
    if (previousMax !== currentToday) {
      calculate({ silent: !elements.startDate.value });
    }
  }, 60 * 1000);
})();
