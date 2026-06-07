(() => {
  'use strict';

  const MAX_PREVIEW_CHARS = 3000;

  function escapeHtml(text) {
    return String(text ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
  }

  function escapeAttribute(text) {
    return escapeHtml(text).replaceAll('`', '&#96;');
  }

  function sanitizeHref(url) {
    const value = String(url || '').trim();
    if (/^(https?:|mailto:|#|\/|\.\.?\/)/i.test(value)) {
      return value;
    }
    return '#';
  }

  function renderInlineMarkdown(text) {
    const codeTokens = [];
    let html = escapeHtml(text);

    html = html.replace(/`([^`\n]+)`/g, (match, code) => {
      const token = `@@CODE_${codeTokens.length}@@`;
      codeTokens.push(`<code>${code}</code>`);
      return token;
    });

    html = html
        .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (match, label, href) => {
          const safeHref = escapeAttribute(sanitizeHref(href));
          return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        })
        .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
        .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
        .replace(/(^|[^\*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
        .replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');

    codeTokens.forEach((value, index) => {
      html = html.replaceAll(`@@CODE_${index}@@`, value);
    });
    return html;
  }

  function isTableDivider(line) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  }

  function isMarkdownBlockStart(line, nextLine) {
    return /^```/.test(line) ||
        /^#{1,6}\s+/.test(line) ||
        /^>\s?/.test(line) ||
        /^\s*[-*+]\s+/.test(line) ||
        /^\s*\d+\.\s+/.test(line) ||
        (line.includes('|') && nextLine && isTableDivider(nextLine));
  }

  function renderMarkdown(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      if (/^```/.test(trimmed)) {
        const lang = trimmed.replace(/^```/, '').trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i].trim())) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          i++;
        }
        const langClass = lang ? ` class="language-${escapeAttribute(lang)}"` : '';
        html.push(`<pre><code${langClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        continue;
      }

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quoteLines = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        html.push(`<blockquote>${quoteLines.map(renderInlineMarkdown).join('<br>')}</blockquote>`);
        continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
          i++;
        }
        html.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
          i++;
        }
        html.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ol>`);
        continue;
      }

      if (line.includes('|') && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
        const header = splitTableRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          rows.push(splitTableRow(lines[i]));
          i++;
        }
        html.push([
          '<table>',
          `<thead><tr>${header.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead>`,
          `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`,
          '</table>',
        ].join(''));
        continue;
      }

      const paragraph = [line];
      i++;
      while (i < lines.length && lines[i].trim() &&
          !isMarkdownBlockStart(lines[i], lines[i + 1])) {
        paragraph.push(lines[i]);
        i++;
      }
      html.push(`<p>${paragraph.map(renderInlineMarkdown).join('<br>')}</p>`);
    }

    return html.join('');
  }

  function formatJson(value) {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch (err) {
      return String(value);
    }
  }

  function textFromContent(content) {
    if (!Array.isArray(content)) {
      return formatJson(content);
    }
    return content.map((item) => {
      if (!item) {
        return '';
      }
      return item.text || item.output_text || item.input_text || formatJson(item);
    }).filter(Boolean).join('\n\n');
  }

  function parseTs(value) {
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : null;
  }

  function formatDate(ts) {
    if (!ts) {
      return '-';
    }
    return new Date(ts).toLocaleString('zh-CN', {hour12: false});
  }

  function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms < 0) {
      return '-';
    }
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  function shortFileName(path) {
    return String(path || '').split(/[\\/]/).pop() || path || 'session.jsonl';
  }

  function getCommandText(payload) {
    if (Array.isArray(payload.command)) {
      return payload.command.join(' ');
    }
    return payload.command || payload.cmd || '';
  }

  function normalizeResponseItem(record, lineNo, ts) {
    const payload = record.payload || {};
    const itemType = payload.type || 'response_item';

    if (itemType === 'message') {
      const text = textFromContent(payload.content);
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'message',
        role: payload.role || 'assistant',
        title: payload.role === 'user' ? 'User' : 'Assistant',
        badge: payload.phase || 'message',
        text,
        raw: record,
      };
    }

    if (itemType === 'function_call' || itemType === 'custom_tool_call') {
      const name = payload.name || payload.tool_name || itemType;
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'tool',
        role: 'tool',
        title: `调用 ${name}`,
        badge: itemType,
        text: formatJson(payload.arguments || payload.input || payload),
        callId: payload.call_id,
        raw: record,
      };
    }

    if (itemType === 'function_call_output' || itemType === 'custom_tool_call_output') {
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'tool',
        role: 'tool',
        title: '工具输出',
        badge: itemType,
        text: formatJson(payload.output || payload.result || payload),
        callId: payload.call_id,
        raw: record,
      };
    }

    if (itemType === 'web_search_call') {
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'tool',
        role: 'tool',
        title: 'Web search',
        badge: itemType,
        text: formatJson(payload),
        raw: record,
      };
    }

    if (itemType === 'reasoning') {
      const text = textFromContent(payload.summary || payload.content);
      if (!text) {
        return null;
      }
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'system',
        role: 'assistant',
        title: 'Reasoning',
        badge: itemType,
        text,
        raw: record,
      };
    }

    return null;
  }

  function normalizeEventMsg(record, lineNo, ts) {
    const payload = record.payload || {};
    const eventType = payload.type || 'event_msg';

    if (eventType === 'token_count' || eventType === 'user_message' || eventType === 'agent_message') {
      return null;
    }

    if (eventType === 'exec_command_end') {
      const command = getCommandText(payload);
      const output = payload.aggregated_output || payload.stdout || payload.stderr || '';
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'command',
        role: 'tool',
        title: command || '命令执行',
        badge: payload.status || `exit ${payload.exit_code}`,
        text: output,
        callId: payload.call_id,
        status: payload.status,
        raw: record,
      };
    }

    if (eventType === 'patch_apply_end') {
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'tool',
        role: 'tool',
        title: '应用补丁',
        badge: payload.status || eventType,
        text: formatJson(payload),
        raw: record,
      };
    }

    if (eventType === 'web_search_end') {
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'tool',
        role: 'tool',
        title: '搜索完成',
        badge: eventType,
        text: formatJson(payload),
        raw: record,
      };
    }

    if (eventType === 'task_started' || eventType === 'task_complete' ||
        eventType === 'context_compacted' || eventType === 'turn_aborted' ||
        eventType === 'thread_rolled_back') {
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'system',
        role: 'system',
        title: eventType.replaceAll('_', ' '),
        badge: eventType,
        text: formatJson(payload),
        raw: record,
      };
    }

    return null;
  }

  function normalizeRecord(record, lineNo) {
    const ts = parseTs(record.timestamp);
    if (record.type === 'session_meta') {
      const meta = record.payload || {};
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'system',
        role: 'system',
        title: 'Session meta',
        badge: 'meta',
        text: formatJson(meta),
        raw: record,
      };
    }
    if (record.type === 'response_item') {
      return normalizeResponseItem(record, lineNo, ts);
    }
    if (record.type === 'event_msg') {
      return normalizeEventMsg(record, lineNo, ts);
    }
    if (record.type === 'compacted') {
      return {
        id: `line-${lineNo}`,
        lineNo,
        ts,
        kind: 'system',
        role: 'system',
        title: 'Compacted',
        badge: 'compacted',
        text: formatJson(record.payload || record),
        raw: record,
      };
    }
    return null;
  }

  function parseSessionText(text, sourceName) {
    const lines = text.split(/\r?\n/);
    const events = [];
    const errors = [];
    const records = [];
    const tokenSamples = [];
    let meta = null;

    lines.forEach((line, index) => {
      const lineNo = index + 1;
      if (!line.trim()) {
        return;
      }
      try {
        const record = JSON.parse(line);
        records.push(record);
        if (record.type === 'session_meta') {
          meta = record.payload || {};
        }
        if (record.type === 'event_msg' && record.payload?.type === 'token_count') {
          const usage = record.payload.rate_limits || record.payload.info?.total_token_usage;
          tokenSamples.push(usage);
        }
        const event = normalizeRecord(record, lineNo);
        if (event) {
          events.push(event);
        }
      } catch (err) {
        errors.push({lineNo, message: err.message});
      }
    });

    const timestamps = events.map((event) => event.ts).filter(Boolean);
    const startTs = timestamps.length ? Math.min(...timestamps) : null;
    const endTs = timestamps.length ? Math.max(...timestamps) : null;

    return {
      sourceName,
      meta,
      events,
      errors,
      records,
      tokenSamples,
      stats: {
        lines: lines.filter((line) => line.trim()).length,
        messages: events.filter((event) => event.kind === 'message').length,
        tools: events.filter((event) => event.kind === 'tool').length,
        commands: events.filter((event) => event.kind === 'command').length,
        patches: events.filter((event) => event.title === '应用补丁').length,
        durationMs: startTs && endTs ? endTs - startTs : null,
      },
    };
  }

  async function fetchSession(path) {
    const response = await fetch(path, {cache: 'no-store'});
    if (!response.ok) {
      throw new Error(`${path} 返回 ${response.status}`);
    }
    return {
      sourceName: path,
      text: await response.text(),
    };
  }

  function makeMetaRow(name, value) {
    return `<dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value || '-')}</dd>`;
  }

  function shouldRenderMarkdown(event) {
    return event.kind === 'message' ||
        (event.kind === 'system' && event.role === 'assistant');
  }

  function createEventHtml(event, compactTools) {
    const text = event.text || '';
    const compact = compactTools && event.kind !== 'message' && text.length > MAX_PREVIEW_CHARS;
    const visibleText = compact ? `${text.slice(0, MAX_PREVIEW_CHARS)}\n...` : text;
    const detailClass = compactTools && event.kind !== 'message' ? ' event-body-compact' : '';
    const statusClass = event.status === 'failed' ? ' is-failed' : '';
    const bodyHtml = shouldRenderMarkdown(event)
        ? `<div class="event-body markdown-body${detailClass}">${renderMarkdown(visibleText)}</div>`
        : `<pre class="event-body plain-body${detailClass}">${escapeHtml(visibleText)}</pre>`;

    return `
      <article class="timeline-item ${event.kind} role-${event.role}${statusClass}">
        <div class="event-rail"></div>
        <div class="event-card">
          <header class="event-head">
            <div>
              <h3>${escapeHtml(event.title)}</h3>
              <p>${escapeHtml(formatDate(event.ts))} · line ${event.lineNo}</p>
            </div>
            <span class="badge">${escapeHtml(event.badge || event.kind)}</span>
          </header>
          ${visibleText ? bodyHtml : ''}
        </div>
      </article>
    `;
  }

  function start(options) {
    const sampleSelect = document.getElementById('sampleSelect');
    const reloadBtn = document.getElementById('reloadBtn');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const roleFilter = document.getElementById('roleFilter');
    const compactToggle = document.getElementById('compactToggle');
    const timelineEl = document.getElementById('timeline');
    const statusEl = document.getElementById('statusText');
    const metaEl = document.getElementById('sessionMeta');
    const visibleCountEl = document.getElementById('visibleCount');
    const messageCountEl = document.getElementById('messageCount');
    const toolCountEl = document.getElementById('toolCount');
    const commandCountEl = document.getElementById('commandCount');
    const durationTextEl = document.getElementById('durationText');

    const state = {
      session: null,
      query: '',
      type: 'all',
      role: 'all',
      compactTools: true,
    };

    function fillSamples() {
      sampleSelect.innerHTML = options.sampleFiles.map((path) => {
        const selected = path === options.defaultFile ? ' selected' : '';
        return `<option value="${escapeHtml(path)}"${selected}>${escapeHtml(shortFileName(path))}</option>`;
      }).join('');
    }

    function renderSummary() {
      const session = state.session;
      if (!session) {
        return;
      }
      messageCountEl.textContent = session.stats.messages;
      toolCountEl.textContent = session.stats.tools;
      commandCountEl.textContent = session.stats.commands;
      durationTextEl.textContent = formatDuration(session.stats.durationMs);

      const meta = session.meta || {};
      metaEl.innerHTML = [
        makeMetaRow('文件', shortFileName(session.sourceName)),
        makeMetaRow('cwd', meta.cwd),
        makeMetaRow('model', meta.model || meta.model_provider),
        makeMetaRow('cli', meta.cli_version),
        makeMetaRow('开始', formatDate(parseTs(meta.timestamp))),
        makeMetaRow('id', meta.id),
      ].join('');

      const errText = session.errors.length ? `，${session.errors.length} 行解析失败` : '';
      statusEl.textContent = `已加载 ${session.stats.lines} 行${errText}`;
    }

    function filterEvents() {
      if (!state.session) {
        return [];
      }
      const query = state.query.trim().toLowerCase();
      return state.session.events.filter((event) => {
        const kindMatch = state.type === 'all' || event.kind === state.type ||
            (state.type === 'system' && event.kind === 'system');
        const roleMatch = state.role === 'all' || event.role === state.role;
        const textMatch = !query || [
          event.title,
          event.badge,
          event.text,
          event.raw?.payload?.cwd,
        ].join('\n').toLowerCase().includes(query);
        return kindMatch && roleMatch && textMatch;
      });
    }

    function renderTimeline() {
      const events = filterEvents();
      visibleCountEl.textContent = `${events.length} / ${state.session ? state.session.events.length : 0}`;
      if (!events.length) {
        timelineEl.innerHTML = '<article class="empty-state">没有匹配的事件。</article>';
        return;
      }
      timelineEl.innerHTML = events.map((event) => createEventHtml(event, state.compactTools)).join('');
    }

    function render() {
      renderSummary();
      renderTimeline();
    }

    function loadText(text, sourceName) {
      state.session = parseSessionText(text, sourceName);
      render();
    }

    function loadSample(path) {
      statusEl.textContent = `正在读取 ${shortFileName(path)}...`;
      fetchSession(path)
          .then(({text, sourceName}) => loadText(text, sourceName))
          .catch((err) => {
            statusEl.textContent = `读取失败: ${err.message}`;
            timelineEl.innerHTML = '<article class="empty-state">无法读取默认文件。请在本地服务环境打开，或上传 JSONL 文件。</article>';
          });
    }

    sampleSelect.addEventListener('change', () => loadSample(sampleSelect.value));
    reloadBtn.addEventListener('click', () => loadSample(sampleSelect.value));
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value;
      renderTimeline();
    });
    typeFilter.addEventListener('change', () => {
      state.type = typeFilter.value;
      renderTimeline();
    });
    roleFilter.addEventListener('change', () => {
      state.role = roleFilter.value;
      renderTimeline();
    });
    compactToggle.addEventListener('change', () => {
      state.compactTools = compactToggle.checked;
      renderTimeline();
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => loadText(String(reader.result || ''), file.name);
      reader.onerror = () => {
        statusEl.textContent = `读取上传文件失败: ${reader.error?.message || 'unknown error'}`;
      };
      reader.readAsText(file);
    });

    fillSamples();
    loadSample(options.defaultFile);
  }

  window.CodexSessionApp = {
    start,
    parseSessionText,
    renderMarkdown,
  };
})();
