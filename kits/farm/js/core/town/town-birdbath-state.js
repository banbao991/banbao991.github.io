'use strict';
// This visitor belongs to the bath, rather than the food/nesting birds' shared routines.
function makeTownBirdBath(day=1){return {ready:false,water:0,agedAt:day,day:0,chosen:false,spawned:false,
  bird:null,visits:0,baths:0};}
function validateTownBirdBath(town,day){
  if(!Object.hasOwn(town,'birdBath'))town.birdBath=makeTownBirdBath(day);
  if(town.observations && !Object.hasOwn(town.observations,'wagtail'))town.observations.wagtail=0;
  const bath=town.birdBath,bird=bath?.bird;
  const number=value=>Number.isFinite(value)&&value>=0&&value<=Number.MAX_SAFE_INTEGER;
  const integer=value=>number(value)&&Number.isInteger(value);
  const point=value=>value&&Number.isFinite(value.x)&&Number.isFinite(value.y)
    &&value.x>=0&&value.x<=WORLD_W&&value.y>=0&&value.y<=WORLD_H;
  if(!bath || !['ready','chosen','spawned'].every(key=>typeof bath[key]==='boolean')
    || !number(bath.water)||bath.water>1||!number(bath.agedAt)||bath.agedAt>day+1
    || !integer(bath.day)||bath.day>day||!integer(bath.visits)||!integer(bath.baths)
    || bath.spawned&&!bath.chosen || !integer(town.observations?.wagtail)
    || bird!==null && (!point(bird)||!point(bird.target)||!integer(bird.day)||bird.day<1||bird.day>day
      || !['arrive','perch','bathe','dry','leave'].includes(bird.mode)
      || !['step','wait'].every(key=>number(bird[key]))||bird.wait>1.8
      || !integer(bird.cycles)||bird.cycles>3||![-1,1].includes(bird.dir)
      || typeof bird.noticed!=='boolean'||!bath.ready))
    throw new Error('存档里的溪畔浴鸟状态不正确。');
}
