'use strict';
function makeTownBoatVisit() {
  return {day:0,decided:false,chosen:false,automatic:false,paid:false,cost:0,
    stage:'idle',route:[],index:0,wait:0};
}
function makeTownBoats() {
  return {visit:makeTownBoatVisit(),lastTrip:0,launched:0,observed:0,spent:0,boats:[]};
}
function validateTownBoats(town,day) {
  if(!Object.hasOwn(town,'paperBoats'))town.paperBoats=makeTownBoats();
  const s=town.paperBoats,v=s?.visit,integer=n=>Number.isSafeInteger(n)&&n>=0;
  const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=WORLD_W&&p.y>=0&&p.y<=WORLD_H;
  if(!s || !['lastTrip','launched','observed','spent'].every(k=>integer(s[k])) || s.lastTrip>day || s.observed>s.launched
    || s.spent>(town.spending?.outings??0)
    || !v || !integer(v.day) || v.day>day || !['decided','chosen','automatic','paid'].every(k=>typeof v[k]==='boolean')
    || !['idle','out','fold','watch','back','home','done'].includes(v.stage) || ![0,18,35,60].includes(v.cost)
    || !Array.isArray(v.route) || v.route.length>20 || !v.route.every(point)
    || !integer(v.index) || v.index>v.route.length || !Number.isFinite(v.wait) || v.wait<0 || v.wait>2.8
    || v.chosen && (!v.decided || v.day<1 || v.cost===0) || v.paid && (!v.chosen || s.spent<v.cost)
    || ['out','fold','watch','back','home'].includes(v.stage) && !v.chosen
    || ['fold','watch'].includes(v.stage) && !v.paid
    || !Array.isArray(s.boats) || s.boats.length>1
    || s.boats.some(b=>!point(b) || !riverAt(b.x,b.y) || !Number.isFinite(b.age) || b.age<0 || b.age>=8
      || !integer(b.day) || b.day<1 || b.day>day || typeof b.noticed!=='boolean'
      || !integer(b.color) || b.color>2 || Math.abs(b.y-(TOWN_LAYOUT.paperBoat.launchY+b.age*20))>.01)
    || s.boats.length>s.launched)
    throw new Error('存档里的溪桥纸船状态不正确。');
}
