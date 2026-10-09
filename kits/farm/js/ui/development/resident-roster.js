'use strict';
// Keep portrait buttons stable while names, activities, or a loaded world change.
const villageResidentRows = new Map();
let villageResidentListKey = '';
let villageResidentHover = null;
let villagePortraitClock = -1;

function hideVillageResidentTooltip() {
  if (villageResidentHover) villageResidentRows.get(villageResidentHover)?.button.setAttribute('aria-describedby', '');
  villageResidentHover = null;
  $('resident-tooltip').hidden = true;
}
function refreshVillageResidentTooltip() {
  if (!villageResidentHover) return;
  const row = villageResidentRows.get(villageResidentHover);
  const tooltip = $('resident-tooltip');
  tooltip.textContent = `${villageResidentHover} · ${villageResidentDescription(villageResidentHover)}\n点击查看地图详情`;
  tooltip.hidden = false;
  const bounds = row.button.getBoundingClientRect();
  const rosterBounds = $('resident-list').getBoundingClientRect();
  const size = tooltip.getBoundingClientRect();
  const width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;
  const beside = rosterBounds.left >= size.width + 16;
  const left = beside ? rosterBounds.left - size.width - 10 : bounds.left;
  tooltip.style.left = `${clamp(left, 8, Math.max(8, width - size.width - 8))}px`;
  tooltip.style.top = `${clamp(beside ? bounds.top : bounds.bottom + 8, 8, Math.max(8, height - size.height - 8))}px`;
}
function updateVillageResidentRoster(names) {
  const rows = names.map(name => {
    if (!villageResidentRows.has(name)) {
      const button = document.createElement('button'), label = document.createElement('span');
      const portrait = document.createElement('canvas');
      button.type = 'button'; button.className = 'resident-locate';
      button.setAttribute('aria-label', `${name}，点击查看地图详情`);
      label.className = 'resident-name'; label.textContent = name;
      portrait.className = 'resident-portrait'; portrait.width = 88; portrait.height = 120;
      portrait.setAttribute('aria-hidden', 'true');
      const reveal = () => { villageResidentHover = name; button.setAttribute('aria-describedby', 'resident-tooltip'); refreshVillageResidentTooltip(); };
      button.addEventListener('pointerenter', reveal); button.addEventListener('focus', reveal);
      button.addEventListener('pointerleave', hideVillageResidentTooltip); button.addEventListener('blur', hideVillageResidentTooltip);
      button.addEventListener('click', () => {
        hideVillageResidentTooltip();
        const actor = villageResidentActor(name); if (actor) centerCamera(actor.x, actor.y);
      });
      button.append(label, portrait);
      villageResidentRows.set(name, { button, portrait });
    }
    return villageResidentRows.get(name).button;
  });
  const key = names.join(',');
  if (key !== villageResidentListKey) {
    hideVillageResidentTooltip(); $('resident-list').replaceChildren(...rows); villageResidentListKey = key;
  }
  updateVillageResidentPortraits(true);
  refreshVillageResidentTooltip();
}
function updateVillageResidentPortraits(force = false) {
  if (!force && now >= villagePortraitClock && now - villagePortraitClock < 1 / 12) return;
  const list = $('resident-list');
  if (!force && list.closest?.('details')?.open === false) return;
  villagePortraitClock = now;
  for (const name of villageResidentListKey.split(',')) {
    const row = villageResidentRows.get(name);
    if (row) drawVillageResidentPortrait(row.portrait, name);
  }
}
document.addEventListener('scroll', hideVillageResidentTooltip, true);
document.addEventListener('keydown', event => { if (event.key === 'Escape' || event.key?.toLowerCase() === 'p') hideVillageResidentTooltip(); });
