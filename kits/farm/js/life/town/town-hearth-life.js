'use strict';
function townHearthAtHome(){const actor=farm.town.traveller;return villageSiteOpen('traveller')&&actor.mode!=='away'
  &&(actor.mode==='home'||festivalAtHome(actor))&&distance(actor,TOWN_LAYOUT.home.door)<3;}
function updateTownHearth(dt){
  if(farm.paused)return;
  const town=farm.town,hearth=town.hearth;
  const cold=seasonTransition().winter>.5,night=farm.phase>=NIGHT_START&&farm.phase<.95;
  if(hearth.active&&(!cold||!night||!townHearthAtHome()||hearth.day!==farm.day)){
    hearth.active=false;save();
  }
  if(cold&&night&&townHearthAtHome()&&hearth.day!==farm.day&&town.inventory.firewood>0){
    hearth.day=farm.day;hearth.chosen=townRandom()<.8;
    if(hearth.chosen){town.inventory.firewood--;hearth.active=true;hearth.nights++;
      townNote('阿棠回到驿屋，添了一份木柴。窗边渐渐亮起炉光，旅途的寒意留在门外。');}
    save();
  }
  hearth.glow=clamp(hearth.glow+dt*(hearth.active?.4:-.3),0,1);
}
function townHearthDescription(){const town=farm.town,hearth=town.hearth;
  return `驿屋暖炉 · 木柴 ${town.inventory.firewood}/8 份 · ${hearth.active?'屋里正暖着':hearth.glow>.01?'余火慢慢暗下去':'冷夜回屋后偶尔生火'} · 已暖过 ${hearth.nights} 夜`;
}
