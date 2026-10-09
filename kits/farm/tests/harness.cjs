const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const elements = new Map();
const documentListeners = {};
let storedSave = null;
let createdElementCount = 0;
function element(id = '') {
  if (elements.has(id)) return elements.get(id);
  const classes = new Set();
  const value = {
    id, style: {}, dataset: {}, hidden: false, textContent: '', listeners: {},
    classList: { toggle(name, force) { const on = force ?? !classes.has(name); if (on) classes.add(name); else classes.delete(name); return on; },
      add(name) { classes.add(name); }, remove(name) { classes.delete(name); }, contains(name) { return classes.has(name); } },
    setAttribute() {}, addEventListener(type, handler) { this.listeners[type] = handler; },
    replaceChildren(...children) { this.children = children; this.textContent = children.map(child => child.textContent ?? '').join(''); },
    append(...children) { this.children ??= []; this.children.push(...children); this.textContent = this.children.map(child => child.textContent ?? '').join(''); },
    click() { this.listeners.click?.(); }, remove() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 1152, height: 816 }; }
  };
  elements.set(id, value);
  return value;
}
const colors = [];
const painted = [];
const exportPainted = [];
const exportColors = [];
const downloads = [];
const downloadBlobs = [];
let latestImageCanvas = null;
const context2d = {
  clearRect() {},
  fillRect(x, y) { colors.push(this.fillStyle); painted.push([x, y]); },
  beginPath() { this.pathRectangles=[]; }, rect(x,y,w,h) { (this.pathRectangles??=[]).push([x,y,w,h]); },
  arc() {}, fill() { for(const [x,y,w,h] of this.pathRectangles||[])this.fillRect(x,y,w,h); },
  stroke() {}, moveTo() {}, lineTo() {}, strokeRect() {}, save() {}, restore() {},
  translate() {}, rotate() {}, scale() {}, fillText() {}, setTransform() {},
  createRadialGradient() { return { addColorStop() {} }; }
};
const imageContext2d = { ...context2d, fillRect(x, y) { exportPainted.push([x, y]); exportColors.push(this.fillStyle); } };
element('farm-map').getContext = () => context2d;
element('farm-map').width = 1152;
element('farm-map').height = 816;
element('mini-map').getContext = () => context2d;
element('mini-map').width = 260;
element('mini-map').height = 217;
element('mini-map').getBoundingClientRect = () => ({ left: 0, top: 0, width: 260, height: 217 });
const controls = {
  '[data-speed]': [1, 2, 4].map(speed => Object.assign(element(`speed-${speed}`), { dataset: { speed } })),
  '[data-tool]': ['inspect', 'plant', 'water'].map(tool => Object.assign(element(`tool-${tool}`), { dataset: { tool } }))
};
const sandbox = vm.createContext({
  document: {
    documentElement: { clientWidth: 1280, clientHeight: 900 },
    getElementById: element, createElement(tag) {
      const item = element(`created-${createdElementCount++}`);
      if (tag === 'canvas') {
        item.getContext = () => imageContext2d;
        item.toBlob = (callback, type) => callback(new Blob(['mock png'], { type }));
        latestImageCanvas = item;
      }
      if (tag === 'a') item.click = () => downloads.push({ name: item.download, href: item.href });
      return item;
    }, createTextNode: text => ({ textContent: text }),
    querySelector: () => element('live-pill'), querySelectorAll: selector => controls[selector] || [],
    addEventListener(type, handler) { (documentListeners[type] ??= []).push(handler); },
    body: { append() {} }, activeElement: { tagName: 'BODY' }
  },
  localStorage: { getItem: () => null, setItem(_key, value) { storedSave = value; } },
  performance: { now: () => 0 }, requestAnimationFrame() {},
  location: { protocol: 'http:' }, confirm: () => true,
  Math, console, Blob, atob, URL: { createObjectURL: blob => { downloadBlobs.push(blob); return 'blob:smoke'; }, revokeObjectURL() {} }, setTimeout: handler => handler()
});
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pageScripts = [...page.matchAll(/<script src="([^"]+)" defer/g)].map(match => match[1]);
const scripts = pageScripts.filter(filename => filename.startsWith('js/')).map(filename => filename.slice(3));
// Sidebar sizing requires a real layout engine; exercise it in browser verification.

for (const filename of pageScripts.filter(filename => filename !== 'js/ui/sidebar-layout.js')) {
  vm.runInContext(fs.readFileSync(path.resolve(root, filename), 'utf8'), sandbox, { filename });
}
const run = code => vm.runInContext(code, sandbox);

module.exports={run,element,sandbox,root,elements,documentListeners,colors,painted,exportPainted,exportColors,downloads,downloadBlobs,pageScripts,scripts,fs,path,vm,context2d,imageContext2d,getLatestImageCanvas:()=>latestImageCanvas,getStoredSave:()=>storedSave};
