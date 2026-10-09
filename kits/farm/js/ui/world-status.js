'use strict';
// Current activities share the same helpers as map hints; disclosure panels stay open during updates.
function updateWorldStatusUI() {
  const celebration = farm.celebration;
  $('plaza-life-status').textContent = `两只猫${plazaCats.every(cat => cat.mode === 'home')
    ? plazaCatsBadWeather() ? '在猫屋避雨雪' : '在猫屋休息' : `外出 ${plazaCats.filter(plazaCatVisible).length}/2`} · 麻雀 ${plazaSparrows.filter(plazaSparrowVisible).length} 只 · ${plazaCatCompanyDescription()}${townCatWaterDescription()?' · '+townCatWaterDescription():''}${plazaEavesDescription()?' · '+plazaEavesDescription():''}`;
  const celebrating = isFestivalDay() && celebration.day === farm.day;
  const plazaReady=villageSiteOpen('plaza');
  $('festival-status').textContent = !plazaReady ? '广场建成后开启欢庆'
    : celebrating
    ? `${festivalTheme().name} · ${FESTIVAL_LEVELS[celebration.level].name}`
    : `下次欢庆：第 ${Math.floor(farm.day / 10 + 1) * 10} 天`;
  $('festival-budget-status').textContent = !plazaReady ? '尚未筹备欢庆'
    : celebrating
    ? `本次支出 ${celebration.budget} 金 · 清晨金币 ${celebration.openingCoins} 金`
    : `当前金币预计预算 ${festivalBudgetFor(farm.coins)} 金 · 当天清晨确定`;
  $('festival-programme-status').textContent = !plazaReady ? '广场建成后，每逢第十天相聚' : celebrating ? festivalProgramme() : '按金币的 1% 筹备，保留 300 金经营储备';
  $('forest-status').textContent = `可采 ${farm.forage.length} 处 · 果篮野莓 ${farm.berries} 份${squirrelEating()?' · 松鼠在吃野莓':''}${forestFox.mode==='nap'?' · 狐狸在打盹':''}`;
  $('keeper-status').textContent = `阿森 · ${forestKeeperActivity()}${forestKeeper.choice === 'gather'
    && forestKeeper.day === farm.day && !isFestivalDay() ? ` · 今日采菇 ${forestKeeper.picked}/3` : ''}`;
  $('lake-status').textContent = `鱼点 ${farm.fishSpots.length} 处 · 鱼箱 ${depotCount('lake')} 尾`;
  $('angler-status').textContent = `阿蓼 · ${anglerActivity()}${angler.fishing?.day === farm.day
    && !isFestivalDay() ? ` · 今日 ${angler.fishing.caught}/${angler.fishing.quota} 尾` : ''}`;
  const active = nurseryActiveBeds();
  const ready = farm.nursery.beds.filter((_, index) => index < active && nurseryBedProgress(index) >= 1).length;
  $('nursery-status').textContent = farm.nursery.level
    ? `已修 ${active} 畦 · 可采 ${ready} 畦 · 货箱 ${depotCount('nursery')} 件`
    : `再送达 ${Math.max(0, NURSERY_THRESHOLDS[0] - farm.shippedTotal)} 件货物，修复首批苗床`;
  if(wetlandFrogSongDescription())$('nursery-status').textContent+=' · '+wetlandFrogSongDescription();
  $('nursery-keeper-status').textContent = `阿芽 · ${nurseryKeeperActivity()}`;
  $('mine-stock-status').textContent = `可采 ${MINE_LAYOUT.nodes.filter((_, index) => mineNodeReady(index)).length} 处 · 暂存 ${mineStockCount()} 块`;
  $('mine-status').textContent = `阿矿 · ${minerActivity()}`;
  const cargo = Object.values(courier.cargo).reduce((sum, count) => sum + count, 0);
  $('shipping-stock-status').textContent = `车上 ${cargo} 件 · 货箱待运 ${DEPOT_IDS.reduce((sum, id) => sum + depotCount(id), 0)} 件`;
  $('shipping-status').textContent = `阿运 · ${courierActivity()}`;
  $('shipping-plan').textContent = courierPlanText();
  $('forest-statistics').textContent = `松鼠亲近度 ${farm.squirrelTrust} · 累计采集 ${farm.forageTotal} 处`;
  $('valley-life-status').textContent=`水獭与小鱼 · 苍鹭${heronFishingActivity()} · 乌龟${turtleBaskActivity()}`;
  $('lake-statistics').textContent = `西湖累计钓获 ${farm.fishTotal} 尾 · 水鸭 ${lakeDucks.length} 只`;
}
function focusWorldStatus(region) {
  const points = {
    forest: FOREST_HOME, lake: { x: LAKE_X, y: LAKE_Y },
    nursery: { x: (NURSERY_LAYOUT.area.left + NURSERY_LAYOUT.area.right) / 2,
      y: (NURSERY_LAYOUT.area.top + NURSERY_LAYOUT.area.bottom) / 2 },
    mine: { x: (MINE_LAYOUT.area.left + MINE_LAYOUT.area.right) / 2,
      y: (MINE_LAYOUT.area.top + MINE_LAYOUT.area.bottom) / 2 },
    plaza: { x: CENTRAL_PLAZA.stage.x, y: 822 }, courier, ridge: RIDGE_OWL_PERCHES[0], 'valley-lake': VALLEY_LAKE_CENTER
  };
  const point = points[region];
  if (!point) return false;
  centerCamera(point.x, point.y);
  return true;
}
for (const region of ['plaza', 'forest', 'lake', 'nursery', 'mine', 'courier', 'ridge', 'valley-lake'])
  $(`status-locate-${region}`).addEventListener('click', () => focusWorldStatus(region));
