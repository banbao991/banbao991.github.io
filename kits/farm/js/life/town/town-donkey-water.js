'use strict';
// One real stop at the existing trough. Work, visitors, food and shelter take priority.
function townDonkeyWaterBuilt(){return farm.town.improvements.donkeyInn.level>=2;}
function townDonkeyWaterActive(){return farm.town.donkeyWater.active>=0;}
function townDonkeyWaterBusy(){const b=farm.town.donkeyWater;return b.active>=0||b.departing>=0;}
function townDonkeyWaterAllowed(){return townDonkeyWaterBuilt()&&!townDonkeyShelter()&&farm.phase<.4&&seasonTransition().winter<.6;}
function townDonkeyWaterPriority(){const t=farm.town,m=t.fodder;
 return t.construction?.id==='donkeyInn'||['out','wait','feed'].includes(t.donkeyVisit.stage)
  ||townDonkeyBondActive()||m.active>=0||m.departing>=0||m.queue.length>0;
}
function finishTownDonkeyWater(completed=false){
 const b=farm.town.donkeyWater,a=farm.town.donkeys[b.active];if(!a)return;
 if(completed){b.water=Math.max(0,b.water-.16);b.drinks++;b.departing=a.id;
  townDonkeyRoute(a,TOWN_LAYOUT.donkeyWater.exits[a.id].map(p=>({...p})),'pen');
  townNote(TOWN_DONKEY_NAMES[a.id]+'走到遮雨水槽，慢慢喝过清水，给同伴让出位置。');
 }else if(a.target==='water')Object.assign(a,{target:'pen',mode:'rest',route:[],index:0,walk:0,wait:3});
 Object.assign(b,{active:-1,stage:'idle',wait:0});save();
}
function refillTownDonkeyWater(announce=true){
 if(!townDonkeyWaterBuilt())return false;
 Object.assign(farm.town.donkeyWater,{ready:true,water:1,agedAt:farm.day+farm.phase});
 if(announce){record('你给小驴驿的遮雨水槽添满清水，'+TOWN_DONKEY_NAMES.join('和')+'有空会轮流来喝。');updateUI();save();}return true;
}
function townDonkeyWaterAt(x,y){const p=TOWN_LAYOUT.donkeyInn.trough;
 return townDonkeyWaterBuilt()&&inRect(x,y,p.x-25,p.y-46,p.x+25,p.y+15)?p:null;
}
function townDonkeyWaterRouteClear(a,route){
 if(!townDonkeyWaterPointClear(a))return false;
 let last=a;
 for(const point of route){const n=Math.max(1,Math.ceil(distance(last,point)/4));
  for(let i=1;i<=n;i++){const v={x:last.x+(point.x-last.x)*i/n,y:last.y+(point.y-last.y)*i/n};
   if(!townDonkeyWaterPointClear(v)
    ||farm.town.donkeys.some(other=>other!==a&&distance(v,other)<42))return false;
  }last=point;
 }return true;
}
function updateTownDonkeyWaterPlan(dt){
 if(farm.paused)return;
 const b=farm.town.donkeyWater,stamp=farm.day+farm.phase;
 if(townDonkeyWaterBuilt()&&!b.ready){b.ready=true;b.water=.75;b.agedAt=stamp;save();}
 if(b.ready){const w=weatherVisual(),s=seasonTransition(),elapsed=clamp(stamp-b.agedAt,0,1);
  const summer=(s.from===1?1-s.amount:0)+(s.to===1?s.amount:0);
  b.water=clamp(b.water+elapsed*(w.rain*.55-(.025+.08*summer)*(1-w.rain)),0,1);b.agedAt=stamp;
 }
 if(b.day!==farm.day){finishTownDonkeyWater();Object.assign(b,{day:farm.day,decided:[false,false],departing:-1});}
 if(townDonkeyWaterActive()){
  const a=farm.town.donkeys[b.active];
  if(!townDonkeyWaterAllowed()||townDonkeyWaterPriority()||b.water<.16||a.target!=='water')finishTownDonkeyWater();
  else if(b.stage==='out'){b.wait=Math.min(15,b.wait+dt);if(b.wait>=15)finishTownDonkeyWater();}
  return;
 }
 if(townDonkeyShelter()||farm.town.construction?.id==='donkeyInn'||['out','wait','feed'].includes(farm.town.donkeyVisit.stage))b.departing=-1;
 if(b.departing>=0){const a=farm.town.donkeys[b.departing];if(a.mode==='walk'||distance(a,TOWN_LAYOUT.donkeyWater.stand)<50)return;b.departing=-1;}
 if(!townDonkeyWaterAllowed()||townDonkeyWaterPriority()||b.water<.2||farm.phase<.08||farm.phase>=.28)return;
 if(farm.phase>=.18&&farm.town.inventory.fodder>0&&farm.town.fodder.day!==farm.day)return;
 for(const a of farm.town.donkeys){
  if(b.decided[a.id]||!['graze','rest'].includes(a.mode)||a.target!=='pen'||a.waveUntil>now)continue;
  const path=[{...TOWN_LAYOUT.donkeyWater.approach},{...TOWN_LAYOUT.donkeyWater.stand}];
  if(!townDonkeyWaterRouteClear(a,path))continue;
  b.decided[a.id]=true;
  if(hash(farm.day,a.id,1349)>=.55*(1-seasonTransition().winter)){save();continue;}
  Object.assign(b,{active:a.id,stage:'out',wait:0});townDonkeyRoute(a,path,'water');save();return;
 }
}
function updateTownDonkeyWaterAnimal(a,dt){
 const b=farm.town.donkeyWater;if(b.active!==a.id)return false;
 if(b.stage==='out'){
  const p=a.route[a.index];if(p){const d=distance(a,p),step=Math.min(d,22*dt),next={x:a.x+(p.x-a.x)/(d||1)*step,y:a.y+(p.y-a.y)/(d||1)*step};
   if(farm.town.donkeys.some(other=>other!==a&&distance(next,other)<42)){finishTownDonkeyWater();return true;}
  }
  if(!townFollowRoute(a,dt,22))return true;
  Object.assign(a,{mode:'rest',dir:1,walk:0,route:[],index:0});b.stage='drink';b.wait=0;save();
 }else{
  a.mode='rest';a.dir=1;a.walk=0;b.wait=Math.min(2.8,b.wait+dt);
  if(b.wait>=2.8-1e-8)finishTownDonkeyWater(true);
 }return true;
}
function townDonkeyWaterHoldOther(a,dt){
 const b=farm.town.donkeyWater,id=b.active>=0?b.active:b.departing,other=farm.town.donkeys[id];if(!other||a.mode!=='walk'||a.target==='home')return false;
 const point=a.route[a.index];if(!point)return false;
 const d=distance(a,point),step=Math.min(d,22*dt),next={x:a.x+(point.x-a.x)/(d||1)*step,y:a.y+(point.y-a.y)/(d||1)*step};
 return a===other?farm.town.donkeys.some(v=>v!==a&&distance(next,v)<42)
  :distance(next,other)<44||b.active>=0&&distance(next,TOWN_LAYOUT.donkeyWater.stand)<42;
}
function townDonkeyWaterActivity(a){const b=farm.town.donkeyWater;
 return b.active===a.id?(b.stage==='drink'?'在遮雨水槽慢慢喝水':'正沿草地走向水槽'):null;
}
function townDonkeyWaterDescription(){
 if(!townDonkeyWaterBuilt())return '第二阶段添遮雨水槽，小驴会轮流来喝水。';
 const b=farm.town.donkeyWater,a=farm.town.donkeys[b.active];
 return `驴驿水量 ${Math.round(b.water*100)}% · ${a?TOWN_DONKEY_NAMES[a.id]+townDonkeyWaterActivity(a):b.departing>=0?'喝完的小驴先让出槽边':b.water<.2?'等雨水或补清水':'晴暖早晨偶尔轮流来喝'} · 已喝 ${b.drinks} 回`;
}
