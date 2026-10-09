'use strict';
function makeTownNectar(){return {day:0,sips:0};}
function makeTownButterfly(id){const site=TOWN_LAYOUT.flowerSites[0];
  const home={x:site.x-62-id*10,y:site.y-42+id*16};
  return {...home,id,variant:id%3,home,target:{...home},step:0,mode:'arrive',wait:0,action:0,lift:0,
    flower:-1,lastFlower:-1,sips:0,noticed:false};
}
function validateTownNectar(town,day){
  const integer=n=>Number.isSafeInteger(n)&&n>=0;
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=-64&&p.x<=WORLD_W+64&&p.y>=-64&&p.y<=WORLD_H+64;
  const fail=()=>{throw new Error('存档里的蝴蝶访花状态不正确。');};
  if(!Object.hasOwn(town,'nectar'))town.nectar={day:town.ecologyDay||0,sips:0};
  if(town.observations&&!Object.hasOwn(town.observations,'butterfly'))town.observations.butterfly=0;
  if(!town.nectar||!integer(town.nectar.day)||town.nectar.day>day||!integer(town.nectar.sips)
    ||!integer(town.observations?.butterfly)||!Array.isArray(town.butterflies)||town.butterflies.length>4)fail();
  for(const butterfly of town.butterflies){
    if(!butterfly)fail();
    const defaults={home:makeTownButterfly(integer(butterfly.id)?Math.min(3,butterfly.id):0).home,
      flower:-1,lastFlower:-1,sips:0,noticed:false};
    for(const [key,value]of Object.entries(defaults))if(!Object.hasOwn(butterfly,key))butterfly[key]=value;
    if(!point(butterfly)||!point(butterfly.target)||!point(butterfly.home)
      ||!integer(butterfly.id)||butterfly.id>3||!integer(butterfly.variant)||butterfly.variant>2
      ||!['arrive','fly','sip','leave'].includes(butterfly.mode)
      ||!['step','wait','action','lift'].every(key=>Number.isFinite(butterfly[key])&&butterfly[key]>=0)
      ||butterfly.wait>3||!integer(butterfly.sips)||butterfly.sips>3||typeof butterfly.noticed!=='boolean'
      ||!['flower','lastFlower'].every(key=>Number.isInteger(butterfly[key])&&butterfly[key]>=-1&&butterfly[key]<TOWN_LAYOUT.flowerSites.length*3)
      ||butterfly.mode==='sip'&&butterfly.flower<0)fail();
  }
  if(new Set(town.butterflies.map(b=>b.id)).size!==town.butterflies.length)fail();
}
