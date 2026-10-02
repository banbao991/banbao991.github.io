'use strict';

const sidebar = document.querySelector('.sidebar');
const mapPanel = document.getElementById('map-panel');
const stackedLayout = window.matchMedia('(max-width: 880px)');

function syncSidebarHeight() {
  if (stackedLayout.matches) {
    sidebar.style.removeProperty('height');
    return;
  }
  sidebar.style.height = `${Math.ceil(mapPanel.getBoundingClientRect().height)}px`;
}

if ('ResizeObserver' in window) new ResizeObserver(syncSidebarHeight).observe(mapPanel);
window.addEventListener('resize', syncSidebarHeight);
stackedLayout.addEventListener('change', syncSidebarHeight);
syncSidebarHeight();
