const CATEGORY_NAMES = {
  '学习网站': '学习网站',
  '友链': '友链',
};

function parseLinks(source) {
  const lines = source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

  const groups = [];
  let currentGroup = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.startsWith('#')) {
      const rawName = line.replace(/^#+\s*/, '').trim();
      const name = CATEGORY_NAMES[rawName] || rawName;
      currentGroup = { name, links: [] };
      groups.push(currentGroup);
      continue;
    }

    const url = lines[index + 1];
    if (!currentGroup || !url || url.startsWith('#')) continue;

    try {
      const parsedUrl = new URL(url, window.location.href);
      currentGroup.links.push({
        description: line,
        url: parsedUrl.href,
        host: parsedUrl.host || parsedUrl.pathname,
      });
      index += 1;
    } catch (error) {
      console.warn(`忽略无效链接：${url}`, error);
    }
  }

  return groups.filter((group) => group.links.length > 0);
}

function createCard(item, index) {
  const article = document.createElement('article');
  article.className = 'link-card directory-card';
  article.dataset.search = `${item.description} ${item.host}`.toLowerCase();
  article.style.animationDelay = `${Math.min(index * 55, 440)}ms`;

  const link = document.createElement('a');
  link.className = 'directory-card-link';
  link.href = item.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${item.description}，在新窗口打开`);

  const title = document.createElement('h3');
  title.className = 'link-title directory-card-title';
  title.textContent = item.description;

  link.append(title);
  article.append(link);
  return article;
}

function createSection(group, cardOffset) {
  const section = document.createElement('section');
  section.className = 'link-section';
  section.dataset.category = group.name;

  const heading = document.createElement('div');
  heading.className = 'section-heading';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = group.name;

  const grid = document.createElement('div');
  grid.className = 'link-grid';
  group.links.forEach((item, itemIndex) => {
    grid.append(createCard(item, cardOffset + itemIndex));
  });

  heading.append(title);
  section.append(heading, grid);
  return section;
}

async function init() {
  const directory = document.querySelector('#directory');
  const empty = document.querySelector('#empty-state');
  const clearButton = document.querySelector('#clear-search');

  try {
    const response = await fetch('data.txt');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const groups = parseLinks(await response.text());
    let cardOffset = 0;
    groups.forEach((group) => {
      directory.append(createSection(group, cardOffset));
      cardOffset += group.links.length;
    });

    const cards = [...document.querySelectorAll('.link-card')];
    const sections = [...document.querySelectorAll('.link-section')];

    BanbaoDirectory.setup({
      groups: sections.map((section) => ({
        element: section,
        items: [...section.querySelectorAll('.link-card')],
      })),
      content: directory,
      isMatch: (card, keyword) => !keyword || card.dataset.search.includes(keyword),
    });

    directory.setAttribute('aria-busy', 'false');
  } catch (error) {
    directory.setAttribute('aria-busy', 'false');
    BanbaoDirectory.showLoadError({
      content: directory,
      empty,
      clearButton,
      message: '链接暂时加载失败，请稍后再试',
    });
    console.error('Failed to load links:', error);
  }
}

init();
