'use strict';
function makeEastWoods(){return {observations:0,keeperVisits:0,keeperVisitDay:0,birds:EAST_WOODS.homes.map((home,id)=>({...home,id,day:0,
  decided:false,chosen:false,mode:'home',goal:'home',route:[],index:0,wait:0,step:0,turn:0,dir:-1,waveUntil:0,noticed:false}))};}
function validateEastWoods(state){
 if(!Object.hasOwn(state,'eastWoods'))state.eastWoods=makeEastWoods();
 const woods=state.eastWoods,h=EAST_WOODS.habitat;
 if(woods&&typeof woods==='object'&&!Array.isArray(woods)){
  if(!Object.hasOwn(woods,'keeperVisits'))woods.keeperVisits=0;
  if(!Object.hasOwn(woods,'keeperVisitDay'))woods.keeperVisitDay=0;
 }
 const count=v=>Number.isSafeInteger(v)&&v>=0;
 const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&inRect(p.x,p.y,h.left,h.top,h.right,h.bottom);
 if(!woods||!count(woods.observations)||!count(woods.keeperVisits)||!count(woods.keeperVisitDay)
   ||woods.keeperVisitDay>state.day||woods.keeperVisits>woods.keeperVisitDay||(!woods.keeperVisits&&woods.keeperVisitDay!==0)
   ||!Array.isArray(woods.birds)||woods.birds.length!==2
   ||woods.birds.some((b,id)=>!point(b)||b.id!==id||!count(b.day)||b.day>state.day
    ||!['decided','chosen','noticed'].every(k=>typeof b[k]==='boolean')
    ||!['home','walk','forage','rest'].includes(b.mode)||!['home','grass'].includes(b.goal)
    ||!Array.isArray(b.route)||b.route.length>100||!b.route.every(point)||!count(b.index)||b.index>b.route.length
    ||!['wait','step','waveUntil'].every(k=>Number.isFinite(b[k])&&b[k]>=0)
    ||!count(b.turn)||![-1,1].includes(b.dir)||b.chosen&&!b.decided))throw new Error('存档里的东缘林地山雉状态不正确。');
}
