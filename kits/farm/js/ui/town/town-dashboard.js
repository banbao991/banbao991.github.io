'use strict';
// Stable controls preserve the reader's scroll position while the town evolves.
let townEventSignature = '';
function updateTownUI() {
  const town = farm.town, actor = town.traveller;
  $('town-card').hidden = town.visits === 0;
  const innReady=villageSiteOpen('traveller');
  $('town-summary').textContent = !innReady ? '旅人驿屋建成后迎来旅人' : town.merchantUnlocked ? `阿棠 · 来访 ${town.visits} 次` : '5000 金后迎来旅人';
  $('town-budget').value = town.budgetMode;
  $('town-budget-detail').textContent = `本季自动预算剩余 ${townBudgetLeft()} / ${town.allowance} 金 · 已用 ${town.seasonSpent} 金 · 保留 ${townReserve()} 金经营储备`;
  $('town-spent').textContent = `累计支出 ${town.spentTotal} 金 · 手作 ${town.spending.goods} · 补给养护 ${town.spending.care} · 建设 ${town.spending.projects} · 纸灯 ${town.spending.lanterns} · 茶会 ${town.spending.gatherings} · 出游 ${town.spending.outings}`;
  $('town-merchant-status').textContent = !innReady ? '阿棠将在旅人驿屋建成、积蓄至少 5000 金后择日来访。'
    : !town.merchantUnlocked ? '积蓄达到 5000 金时，阿棠才开始把苔谷加入行程。'
    : actor.mode === 'away' ? `正在旅途中 · 第 ${town.nextVisit} 天起择日来访，积蓄至少 5000 金时停靠`
    : `阿棠 · ${townTravellerActivity()} · 本趟备货：${TOWN_WEALTH_NAMES[actor.tier]} · ${townShopOpen() ? '营业中' : actor.mode==='rest'||actor.target==='tea'?'暂时离柜，小歇后回来':actor.target==='flowers'?'暂时离柜，浇完花回来':'暂未营业'}`;
  $('town-map-shop-status').textContent = $('town-merchant-status').textContent;
  if ((!innReady || actor.mode === 'away') && !townPostcardAlbumOpen) $('town-map-shop').hidden = true;
  $('town-map-shop-title').textContent=townPostcardAlbumOpen?'旅途明信片图册':'阿棠的小货车';
  for (let i = 0; i < 5; i++) for (const prefix of ['town-buy-', 'town-map-buy-']) {
    const button = $(`${prefix}${i}`), offer = actor.mode === 'away' ? null : actor.offers[i];
    button.hidden = !offer;
    if (!offer) continue;
    const good = TOWN_GOODS[offer.id];
    button.textContent = `${good.name} · ${offer.price} 金${offer.regularPrice ? ' · 八折' : ''}${offer.sold ? ' · 已购' : ''}`;
    button.title = `${offer.regularPrice ? `旅途特价：原价 ${offer.regularPrice} 金，本趟八折 ${offer.price} 金。 ` : ''}${good.description} 现有 ${town.inventory[offer.id]} / ${good.stock}${offer.id==='snackBox'?' 份':''}。`;
    button.disabled = offer.sold || !townShopOpen() || town.inventory[offer.id] >= good.stock
      || good.quantity && town.inventory[offer.id]+good.quantity>good.stock
      || !townCanSpend(offer.price);
  }
  $('town-inventory').textContent = Object.entries(town.inventory).filter(([, count]) => count > 0)
    .map(([id, count]) => id==='snackBox'?`四季茶点 × ${count} 份`:`${TOWN_GOODS[id].name} × ${count}`).join(' · ') || '暂未添置手作或补给。';
  $('town-tea').textContent = `已招待 ${town.teaServed} 杯花茶（茶亭 ${town.pavilion.served} 杯）· 阿棠自用 ${town.selfTea} 杯 · 茶亭存茶 ${town.pavilion.tea}/4 包 · 鸟儿 ${town.birds.length+(town.birdBath.bird?1:0)} 只 · 蝴蝶 ${town.butterflies.length} 只 · 萤火虫 ${town.fireflies.length} 只`;
  $('town-bird-meal-status').textContent=townBirdMealDescription();
  $('town-hearth').textContent=townHearthDescription();
  const rainText=townRainGearDescription();
  for (const prefix of ['town-','town-map-']) {
    $(`${prefix}rain-gear`).textContent=rainText;
    $(`${prefix}rain-palette`).disabled=!town.inventory.rainGear;
  }
  $('town-snack-status').textContent=townSnackDescription();
  $('town-child-snack-status').textContent=townChildSnackDescription();
  $('town-music-status').textContent=townMusicDescription();
  $('town-chime-status').textContent=townChimeSummary();
  $('town-porch-light-status').textContent=townPorchLightSummary();
  for(let i=0;i<3;i++)$('town-porch-light-locate-'+i).hidden=!town.porchLights.pieces[i];
  for(let i=0;i<3;i++)$('town-chime-locate-'+i).hidden=!farm.town.chimes.pieces[i];
  $('town-fodder-status').textContent=townFodderDescription();
  $('town-donkey-water-status').textContent=townDonkeyWaterDescription();
  $('town-donkey-water-refill').hidden=!townDonkeyWaterBuilt();
  $('town-nectar').textContent=townNectarDescription();
  $('town-birdbath').textContent=town.inventory.birdNest
    ?`溪畔浅水盘 · 水量 ${Math.round(town.birdBath.water*100)}% · ${townBathBirdActivity()} · 浴鸟已来访 ${town.birdBath.visits} 次`
    :'溪畔巢箱添好后，雨水会留在浅盘里，晴暖白天偶尔有白鹡鸰来洗澡。';
  const names={sparrow:'小雀',kingfisher:'翠鸟',robin:'知更鸟',snail:'蜗牛',hedgehog:'刺猬',firefly:'萤光夜',wagtail:'白鹡鸰',butterfly:'蝴蝶'};
  $('town-observations').textContent = '已记录偶遇：'+Object.entries(town.observations)
    .map(([id,count])=>`${names[id]} ${count} 次`).join(' · ');
  $('town-dog-status').textContent=town.dog.present?`旅伴豆豆 · ${town.dog.mode==='home'?'在驿屋里休息':town.dog.target==='leave'?'沿村路道别':town.dog.target==='home'?'回屋休息':townDogStretchActive()?'在草地上伸懒腰':town.dog.mode==='rest'?'在草地歇脚':'在驿屋附近散步'}`:'阿棠有时会带着旅伴小狗豆豆一起来，留下几天再继续旅行。';
  if(town.dog.present && town.dog.friendDay===farm.day)
    $('town-dog-status').textContent+=` · 今天认识了${town.dog.friendName}`;
  $('town-inventory').textContent+=town.inventory.petToy?` · 猫咪玩球 ${town.catPlay.sessions} 回`:'';
  if(town.inventory.flowerPot)$('town-inventory').textContent+=` · 花盆浇水 ${town.flowerCare.waterings} 次`;
  if(town.donkeys.length)$('town-inventory').textContent+=` · 小驴 ${town.donkeys.map(animal=>TOWN_DONKEY_NAMES[animal.id]).join('、')}`;
  $('town-donkey-status').textContent=town.improvements.donkeyInn.level
    ?`已建 ${town.improvements.donkeyInn.level}/3 阶段 · ${townDonkeyBondActive()?TOWN_DONKEY_NAMES.join('与')+(town.donkeyBond.stage==='out'?'慢慢走近':'轻轻蹭鼻子'):town.donkeys.map(animal=>`${TOWN_DONKEY_NAMES[animal.id]}${townDonkeyActivity(animal)}`).join('、') || '正准备迎来小驴'}`
    :'矿坡东侧山脊外的草地，50000 金起可逐步建设小驴驿。';
  updateTownDonkeyVisitUI();
  updateTownBoatUI();
  updateTownTeaPartyUI();
  updateTownSketchUI();
  updateTownPostcardUI();
  $('east-shore-status').textContent=`东缘林泉与山脚小塘 · 鸳鸯游水 ${farm.eastShore.ducks.filter(b=>b.mode!=='sleep').length}/2 · 刺猬${farm.eastShore.hedge.mode==='hide'?'在落叶窝休息':'在岸边觅食'} · 已观察 ${farm.eastShore.observations} 次 · 野果已吃 ${farm.eastShore.meals} 份 · ${eastDuckCompanyActive()?'鸳鸯正在相伴理羽':`已相伴 ${farm.eastShore.company.count} 回`}`;
  $('east-woods-status').textContent=`东缘林地 · 山雉外出 ${farm.eastWoods.birds.filter(b=>b.mode!=='home').length}/2 · 栎树、山楂和云杉 · 已观察 ${farm.eastWoods.observations} 次 · 阿森招呼 ${farm.eastWoods.keeperVisits} 次`;
  $('east-woods-status').textContent+=`；林梢花栗鼠 ${farm.eastCanopy.chipmunks.filter(a=>a.mode!=='home').length}/2 · 啄木鸟${farm.eastCanopy.woodpecker.mode==='nest'?'在树洞歇息':'在树间活动'} · 已观察 ${farm.eastCanopy.observations} 次`;
  const keepsakes=townCurioSlots();
  $('town-curio-summary').textContent=`屋旁已经陈列 ${keepsakes.filter(slot=>town.inventory[slot.id]).length}/${keepsakes.length} 件小收藏。点下方收藏，去故事里的地方看看。`;
  for(const slot of keepsakes){const good=TOWN_GOODS[slot.id],button=$(`town-curio-${slot.id}`);
    button.textContent=`${good.name} · ${town.inventory[slot.id]?'去故事里看看 ↗':`未收集 / ${TOWN_WEALTH_LEVELS[good.tier]} 金起有机会带来`}`;
    button.title=good.description;button.disabled=!town.inventory[slot.id];
  }
  const job = town.construction;
  $('town-construction').textContent = job ? `${TOWN_PROJECTS[job.id].name} · ${job.kind === 'care' ? '季节照料' : `第 ${job.level} 阶段`} · ${Math.floor(job.progress * 100)}% · 已付 ${job.cost} 金${isFestivalDay() ? ' · 欢庆日停工' : farm.phase >= townProjectStop(job.id) ? ' · 明天继续' : ''}`
    : '阿棠擅长修木架、种花与做小手工。营业时可选购手作，也可以请他修缮小镇。';
  $('town-map-construction').textContent = $('town-construction').textContent;
  $('town-development-plan').textContent = townDevelopmentDescription();
  $('town-map-development-plan').textContent = $('town-development-plan').textContent;
  $('town-care-summary').textContent = `已完成 ${town.maintenanceCount} 次养护。风雨会带来照料需求，暂不照料也会保留设施。`;
  $('town-map-care-summary').textContent = $('town-care-summary').textContent;
  const story=TOWN_STORIES[actor.storyIndex];
  for(const prefix of ['town-','town-map-']) {
    $(`${prefix}story`).textContent=story ? actor.storyHeard ? townStoryText() : `这趟带来的故事：「${story.title}」`
      : '阿棠还在路上，来访时会带一段当季的故事。';
    const button=$(`${prefix}listen`);button.textContent=actor.storyHeard?'本趟故事已经听过了':'听阿棠讲故事';
    button.disabled=!townShopOpen() || actor.storyIndex<0 || actor.storyHeard;
    $(`${prefix}greetings`).textContent=actor.greetings.names.length
      ? `第 ${actor.greetings.day} 天路上遇见：${actor.greetings.names.join('、')}` : '路上遇见正在活动的居民时，阿棠会挥手打招呼。';
  }
  Object.keys(TOWN_PROJECTS).forEach((id, index) => {
    const level = town.improvements[id].level;
    for (const prefix of ['town-project-', 'town-map-project-']) {
      const button = $(`${prefix}${index}`);
      button.textContent = `${TOWN_PROJECTS[id].name} · ${level >= 3 ? '已完成三阶段' : `${level + 1} 阶段 / ${townProjectPrice(id)} 金`}`;
      button.disabled = !townCanCommission(id);
      button.title = `${TOWN_PROJECTS[id].description} 目前 ${level}/3 阶段。${level < 3 ? `委托时积蓄需要 ${townProjectMinimum(id)} 金，阿棠营业时受理。` : '三个阶段都已完成。'}`;
    }
    for (const prefix of ['town-care-', 'town-map-care-']) {
      const button = $(`${prefix}${index}`);
      button.textContent = `${TOWN_PROJECTS[id].name} · ${level ? `${townCarePrice(id)} 金 / ${townCareDescription(id)}` : '尚未建设'}`;
      button.title = '整理木作、补土浇花。需要照料时可请阿棠来整理；小镇也会按公共预算自动安排。';
      button.disabled = !townCanCare(id);
    }
  });
  const signature = JSON.stringify(town.events);
  if (signature !== townEventSignature) {
    townEventSignature = signature;
    const list = $('town-events'), scroll = list.scrollTop || 0;
    list.replaceChildren(...town.events.map(event => {
      const li = document.createElement('li'); li.textContent = `第 ${event.day} 天 · ${playerJournalText(event.text)}`; return li;
    }));
    list.scrollTop = scroll;
  }
}
$('town-budget').addEventListener('change', event => townSetBudget(event.target.value));
for (const id of ['town-rain-palette','town-map-rain-palette']) $(id).addEventListener('click',townChangeRainPalette);
$('town-bird-meal-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.feeding.x,TOWN_LAYOUT.feeding.y));
$('town-birdbath-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.birdBath.water.x,TOWN_LAYOUT.birdBath.water.y));
$('town-locate').addEventListener('click', () => centerCamera(TOWN_LAYOUT.cart.x, TOWN_LAYOUT.cart.y));
$('town-donkey-water-refill').addEventListener('click',()=>refillTownDonkeyWater());
$('town-donkey-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.projects.donkeyInn.x,TOWN_LAYOUT.projects.donkeyInn.y));
for (let i = 0; i < 5; i++) for (const prefix of ['town-buy-', 'town-map-buy-']) $(`${prefix}${i}`).addEventListener('click', () => {
  const offer = farm.town.traveller.offers[i];
  if (offer && !townBuy(offer.id)) record('这件商品暂时不能购买：请留意营业时间、库存和经营储备。');
});
$('town-map-shop-close').addEventListener('click',closeTownPostcardPanel);
// Close before the next map click, so clicking the cart can open the shelf again.
document.addEventListener('pointerdown', event => {
  if (event.button !== undefined && event.button !== 0) return;
  const panel = $('town-map-shop');
  if (!panel.hidden && !panel.contains(event.target)) closeTownPostcardPanel();
});
Object.keys(TOWN_PROJECTS).forEach((id, index) => { for (const prefix of ['town-project-', 'town-map-project-']) $(`${prefix}${index}`).addEventListener('click', () => {
  if (!townCommission(id)) record('这项修缮暂时不能委托：请先等阿棠营业、上一项完工，并留足积蓄和经营储备。');
}); });
Object.keys(TOWN_PROJECTS).forEach((id,index)=>{for(const prefix of ['town-care-','town-map-care-']) $(`${prefix}${index}`).addEventListener('click',()=>{
  if(!townCommissionCare(id))record('目前无需照料或不能受理：等阿棠营业与上一项完工，并保留经营储备。');
});});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeTownPostcardPanel();
});
for(const id of ['town-listen','town-map-listen'])$(id).addEventListener('click',townReadStory);
for(const slot of townCurioSlots())$(`town-curio-${slot.id}`).addEventListener('click',()=>{
  if(!farm.town.inventory[slot.id])return;
  const point=slot.id==='riverPlate'?{x:LAKE_X,y:LAKE_Y}:slot.id==='forestCarving'?FOREST_HOME:slot.id==='pressedLeaves'?EAST_WOODS.trees[0]:slot.id==='pheasantClay'?farm.eastWoods.birds[0]:slot.id==='seedJar'?EAST_GARDEN_EXTENSION.beds[0]:MINE_LAYOUT.nodes[2];
  centerCamera(point.x,point.y);record(TOWN_GOODS[slot.id].description);save();
});

$('town-nectar-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.flowerPatch.x,TOWN_LAYOUT.flowerPatch.y));

for(let i=0;i<3;i++)$('town-chime-locate-'+i).addEventListener('click',()=>{const point=TOWN_LAYOUT.chimes[i];centerCamera(point.x,point.y);});

for(let i=0;i<3;i++)$('town-porch-light-locate-'+i).addEventListener('click',()=>{const point=TOWN_LAYOUT.porchLights[i];centerCamera(point.x,point.y);});

$('town-snack-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.pavilionTea.x,TOWN_LAYOUT.pavilionTea.y));
$('town-child-snack-locate').addEventListener('click',()=>centerCamera(TOWN_LAYOUT.tea.x,TOWN_LAYOUT.tea.y));

$('east-woods-locate').addEventListener('click',()=>centerCamera(2300,360));
$('east-canopy-locate').addEventListener('click',()=>centerCamera(2310,170));
$('east-garden-locate').addEventListener('click',()=>centerCamera(2240,1180));
$('east-picnic-locate').addEventListener('click',()=>centerCamera(EAST_PICNIC.bench.x,EAST_PICNIC.bench.y));

$('east-spring-locate').addEventListener('click',()=>centerCamera(EAST_SHORE.spring.x,EAST_SHORE.spring.y));
$('east-pond-locate').addEventListener('click',()=>centerCamera(EAST_SHORE.pond.x,EAST_SHORE.pond.y));
