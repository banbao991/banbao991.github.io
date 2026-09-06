const MONTH = 1000 * 60 * 60 * 24 * 30;

function parseDate(value) {
  const parts = String(value || '').split(/[.\-/]/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(value) {
  const parsed = parseDate(value);
  if (!parsed) return '';
  return [parsed.getFullYear(), String(parsed.getMonth() + 1).padStart(2, '0')]
      .join(' · ');
}

function setupYearFilter(years, onChange) {
  const container = document.querySelector('#year-filter');
  const minInput = document.querySelector('#year-min');
  const maxInput = document.querySelector('#year-max');
  const output = document.querySelector('#year-range-output');
  const validYears = years.filter(Number.isFinite);

  if (!validYears.length) {
    return {
      matches: () => true,
      reset: () => {},
    };
  }

  const lowerBound = Math.min(...validYears);
  const upperBound = Math.max(...validYears);
  const rangeSize = upperBound - lowerBound;
  const currentYear = new Date().getFullYear();
  const defaultMax = Math.max(lowerBound, Math.min(currentYear, upperBound));
  const defaultMin = Math.min(Math.max(2023, lowerBound), defaultMax);
  let selectedMin = defaultMin;
  let selectedMax = defaultMax;

  [minInput, maxInput].forEach((input) => {
    input.min = String(lowerBound);
    input.max = String(upperBound);
    input.step = '1';
  });
  minInput.value = String(defaultMin);
  maxInput.value = String(defaultMax);

  function sync(source, notify = true) {
    selectedMin = Number(minInput.value);
    selectedMax = Number(maxInput.value);

    if (selectedMin > selectedMax) {
      if (source === minInput) {
        selectedMax = selectedMin;
        maxInput.value = String(selectedMax);
      } else {
        selectedMin = selectedMax;
        minInput.value = String(selectedMin);
      }
    }

    const start = rangeSize ? ((selectedMin - lowerBound) / rangeSize) * 100 : 0;
    const end = rangeSize ? ((selectedMax - lowerBound) / rangeSize) * 100 : 100;
    container.style.setProperty('--range-start', `${start}%`);
    container.style.setProperty('--range-end', `${end}%`);
    output.textContent = selectedMin === selectedMax
      ? String(selectedMin)
      : `${selectedMin} — ${selectedMax}`;
    minInput.setAttribute('aria-valuetext', `${selectedMin} 年`);
    maxInput.setAttribute('aria-valuetext', `${selectedMax} 年`);
    const isCollapsed = selectedMin === selectedMax;
    minInput.style.zIndex = isCollapsed && source !== maxInput ? '3' : '2';
    maxInput.style.zIndex = isCollapsed && source === maxInput ? '3' : '2';

    if (notify) onChange();
  }

  minInput.addEventListener('input', () => sync(minInput));
  maxInput.addEventListener('input', () => sync(maxInput));
  container.hidden = false;
  sync(null, false);

  return {
    matches: (year) => Number.isFinite(year)
      && year >= selectedMin
      && year <= selectedMax,
    reset: () => {
      minInput.value = String(defaultMin);
      maxInput.value = String(defaultMax);
      sync(null);
    },
  };
}

function splitTitle(value) {
  const details = [];
  const title = value.replace(/\s*[（(]([^（）()]*)[）)]/g, (_, detail) => {
    const normalized = detail.trim();
    if (normalized) details.push(normalized);
    return '';
  }).trim();

  return {
    title: title || value,
    detail: details.join(' · '),
  };
}

function normalizeItem(item, keys) {
  const rawLink = String(item[keys.link] || '').trim();
  const isHidden = rawLink.startsWith('**');
  return {
    item,
    isHidden,
    link: isHidden ? rawLink.replace(/^\*+/, '').trim() : rawLink,
  };
}

function createCard(entry, index, keys) {
  const title = String(entry.item[keys.info] || '').trim();
  const titleParts = splitTitle(title);
  const url = entry.link;
  const date = String(entry.item.date || '').trim();
  const parsedDate = parseDate(date);
  const isNew = parsedDate && Date.now() - parsedDate.getTime() < MONTH;

  const article = document.createElement('article');
  article.className = 'item directory-card';
  article.dataset.hiddenItem = String(entry.isHidden);
  article.dataset.year = parsedDate ? String(parsedDate.getFullYear()) : '';
  article.style.animationDelay = `${Math.min(index * 35, 420)}ms`;
  article.dataset.search = `${title} ${date}`.toLowerCase();

  const link = document.createElement('a');
  link.className = 'item-link directory-card-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${title}，在新窗口打开`);

  const meta = document.createElement('div');
  meta.className = 'item-meta';

  if (isNew) {
    const badge = document.createElement('span');
    badge.className = 'new-badge';
    badge.textContent = 'NEW';
    meta.append(badge);
  }

  const headingGroup = document.createElement('div');
  headingGroup.className = 'item-heading';

  const heading = document.createElement('h2');
  heading.className = 'item-title directory-card-title';
  heading.textContent = titleParts.title;
  headingGroup.append(heading);

  if (titleParts.detail) {
    const subtitle = document.createElement('p');
    subtitle.className = 'item-subtitle';
    subtitle.textContent = `--- ${titleParts.detail}`;
    headingGroup.append(subtitle);
  }

  const bottom = document.createElement('div');
  bottom.className = 'item-bottom directory-card-bottom';

  const detail = document.createElement('span');
  detail.className = 'item-date directory-card-detail';
  detail.textContent = date ? formatDate(date) : '—';

  const arrow = document.createElement('span');
  arrow.className = 'item-arrow directory-card-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';

  bottom.append(detail, arrow);
  link.append(meta, headingGroup, bottom);
  article.append(link);
  return article;
}

async function init() {
  const grid = document.querySelector('#grid');
  const empty = document.querySelector('#empty-state');
  const clearButton = document.querySelector('#clear-search');
  const hiddenToggle = document.querySelector('#hidden-toggle');
  let showHiddenItems = false;

  try {
    const data = await d3.csv('data/infos.csv');
    const keys = {
      link: data.columns[0].trim(),
      info: data.columns[1].trim(),
    };
    const entries = data.map((item) => normalizeItem(item, keys));
    const hiddenCount = entries.filter((entry) => entry.isHidden).length;
    const fragment = document.createDocumentFragment();
    const cards = entries.map((entry, index) => createCard(entry, index, keys));
    cards.forEach((card) => fragment.append(card));
    grid.append(fragment);
    grid.setAttribute('aria-busy', 'false');

    const years = entries
        .map((entry) => parseDate(entry.item.date))
        .filter(Boolean)
        .map((date) => date.getFullYear());
    let filterCards = () => {};
    const yearFilter = setupYearFilter(years, () => filterCards());
    filterCards = BanbaoDirectory.setup({
      groups: [{ element: grid, items: cards }],
      content: grid,
      isMatch: (card, keyword) => {
        const isHiddenItem = card.dataset.hiddenItem === 'true';
        const year = card.dataset.year ? Number(card.dataset.year) : Number.NaN;
        return (!isHiddenItem || showHiddenItems)
            && yearFilter.matches(year)
            && (!keyword || card.dataset.search.includes(keyword));
      },
    });

    clearButton.addEventListener('click', () => yearFilter.reset());

    hiddenToggle.disabled = hiddenCount === 0;
    hiddenToggle.addEventListener('click', () => {
      showHiddenItems = !showHiddenItems;
      hiddenToggle.setAttribute('aria-expanded', String(showHiddenItems));
      filterCards();
    });
  } catch (error) {
    grid.setAttribute('aria-busy', 'false');
    BanbaoDirectory.showLoadError({
      content: grid,
      empty,
      clearButton,
      message: '项目暂时加载失败，请稍后再试',
    });
    console.error('Failed to load project data:', error);
  }
}

init();
