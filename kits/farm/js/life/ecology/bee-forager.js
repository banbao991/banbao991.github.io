'use strict';
// One original bee follows a saved journey; five others stay near their hives.
function beeForagerWeather() {
  const w=weatherVisual();return seasonTransition().winter<.55 && w.rain<.3 && w.snow<.25;
}
function beeForagerFlower(index) {
  const h=farm.valleyHerbs[index];return h?{x:h.x+3,y:h.y-Math.round(5+valleyHerbProgress(h)*14)-1}:null;
}
function beeForagerFlowerAvailable(index) {
  const h=farm.valleyHerbs[index];return h && farm.beeForager.cycles[index]!==h.pickedAt
    && valleyHerbProgress(h)>=.75 && valleyHerbProgress(h)<.96;
}
function beeForagerMove(point,dt,speed) {
  const b=farm.beeForager,dx=point.x-b.x,dy=point.y-b.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*speed);
  if(d>0){b.x+=dx/d*step;b.y+=dy/d*step;}return d<=step;
}
function updateBeeForager(dt) {
  if(farm.paused || farm.upgrades<2)return;
  const b=farm.beeForager,home={x:HIVE_SITES[0].x,y:HIVE_SITES[0].y-9};
  if(b.stage==='idle') {
    if(b.day!==farm.day)Object.assign(b,{day:farm.day,decided:false,chosen:false,target:-1,elapsed:0,cycle:null,duration:0,helped:0,observedTrip:false});
    if(!b.decided && farm.phase>=.06 && farm.phase<.24 && beeForagerWeather()) {
      const candidates=farm.valleyHerbs.map((_,i)=>i).filter(beeForagerFlowerAvailable);
      if(candidates.length){b.decided=true;if(hash(farm.day,611,2601)<.7){
        const index=candidates[Math.floor(hash(farm.day,611,2602)*candidates.length)],h=farm.valleyHerbs[index];
        Object.assign(b,{chosen:true,stage:'out',target:index,cycle:h.pickedAt,duration:h.readyAt-h.pickedAt});
      }}
    }
    return;
  }
  const herb=farm.valleyHerbs[b.target];
  if(['out','sip'].includes(b.stage) && (b.day!==farm.day || farm.phase>=.44 || !beeForagerWeather()
    || !herb || herb.pickedAt!==b.cycle || valleyHerbProgress(herb)>=1))b.stage='back';
  if(b.stage==='back') {if(beeForagerMove(home,dt,150))b.stage='idle';return;}
  const flower=beeForagerFlower(b.target);
  if(b.stage==='out') {
    if(beeForagerMove(flower,dt,110)){b.stage='sip';b.elapsed=0;b.cycles[b.target]=b.cycle;}
    return;
  }
  // Benefit accrues only during actual contact, leaving a visible growing interval.
  const used=Math.min(dt,1.8-b.elapsed),today=farm.day+farm.phase;
  const boost=Math.max(0,Math.min(b.duration*.04*used/1.8,herb.readyAt-today-.04));
  herb.readyAt-=boost;b.helped+=boost;b.elapsed=Math.min(1.8,b.elapsed+dt);b.x=flower.x;b.y=flower.y;
  if(b.elapsed>=1.8){b.visits++;b.stage='back';record(`蜜蜂在${VALLEY_HERB_TYPES[herb.kind].name}花间采好了蜜，轻轻飞回果园蜂箱。`);save();}
}
function beeForagerVisible() {return farm.upgrades>=2 && farm.beeForager.stage!=='idle';}
function beeForagerAt(x,y) {
  const b=farm.beeForager;return beeForagerVisible() && Math.abs(x-b.x)<9 && Math.abs(y-b.y)<8?b:null;
}
function beeForagerActivity() {
  const b=farm.beeForager,kind=farm.valleyHerbs[b.target]?.kind;
  return b.stage==='out'?`飞往${VALLEY_HERB_TYPES[kind]?.name||'香草'}花间`
    :b.stage==='sip'?`在${VALLEY_HERB_TYPES[kind].name}花间采蜜 ${Math.floor(b.elapsed/1.8*100)}%`:'带着花粉飞回蜂箱';
}
function observeBeeForager() {
  const b=farm.beeForager;
  if(b.stage==='back' && b.elapsed>=1.8 && !b.observedTrip){b.observedTrip=true;b.observed++;record('你看着蜜蜂带回一点香草花粉，果园与山谷有了小小的往来。');}
  else record(`蜜蜂${beeForagerActivity()}，你安静地看了一会儿。`);
  updateUI();save();
}
