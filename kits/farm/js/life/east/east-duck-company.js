'use strict';
// A real encounter uses the birds' existing stops, without extra travel or waiting.
function eastDuckCompanyConditions(){
 const birds=farm.eastShore.ducks,w=weatherVisual(),d=distance(birds[0],birds[1]);
 return farm.phase>=.12&&farm.phase<.5&&seasonTransition().winter<.6&&w.rain<.35&&w.snow<.25
  &&d>=30&&d<=70&&birds.every(b=>b.mode==='rest'&&b.goal==='water');
}
function eastDuckCompanyActive(){return farm.eastShore.company.remaining>0&&eastDuckCompanyConditions();}
function updateEastDuckCompany(dt){
 if(farm.paused)return;
 const c=farm.eastShore.company,birds=farm.eastShore.ducks;
 if(c.day!==farm.day)Object.assign(c,{day:farm.day,chosen:hash(farm.day,0,883)<.6*(1-seasonTransition().winter),started:false,remaining:0});
 if(c.remaining>0){
  if(!eastDuckCompanyConditions()){c.remaining=0;return;}
  c.remaining=Math.max(0,c.remaining-dt);
  if(!c.remaining){c.count++;c.lastDay=farm.day;record('山脚小塘的一对鸳鸯停在近处，向彼此转头理羽，又慢慢回到自己的游水节奏。');save();}
  return;
 }
 if(!c.chosen||c.started||!eastDuckCompanyConditions()||birds.some(b=>b.wait<2.5))return;
 c.started=true;c.remaining=2.4;birds[0].dir=birds[1].x<birds[0].x?-1:1;birds[1].dir=-birds[0].dir;
}
