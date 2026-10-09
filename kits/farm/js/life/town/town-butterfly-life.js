'use strict';
// Drawing, landing, hover hints and saves share these actual flower heads.
function townNectarFlower(siteIndex,seedIndex){
  const site=TOWN_LAYOUT.flowerSites[siteIndex],growth=townPlantGrowth('butterflySeed',seedIndex);
  const height=3+growth*(13+seedIndex*3);
  return {id:siteIndex*3+seedIndex,site:siteIndex,x:site.x+8+seedIndex*4,y:site.y+5-height,
    depth:site.y+11,height,growth,bloom:clamp((growth-.5)/.4,0,1)};
}
function townButterflyFlowers(){return TOWN_LAYOUT.flowerSites.flatMap((site,index)=>
  Array.from({length:farm.town.inventory.butterflySeed},(_,seed)=>townNectarFlower(index,seed)))
  .filter(flower=>flower.growth>=.75);}
function townButterflyWelcoming(){const weather=weatherVisual();
  return farm.phase>=.07&&farm.phase<.45&&weather.rain<.25&&weather.snow<.25&&seasonTransition().winter<.5;
}
function townButterflyLeave(butterfly){butterfly.mode='leave';butterfly.flower=-1;butterfly.target={...butterfly.home};butterfly.wait=0;}
function townButterflyChoose(butterfly,flowers){
  const occupied=new Set(farm.town.butterflies.filter(other=>other!==butterfly&&other.mode!=='leave').map(other=>Math.floor(other.flower/3)));
  const available=flowers.filter(flower=>flower.site!==Math.floor(butterfly.lastFlower/3)&&!occupied.has(flower.site));
  if(!available.length){townButterflyLeave(butterfly);return;}
  const flower=available[Math.floor(townRandom()*available.length)];
  butterfly.flower=flower.id;butterfly.target={x:flower.x,y:flower.y-2};butterfly.mode='fly';
}
function updateTownButterflies(dt){
  if(farm.paused)return;
  const town=farm.town,flowers=townButterflyFlowers(),welcoming=townButterflyWelcoming();
  if(welcoming&&flowers.length&&town.nectar.day!==farm.day&&!town.butterflies.length){
    town.nectar.day=farm.day;
    town.butterflies=Array.from({length:Math.min(4,town.inventory.butterflySeed+1)},(_,id)=>makeTownButterfly(id));
    for(const butterfly of town.butterflies)townButterflyChoose(butterfly,flowers);
  }
  for(const butterfly of town.butterflies){
    butterfly.step+=dt*(butterfly.mode==='sip'?1.8:8);
    if(butterfly.mode!=='leave'&&(!welcoming||town.nectar.day!==farm.day||!flowers.length))townButterflyLeave(butterfly);
    if(butterfly.mode==='arrive'||butterfly.mode==='fly'&&butterfly.flower<0)townButterflyChoose(butterfly,flowers);
    const flower=flowers.find(site=>site.id===butterfly.flower);
    if(butterfly.mode!=='leave'&&!flower)townButterflyChoose(butterfly,flowers);
    if(butterfly.mode==='sip'){
      const head=flowers.find(site=>site.id===butterfly.flower);
      if(!head)continue;
      butterfly.x=head.x;butterfly.y=head.y-2;butterfly.target={x:butterfly.x,y:butterfly.y};
      butterfly.wait=Math.max(0,butterfly.wait-dt);
      if(!butterfly.wait){town.nectar.sips++;butterfly.sips++;butterfly.lastFlower=butterfly.flower;
        if(butterfly.sips>=3)townButterflyLeave(butterfly);else townButterflyChoose(butterfly,flowers);}
      continue;
    }
    if(butterfly.mode==='fly'){
      const head=flowers.find(site=>site.id===butterfly.flower);
      if(head)butterfly.target={x:head.x,y:head.y-2};
    }
    const dx=butterfly.target.x-butterfly.x,dy=butterfly.target.y-butterfly.y,length=Math.hypot(dx,dy);
    const travel=Math.min(length,dt*(butterfly.mode==='leave'?38:28));
    if(length>.01){butterfly.x+=dx/length*travel;butterfly.y+=dy/length*travel;}
    if(length<=travel+.01){butterfly.x=butterfly.target.x;butterfly.y=butterfly.target.y;
      if(butterfly.mode!=='leave'){butterfly.mode='sip';butterfly.wait=2.2+townRandom()*.8;}}
  }
  town.butterflies=town.butterflies.filter(b=>b.mode!=='leave'||distance(b,b.home)>.01);
}
function townButterflyActivity(butterfly){return butterfly.mode==='sip'?'停在花头吸蜜，慢慢合翅'
  :butterfly.mode==='leave'?'沿草甸飞回安静的落脚处':'正飞向下一簇开花的蜜源花';}
function townNectarDescription(){const town=farm.town;
  return `蜜源花访客 · 吸蜜中 ${town.butterflies.filter(b=>b.mode==='sip').length} 只 · 累计访花 ${town.nectar.sips} 回 · 已观察 ${town.observations.butterfly} 次`;
}
