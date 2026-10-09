'use strict';
// A saved, optional festival evening. Motion uses world time; flame shimmer uses display time.
function townLanternOffer() {
  const tier=Math.max(0,TOWN_WEALTH_LEVELS.reduce((level,coins,index)=>farm.coins>=coins?index:level,0));
  const count=[3,4,6,8][tier];
  return {count,cost:count*35};
}
function townLanternWeatherOK() {
  const weather=weatherVisual();
  return farm.weather!=='rain' && farm.weather!=='snow' && weather.rain<.25 && weather.snow<.25;
}
function townCanLaunchLanterns(automatic=false) {
  return isFestivalDay() && farm.coins>=TOWN_MERCHANT_MIN_COINS
    && farm.phase>=.38 && farm.phase<.43 && townLanternWeatherOK()
    && !(farm.town.lanternEvent.day===farm.day && farm.town.lanternEvent.launched)
    && townCanSpend(townLanternOffer().cost,automatic);
}
function townLaunchLanterns(automatic=false) {
  if(!townCanLaunchLanterns(automatic))return false;
  const {count,cost}=townLanternOffer(),stage=CENTRAL_PLAZA.stage;
  if(!townSpend(cost,'lanterns',automatic))return false;
  const event=farm.town.lanternEvent;
  Object.assign(event,{day:farm.day,launched:true,cost,lanterns:Array.from({length:count},(_,id)=>({
    id,x:stage.x-80+id*160/(count-1),y:stage.y+52+id%2*14,age:0,wait:id*.7,variant:id%3
  }))});
  farm.town.lanternCount++;
  townNote(`${automatic?'村民一起':'你为大家'}点亮 ${count} 盏欢庆纸灯，花费 ${cost} 金。`,true);
  updateUI();save();return true;
}
function townLanternPosition(lantern) {
  return {x:lantern.x+Math.sin(lantern.age*.32+lantern.id)*lantern.age*.7,
    y:lantern.y-lantern.age*(13+lantern.id*.65)};
}
function townLanternOpacity(lantern) { return clamp((26-lantern.age)/7,0,1); }
function updateTownLanterns(dt) {
  if(farm.paused)return;
  const event=farm.town.lanternEvent;
  if(event.day!==farm.day){
    Object.assign(event,makeTownLanternEvent(),{day:farm.day,
      chosen:isFestivalDay() && farm.coins>=TOWN_MERCHANT_MIN_COINS && townRandom()<.35});
  }
  if(event.chosen && !event.launched && farm.phase>=.40 && farm.phase<.43)townLaunchLanterns(true);
  for(const lantern of event.lanterns){
    const delay=Math.min(dt,lantern.wait);lantern.wait-=delay;lantern.age+=dt-delay;
  }
  event.lanterns=event.lanterns.filter(lantern=>lantern.age<26);
}
function townLanternStatus() {
  if(!villageSiteOpen('plaza'))return '广场建成后，可以在欢庆日举办纸灯小会。';
  const event=farm.town.lanternEvent;
  if(event.day===farm.day && event.launched)return event.lanterns.length
    ? `纸灯正缓缓升起 · 还看得见 ${event.lanterns.length} 盏 · 本次 ${event.cost} 金`
    : `本次纸灯已散入夜色 · 花费 ${event.cost} 金，今天不再重复举办`;
  if(!isFestivalDay())return `下一次欢庆是第 ${Math.floor(farm.day/10+1)*10} 天 · 已举办 ${farm.town.lanternCount} 次纸灯小会`;
  if(farm.coins<TOWN_MERCHANT_MIN_COINS)return '积蓄达到 5000 金后，可以为欢庆夜添几盏纸灯。';
  if(farm.phase>=.43)return '散场前点灯的时段已过，下一次欢庆再相聚。';
  if(!townLanternWeatherOK())return '雨雪中暂不点灯，等天气转好且仍在傍晚时段再决定。';
  return `${event.chosen?'今天计划点亮纸灯，公共预算充足时会举办':'今天还没安排纸灯小会，你可以为大家举办'} · 散场前 15:07–16:19 点灯，随后升入暮色`;
}
