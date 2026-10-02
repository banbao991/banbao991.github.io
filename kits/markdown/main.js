'use strict';

const DEFAULT_FILE = 'kits/farm/doc/世界与玩法.md';
const $ = id => document.getElementById(id);
const input = $('file-input');
const content = $('content');
const toc = $('toc');
const message = $('message');
let activeController = null;
let requestNumber = 0;
let headings = [];
let toastTimer = null;
let currentDocumentPath = null;

function showToast(text) {
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function showMessage(text) {
  message.textContent = text;
  message.classList.add('show');
}

function hideMessage() {
  message.textContent = '';
  message.classList.remove('show');
}

function resolveDocumentPath(value) {
  const path = String(value || '').trim().replace(/^\/+/, '');
  if (!path || path.includes('\\') || path.includes('?') || path.includes('#')) {
    throw new Error('请输入站点根目录下的 Markdown 文件路径。');
  }
  if (path.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('路径不能包含空目录、. 或 ..。');
  }
  const url = new URL('/' + path, location.origin);
  if (url.origin !== location.origin || !/\.(md|markdown|mdown)$/i.test(url.pathname)) {
    throw new Error('只能打开当前站点中的 .md、.markdown 或 .mdown 文件。');
  }
  return { path: decodeURIComponent(url.pathname.slice(1)), url };
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function makeViewerUrl(path, hash = '') {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('file', path);
  url.hash = hash;
  return url.href;
}

function rewriteLinks(documentUrl) {
  for (const link of content.querySelectorAll('a[href]')) {
    const original = link.getAttribute('href');
    if (!original) continue;
    if (original.startsWith('#')) {
      try {
        const fragment = decodeURIComponent(original.slice(1));
        if (!document.getElementById(fragment) && document.getElementById('md-' + fragment)) {
          link.href = '#md-' + encodeURIComponent(fragment);
        }
      } catch { link.removeAttribute('href'); }
      continue;
    }
    let target;
    try { target = new URL(original, documentUrl); }
    catch { link.removeAttribute('href'); continue; }
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(target.protocol)) {
      link.removeAttribute('href');
      continue;
    }
    if (target.origin === location.origin && /\.(md|markdown|mdown)$/i.test(target.pathname)) {
      link.href = makeViewerUrl(decodeURIComponent(target.pathname.slice(1)), target.hash);
    } else {
      link.href = target.href;
      if (target.origin !== location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    }
  }
  for (const image of content.querySelectorAll('img[src]')) {
    try {
      const target = new URL(image.getAttribute('src'), documentUrl);
      if (!['http:', 'https:'].includes(target.protocol)) image.removeAttribute('src');
      else image.src = target.href;
    } catch { image.removeAttribute('src'); }
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    image.removeAttribute('srcset');
  }
}

function buildToc() {
  toc.replaceChildren();
  headings = [...content.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const used = new Map();
  for (const heading of headings) {
    const base = slugify(heading.textContent);
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    heading.id = count ? `md-${base}-${count}` : `md-${base}`;
  }
  const visible = headings.filter(h => ['H2', 'H3'].includes(h.tagName));
  for (const heading of visible.length ? visible : headings) {
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.textContent = heading.textContent.trim();
    if (heading.tagName === 'H3') link.classList.add('level-3');
    toc.append(link);
  }
}

function enhanceCodeAndTables() {
  for (const pre of content.querySelectorAll('pre')) {
    const code = pre.querySelector('code');
    if (!code) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '复制';
    button.setAttribute('aria-label', '复制代码块');
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.textContent); showToast('代码已复制'); }
      catch { showToast('浏览器未允许复制'); }
    });
    pre.append(button);
  }
  for (const table of content.querySelectorAll('table')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrap';
    table.replaceWith(wrapper);
    wrapper.append(table);
  }
}

