'use strict';
// Traveller, worksites and wildlife use the same world anchors as the drawing queue.
function townDescribe(x, y) {
  const paperBoat=townPaperBoatAt(x,y);
  if(paperBoat)return {target:paperBoat,kind:'paper-boat',text:`溪桥小纸船 · 顺流漂向下游 · ${paperBoat.noticed?'这一只已经看过':'点击安静看看'}`};
  if(chickenMealAt(x,y))return {target:TOWN_LAYOUT.henMeal.tray,kind:'hen-meal',text:chickenMealDescription()+' · 阿棠的小货车可买谷粒'};
  const donkey=townDonkeyAt(x,y);
  if(donkey)return {target:donkey,kind:'donkey',text:`东岸小驴${TOWN_DONKEY_NAMES[donkey.id]} · ${townDonkeyActivity(donkey)} · 点击打招呼`};
  if(townDogAt(x,y))return {target:farm.town.dog,text:`旅伴小狗豆豆 · ${farm.town.dog.target==='leave'?'沿村路道别':farm.town.dog.target==='home'?'回驿屋休息':townDogStretchActive()?'在草地上舒展前爪、伸懒腰':farm.town.dog.mode==='rest'?'在草地上歇脚':'慢慢散步'} · 点击打招呼`};
  const lantern=townLanternAt(x,y);
  if(lantern)return {target:lantern,text:`欢庆纸灯 · ${lantern.age>0?'缓缓升入夜色':'正等待点亮'} · 本次花费 ${farm.town.lanternEvent.cost} 金`};
  const firefly=townFireflyAt(x,y);
  if(firefly)return {target:firefly,text:`${firefly.habitat==='wetland'?'湿地芦苇':'蜜源花园'}萤火虫 · ${farm.town.fireflyChoice.observed?'这一夜的萤光已经记下':'点击安静观察这一夜的萤光'}`};
  if (!farm.town.merchantUnlocked) return null;
  const postcard=townPostcardAt(x,y);
  if(postcard)return {target:postcard,kind:'postcard',text:townPostcardDescription()};
  const porchLight=townPorchLightAt(x,y);
  if(porchLight)return {target:porchLight,kind:'porch-light',text:townPorchLightDescription(porchLight.id)};
  const chime=townChimeAt(x,y);
  if(chime)return {target:chime,kind:'windchime',text:townChimeDescription(chime.id)};
  const trough=townDonkeyWaterAt(x,y);
  if(trough)return {target:trough,kind:'donkey-water',text:townDonkeyWaterDescription()+' · 点击免费添清水，雨水与驴驿养护也会补水'};
  const fodder=TOWN_LAYOUT.fodder.rack;
  if(farm.town.improvements.donkeyInn.level&&inRect(x,y,fodder.x-19,fodder.y-18,fodder.x+19,fodder.y+13))
    return {target:fodder,text:townFodderDescription()+' · 阿棠的货车可以买到干牧草'};
  const donkeyGate=TOWN_LAYOUT.donkeyInn.gate,donkeyNotice=TOWN_LAYOUT.donkeyInn.notice;
  if(farm.town.improvements.donkeyInn.level && (inRect(x,y,donkeyGate.x-6,donkeyGate.y-18,donkeyGate.x+12,donkeyGate.y+18)
    || inRect(x,y,donkeyNotice.x-15,donkeyNotice.y-11,donkeyNotice.x+15,donkeyNotice.y+28)))
    return {target:donkeyGate,kind:'donkey-gate',text:'东岸驴驿小门 · 点击查看阿宁探访的条件与零食费用'};
  if (plazaCatAt(x, y)) return null;
  const catWater=TOWN_LAYOUT.catWater.water;
  if(townCatWaterBuilt()&&inRect(x,y,catWater.x-10,catWater.y-5,catWater.x+10,catWater.y+7))
    return {target:catWater,kind:'cat-water',text:townCatWaterDescription()+' · 点击免费添一碗清水，雨水与猫棚养护也会补水'};
  const actor = farm.town.traveller;
  const canopy=townRainCanopyAt(x,y);
  if(canopy)return {target:canopy.actor,kind:canopy.owner==='child'?'rain-child':'rain-merchant',
    text:`${canopy.owner==='child'?'阿宁':'旅行商人阿棠'} · 撑着${TOWN_RAIN_PALETTES[farm.town.rainGear.palette].name}布伞 · ${canopy.owner==='child'?'点击打招呼':'点击查看本趟商品'}`};
  if(townRainHookAt(x,y))return {target:TOWN_LAYOUT.rainHookOffset,kind:'rain-hook',text:townRainGearDescription()+' · 点击免费换配色'};
  const sketch=townSketchBookAt(x,y);
  if(sketch)return {target:TOWN_LAYOUT.sketchOffset,kind:'sketchbook',text:townSketchDescription()+' · 点击翻看画册'};
  const job = farm.town.construction;
  if (job) {
    const materials = TOWN_LAYOUT.projects[job.id].materials;
    if (Math.abs(x - materials.x) < 25 && y > materials.y - 30 && y < materials.y + 13)
      return { target: job, text: `${TOWN_PROJECTS[job.id].name}${job.kind === 'care' ? '养护工具' : '修缮材料'} · ${Math.floor(job.progress * 100)}% · 已付 ${job.cost} 金` };
  }
  if (townTravellerVisible() && Math.abs(x - actor.x) < 16 && y > actor.y - 24 && y < actor.y + 23)
    return { target: actor, text: `旅行商人阿棠 · ${townTravellerActivity()}${actor.carriedTea?` · 随身花茶 ${actor.carriedTea} 包`:''} · 点击查看本趟商品` };
  const bathBird=townBathBirdAt(x,y);
  if(bathBird)return {target:bathBird,kind:'bath-bird',text:`溪畔白鹡鸰 · ${townBathBirdActivity()} · 点击记下这次偶遇`};
  const bath=TOWN_LAYOUT.birdBath;
  if(villageSiteOpen('herbs') && farm.town.inventory.birdNest && inRect(x,y,bath.water.x-11,bath.water.y-4,bath.water.x+11,bath.water.y+4))
    return {target:bath,text:`溪畔浅水盘 · 水量 ${Math.round(farm.town.birdBath.water*100)}% · ${townBathBirdActivity()} · 雨水补给，晴天慢慢蒸发`};
  for (const bird of farm.town.birds) if (Math.abs(x - bird.x) < 20 && Math.abs(y - bird.y + 5) < 17)
    return { target: bird, text: `${bird.variant===1 ? '溪畔翠鸟' : bird.variant===2 ? '冬日知更鸟' : '驿屋小雀'} · ${townBirdMealActivity(bird)} · 点击记下这次偶遇` };
  for (const animal of farm.town.critters) if(animal.mode!=='hide' && Math.abs(x-animal.x)<19 && Math.abs(y-animal.y+3)<13)
    return {target:animal,text:`${animal.kind==='snail'?'花园小蜗牛':'秋日刺猬'} · ${animal.shy>0?'安静地缩着歇一会儿':animal.mode==='leave'?'正慢慢回到叶堆':'在草叶间寻找食物'} · 点击安静观察`};
  for (const butterfly of farm.town.butterflies) if (distance({ x, y }, butterfly) < 12)
    return {target:butterfly,kind:'butterfly',text:`蜜源花园的蝴蝶 · ${townButterflyActivity(butterfly)} · 已吸蜜 ${butterfly.sips}/3 回 · 点击安静观察`};
  // Residents standing in a facility still receive their own interaction.
  if(workerAt(x,y) || courierAt(x,y) || nurseryKeeperAt(x,y) || minerAt(x,y)
    || forestKeeperAt(x,y) || villagerAt(x,y) || orderKeeperAt(x,y) || anglerAt(x,y))return null;
  const east=eastSceneryDescription(x,y);if(east)return east;
  for(const shelf of TOWN_LAYOUT.showcases){
  if(inRect(x,y,shelf.left-3,shelf.top,shelf.right+3,shelf.bottom+3)
    && shelf.slots.some(slot=>farm.town.inventory[slot.id])){
    const slot=shelf.slots.find(slot=>farm.town.inventory[slot.id] && Math.abs(x-slot.x)<17 && y>slot.y-26 && y<slot.y+2);
    return {target:shelf,text:slot?`驿屋小收藏 · ${TOWN_GOODS[slot.id].description}`
      :`驿屋小收藏柜 · ${shelf.slots.filter(slot=>farm.town.inventory[slot.id]).map(slot=>TOWN_GOODS[slot.id].name).join('、')} · 收藏卡片可定位故事里的地方`};
  }
  }
  for(let i=0;i<farm.town.inventory.flowerPot;i++) {
    const pot=TOWN_LAYOUT.flowerPots[i];
    if(inRect(x,y,pot.x-10,pot.y-30,pot.x+10,pot.y+2))
      return {target:pot,kind:'flower-pot',text:`驿屋四季花盆 · ${townPlantGrowth('flowerPot',i)>=1?'花株已经长大':`新花长势 ${Math.floor(townPlantGrowth('flowerPot',i)*100)}%`} · ${townFlowerSoilText(i)} · 点击请阿棠看看`};
  }
  const toy=townCatToyAt(x,y);
  if(toy)return {target:toy,kind:'cat-toy',text:`猫咪毛线球 · ${toy.rolling?'轻轻滚动':farm.town.catPlay.active>=0?'猫咪正追着玩':'点击招呼猫咪来玩'} · 今日每只猫最多一回，累了就歇脚`};
  if(farm.town.inventory.butterflySeed && TOWN_LAYOUT.flowerSites.some(site=>inRect(x,y,site.x-13,site.y-27,site.x+22,site.y+12))) {
    const level=farm.town.improvements.meadowFlowers.level;
    const growth=Math.min(...Array.from({length:farm.town.inventory.butterflySeed},(_,i)=>townPlantGrowth('butterflySeed',i)));
    return {target:TOWN_LAYOUT.flowerPatch,text:`西南蜜源花园 · ${level?`${level}/3 阶段 · ${townCareDescription('meadowFlowers')} · `:''}${growth>=1?'花株已经长大':`新花长势 ${Math.floor(growth*100)}%`} · 可吸蜜花头 ${townButterflyFlowers().length} 处 · ${farm.town.butterflies.filter(b=>b.mode==='sip').length} 只蝴蝶正吸蜜`};
  }
  const wood=TOWN_LAYOUT.hearth.wood;
  if(farm.town.inventory.firewood && inRect(x,y,wood.x-10,wood.y-12,wood.x+15,wood.y+4))
    return {target:wood,text:townHearthDescription()+' · 点此查看，补柴在货车购买'};
  const home = TOWN_LAYOUT.home, cart = TOWN_LAYOUT.cart;
  if (villageSiteOpen('traveller') && inRect(x, y, home.left - 3, home.top, home.right + 3, home.bottom + 8))
    return { target: home, text: `旅人驿屋 · 阿棠来访时在此过夜 · ${actor.mode === 'home' || festivalAtHome(actor) ? '阿棠在屋里休息' : '门前留着花盆和旅途的故事'}${farm.town.dog.present&&farm.town.dog.mode==='home'?' · 豆豆也在屋里歇脚':''} · ${townHearthDescription()}` };
  const cartPosition = townCartPosition();
  if (villageSiteOpen('traveller') && actor.mode !== 'away'
    && inRect(x, y, cartPosition.x - 62, cartPosition.y - 60, cartPosition.x + 64, cartPosition.y + 43))
    return { target: cart, text: `阿棠的小货车 · ${townShopOpen() ? '营业中，点击查看商品' : '暂未营业'} · ${TOWN_WEALTH_NAMES[actor.tier]}${townSpecialOffer() ? ' · ' + townSpecialOfferHint() : ''}` };
  const music=TOWN_LAYOUT.music;
  if(farm.town.inventory.musicBox&&inRect(x,y,music.x-8,music.y-2,music.x+8,music.y+14))
    return {target:music,kind:'music-box',text:townMusicDescription()};
  if (distance({ x, y }, TOWN_LAYOUT.tea) < 26)
    return { target: TOWN_LAYOUT.tea, text: `驿屋茶桌 · ${farm.town.teaParty.stage==='tea'?`邻里茶会 · 本次点心 ${farm.town.teaParty.cost} 金 · `:townTeaPartyHosting()?'正在等邻居到座 · 尚未收费 · ':''}${farm.town.childVisit?townChildSnackDescription()+' · ':''}花茶剩余 ${farm.town.inventory.teaBlend} 杯 · 已招待 ${farm.town.teaServed} 杯 · 阿棠自用 ${farm.town.selfTea} 杯` };
  if (distance({ x, y }, TOWN_LAYOUT.feeding) < 19)
    return { target: TOWN_LAYOUT.feeding, text: townBirdMealDescription()+' · 每天最多一份谷粒' };
  if(farm.town.improvements.travellerGarden.level && distance({x,y},TOWN_LAYOUT.gardenHabitat.home)<19)
    return {target:TOWN_LAYOUT.gardenHabitat,text:'花园叶堆 · 留着落叶和湿草，蜗牛与秋日刺猬偶尔来歇脚'};
  if((farm.town.improvements.teaChimes.level || farm.town.pavilion.tea || farm.town.snacks.pantry.length)
    && inRect(x,y,TOWN_LAYOUT.pavilionTea.x-15,TOWN_LAYOUT.pavilionTea.y-13,TOWN_LAYOUT.pavilionTea.x+15,TOWN_LAYOUT.pavilionTea.y+7))
    return {target:TOWN_LAYOUT.pavilionTea,text:`南谷茶亭小茶箱 · 花茶 ${farm.town.pavilion.tea}/4 包 · 已招待 ${farm.town.pavilion.served} 杯 · ${townSnackDescription()}`};
  if (villageSiteOpen('herbs') && farm.town.inventory.birdNest && x>TOWN_LAYOUT.birdhouse.x-22 && x<TOWN_LAYOUT.birdhouse.x+37
    && y > TOWN_LAYOUT.birdhouse.y - 57 && y < TOWN_LAYOUT.birdhouse.y + 10)
    return { target: TOWN_LAYOUT.birdhouse, text: `溪畔巢箱 · 翠鸟偶尔停栖，再飞向西南小湖觅食${farm.town.improvements.wetlandNest.level ? ` · ${townCareDescription('wetlandNest')}` : ''}` };
  for (const [id, project] of Object.entries(TOWN_PROJECTS)) {
    const site = TOWN_LAYOUT.projects[id], level = farm.town.improvements[id].level;
    const stable=TOWN_LAYOUT.donkeyInn.stable;
    const bounds = id==='donkeyInn'?{left:stable.left-8,top:stable.top,right:stable.right+8,bottom:stable.bottom+7}:id === 'travellerGarden' ? { left: site.x-47, top: site.y-25, right: site.x+47, bottom: site.y+(level-1)*23+6 }
      : id === 'teaChimes' ? VALLEY_GARDEN_LAYOUT.teaHouse
      : id === 'catComfort' ? { left: site.x-25, top: site.y-29, right: site.x+39, bottom: site.y+16 }
      : { left: site.x-28, top: site.y-28, right: site.x+28, bottom: site.y+22 };
    if (level && inRect(x,y,bounds.left,bounds.top,bounds.right,bounds.bottom))
      return { target: site, text: `${project.name} · 已修 ${level}/3 阶段 · ${townCareDescription(id)} · ${project.description}` };
  }
  return null;
}
function handleTownClick(x, y) {
  const hint = townDescribe(x, y);
  if (!hint) return false;
  if(hint.kind==='paper-boat'){townObservePaperBoat(hint.target);return true;}
  if(hint.kind==='postcard'){openTownPostcardPanel();return true;}
  if(hint.kind==='sketchbook'){
    townPostcardAlbumOpen=false;
    $('town-map-lantern').hidden=true;$('town-map-donkey-visit').hidden=true;$('town-map-shop').hidden=false;
    updateUI();$('town-map-sketch-details').scrollIntoView?.({block:'nearest'});return true;
  }
  if(hint.kind==='porch-light'){toggleTownPorchLight(hint.target.id);return true;}
  if(hint.kind==='windchime'){touchTownChime(hint.target.id);return true;}
  if(hint.kind==='music-box'){windTownMusic();return true;}
  if(hint.kind==='rain-hook'){townChangeRainPalette();return true;}
  if(hint.kind==='rain-child'){villageWalker.waveUntil=now+2.3;record('阿宁轻轻转了转小布伞：“雨里的苔谷也很好看。”');save();return true;}
  if(hint.kind==='butterfly'){noticeTownAnimal(hint.target,'butterfly');updateUI();save();return true;}
  if(hint.kind==='bath-bird'){noticeTownAnimal(hint.target,'wagtail');updateUI();save();return true;}
  if(hint.kind==='donkey-gate'){openTownDonkeyVisitPanel();return true;}
  if(hint.kind==='donkey'){greetTownDonkey(hint.target);return true;}
  if(hint.kind==='flower-pot'){inviteTownFlowerCare();return true;}
  if(hint.kind==='donkey-water'){refillTownDonkeyWater();return true;}
  if(hint.kind==='cat-water'){refillTownCatWater();return true;}
  if(hint.kind==='cat-toy'){inviteTownCatPlay(hint.target);return true;}
  if(hint.target===farm.town.dog){greetTownDog();return true;}
  if (hint.target === farm.town.traveller || hint.target === TOWN_LAYOUT.cart) {
    townPostcardAlbumOpen=false;
    farm.town.traveller.waveUntil = now + 2.5;
    $('town-map-lantern').hidden = true;
    $('town-map-donkey-visit').hidden = true;
    $('town-map-shop').hidden = false;
    $('town-map-shop-close').focus?.({ preventScroll: true });
    if (!townShopOpen()) record(`阿棠 · ${townTravellerActivity()}，货架在侧栏等你来看看。`);
    updateUI(); save();
  } else {
    if(farm.town.fireflies.includes(hint.target))noticeTownFireflies();
    if(farm.town.birds.includes(hint.target))noticeTownAnimal(hint.target,
      hint.target.variant===1?'kingfisher':hint.target.variant===2?'robin':'sparrow');
    if(farm.town.critters.includes(hint.target))noticeTownAnimal(hint.target,hint.target.kind);
    record(hint.text);updateUI();save();
  }
  return true;
}
