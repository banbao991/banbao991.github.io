(() => {
  'use strict';

  function normalizeTimezone(raw) {
    const text = String(raw || '').trim().toLowerCase();
    if (/aoe/.test(text)) {
      return {code: 'AOE', label: 'AOE (UTC-12)'};
    }
    if (/北京|beijing|utc\+?8|bjt|cst/.test(text)) {
      return {code: 'BJT', label: '北京时间 (UTC+8)'};
    }
    return null;
  }

  function parseDeadlineTimestamp(dateText, timezoneCode) {
    const match = String(dateText || '').trim().match(
        /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
    if (!match) {
      return NaN;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hasTime = match[4] !== undefined;
    const hour = hasTime ? Number(match[4]) : 23;
    const minute = hasTime ? Number(match[5] ?? 0) : 59;
    const second = hasTime ? Number(match[6] ?? 0) : 59;

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return NaN;
    }
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
      return NaN;
    }

    const offsetMinutes = timezoneCode === 'AOE' ? -12 * 60 : 8 * 60;
    const utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60 * 1000;

    // Validate local calendar fields to avoid invalid rollover dates.
    const checkDate = new Date(utcMs + offsetMinutes * 60 * 1000);
    if (checkDate.getUTCFullYear() !== year || checkDate.getUTCMonth() + 1 !== month ||
        checkDate.getUTCDate() !== day) {
      return NaN;
    }

    return utcMs;
  }

  function parseEventText(text) {
    const lines = String(text || '').split(/\r?\n/);
    const events = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line || line.startsWith('#')) {
        continue;
      }

      const parts = line.split(/[,，]/).map(s => s.trim()).filter(Boolean);
      if (parts.length < 3) {
        errors.push(`第 ${i + 1} 行格式错误，需为: 事件, 到期日期, AOE/北京时间`);
        continue;
      }

      const eventName = parts[0];
      const dateText = parts[1];
      const timezone = normalizeTimezone(parts.slice(2).join(' '));
      if (!timezone) {
        errors.push(`第 ${i + 1} 行时区无法识别: ${parts.slice(2).join(' ')}`);
        continue;
      }

      const dueTs = parseDeadlineTimestamp(dateText, timezone.code);
      if (Number.isNaN(dueTs)) {
        errors.push(`第 ${i + 1} 行日期无法识别: ${dateText}`);
        continue;
      }

      events.push({
        name: eventName,
        dateText,
        timezone: timezone.label,
        timezoneCode: timezone.code,
        dueTs,
        lineNo: i + 1,
      });
    }

    return {events, errors};
  }

  window.DateParser = {
    parseEventText,
  };
})();
