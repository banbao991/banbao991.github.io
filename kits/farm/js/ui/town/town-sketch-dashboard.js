'use strict';
// Two bounded readers share one saved page selection and one drawing function.
const townSketchReaderSignatures={};
function updateTownSketchUI() {
  const sketch=farm.town.sketch,page=sketch.pages[sketch.selected],preview=page||sketch.pending;
  for(const prefix of ['town-','town-map-']) {
    $(`${prefix}sketch-status`).textContent=townSketchDescription();
    $(`${prefix}sketch-caption`).textContent=page
      ?`${sketch.selected+1}/${sketch.pages.length} · ${seasons[page.season].name} · ${townSketchSites()[page.topic].name} · 第 ${page.day} 天记下，第 ${page.finished} 天画完。${townSketchSites()[page.topic].text}`
      :preview?`正在画${townSketchSites()[preview.topic].name}，纸上的颜色来自那天的季节。`:'等阿棠下次歇脚时，再添一页风景。';
    const canvas=$(`${prefix}sketch-picture`),signature=JSON.stringify([preview,preview===sketch.pending?Math.floor((preview?.progress||0)*10):1]);
    canvas.hidden=!preview;canvas.setAttribute('aria-label',preview?`${seasons[preview.season].name}的${townSketchSites()[preview.topic].name}像素写生`:'暂时空白的写生册');
    if(signature!==townSketchReaderSignatures[prefix]) {
      const target=canvas.getContext?.('2d');
      if(target){target.save();target.setTransform(3,0,0,3,0,0);drawTownSketchPage(target,preview,preview&&preview===sketch.pending?preview.progress:1);target.restore();}
      townSketchReaderSignatures[prefix]=signature;
    }
    for(const direction of ['prev','next'])$(`${prefix}sketch-${direction}`).disabled=sketch.pages.length<2;
    $(`${prefix}sketch-locate`).disabled=!page;
  }
}
for(const prefix of ['town-','town-map-']) {
  $(`${prefix}sketch-prev`).addEventListener('click',()=>townTurnSketchPage(-1));
  $(`${prefix}sketch-next`).addEventListener('click',()=>townTurnSketchPage(1));
  $(`${prefix}sketch-locate`).addEventListener('click',()=>{
    const page=farm.town.sketch.pages[farm.town.sketch.selected];if(!page)return;
    const site=townSketchSites()[page.topic];centerCamera(site.point.x,site.point.y);record(site.text);
  });
}
