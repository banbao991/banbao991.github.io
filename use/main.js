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

function createCard(item, index, keys) {
  const title = String(item[keys.info] || '').trim();
  const titleParts = splitTitle(title);
  const url = String(item[keys.link] || '').trim();
  const date = String(item.date || '').trim();
  const parsedDate = parseDate(date);
  const isNew = parsedDate && Date.now() - parsedDate.getTime() < MONTH;

  const article = document.createElement('article');
  article.className = 'item';
  article.style.animationDelay = `${Math.min(index * 35, 420)}ms`;
  article.dataset.search = `${title} ${date}`.toLowerCase();

  const link = document.createElement('a');
  link.className = 'item-link';
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
  heading.className = 'item-title';
  heading.textContent = titleParts.title;
  headingGroup.append(heading);

  if (titleParts.detail) {
    const subtitle = document.createElement('p');
    subtitle.className = 'item-subtitle';
    subtitle.textContent = `--- ${titleParts.detail}`;
    headingGroup.append(subtitle);
  }

  const bottom = document.createElement('div');
  bottom.className = 'item-bottom';

  const detail = document.createElement('span');
  detail.className = 'item-date';
  detail.textContent = date ? formatDate(date) : '—';

  const arrow = document.createElement('span');
  arrow.className = 'item-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';

  bottom.append(detail, arrow);
  link.append(meta, headingGroup, bottom);
  article.append(link);
  return article;
}

async function init() {
  const grid = document.querySelector('#grid');
  const input = document.querySelector('#search-input');
  const count = document.querySelector('#visible-count');
  const empty = document.querySelector('#empty-state');
  const clearButton = document.querySelector('#clear-search');

  try {
    const data = await d3.csv('data/infos.csv');
    const keys = {
      link: data.columns[0].trim(),
      info: data.columns[1].trim(),
    };
    const fragment = document.createDocumentFragment();
    const cards = data.map((item, index) => createCard(item, index, keys));
    cards.forEach((card) => fragment.append(card));
    grid.append(fragment);
    grid.setAttribute('aria-busy', 'false');
    count.textContent = cards.length;

    const filterCards = () => {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matched = !keyword || card.dataset.search.includes(keyword);
        card.hidden = !matched;
        if (matched) visible += 1;
      });
      count.textContent = visible;
      empty.hidden = visible !== 0;
      grid.hidden = visible === 0;
    };

    input.addEventListener('input', filterCards);
    clearButton.addEventListener('click', () => {
      input.value = '';
      filterCards();
      input.focus();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === 'Escape' && document.activeElement === input) {
        input.value = '';
        filterCards();
        input.blur();
      }
    });
  } catch (error) {
    grid.setAttribute('aria-busy', 'false');
    empty.hidden = false;
    empty.querySelector('p').textContent = '项目暂时加载失败，请稍后再试';
    clearButton.hidden = true;
    console.error('Failed to load project data:', error);
  }

  document.querySelector('#back-to-top').addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

init();
