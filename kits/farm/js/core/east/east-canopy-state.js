'use strict';
function makeEastCanopy(){return {observations:0,
  chipmunks:EAST_CANOPY.homes.map((p,id)=>({...p,id,day:0,decided:false,chosen:false,mode:'home',goal:'home',
    route:[],index:0,wait:0,step:0,turn:0,dir:1,waveUntil:0,noticed:false})),
  woodpecker:{x:EAST_CANOPY.perches[EAST_CANOPY.nest].x,y:EAST_CANOPY.perches[EAST_CANOPY.nest].y,
    day:0,decided:false,chosen:false,mode:'nest',perch:EAST_CANOPY.nest,target:EAST_CANOPY.nest,
    wait:0,step:0,turn:0,dir:-1,waveUntil:0,noticed:false}};}
function validateEastCanopy(state){
  if(!Object.hasOwn(state,'eastCanopy'))state.eastCanopy=makeEastCanopy();
  const s=state.eastCanopy,count=n=>Number.isSafeInteger(n)&&n>=0,nonneg=n=>Number.isFinite(n)&&n>=0;
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
  const common=a=>a&&count(a.day)&&a.day<=state.day&&count(a.turn)
    &&['decided','chosen','noticed'].every(k=>typeof a[k]==='boolean')&&(!a.chosen||a.decided)
    &&['wait','step','waveUntil'].every(k=>nonneg(a[k]))&&[-1,1].includes(a.dir);
  const perched=p=>Number.isInteger(p)&&p>=0&&p<EAST_CANOPY.perches.length;
  const bird=s?.woodpecker;
  if(!s||!count(s.observations)||s.observations>3||!Array.isArray(s.chipmunks)||s.chipmunks.length!==2
    ||s.chipmunks.some((a,id)=>!common(a)||!point(a)||!eastCanopyClear(a,a)||a.id!==id
      ||!['home','walk','forage','rest'].includes(a.mode)||!['home','grass'].includes(a.goal)
      ||!Array.isArray(a.route)||a.route.length>100||!a.route.every(p=>point(p)&&eastCanopyClear(p,p))
      ||!count(a.index)||a.index>a.route.length
      ||a.mode==='home'&&distance(a,EAST_CANOPY.homes[id])>.001
      ||a.mode==='walk'&&a.route[a.index]&&!eastCanopyClear(a,a.route[a.index])
      ||a.route.some((p,i)=>i>a.index&&!eastCanopyClear(a.route[i-1],p)))
    ||!common(bird)||!point(bird)||!perched(bird.perch)||!perched(bird.target)
    ||!inRect(bird.x,bird.y,2080,48,2530,256)||!['nest','fly','peck','rest'].includes(bird.mode)
    ||bird.mode!=='fly'&&distance(bird,EAST_CANOPY.perches[bird.perch])>.001
    ||bird.mode==='nest'&&bird.perch!==EAST_CANOPY.nest
    ||s.observations!==s.chipmunks.filter(a=>a.noticed).length+(bird.noticed?1:0))
    throw new Error('存档里的东缘花栗鼠与啄木鸟状态不正确。');
}
