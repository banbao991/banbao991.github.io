'use strict';
// Rebuild only when events change; preserve the visible entry while reading older news.
let journalSignature = '';
let journalRenderedEvents = [];
let journalRenderedDay = 0;
let journalCopyPending = false;
let journalCopyRequest = 0;

function dailyJournalText() {
  // Entries are stored newest first. Reverse occurrence order, including after
  // midnight and events sharing a minute; sorting HH:MM would break a farm day.
  const events = farm.events.filter(event => event.day === farm.day).reverse();
  return `农场日记 · 第 ${farm.day} 天\n\n` + events
    .map(event => `${event.time} ${playerJournalText(event.text)}`).join('\n');
}
function copyJournalFallback(text) {
  const input = document.createElement('textarea'), focused = document.activeElement;
  input.value = text; input.readOnly = true;
  input.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none';
  input.setAttribute('aria-hidden', 'true');
  document.body.append(input);
  try {
    input.focus({ preventScroll: true });
    input.select();
    if (!document.execCommand?.('copy')) throw new Error('Clipboard unavailable');
  } finally {
    input.remove(); focused?.focus?.({ preventScroll: true });
  }
}
async function copyDailyJournal() {
  if (journalCopyPending || !farm.events.some(event => event.day === farm.day)) return false;
  const button = $('copy-journal'), text = dailyJournalText(), request = ++journalCopyRequest;
  journalCopyPending = true; button.disabled = true; button.textContent = '正在复制…';
  let copied = false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); }
      catch { copyJournalFallback(text); }
    } else copyJournalFallback(text);
    copied = true; button.textContent = '已复制';
  } catch {
    button.textContent = '复制失败，请重试';
  } finally {
    journalCopyPending = false;
    button.disabled = !farm.events.some(event => event.day === farm.day);
    setTimeout(() => { if (journalCopyRequest === request) button.textContent = '复制当天'; }, 2200);
  }
  return copied;
}
$('copy-journal').addEventListener('click', copyDailyJournal);
function sizeJournalWindow() {
  const list = $('event-list'), entries = Array.from(list.children || []);
  if (entries.length < 4) { list.style.maxHeight = ''; return; }
  const first = entries[0].getBoundingClientRect(), fourth = entries[3].getBoundingClientRect();
  const height = fourth.bottom - first.top;
  if (Number.isFinite(height) && height > 0) list.style.maxHeight = `${Math.ceil(height) + 8}px`;
}
function updateJournalUI() {
  const events = farm.events.filter(event => event.day === farm.day), signature = JSON.stringify([farm.day, events]);
  $('copy-journal').disabled = journalCopyPending || events.length === 0;
  if (signature === journalSignature) return;
  const list = $('event-list'), scrollTop = list.scrollTop || 0;
  const oldEntries = Array.from(list.children || []);
  const anchor = journalRenderedDay === farm.day && scrollTop > 0
    ? oldEntries.find(entry => entry.offsetTop + entry.offsetHeight > scrollTop) : null;
  const offset = anchor ? anchor.offsetTop - scrollTop : 0;
  const anchorEvent = anchor ? journalRenderedEvents[oldEntries.indexOf(anchor)] : null;
  const entries = events.map(event => {
    const li = document.createElement('li'), span = document.createElement('span'), time = document.createElement('time');
    time.textContent = `第 ${event.day} 天 ${event.time}`;
    span.append(time, document.createTextNode(playerJournalText(event.text))); li.append(span);
    return li;
  });
  list.replaceChildren(...entries);
  journalSignature = signature;
  journalRenderedEvents = events;
  journalRenderedDay = farm.day;
  sizeJournalWindow();
  const anchorIndex = anchorEvent ? events.indexOf(anchorEvent) : -1;
  const matching = anchorIndex >= 0 ? entries[anchorIndex] : null;
  list.scrollTop = matching ? matching.offsetTop - offset : 0;
}
if (typeof ResizeObserver !== 'undefined') {
  let journalWidth = 0;
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (width !== journalWidth) { journalWidth = width; sizeJournalWindow(); }
  }).observe($('event-list'));
}
