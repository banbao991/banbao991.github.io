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

    let filterCards;
    filterCards = BanbaoDirectory.setup({
      groups: [{ element: grid, items: cards }],
      content: grid,
      isMatch: (card, keyword) => {
        const isHiddenItem = card.dataset.hiddenItem === 'true';
        return (!isHiddenItem || showHiddenItems)
            && (!keyword || card.dataset.search.includes(keyword));
      },
    });

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
