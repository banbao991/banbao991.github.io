'use strict';
// Map drag, click actions, wheel zoom and minimap navigation event bindings.
function mousePosition(e){const b=canvas.getBoundingClientRect(),screenX=(e.clientX-b.left)*W/b.width,screenY=(e.clientY-b.top)*H/b.height;return {...screenToWorld(screenX,screenY),screenX,screenY,localX:e.clientX-b.left,localY:e.clientY-b.top};}

let drag=null, suppressClickUntil=0, miniDragging=false;
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==undefined&&e.button!==0)return;
  drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
  clearMapHover(true);
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
  if(drag){
    const bounds=canvas.getBoundingClientRect(),dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;
    if(drag.moved){panByScreen(dx*W/bounds.width,dy*H/bounds.height);clearMapHover(true);}
    drag.lastX=e.clientX;drag.lastY=e.clientY;
    return;
  }
  rememberMapHover(e);
});
canvas.addEventListener('pointerup',e=>{if(drag?.moved){suppressClickUntil=performance.now()+400;save();}drag=null;canvas.releasePointerCapture?.(e.pointerId);rememberMapHover(e);});
canvas.addEventListener('pointercancel',()=>{drag=null;clearMapHover(true);});
canvas.addEventListener('pointerleave',()=>{clearMapHover(true);});
canvas.addEventListener('click',e=>{
  if(performance.now()<suppressClickUntil){suppressClickUntil=0;return;}
  const {x,y}=mousePosition(e);
  if(handleVillageDevelopmentClick(x,y))return;
  const canopyAnimal=eastCanopyAnimalAt(x,y);if(canopyAnimal){greetEastCanopy(canopyAnimal);return;}
  if(handleEastShoreClick(x,y))return;
  const eastBird=eastPheasantAt(x,y);if(eastBird){greetEastPheasant(eastBird);return;}
  if(beeForagerAt(x,y)){observeBeeForager();return;}
  if(handleTownClick(x,y))return;
  if(courierAt(x,y)){greetCourier();return;}
  const plazaCat=plazaCatAt(x,y);
  if(plazaCat){greetPlazaCat(plazaCat);return;}
  const plazaBird=plazaSparrowAt(x,y);
  if(plazaBird){greetPlazaSparrow(plazaBird);return;}
  if(forestKeeperAt(x,y)){forestKeeper.waveUntil=now+2.3;record(isFestivalDay()?'阿森把采集篮留在家，和大家一起分享节日点心。':'阿森轻轻挥手：“林子里的蘑菇和小动物，今天都好着呢。”');save();return;}
  if(minerAt(x,y)){miner.waveUntil=now+2.3;record('阿矿收起小镐，笑着指向新露出的矿脉：“好石头得慢慢找。”');save();return;}
  const mineNode=mineNodeAt(x,y);
  if(mineNode>=0){
    if(!collectMineNode(mineNode))record('这处矿脉刚采过，碎石间还没有露出新的矿石。');
    updateUI();save();return;
  }
  if(nurseryKeeperAt(x,y)){nurseryKeeper.waveUntil=now+2.3;record('阿芽从苗圃抬起头：“湿地的花开好了，香草和果树也会跟着长得更好。”');save();return;}
  const clickedWorker=workerAt(x,y);
  if(clickedWorker && (tool==='inspect'||!plotAt(x,y))){greetWorker(clickedWorker);return;}
  if(villagerAt(x,y)){villageWalker.waveUntil=now+2.3;record('阿宁笑着向你挥手：“集市快热闹起来啦。”');save();return;}
  if(orderKeeperAt(x,y)){orderKeeper.waveUntil=now+2.3;record(isFestivalDay()?'阿葵把订单本收好，递给你一块香甜的点心。':orderKeeper.gardenWork?.stage==='beds'?'阿葵笑着说：“这些菜长好后，村口的大家都能尝尝。”':'阿葵指了指村口告示牌，新的委托已经贴好。');save();return;}
  if(anglerAt(x,y)){if(anglerQuietAtPier())angler.waveUntil=now+2.3;record(isFestivalDay()?'阿蓼把鱼竿留在小屋，今天来广场听大家唱歌。':anglerQuietAtPier()?'阿蓼放下鱼竿，笑着向你挥了挥手。':'阿蓼轻轻晃了晃鱼竿，湖面泛起细小的波纹。');save();return;}
  if(villageSiteOpen('plaza')&&landmarkAt(x,y)==='central-stage'){openTownLanternPanel();return;}
  const p=plotAt(x,y);
  if(p){
    if(tool==='plant'){
      if(p.crop){record('这格田地已经有作物啦。');return;}
      const type=$('seed-select').value,c=crops[type];
      if(farm.coins<c.cost){record(`金币还差一点，播种${c.name}需要 ${c.cost} 金。`);return;}
      farm.coins-=c.cost;p.crop=type;p.age=0;p.plantedAt=farm.phase;p.watered=farm.weather==='rain';record(`你亲手种下了${c.name}。`);
    }else if(tool==='water'){
      if(!p.crop){record('先播下种子，再给它浇水吧。');return;}
      p.watered=true;record(`你给${crops[p.crop].name}浇了水。`);
    }else record(describe(x,y).text);
    updateUI();save();return;
  }
  if(squirrelAt(x,y)){feedSquirrel();return;}
  if(foxAt(x,y)){greetForestFox();return;}
  const goat=goatAt(x,y);
  if(goat){greetGoat(goat);return;}
  const ridgeAnimal=ridgeAnimalAt(x,y);
  if(ridgeAnimal){interactRidgeAnimal(ridgeAnimal);return;}
  const duck=duckAt(x,y);
  if(duck){greetDuck(duck);return;}
  if(pondDuckAt(x,y)){record('池塘小鸭扑棱着翅膀，向你轻轻叫了一声。');return;}
  const valleyCreature=valleyCreatureAt(x,y);
  if(valleyCreature){interactValleyCreature(valleyCreature);return;}
  if(nurseryFrogAt(x,y)){greetNurseryFrog();return;}
  const wetlandCreature=wetlandCreatureAt(x,y);
  if(wetlandCreature){interactWetlandCreature(wetlandCreature);return;}
  const foraged=forageAt(x,y);
  if(foraged){collectForage(foraged);return;}
  const fish=fishSpotAt(x,y);
  if(fish){catchFish(fish);return;}
  const herb=valleyHerbAt(x,y);
  if(herb){collectValleyHerb(herb);return;}
  const nurseryBed=nurseryBedAt(x,y);
  if(nurseryBed>=0){if(!collectNurseryBed(nurseryBed))record('这畦花苗还在生长，过些时候再来。');updateUI();save();return;}
  if(eastGardenBedAt(x,y)>=0 || eastGardenBasketAt(x,y)){record(describe(x,y).text);save();return;}
  const wetlandPlant=wetlandPlantAt(x,y);
  if(wetlandPlant){record(wetlandPlantHint(wetlandPlant));save();return;}
  if(coopAt(x,y)){farm.chickenLove++;record('你撒了一把谷粒，鸡群叽叽喳喳地围了过来。');save();return;}
  if(cowAt(x,y)){farm.cowLove++;record('牛牛喜欢你的陪伴，开心地摇了摇尾巴。');save();return;}
  const item=describe(x,y);if(item)record(item.text);
});
canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const p=mousePosition(e);
  setZoom(farm.view.zoom+(e.deltaY<0?.1:-.1),p.screenX,p.screenY);
},{passive:false});
miniCanvas.addEventListener('pointerdown',e=>{miniDragging=true;miniCanvas.setPointerCapture?.(e.pointerId);const p=miniToWorld(e);centerCamera(p.x,p.y);});
miniCanvas.addEventListener('pointermove',e=>{if(miniDragging){const p=miniToWorld(e);centerCamera(p.x,p.y);}});
miniCanvas.addEventListener('pointerup',e=>{miniDragging=false;miniCanvas.releasePointerCapture?.(e.pointerId);});
miniCanvas.addEventListener('pointercancel',()=>{miniDragging=false;});
$('zoom-out').addEventListener('click',()=>setZoom(farm.view.zoom-.1));
$('zoom-in').addEventListener('click',()=>setZoom(farm.view.zoom+.1));
$('zoom-range').addEventListener('input',e=>setZoom(e.target.value));
$('home-view').addEventListener('click',()=>centerCamera(480,320));
