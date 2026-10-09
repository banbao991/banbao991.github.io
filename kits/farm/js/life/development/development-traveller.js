'use strict';
// Improvement prerequisites and restoration of an earlier traveller's pending move.
function villageTownProjectReady(id) {
  if(!villageSiteOpen('traveller'))return false;
  const need=({wetlandNest:'herbs',meadowFlowers:'herbs',teaChimes:'scenic',travellerGarden:'traveller',donkeyInn:'donkeyRoad'})[id];
  return !need||villageSiteOpen(need);
}
function villageSettleTraveller(dt) {
  const a=farm.town.traveller;
  if(!a.villageSettling)return false;
  if(farm.town.construction)return false;
  if(farm.paused)return true;
  if(isFestivalDay()){updateFestivalActor(a,dt,VILLAGE_CREW_HOME.door,13,'construction');return true;}
  if(a.festival?.stage==='back'){if(festivalMove(a,a.festival.back,dt))a.festival=null;return true;}
  if(a.festival){a.festival=null;a.path=[];a.goal=null;}
  if(villageActorMove(a,TOWN_LAYOUT.home.door,dt)){
    a.villageSettling=false;a.mode='home';a.route=[];a.index=0;a.path=[];
    townNote('阿棠把旅途行李放进新驿屋，村口又多了一处温暖的落脚点。',true);
  }return true;
}
