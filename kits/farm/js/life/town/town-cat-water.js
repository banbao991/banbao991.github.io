'use strict';
// A short, real walk to the existing bowl; play, company, shelter and work take priority.
function townCatWaterBuilt(){return farm.town.improvements.catComfort.level>=3;}
function townCatWaterActive(){return farm.town.catWater.active>=0;}
function townCatWaterCat(cat){return townCatWaterActive()&&plazaCats[farm.town.catWater.active]===cat;}
function townCatWaterAllowed(){const w=weatherVisual();return townCatWaterBuilt()&&!isFestivalDay()
 &&farm.phase>=.14&&farm.phase<.44&&seasonTransition().winter<.55&&w.rain<.25&&w.snow<.25;}
function townCatWaterDescription(){
 if(!townCatWaterBuilt())return '';
 const b=farm.town.catWater,cat=plazaCats[b.active];
 return `猫碗水量 ${Math.round(b.water*100)}%${cat?' · '+cat.name+(b.stage==='drink'?'在慢慢喝水':'正去浅水碗'):b.water<.15?' · 等雨水或补清水':''}`;
}
function townCatWaterHint(cat){return townCatWaterCat(cat)?farm.town.catWater.stage==='drink'?'在猫棚旁慢慢喝水':'沿空地去浅水碗':'';}
function finishTownCatWater(completed=false){
 const b=farm.town.catWater,cat=plazaCats[b.active];if(!cat)return;
 if(['move','drink'].includes(cat.mode))Object.assign(cat,{mode:'groom',path:[],wait:2.5,action:0});
 if(completed){b.drinks++;townNote(cat.name+'在猫棚旁喝了几口清水，坐下来洗洗脸。');}
 Object.assign(b,{active:-1,stage:'idle',wait:0});save();
}
function refillTownCatWater(){
 if(!townCatWaterBuilt())return;
 const b=farm.town.catWater;b.ready=true;b.water=1;b.agedAt=farm.day+farm.phase;
 record('你给猫棚旁的浅水碗添满清水，橘子和墨点有空时会过来喝。');updateUI();save();
}
function townCatWaterRouteClear(from,path,other){
 let last=from;
 for(const point of path){const length=distance(last,point),steps=Math.max(1,Math.ceil(length/4));
  for(let i=1;i<=steps;i++){const p={x:last.x+(point.x-last.x)*i/steps,y:last.y+(point.y-last.y)*i/steps};
   if(!plazaPetWalkable(p)||distance(p,other)<38)return false;
  }last=point;
 }return true;
}
function updateTownCatWaterPlan(dt){
 if(farm.paused)return;
 const b=farm.town.catWater,stamp=farm.day+farm.phase,built=townCatWaterBuilt();
 if(built&&!b.ready){b.ready=true;b.water=.75;b.agedAt=stamp;save();}
 if(b.ready){const w=weatherVisual(),season=seasonTransition(),elapsed=clamp(stamp-b.agedAt,0,1);
  const summer=(season.from===1?1-season.amount:0)+(season.to===1?season.amount:0);
  b.water=clamp(b.water+elapsed*(w.rain*.65-(.03+.12*summer)*(1-w.rain)),0,1);b.agedAt=stamp;
 }
 if(b.day!==farm.day){finishTownCatWater();Object.assign(b,{day:farm.day,decided:[false,false]});save();}
 const site=TOWN_LAYOUT.catWater,priority=plazaCatCompanyActive()||farm.town.catPlay.active>=0
  ||farm.town.construction?.id==='catComfort'||plazaNeighbours().some(p=>distance(p,site.stand)<40);
 if(townCatWaterActive()){
  const cat=plazaCats[b.active],other=plazaCats[1-b.active];
  if(!townCatWaterAllowed()||priority||b.water<.10||distance(cat,other)<38
   ||!['move','drink'].includes(cat.mode)){finishTownCatWater();return;}
  if(b.stage==='out'){b.wait=Math.min(12,b.wait+dt);if(b.wait>=12)finishTownCatWater();}
  return;
 }
 if(!townCatWaterAllowed()||farm.phase>=.35||priority||b.water<.15)return;
 for(const [index,cat]of plazaCats.entries()){
  const other=plazaCats[1-index];
  if(b.decided[index]||!['sleep','groom','stretch','watch'].includes(cat.mode)||distance(cat,site.stand)>170
   ||distance(other,site.stand)<48||distance({x:other.tx,y:other.ty},site.stand)<42)continue;
  const path=plazaPetPath(cat,site.stand,{avoid:[other]});
  if(!path.length||!townCatWaterRouteClear(cat,path,other))continue;
  b.decided[index]=true;
  if(hash(farm.day,index,1259)>=.4){save();continue;}
  Object.assign(b,{active:index,stage:'out',wait:0});
  Object.assign(cat,{mode:'move',path,tx:site.stand.x,ty:site.stand.y,action:0});save();return;
 }
}
function updateTownCatWaterCat(cat,dt){
 if(!townCatWaterCat(cat))return false;
 const b=farm.town.catWater,other=plazaCats[1-b.active];
 if(b.stage==='out'){
  const next=cat.path[0];
  if(next){const d=distance(cat,next),travel=Math.min(d,42*dt),p={x:cat.x+(next.x-cat.x)/(d||1)*travel,y:cat.y+(next.y-cat.y)/(d||1)*travel};
   if(distance(p,other)<38){finishTownCatWater();return true;}
   if(movePlazaPet(cat,next,dt,42))cat.path.shift();
  }
  if(!cat.path.length&&distance(cat,TOWN_LAYOUT.catWater.stand)<.1){b.stage='drink';b.wait=0;cat.mode='drink';cat.dir=-1;save();}
 }else{
  const used=Math.min(dt,2.6-b.wait);b.wait+=used;b.water=Math.max(0,b.water-used*.12/2.6);cat.action+=dt;cat.dir=-1;
  if(b.wait>=2.6-1e-8)finishTownCatWater(true);
 }return true;
}

function townCatWaterHoldOther(cat,point,dt){
 if(!townCatWaterActive()||townCatWaterCat(cat)||!point)return false;
 const selected=plazaCats[farm.town.catWater.active],d=distance(cat,point),step=Math.min(d,(cat.mode==='return'?78:42)*dt);
 const next={x:cat.x+(point.x-cat.x)/(d||1)*step,y:cat.y+(point.y-cat.y)/(d||1)*step};
 return distance(next,selected)<38||distance(next,TOWN_LAYOUT.catWater.stand)<38;
}