function renderMarkdown(markdown, documentUrl) {
  if (!window.marked?.parse || !window.DOMPurify?.sanitize) {
    throw new Error('Markdown 渲染库未能加载，请刷新页面。');
  }
  const parsed = window.marked.parse(markdown, { gfm: true, breaks: false });
  content.innerHTML = window.DOMPurify.sanitize(parsed, {
    USE_PROFILES: { html: true },
    SANITIZE_NAMED_PROPS: true
  });
  buildToc();
  rewriteLinks(documentUrl);
  enhanceCodeAndTables();
  return content.querySelector('h1')?.textContent.trim() || documentUrl.pathname.split('/').pop();
}

function updateActiveHeading() {
  if (!headings.length) return;
  let selected = headings[0];
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= 110) selected = heading;
    else break;
  }
  for (const link of toc.querySelectorAll('a')) {
    link.classList.toggle('active', decodeURIComponent(link.hash.slice(1)) === selected.id);
  }
}

async function loadDocument(value, pushHistory = false) {
  if (activeController) activeController.abort();
  const sequence = ++requestNumber;
  currentDocumentPath = null;
  content.replaceChildren();
  toc.replaceChildren();
  headings = [];
  hideMessage();
  $('document-title').textContent = '正在打开文档…';
  $('document-path').textContent = String(value || '—');
  $('document-info').textContent = '正在读取';
  $('raw-link').hidden = true;

  let resolved;
  try { resolved = resolveDocumentPath(value); }
  catch (error) {
    $('document-title').textContent = '无法打开文档';
    showMessage(error.message);
    return;
  }
  input.value = resolved.path;
  $('document-path').textContent = resolved.path;
  $('raw-link').href = resolved.url.href;
  $('raw-link').hidden = false;
  if (pushHistory) {
    history.pushState(null, '', makeViewerUrl(resolved.path));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const controller = new AbortController();
  activeController = controller;
  try {
    const response = await fetch(resolved.url.href, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`读取失败：HTTP ${response.status}。请检查文件路径是否存在。`);
    const markdown = await response.text();
    if (sequence !== requestNumber) return;
    const title = renderMarkdown(markdown, resolved.url);
    currentDocumentPath = resolved.path;
    $('document-title').textContent = title;
    $('document-info').textContent = `${(new TextEncoder().encode(markdown).length / 1024).toFixed(1)} KB · GFM`;
    document.title = title === 'Markdown 阅读器' ? title : `${title} · Markdown 阅读器`;
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      requestAnimationFrame(() => (document.getElementById(id) || document.getElementById('md-' + id))?.scrollIntoView());
    }
    updateActiveHeading();
  } catch (error) {
    if (error.name === 'AbortError' || sequence !== requestNumber) return;
    $('document-title').textContent = '无法打开文档';
    $('document-info').textContent = '读取失败';
    showMessage(error.message || '未知错误');
  }
}

$('open-form').addEventListener('submit', event => {
  event.preventDefault();
  loadDocument(input.value, true);
});

$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); showToast('阅读链接已复制'); }
  catch { showToast('浏览器未允许复制'); }
});

function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
  $('theme-toggle').textContent = dark ? '☀' : '☾';
  $('theme-toggle').setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
  $('theme-toggle').title = dark ? '切换浅色模式' : '切换深色模式';
  try { localStorage.setItem('markdown-reader-theme', dark ? 'dark' : 'light'); } catch { /* storage may be disabled */ }
}

$('theme-toggle').addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
try { if (localStorage.getItem('markdown-reader-theme') === 'dark') setTheme(true); } catch { /* storage may be disabled */ }

document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    input.focus();
    input.select();
  }
});

let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => { updateActiveHeading(); scrollPending = false; });
}, { passive: true });

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  const path = params.get('file') || params.get('path') || DEFAULT_FILE;
  try {
    if (resolveDocumentPath(path).path === currentDocumentPath) return;
  } catch { /* loadDocument will show the path error */ }
  loadDocument(path);
});

const params = new URLSearchParams(location.search);
loadDocument(params.get('file') || params.get('path') || DEFAULT_FILE);
