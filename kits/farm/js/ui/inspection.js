'use strict';
// Map inspection text and plot lookup. Reuses actor hit tests from life modules.
function plotAt(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);return farm.plots.find(p=>p.x===tx&&p.y===ty);}

function describe(x,y){
  const developmentHint=villageDevelopmentHint(x,y,true);if(developmentHint)return developmentHint;
  const canopyHint=eastCanopyDescription(x,y);if(canopyHint)return canopyHint;
  const bee=beeForagerAt(x,y);if(bee)return {target:bee,text:`果园蜜蜂 · ${beeForagerActivity()} · 点击安静观察`};
  const shoreHint=eastShoreDescription(x,y);if(shoreHint)return shoreHint;
  const townHint=townDescribe(x,y); if(townHint)return townHint;
  const plazaCat=plazaCatAt(x,y);
  if(plazaCat)return {target:plazaCat,text:plazaCatHint(plazaCat)};
  const plazaBird=plazaSparrowAt(x,y);
  if(plazaBird)return {target:plazaBird,text:plazaSparrowHint(plazaBird)};
  if(forestKeeperAt(x,y))return {target:forestKeeper,text:`阿森 · ${forestKeeperActivity()}${forestKeeper.choice==='gather'&&forestKeeper.day===farm.day&&!isFestivalDay()?` · 今日采菇 ${forestKeeper.picked}/3`:''} · 点击打招呼`};
  if(minerAt(x,y))return {target:miner,text:`阿矿 · ${minerActivity()} · 点击打招呼`};
  const mineNode=mineNodeAt(x,y);
  if(mineNode>=0){const kind=MINE_LAYOUT.nodes[mineNode].kind;return {target:MINE_LAYOUT.nodes[mineNode],text:`矿坡${MINE_ORES[kind].name} · ${mineNodeReady(mineNode)?'可以逐块采集':'矿脉正在缓慢显露'} · 点击查看或开采`};}
  if(courierAt(x,y))return {target:courier,text:`运货村民阿运 · ${courierActivity()} · 车上 ${Object.values(courier.cargo).reduce((a,b)=>a+b,0)} 件`};
  if(nurseryKeeperAt(x,y))return {target:nurseryKeeper,text:`阿芽 · ${nurseryKeeperActivity()} · 点击打招呼`};
  const worker=(tool==='inspect'||!plotAt(x,y))?workerAt(x,y):null;
  if(worker){const action=festivalActivity(worker)||({harvest:'采收',plant:'播种',water:'浇水',milk:'挤牛奶',eggs:'收鸡蛋',fruit:'摘水果',honey:'收蜂蜜',wool:'照顾羊群',goatMilk:'照顾山羊',herb:'采收香草'}[worker.task?.type]||(worker.name==='阿栀'?(farm.phase>=NIGHT_START?'回家睡觉':distance(worker,VALLEY_WORKER_LAYOUT.chair)<20?'在摇椅上休息':'去摇椅休息'):worker.name==='阿牧'?(farm.phase>=NIGHT_START?'回羊舍休息':distance(worker,PASTURE_WORKER_LAYOUT.rest)<20?'在两舍之间歇脚':'去两舍之间休息'):'等候下一项工作'));return {target:worker,text:`${worker.name} · 负责${WORKER_ROLES[worker.name] || '农场'} · ${worker.task?'正在':''}${action} · 点击打招呼`};}
  const p=plotAt(x,y);
  if(p){if(!p.crop)return {target:p,plot:p,text:'空田地 · 等待播种'};const c=crops[p.crop],stage=['初芽','幼苗','抽叶','花蕾','青果','将熟'][cropVisualStage(p)];return {target:p,plot:p,text:`${c.name} · ${p.age>=c.days?'可以收获':`${stage} ${Math.floor(cropVisualProgress(p)*100)}%`} · ${p.watered?'已浇水':'需要浇水'}`};}
  const cow=cowAt(x,y);
  if(cow)return {target:cow,text:`${cow.name} · ${cowActivity(cow)} · 点击打招呼`,cow:true};
  const sheepHere=sheepAt(x,y);
  if(sheepHere)return {target:sheepHere,text:`南方羊群 · ${farm.woolReady?'阿牧准备给它们梳毛':'正在悠闲地吃草'}`};
  const goat=goatAt(x,y);
  if(goat)return {target:goat,text:`山羊${goat.name} · ${farm.phase>=NIGHT_START||weatherVisual().rain>.72?'正在回舍休息':'在草甸上散步'} · 点击打招呼`};
  if(squirrelAt(x,y))return {target:squirrel,text:`森林松鼠 · 亲近度 ${farm.squirrelTrust}${squirrelMealDescription()?` · ${squirrelMealDescription()}`:''} · ${farm.berries?'点击喂一份野莓':'点击打招呼，或先采野莓'}`};
  const eastBird=eastPheasantAt(x,y);
  if(eastBird)return {target:eastBird,text:`东缘${eastBird.id?'雌山雉':'雄山雉'} · ${eastPheasantActivity(eastBird)} · 点击安静观察`};
  const ridgeAnimal=ridgeAnimalAt(x,y);
  if(ridgeAnimal)return {target:ridgeAnimal.actor,text:ridgeAnimalHint(ridgeAnimal)};
  const owlPerch=ridgeOwlPerchAt(x,y);
  if(owlPerch)return {target:owlPerch,text:`北岭${owlPerch.name} · 猫头鹰夜间巡飞时会在这里落脚`};
  if(foxAt(x,y))return {target:forestFox,text:`林间狐狸 · ${forestFoxActivity()} · 点击安静打招呼`};
  if(villagerAt(x,y))return {target:villageWalker,text:`${VILLAGE_WALKER_LAYOUT.name} · ${festivalActivity(villageWalker)||townBoatActivity()||townChildTeaActivity()||plazaEavesChildActivity()||townDonkeyVisitActivity()|| (farm.phase>=NIGHT_START?'正回家休息':'在阿运与阿宁的小屋前散步')}${townRainCanopy('child')?' · 撑着小布伞':''} · 点击打招呼`};
  if(orderKeeperAt(x,y))return {target:orderKeeper,text:`阿葵 · ${festivalActivity(orderKeeper)||eastGardenKeeperActivity()} · 点击打招呼`};
  const duck=duckAt(x,y);
  if(duck)return {target:duck,text:`西湖水鸭 · ${lakeDuckVisitHint(duck)} · 点击打招呼，看它划起波纹`};
  if(pondDuckAt(x,y))return {target:'pond-duck',text:'池塘小鸭 · 点击打招呼'};
  if(anglerAt(x,y))return {target:angler,text:`阿蓼 · ${anglerActivity()} · 点击打招呼`};
  const valleyCreature=valleyCreatureAt(x,y);
  if(valleyCreature)return {target:valleyCreature.actor,text:valleyCreatureHint(valleyCreature)};
  if(nurseryFrogAt(x,y))return {target:'nursery-frog',text:nurseryFrogHint()};
  const wetlandCreature=wetlandCreatureAt(x,y);
  if(wetlandCreature)return {target:`wetland-${wetlandCreature.kind}-${wetlandCreature.index??0}`,text:wetlandCreatureHint(wetlandCreature)};
  const foraged=forageAt(x,y);
  if(foraged)return {target:foraged,text:`${forageName(foraged)} · 点击单独采摘${foraged.kind==='berry'?'，可喂松鼠':''}`};
  const fish=fishSpotAt(x,y);
  if(fish)return {target:fish,text:`${fishName(fish)}的鱼点 · 点击垂钓，今日剩余 ${farm.fishSpots.length} 处`};
  const herb=valleyHerbAt(x,y);
  if(herb){const name=VALLEY_HERB_TYPES[herb.kind].name,progress=valleyHerbProgress(herb),visited=farm.beeForager.cycles[farm.valleyHerbs.indexOf(herb)]===herb.pickedAt;return {target:herb,text:`${name} · ${progress>=1?'可以逐株采摘':`生长中 ${Math.floor(progress*100)}%`}${visited?' · 蜜蜂来过花间':''} · 点击查看或采收`};}
  const nurseryBed=nurseryBedAt(x,y);
  if(nurseryBed>=0){const kind=GOOD_NAMES[NURSERY_LAYOUT.beds[nurseryBed].kind],progress=nurseryBedProgress(nurseryBed);return {target:NURSERY_LAYOUT.beds[nurseryBed],text:`湿地苗床 · ${kind} · ${progress>=1?'可以单畦采收':`培育中 ${Math.floor(progress*100)}%`} · 阿芽会自行照料`};}
  const eastBed=eastGardenBedAt(x,y);
  if(eastBed>=0){const bed=farm.eastGarden.beds[eastBed],progress=eastGardenProgress(eastBed);return {target:bed,text:`东岸菜圃 · ${EAST_GARDEN_CROPS[bed.kind].name} · ${progress>=1?'成熟待阿葵采收':`生长中 ${Math.floor(progress*100)}%`} · 村民自用`};}
  if(eastGardenBasketAt(x,y))return {target:'village-basket',text:`村口菜篮 · ${eastGardenBasketText()} · 村民日常与欢庆日共用`};
  const wetlandPlant=wetlandPlantAt(x,y);
  if(wetlandPlant)return {target:wetlandPlant,text:wetlandPlantHint(wetlandPlant)};
  const depot=depotAt(x,y);
  if(depot){const goods=Object.entries(farm.depots[depot]).filter(([,count])=>count>0).map(([good,count])=>`${GOOD_NAMES[good]} ${count}`).join('、');return {target:DEPOT_SITES[depot],text:`${DEPOT_SITES[depot].name} · ${goods||'暂时空着'} · 阿运返程时沿路收货`};}
  const kind=landmarkAt(x,y);
  const siteHint=villageDevelopmentHint(x,y);if(siteHint)return siteHint;
  const descriptions={
    'mine-home':'阿矿的小屋 · 矿工的温暖小家',
    'mine-stockpile':`矿区棚屋 · ${mineOreText(farm.mine.stock)} · 阿矿每四天送往村口`,
    'mine-cart-bay':'矿区推车停放点 · 阿矿送矿用的小车',
    'mine-rest':'轨旁歇脚台 · 阿矿采完矿后歇脚的地方',
    'mine-entrance':'河东旧矿洞 · 轨道通向岩坡里的幽深洞口',
    'mine-tea-table':'南谷茶桌 · 阿矿送完矿石后会来喝茶',
    'mine-market-stall':`村口右侧矿摊 · 最近送达：${mineOreText(farm.mine.marketGoods)} · 累计矿业收入 ${farm.mine.incomeTotal} 金`,
    'mine-area':`河东矿坡 · ${MINE_LAYOUT.nodes.filter((_,index)=>mineNodeReady(index)).length} 处矿脉可采 · 青石、赤铜与月白石英`,
    'nursery-home':'阿芽的小屋 · 苗圃的温暖小家',
    'nursery-bench':'苗圃长椅 · 阿芽忙完后会来歇脚',
    'wetland-lookout':'湿地观鸟台 · 看浅溪与水鸟',
    'wetland-bridge':'浅溪木板桥 · 从草甸跨过溪水，去湿地看芦苇与水鸟',
    'wetland-creek':'西南小湖浅溪 · 湖水沿草甸缓缓流向西南湿地',
    'nursery-wetland':`西南湿地 · 雨水改变浅洼水位 · 黑水鸡游过睡莲，暖季有蜻蜓与萤火虫`,
    nursery:`旧苗圃 · ${farm.nursery.level?`已修好 ${nurseryActiveBeds()} 畦，阿芽正在培育花束和种子包`:`累计送达 ${NURSERY_THRESHOLDS[0]} 件货物后修复首批苗床`}`,
    'valley-lake':'西南小湖 · 水獭、乌龟、苍鹭和小鱼生活在这里',
    'fishing-hut':'西湖钓鱼小屋 · 阿蓼把渔具收在这里',
    rowboat:'湖边小船 · 系在栈桥旁轻轻摇晃',
    'lake-dock':'西湖栈桥 · 阿蓼在这里看鱼，点击水面发亮的鱼点可以垂钓',
    'south-lake':'西湖 · 鱼点每天变化，点击发亮的水纹可以垂钓',
    coop:`鸡舍 · ${farm.eggsReady?'今天还有新鲜鸡蛋':'今天的鸡蛋已收好'} · 点击喂鸡`,
    house:'农舍 · 工人的温暖小家',barn:'牛舍 · 每天都会有新鲜牛奶',
    greenhouse:'温室 · 冬日也能种菜','east-windmill':'东侧风车 · 随风缓缓转动',
    'forest-cabin':'阿森的林间木屋 · 采菇与巡林后的歇脚处',
    'sheep-barn':'羊舍 · 阿牧照料羊群的地方','future-pasture':'待建的羊舍 · 农场富足后会开放',
    'pasture-bench':'两舍间长椅 · 阿牧完成照料后会在这里歇脚',
    'goat-barn':'山羊舍 · 糯米和栗子在这里避雨过夜，阿牧每天来照料',
    'goat-pen':'山羊牧场 · 两只山羊白天在围栏里散步',
    'future-goat-barn':'待建山羊舍 · 羊舍开放后，金币达到 1500 时自动建造',
    'future-goat-pen':'待建山羊牧场 · 建成山羊舍后糯米和栗子会搬来',
    'valley-windmill':'山谷风车 · 为香草梯田引水','valley-garden':'山谷花圃 · 花朵沿着小径盛开',
    'valley-worker-home':'阿栀的小屋 · 入夜窗边亮起暖灯',
    'valley-chair':'山谷摇椅 · 阿栀采完香草后会来打盹',
    'valley-herbs':`香草梯田 · 六株香草各自生长与再生 · 已采 ${farm.herbTotal} 株`,
    'valley-tea-house':'南谷茶亭 · 坐在暖木台上听风与水声',
    'valley-lookout':'临河观景台 · 晨间看溪流，入夜有暖灯',
    'central-stage':`苔谷广场木台 · ${isFestivalDay()?`今天是${festivalTheme().name} · ${festivalTheme().detail}`:'每逢第 10 天举办欢庆日'} · 点击查看纸灯小会费用`,
    'festival-table':`欢庆茶点桌 · ${festivalTheme().name} · ${FESTIVAL_LEVELS[currentFestivalLevel()].name}` ,
    'festival-pole':'欢庆彩旗 · 随风轻摇，入夜亮起暖灯',
    'plaza-cat-house':plazaCatHouseHint(),
    'central-well':'苔谷广场水井 · 清凉的井水映着四季天空',
    'central-bench':'苔谷广场长椅 · 坐下来歇一歇',
    'central-flowers':'苔谷广场花圃 · 四季有不同的颜色',
    'central-plaza':`苔谷广场 · ${isFestivalDay()?`${festivalTheme().name} · ${FESTIVAL_LEVELS[currentFestivalLevel()].name} · 筹备 ${farm.celebration.budget} 金 · ${festivalProgramme()}`:'每逢第 10 天村民来这里欢庆'}`,
    'east-garden':`东岸菜圃 · ${farm.eastGarden.beds.filter((_,index)=>eastGardenProgress(index)>=1).length} 畦成熟 · 阿葵每天照料，收成留给村民`,'village-home':'村民小屋 · 傍晚的窗子会亮起来',
    'village-walker-home':'阿宁的小屋 · 夜里亮起温暖的灯',
    'order-keeper-home':'阿葵的小屋 · 阿葵忙完菜圃后回家休息',
    'courier-village-home':'村口小屋 · 阿运回村后在这里过夜',
    fountain:'村口喷泉 · 水声清清凉凉',
    'village-market':'村口集市 · 作物售价提高 15%',
    'market-receiving':`村口收货台 · ${Object.keys(farm.marketGoods).length?'今日已收到运货村民送来的货物':'等待运货村民送货'} · 货物送达后结算`,
    'notice-board':'村口告示牌 · 阿葵的订单会贴在这里',
    'market-lamp':'村口路灯 · 傍晚会照亮小屋与集市',
    bridge:'溪流木桥 · 连接两岸的村路',river:'苔谷溪流 · 沿着水声可以走到村口',
    pond:'小池塘 · 鸭子最喜欢这里',
    'shipping-stall':'主场小货摊 · 阿运在旁边的小屋过夜，次日收货返程',
    'carrier-cottage':'阿运的小屋 · 运货途中在这里过夜',
    beehive:`果园西侧蜂箱 · 每两天酿一罐蜂蜜 · 已收 ${farm.honeyTotal} 罐 · 香草访花 ${farm.beeForager.visits} 回`,
    orchard:`果园 · ${farm.fruitReady?'今天有一篮水果可以采摘':`累计摘下 ${farm.fruitTotal} 篮水果`}`,
    'cow-pasture':'牛牛牧场 · 奶糖和团子会在围栏里散步',
    'sheep-pasture':'南方羊圈 · 羊群会在这里吃草',
    'village-south':'村口南郊 · 沿河可以找到菜圃和木桥',
    'traveller-yard':'旅人院落 · 阿棠和邻居喝茶歇脚的地方',
    'traveller-road':'东岸村路 · 通向驿屋与村口',
    'mine-ridge':'矿坡山脊 · 岩石与安静的草地',
    'donkey-inn':`东岸小驴驿 · ${TOWN_DONKEY_NAMES.join('和')}自在吃草，雨雪或夜晚回棚休息`,
    'east-pasture':'东岸草地 · 积蓄达到 50000 金后，可以请阿棠逐步修建小驴驿',
    'traveller-district':'东岸旅人街区 · 驿屋、花园与安静的草地',
    'east-clearing':'村口东侧空地 · 小路通往山外，积蓄丰厚后会有旅人来停靠',
    'village-west-south':'溪西南路 · 过桥可到村口花圃与集市',
    'village-west':'溪西广场附近 · 南行可到风车与牧场，过桥可到村口',
    village:`村口街区 · ${farm.upgrades>=5?'集市营业中':'攒够金币，集市将会开张'}`,
    forest:'东部森林 · 松鼠寻野莓，北岭有小鹿、野兔和猫头鹰，东缘林地有山雉',
    valley:'南方山谷 · 风车、香草梯田、茶亭与临河观景台沿途相伴',
    'southwest-meadow':'西南草甸 · 西南小湖与湿地之间的野花草地',
    meadow:'西部草甸 · 西湖与南谷牧场之间的开阔草地',
    'main-farm':'苔谷主场 · 工人和动物在这里忙碌'
  };
  return kind?{target:kind,text:descriptions[kind]}:null;
}
