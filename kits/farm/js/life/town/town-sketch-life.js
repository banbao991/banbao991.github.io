'use strict';
// Remember actual journeys; draw during the existing seated rest, without taking over routes.
function townSketchSites() {
  const bridge=RIVER_BRIDGES[1];
  return {
    yard:{name:'驿屋的小院',point:TOWN_LAYOUT.home.door,radius:190,text:'屋檐、花盆和货车，记着一段停靠的日子。'},
    bridge:{name:'溪流木桥',point:{x:(bridge.west+bridge.east)/2,y:bridge.y+bridge.height/2},radius:100,
      text:'走过木桥时，水面带着整座苔谷的光。'},
    pavilion:{name:'南谷茶亭',point:TOWN_LAYOUT.projects.teaChimes.work,radius:130,
      text:'山谷里留着一张茶桌，远路也可以慢慢走。'},
    donkeys:{name:'小驴牧草场',point:TOWN_LAYOUT.donkeyInn.greetSpot,radius:130,
      text:'小驴转了转耳朵，又低头闻闻草香。'}
  };
}
function townSketchSeated() {
  const actor=farm.town.traveller,weather=weatherVisual();
  return !!farm.town.inventory.sketchbook&&townTravellerVisible()&&!isFestivalDay()&&!actor.festival
    &&actor.mode==='rest'&&!townTeaPartyHosting()&&!farm.town.construction
    &&distance(actor,TOWN_LAYOUT.merchantSeat)<=2&&farm.phase>=.04&&farm.phase<.46
    &&weather.rain<.25&&weather.snow<.25;
}
function townSketchDrawing() { return !!farm.town.sketch.pending&&townSketchSeated(); }
function updateTownSketch(dt) {
  if(farm.paused)return;
  const town=farm.town,sketch=town.sketch,actor=town.traveller;
  if(townTravellerVisible()&&!festivalAtHome(actor))for(const [id,site]of Object.entries(townSketchSites())) {
    if(!sketch.seen.includes(id)&&(id!=='donkeys'||town.improvements.donkeyInn.level)
      &&distance(actor,site.point)<=site.radius)sketch.seen.push(id);
  }
  if(!townSketchSeated())return;
  if(!sketch.pending&&sketch.day!==farm.day) {
    // A failed choice is also saved. Merely opening the album never rerolls it.
    sketch.day=farm.day;
    const transition=seasonTransition(),season=transition.amount>=.5?transition.to:transition.from;
    const available=sketch.seen.filter(topic=>!sketch.pages.some(p=>p.topic===topic&&p.season===season));
    if(available.length&&townRandom()<.65) {
      sketch.pending={topic:available[Math.floor(townRandom()*available.length)],season,day:farm.day,progress:0,
        palette:{from:transition.from,to:transition.to,amount:transition.amount}};
      townNote(`阿棠打开写生册，想把${townSketchSites()[sketch.pending.topic].name}留在纸上。`);
    }
  }
  const pending=sketch.pending;
  if(!pending)return;
  sketch.day=farm.day;
  pending.progress=Math.min(1,pending.progress+dt/1.8);
  if(pending.progress===1) {
    const {progress,...page}=pending;
    sketch.pages.push({...page,finished:farm.day});sketch.selected=sketch.pages.length-1;sketch.pending=null;
    townNote(`写生册添了一页：${seasons[page.season].name} · ${townSketchSites()[page.topic].name}。`);
    save();
  }
}
function townSketchBookPoint() {
  if(!farm.town.inventory.sketchbook)return null;
  if(townSketchDrawing()) {
    const actor=farm.town.traveller;
    return {x:Math.round(actor.x),y:Math.round(actor.y)+4,open:true};
  }
  if(farm.town.traveller.mode==='away')return null;
  const cart=townCartPosition();return {x:cart.x+TOWN_LAYOUT.sketchOffset.x,y:cart.y+TOWN_LAYOUT.sketchOffset.y,open:false};
}
function townSketchBookAt(x,y) {
  const book=townSketchBookPoint();
  return book&&inRect(x,y,book.x-14,book.y-8,book.x+14,book.y+7)?book:null;
}
function townSketchDescription() {
  const sketch=farm.town.sketch;
  if(!farm.town.inventory.sketchbook)return '100000 金起有机会带来永久写生册。阿棠在歇脚时画自己走过的地方，不另收纸笔费。';
  const pending=sketch.pending;
  return `已留住 ${sketch.pages.length}/16 页 · 走过 ${sketch.seen.length}/4 处风景`
    +(pending?` · ${townSketchSites()[pending.topic].name} ${Math.floor(pending.progress*100)}%${townSketchDrawing()?'，正在落笔':'，下次小歇继续'}`
      :sketch.pages.length===16?' · 四季画册已经画满':' · 晴好午后小歇时，偶尔再添一页');
}
function townTurnSketchPage(delta) {
  const sketch=farm.town.sketch;
  if(!sketch.pages.length)return false;
  sketch.selected=(sketch.selected+delta+sketch.pages.length)%sketch.pages.length;
  updateUI();save();return true;
}
