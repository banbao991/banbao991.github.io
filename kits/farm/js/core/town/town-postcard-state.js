'use strict';
const TOWN_POSTCARD_TOPICS=['溪桥小镇','燕归村','海风灯塔','花田邮局','松岭旅店','石坡风车','月湾码头','雪谷木屋'];
const TOWN_POSTCARD_PRICES=[60,180,520,1400];
function makeTownPostcards(){return {offer:null,cards:[],selected:0,total:0,spent:0};}
function townPostcardPrice(card){return Math.round(TOWN_POSTCARD_PRICES[card.tier]*(.9+hash(card.visit,card.day,2289)*.2));}
function townPostcardTitle(card){return `${seasons[card.season].name} · ${TOWN_POSTCARD_TOPICS[card.topic]}`;}
function validateTownPostcards(town,day){
 if(!Object.hasOwn(town,'postcards'))town.postcards=makeTownPostcards();
 const p=town.postcards,integer=n=>Number.isSafeInteger(n)&&n>=0;
 const card=c=>c&&integer(c.topic)&&c.topic<8&&integer(c.season)&&c.season<4&&integer(c.tier)&&c.tier<4
  &&c.topic<2+c.tier*2&&integer(c.day)&&c.day>=1&&c.day<=day&&integer(c.visit)&&c.visit>=1&&c.visit<=town.visits;
 const fail=()=>{throw new Error('存档里的旅途明信片不正确。');};
 if(!p||!Array.isArray(p.cards)||p.cards.length>32||!integer(p.selected)||p.selected>=Math.max(1,p.cards.length)
  ||!integer(p.total)||p.total>town.visits||!integer(p.spent)||p.spent>town.spending.goods)fail();
 const keys=new Set();let copies=0,spent=0;
 for(const c of p.cards){const key=c.topic+':'+c.season;
  if(!card(c)||keys.has(key)||!integer(c.copies)||c.copies<1||!integer(c.spent)||c.spent<54*c.copies
   ||!integer(c.lastDay)||c.lastDay<c.day||c.lastDay>day||!integer(c.lastVisit)||c.lastVisit<c.visit||c.lastVisit>town.visits
   ||c.copies>c.lastVisit-c.visit+1||c.spent>1540*c.copies)fail();
  keys.add(key);copies+=c.copies;spent+=c.spent;
 }
 if(copies!==p.total||spent!==p.spent)fail();
 const o=p.offer;if(o!==null){
  if(!card(o)||o.visit!==town.visits||typeof o.bought!=='boolean'||typeof o.automatic!=='boolean'||o.price!==townPostcardPrice(o))fail();
  if(o.bought&&!p.cards.some(c=>c.topic===o.topic&&c.season===o.season&&c.lastVisit===o.visit&&c.lastDay>=o.day))fail();
 }
}
