(() => {
  'use strict';

  const REFRESH_MS = 1000;

  function getEventKey(event) {
    return `evt-${event.lineNo}-${event.dueTs}`;
  }

  function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
  }

  function formatSpan(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const rest = totalSeconds % 86400;
    const hours = Math.floor(rest / 3600);
    const minutes = Math.floor((rest % 3600) / 60);
    const seconds = rest % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    if (days > 0) {
      return `${days}天 ${hh}:${mm}:${ss}`;
    }
    return `${hh}:${mm}:${ss}`;
  }

  function formatRemain(ms) {
    if (ms >= 0) {
      return `剩余 ${formatSpan(ms)}`;
    }
    return `已过 ${formatSpan(-ms)}`;
  }

  function formatTag(ms) {
    const dayDiff = Math.floor(Math.abs(ms) / 86400000);
    if (ms >= 0) {
      return `D-${dayDiff}`;
    }
    return `+${dayDiff} 天`;
  }

  async function fetchFirstAvailable(paths) {
    let lastError = '读取失败';
    for (const path of paths) {
      try {
        const response = await fetch(path, {cache: 'no-store'});
        if (response.ok) {
          return {path, text: await response.text()};
        }
        lastError = `${path} 返回 ${response.status}`;
      } catch (err) {
        lastError = `${path} 读取异常`;
      }
    }
    throw new Error(lastError);
  }

  function createRowHtml(event, nowTs) {
    const remainMs = event.dueTs - nowTs;
    const expired = remainMs < 0;
    const key = getEventKey(event);

    return `
      <article class="event-row ${expired ? 'is-expired' : ''}" data-event-key="${key}">
        <div class="event-main">
          <h3>${escapeHtml(event.name)}</h3>
          <p class="meta">${escapeHtml(event.dateText)} · ${escapeHtml(event.timezone)}</p>
        </div>
        <div class="event-side">
          <span class="tag ${expired ? 'expired' : ''}">${formatTag(remainMs)}</span>
          <div class="remain">${formatRemain(remainMs)}</div>
        </div>
      </article>
    `;
  }

  function start(options) {
    const listEl = document.getElementById('eventList');
    const statusEl = document.getElementById('statusText');
    const nowEl = document.getElementById('nowText');
    const showExpiredEl = document.getElementById('showExpired');

    const state = {
      events: [],
      errors: [],
      sourcePath: '',
      showExpired: false,
      visibleEvents: [],
      lastExpiredMap: new Map(),
      needsFullRender: true,
    };

    function updateStatusText() {
      const errMsg = state.errors.length > 0
          ? `；忽略 ${state.errors.length} 行异常数据`
          : '';
      statusEl.textContent = state.sourcePath
          // ? `已加载 ${state.events.length} 个事件，来源: ${state.sourcePath}${errMsg}`
          ? `已加载 ${state.events.length} 个事件\n${errMsg}`
          : '正在读取事件数据...';
    }

    function getVisibleEvents(nowTs) {
      const sorted = state.events.slice().sort((a, b) => a.dueTs - b.dueTs);
      if (!state.showExpired) {
        return sorted.filter(item => item.dueTs >= nowTs);
      }

      const alive = [];
      const expired = [];
      for (const event of sorted) {
        if (event.dueTs >= nowTs) {
          alive.push(event);
        } else {
          expired.push(event);
        }
      }
      expired.sort((a, b) => b.dueTs - a.dueTs);
      return alive.concat(expired);
    }

    function updateNowText(nowTs) {
      nowEl.textContent = `当前时间: ${new Date(nowTs).toLocaleString('zh-CN')}`;
    }

    function hasExpiredFlagChanged(nowTs) {
      for (const event of state.events) {
        const key = getEventKey(event);
        const isExpired = event.dueTs < nowTs;
        const prev = state.lastExpiredMap.get(key);
        if (prev === undefined || prev !== isExpired) {
          return true;
        }
      }
      return false;
    }

    function updateExpiredFlagSnapshot(nowTs) {
      const nextMap = new Map();
      for (const event of state.events) {
        nextMap.set(getEventKey(event), event.dueTs < nowTs);
      }
      state.lastExpiredMap = nextMap;
    }

    function fullRender(nowTs) {
      const visible = getVisibleEvents(nowTs);
      state.visibleEvents = visible;

      listEl.classList.add('is-refreshing');
      listEl.innerHTML = visible.map(item => createRowHtml(item, nowTs)).join('');

      if (visible.length === 0) {
        listEl.innerHTML = '<article class="event-row"><div class="event-main"><h3>暂无事件</h3><p class="meta">当前筛选条件下没有可展示的倒计时。</p></div></article>';
      }

      requestAnimationFrame(() => {
        listEl.classList.remove('is-refreshing');
      });
    }

    function updateCountdownOnly(nowTs) {
      for (const event of state.visibleEvents) {
        const remainMs = event.dueTs - nowTs;
        const rowEl = listEl.querySelector(`[data-event-key="${getEventKey(event)}"]`);
        if (!rowEl) {
          continue;
        }
        const tagEl = rowEl.querySelector('.tag');
        const remainEl = rowEl.querySelector('.remain');
        if (tagEl) {
          tagEl.textContent = formatTag(remainMs);
        }
        if (remainEl) {
          remainEl.textContent = formatRemain(remainMs);
        }
      }
    }

    function refreshTick() {
      const nowTs = Date.now();
      updateNowText(nowTs);

      const shouldFullRender = state.needsFullRender || hasExpiredFlagChanged(nowTs);
      if (shouldFullRender) {
        fullRender(nowTs);
        state.needsFullRender = false;
      } else {
        updateCountdownOnly(nowTs);
      }

      updateExpiredFlagSnapshot(nowTs);
      updateStatusText();
    }

    showExpiredEl.addEventListener('change', () => {
      state.showExpired = showExpiredEl.checked;
      state.needsFullRender = true;
      refreshTick();
    });

    fetchFirstAvailable(options.sourceFiles)
        .then(({path, text}) => {
          const result = window.DateParser.parseEventText(text);
          state.events = result.events;
          state.errors = result.errors;
          state.sourcePath = path;
          state.needsFullRender = true;
          refreshTick();
        })
        .catch(err => {
          statusEl.textContent = `读取失败: ${err.message}`;
        });

    refreshTick();
    setInterval(refreshTick, REFRESH_MS);
  }

  window.CountdownApp = {
    start,
  };
})();
