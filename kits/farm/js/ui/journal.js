'use strict';
// Rebuild only when events change; preserve the visible entry while reading older news.
let journalSignature = '';
let journalRenderedEvents = [];
function sizeJournalWindow() {
  const list = $('event-list'), entries = Array.from(list.children || []);
  if (entries.length < 4) { list.style.maxHeight = ''; return; }
  const first = entries[0].getBoundingClientRect(), fourth = entries[3].getBoundingClientRect();
  const height = fourth.bottom - first.top;
  if (Number.isFinite(height) && height > 0) list.style.maxHeight = `${Math.ceil(height) + 8}px`;
}
function updateJournalUI() {
  const events = farm.events.slice(0, 10), signature = JSON.stringify(events);
  if (signature === journalSignature) return;
  const list = $('event-list'), scrollTop = list.scrollTop || 0;
  const oldEntries = Array.from(list.children || []);
  const anchor = scrollTop > 0 ? oldEntries.find(entry => entry.offsetTop + entry.offsetHeight > scrollTop) : null;
  const offset = anchor ? anchor.offsetTop - scrollTop : 0;
  const anchorEvent = anchor ? journalRenderedEvents[oldEntries.indexOf(anchor)] : null;
  const entries = events.map(event => {
    const li = document.createElement('li'), span = document.createElement('span'), time = document.createElement('time');
    time.textContent = `第 ${event.day} 天 ${event.time}`;
    span.append(time, document.createTextNode(event.text)); li.append(span);
    return li;
  });
  list.replaceChildren(...entries);
  journalSignature = signature;
  journalRenderedEvents = events;
  sizeJournalWindow();
  const anchorIndex = anchorEvent ? events.indexOf(anchorEvent) : -1;
  const matching = anchorIndex >= 0 ? entries[anchorIndex] : null;
  list.scrollTop = scrollTop > 0 ? matching ? matching.offsetTop - offset : scrollTop : 0;
}
if (typeof ResizeObserver !== 'undefined') {
  let journalWidth = 0;
  new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (width !== journalWidth) { journalWidth = width; sizeJournalWindow(); }
  }).observe($('event-list'));
}
