'use strict';
// Toolbar, time controls, ledger disclosure, reset button and keyboard event bindings.
function syncToolUI() {
  document.querySelectorAll('[data-tool]').forEach(t=>{const on=t.dataset.tool===tool;t.classList.toggle('active',on);t.setAttribute('aria-pressed',on);});
  $('seed-picker').hidden=tool!=='plant';
}
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{tool=b.dataset.tool;syncToolUI();}));
document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{farm.speed=+b.dataset.speed;updateUI();save();}));
$('play-button').addEventListener('click',()=>{farm.paused=!farm.paused;updateUI();save();});
$('ledger-toggle').addEventListener('click',()=>{farm.ledgerExpanded=!farm.ledgerExpanded;updateUI();save();});

$('reset-button').addEventListener('click',()=>{
  if(!confirm('要让苔谷农场从第一天重新开始吗？当前的农场进度会清除。'))return;
  replaceFarmState(newFarm());
});
document.addEventListener('keydown',e=>{
  if(['SELECT','INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(e.code==='Space'){e.preventDefault();$('play-button').click();}
  if(['Digit1','Digit2','Digit3'].includes(e.code))document.querySelectorAll('[data-tool]')[+e.code.slice(-1)-1].click();
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'].includes(e.code)){
    e.preventDefault();
    const dx=['ArrowLeft','KeyA'].includes(e.code)?80:['ArrowRight','KeyD'].includes(e.code)?-80:0;
    const dy=['ArrowUp','KeyW'].includes(e.code)?80:['ArrowDown','KeyS'].includes(e.code)?-80:0;
    panByScreen(dx,dy);save();
  }
  if(['Equal','NumpadAdd','Minus','NumpadSubtract'].includes(e.code))setZoom(farm.view.zoom+(['Equal','NumpadAdd'].includes(e.code)?.1:-.1));
});
