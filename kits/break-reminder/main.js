(function () {
  'use strict';

  const STORAGE_KEY = 'break-reminder-state-v1';
  const CLAIM_KEY = 'break-reminder-claim-v1';
  const MIN_INTERVAL = 1;
  const MAX_INTERVAL = 240;
  const DEFAULT_INTERVAL = 45;
  const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const ORIGINAL_TITLE = document.title;

  const reminderCopies = [
    {
      title: '起来走一走吧',
      message: '喝口水，看看远处，让眼睛和身体都松一松。',
    },
    {
      title: '该舒展一下啦',
      message: '离开座位活动几分钟，也别忘了补充水分。',
    },
    {
      title: '给自己一个小暂停',
      message: '站起来走几步，转转肩颈，呼吸一点新鲜空气。',
    },
  ];

  const elements = {
    countdown: document.getElementById('countdown'),
    minuteText: document.getElementById('minuteText'),
    secondText: document.getElementById('secondText'),
    nextTime: document.getElementById('nextTime'),
    startButton: document.getElementById('startButton'),
    resetButton: document.getElementById('resetButton'),
    intervalInput: document.getElementById('intervalInput'),
    quickButtons: Array.from(document.querySelectorAll('[data-minutes]')),
    soundToggle: document.getElementById('soundToggle'),
    notificationStatus: document.getElementById('notificationStatus'),
    testButton: document.getElementById('testButton'),
    runningStatus: document.getElementById('runningStatus'),
    runningStatusText: document.getElementById('runningStatusText'),
    todayCount: document.getElementById('todayCount'),
    dialog: document.getElementById('reminderDialog'),
    dialogTitle: document.getElementById('dialogTitle'),
    dialogMessage: document.getElementById('dialogMessage'),
    doneButton: document.getElementById('doneButton'),
    snoozeButton: document.getElementById('snoozeButton'),
  };

  let state = loadState();
  let audioContext = null;
  let activeChimeSource = null;
  let titleFlashTimer = null;
  let lastRenderedSecond = -1;
  let reminderVisible = false;

  function todayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function defaultState() {
    return {
      intervalMinutes: DEFAULT_INTERVAL,
      soundEnabled: true,
      running: false,
      nextAt: null,
      countDate: todayKey(),
      todayCount: 0,
      copyIndex: 0,
      awaitingAcknowledgement: false,
    };
  }

  function normalizeState(candidate) {
    const fallback = defaultState();
    const interval = Number(candidate && candidate.intervalMinutes);
    const nextAt = Number(candidate && candidate.nextAt);
    const count = Number(candidate && candidate.todayCount);
    const copyIndex = Number(candidate && candidate.copyIndex);

    return {
      intervalMinutes: Number.isFinite(interval)
        ? Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(interval)))
        : fallback.intervalMinutes,
      soundEnabled: candidate && typeof candidate.soundEnabled === 'boolean'
        ? candidate.soundEnabled
        : fallback.soundEnabled,
      running: Boolean(candidate && candidate.running),
      nextAt: Number.isFinite(nextAt) && nextAt > 0 ? nextAt : null,
      countDate: candidate && typeof candidate.countDate === 'string'
        ? candidate.countDate
        : fallback.countDate,
      todayCount: Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0,
      copyIndex: Number.isFinite(copyIndex) && copyIndex >= 0 ? Math.floor(copyIndex) : 0,
      awaitingAcknowledgement: Boolean(candidate && candidate.awaitingAcknowledgement),
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const normalized = normalizeState(saved);
      if (normalized.countDate !== todayKey()) {
        normalized.countDate = todayKey();
        normalized.todayCount = 0;
      }
      if (normalized.running && !normalized.nextAt && !normalized.awaitingAcknowledgement) {
        normalized.nextAt = Date.now() + normalized.intervalMinutes * 60 * 1000;
      }
      if (normalized.awaitingAcknowledgement) {
        normalized.nextAt = null;
      }
      return normalized;
    } catch (error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // 页面仍可工作，只是不再跨刷新保存状态。
    }
  }

  function syncToday() {
    const currentDate = todayKey();
    if (state.countDate !== currentDate) {
      state.countDate = currentDate;
      state.todayCount = 0;
      saveState();
    }
  }

  function clampInterval(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return state.intervalMinutes;
    }
    return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(number)));
  }

  function scheduleFromNow(minutes) {
    state.nextAt = Date.now() + minutes * 60 * 1000;
  }

  function updateInterval(minutes) {
    const nextInterval = clampInterval(minutes);
    state.intervalMinutes = nextInterval;
    elements.intervalInput.value = String(nextInterval);
    elements.quickButtons.forEach((button) => {
      button.classList.toggle('is-active', Number(button.dataset.minutes) === nextInterval);
    });
    if (state.running) {
      scheduleFromNow(nextInterval);
    }
    saveState();
    render(true);
  }

  function updateNotificationStatus() {
    if (!('Notification' in window)) {
      elements.notificationStatus.textContent = '当前浏览器不支持桌面通知';
      return;
    }

    const labels = {
      granted: '已允许，将在到点时发送',
      denied: '通知已被关闭，可在浏览器设置中开启',
      default: '点击开始后申请通知权限',
    };
    elements.notificationStatus.textContent = labels[Notification.permission] || labels.default;
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window) || Notification.permission !== 'default') {
      updateNotificationStatus();
      return;
    }

    try {
      await Notification.requestPermission();
    } catch (error) {
      // 某些浏览器不允许在当前上下文请求权限，页面提醒仍然可用。
    }
    updateNotificationStatus();
  }

  function prepareAudio() {
    if (!state.soundEnabled) {
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  }

  function playChime() {
    if (!state.soundEnabled || activeChimeSource) {
      return;
    }

    prepareAudio();
    if (!audioContext || audioContext.state !== 'running') {
      return;
    }

    const sampleRate = audioContext.sampleRate;
    const loopSeconds = 4;
    const buffer = audioContext.createBuffer(1, sampleRate * loopSeconds, sampleRate);
    const channel = buffer.getChannelData(0);
    const notes = [523.25, 659.25, 783.99];
    const noteSeconds = 0.5;

    notes.forEach((frequency, noteIndex) => {
      const noteStart = Math.floor(noteIndex * 0.18 * sampleRate);
      const noteLength = Math.floor(noteSeconds * sampleRate);
      for (let index = 0; index < noteLength; index += 1) {
        const progress = index / noteLength;
        const envelope = Math.sin(Math.PI * progress) ** 2;
        channel[noteStart + index] += Math.sin(
          2 * Math.PI * frequency * index / sampleRate,
        ) * envelope * 0.09;
      }
    });

    activeChimeSource = audioContext.createBufferSource();
    activeChimeSource.buffer = buffer;
    activeChimeSource.loop = true;
    activeChimeSource.connect(audioContext.destination);
    activeChimeSource.start();
  }

  function stopChime() {
    if (!activeChimeSource) {
      return;
    }
    try {
      activeChimeSource.stop();
      activeChimeSource.disconnect();
    } catch (error) {
      // 音源可能已被浏览器停止。
    }
    activeChimeSource = null;
  }

  function showSystemNotification(copy) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification('休息一下', {
        body: `${copy.title}。${copy.message}`,
        icon: '/images/favicon-32x32-next.jpg',
        tag: 'break-reminder',
        renotify: true,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      window.setTimeout(() => notification.close(), 20 * 1000);
    } catch (error) {
      // 页面弹窗和提示音仍会继续执行。
    }
  }

  function flashTitle() {
    window.clearInterval(titleFlashTimer);
    let visible = false;
    titleFlashTimer = window.setInterval(() => {
      document.title = visible ? ORIGINAL_TITLE : '休息时间到 · 起来走走';
      visible = !visible;
    }, 900);
  }

  function stopTitleFlash() {
    window.clearInterval(titleFlashTimer);
    titleFlashTimer = null;
    document.title = ORIGINAL_TITLE;
  }

  function showDialog(copy) {
    elements.dialogTitle.textContent = copy.title;
    elements.dialogMessage.textContent = copy.message;
    if (!elements.dialog.open) {
      if (typeof elements.dialog.showModal === 'function') {
        elements.dialog.showModal();
      } else {
        elements.dialog.setAttribute('open', '');
      }
    }
  }

  function closeDialog() {
    if (!elements.dialog.open) {
      return;
    }
    if (typeof elements.dialog.close === 'function') {
      elements.dialog.close();
    } else {
      elements.dialog.removeAttribute('open');
    }
    reminderVisible = false;
    stopChime();
    stopTitleFlash();
  }

  function claimReminder(dueAt) {
    try {
      const previous = JSON.parse(localStorage.getItem(CLAIM_KEY));
      if (previous && previous.dueAt === dueAt) {
        return false;
      }
      const claim = { dueAt, tabId: TAB_ID, claimedAt: Date.now() };
      localStorage.setItem(CLAIM_KEY, JSON.stringify(claim));
      const confirmed = JSON.parse(localStorage.getItem(CLAIM_KEY));
      return Boolean(confirmed && confirmed.dueAt === dueAt && confirmed.tabId === TAB_ID);
    } catch (error) {
      return true;
    }
  }

  function performReminder(copy, options) {
    const settings = options || {};
    reminderVisible = true;
    playChime();
    showSystemNotification(copy);
    showDialog(copy);
    flashTitle();

    if (settings.count) {
      syncToday();
      state.todayCount += 1;
      state.copyIndex = (state.copyIndex + 1) % reminderCopies.length;
      state.awaitingAcknowledgement = true;
      state.nextAt = null;
      saveState();
      render(true);
    }
  }

  function handleDue() {
    if (
      reminderVisible
      || state.awaitingAcknowledgement
      || !state.running
      || !state.nextAt
      || Date.now() < state.nextAt
    ) {
      return;
    }

    const dueAt = state.nextAt;
    if (!claimReminder(dueAt)) {
      state = loadState();
      return;
    }

    const copy = reminderCopies[state.copyIndex % reminderCopies.length];
    performReminder(copy, { count: true });
  }

  function formatCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      totalSeconds,
    };
  }

  function formatNextTime(timestamp) {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(timestamp));
  }

  function render(force) {
    syncToday();
    const remaining = state.running && state.nextAt
      ? state.nextAt - Date.now()
      : state.intervalMinutes * 60 * 1000;
    const formatted = formatCountdown(remaining);

    if (!force && formatted.totalSeconds === lastRenderedSecond) {
      return;
    }
    lastRenderedSecond = formatted.totalSeconds;

    elements.minuteText.textContent = formatted.minutes;
    elements.secondText.textContent = formatted.seconds;
    elements.intervalInput.value = String(state.intervalMinutes);
    elements.soundToggle.checked = state.soundEnabled;
    elements.todayCount.textContent = String(state.todayCount);
    elements.startButton.textContent = state.running ? '暂停提醒' : '开始提醒';
    elements.resetButton.disabled = !state.running;
    elements.runningStatus.dataset.state = state.running ? 'running' : 'stopped';
    elements.runningStatusText.textContent = state.running ? '提醒运行中' : '尚未开始';
    elements.nextTime.textContent = state.running && state.nextAt
      ? `预计 ${formatNextTime(state.nextAt)} 提醒`
      : '设置好间隔后开始吧';
    elements.quickButtons.forEach((button) => {
      button.classList.toggle(
        'is-active',
        Number(button.dataset.minutes) === state.intervalMinutes,
      );
    });
  }

  function tick() {
    handleDue();
    render(false);
  }

  elements.startButton.addEventListener('click', async () => {
    prepareAudio();
    await requestNotificationPermission();
    state.running = !state.running;
    if (state.running) {
      scheduleFromNow(state.intervalMinutes);
    } else {
      state.nextAt = null;
    }
    saveState();
    render(true);
  });

  elements.resetButton.addEventListener('click', () => {
    if (!state.running) {
      return;
    }
    scheduleFromNow(state.intervalMinutes);
    saveState();
    render(true);
  });

  elements.intervalInput.addEventListener('change', (event) => {
    updateInterval(event.target.value);
  });

  elements.intervalInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  });

  elements.quickButtons.forEach((button) => {
    button.addEventListener('click', () => updateInterval(button.dataset.minutes));
  });

  elements.soundToggle.addEventListener('change', () => {
    state.soundEnabled = elements.soundToggle.checked;
    if (state.soundEnabled) {
      prepareAudio();
    } else {
      stopChime();
    }
    saveState();
  });

  elements.testButton.addEventListener('click', async () => {
    prepareAudio();
    await requestNotificationPermission();
    performReminder({
      title: '测试成功',
      message: '之后的休息提醒会像这样出现。',
    }, { count: false });
  });

  elements.doneButton.addEventListener('click', () => {
    if (state.awaitingAcknowledgement) {
      state.awaitingAcknowledgement = false;
      if (state.running) {
        scheduleFromNow(state.intervalMinutes);
      }
      saveState();
    }
    closeDialog();
    render(true);
  });

  elements.snoozeButton.addEventListener('click', () => {
    state.running = true;
    state.awaitingAcknowledgement = false;
    scheduleFromNow(5);
    saveState();
    closeDialog();
    render(true);
  });

  elements.dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      state = loadState();
      render(true);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      state = loadState();
      tick();
    }
  });

  window.addEventListener('focus', tick);

  updateNotificationStatus();
  render(true);
  if (state.awaitingAcknowledgement) {
    const previousCopyIndex = (
      state.copyIndex + reminderCopies.length - 1
    ) % reminderCopies.length;
    performReminder(reminderCopies[previousCopyIndex], { count: false });
  }
  window.setInterval(tick, 1000);
})();
