'use strict';
function makeEastShore(){return {observations:0,meals:0,rippleUntil:0,company:makeEastDuckCompany(),
 ducks:EAST_SHORE.nests.map((p,id)=>({...p,id,mode:'sleep',goal:'nest',target:{...p},wait:0,step:0,turn:0,dir:1,day:0,chosen:false,noticed:false,waveUntil:0})),
 hedge:{...EAST_SHORE.hedge.home,mode:'hide',goal:'home',route:[],index:0,wait:0,step:0,turn:0,day:0,chosen:false,dir:1,noticed:false,curlUntil:0,berry:-1},
 berries:EAST_SHORE.hedge.berries.map(()=>({readyAt:0,pickedAt:null}))};}
function validateEastShore(state){
 if(!Object.hasOwn(state,'eastShore'))state.eastShore=makeEastShore();
 const s=state.eastShore,count=v=>Number.isSafeInteger(v)&&v>=0,nonneg=v=>Number.isFinite(v)&&v>=0;
 const validPoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 const hedgePoint=p=>validPoint(p)&&eastHedgeClear(p,p);
 if(!s||!count(s.observations)||s.observations>3||!count(s.meals)||!nonneg(s.rippleUntil)
  ||!Array.isArray(s.ducks)||s.ducks.length!==2||s.ducks.some((b,id)=>!validPoint(b)||!eastShoreWater(b,EAST_SHORE.pond,-6)
   ||b.id!==id||!['sleep','swim','rest'].includes(b.mode)||!['nest','water'].includes(b.goal)
   ||!validPoint(b.target)||!eastShoreWater(b.target,EAST_SHORE.pond,-6)||![-1,1].includes(b.dir)
   ||!['wait','step','waveUntil'].every(k=>nonneg(b[k]))||!count(b.turn)||!count(b.day)||b.day>state.day
   ||typeof b.chosen!=='boolean'||typeof b.noticed!=='boolean')
  ||!s.hedge||!hedgePoint(s.hedge)||!['hide','walk','rest','forage'].includes(s.hedge.mode)
  ||!['home','berries'].includes(s.hedge.goal)||![-1,1].includes(s.hedge.dir)
  ||!['wait','step','curlUntil'].every(k=>nonneg(s.hedge[k]))||!count(s.hedge.turn)||!count(s.hedge.day)||s.hedge.day>state.day
  ||typeof s.hedge.chosen!=='boolean'||typeof s.hedge.noticed!=='boolean'
  ||!Number.isInteger(s.hedge.berry)||s.hedge.berry< -1||s.hedge.berry>2
  ||!Array.isArray(s.hedge.route)||s.hedge.route.length>100||!s.hedge.route.every(hedgePoint)
  ||!count(s.hedge.index)||s.hedge.index>s.hedge.route.length
  ||!Array.isArray(s.berries)||s.berries.length!==3||s.berries.some(b=>!b||!nonneg(b.readyAt)||(b.pickedAt!==null&&(!nonneg(b.pickedAt)||b.pickedAt>state.day+state.phase))))
  throw new Error('存档里的东缘林泉与山脚小塘状态不正确。');
 validateEastDuckCompany(s,state.day);
 if(s.observations!==s.ducks.filter(b=>b.noticed).length+(s.hedge.noticed?1:0))throw new Error('存档里的山脚动物观察次数不一致。');
}
