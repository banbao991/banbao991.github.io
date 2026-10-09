'use strict';
// Paid tea moves in the craftsperson's bag before it reaches the southern pavilion.
function townPrepareTeaParcel(actor) {
  townPrepareSnackParcel();
  const town=farm.town;
  if(town.construction?.id!=='teaChimes' || actor.carriedTea>0)return;
  const count=Math.min(2,4-town.pavilion.tea,town.inventory.teaBlend);
  if(count<=0)return;
  actor.carriedTea=count;town.inventory.teaBlend-=count;
  townNote(`阿棠随身带上 ${count} 包花茶，准备在茶亭修缮时交给小茶箱。`);
}
function townDeliverTeaParcel(actor) {
  townDeliverSnackParcel(actor);
  const count=Math.min(actor.carriedTea,4-farm.town.pavilion.tea);
  if(count<=0)return;
  farm.town.pavilion.tea+=count;actor.carriedTea-=count;
  townNote(`阿棠把 ${count} 包花茶放进南谷茶亭的小茶箱，沿途的茶香留给歇脚的人。`);
  save();
}
function townReturnTeaParcel(actor) {
  townReturnSnackParcel();
  const count=Math.min(actor.carriedTea,TOWN_GOODS.teaBlend.stock-farm.town.inventory.teaBlend);
  if(count<=0)return;
  actor.carriedTea-=count;farm.town.inventory.teaBlend+=count;
  townNote(`阿棠回到驿屋，把未交付的 ${count} 包花茶放回货架。`);
  save();
}
function updateTownPavilionTea() {
  if(farm.paused || isFestivalDay() || miner.mode!=='teaRest' || !miner.deliveryDay)return;
  const town=farm.town,pavilion=town.pavilion;
  if(pavilion.minerTrip===miner.deliveryDay || pavilion.tea<=0)return;
  pavilion.minerTrip=miner.deliveryDay;pavilion.tea--;pavilion.served++;town.teaServed++;
  miner.waveUntil=now+2;
  townNote('阿矿送完矿石来到茶亭，从小茶箱取了一杯山谷花茶，听风铃慢慢喝。');
  save();
}
