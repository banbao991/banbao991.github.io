'use strict';
// The town's events and moving visitor are serialized in farm.town, including every route.
function makeTownLanternEvent() { return {day:0,chosen:false,launched:false,cost:0,lanterns:[]}; }
function makeTownFireflyChoice() { return {day:0,wetland:false,meadow:false,appeared:false,observed:false}; }
function makeTownFlowerVisit(){return {day:0,stage:'idle',targets:[],index:0,wait:0};}
function makeTownFlowerCare(){return {pots:[],visit:makeTownFlowerVisit(),waterings:0};}
function makeTownDonkeyVisit(){return {day:0,decided:false,chosen:false,automatic:false,paid:false,
  donkey:-1,cost:0,stage:'idle',route:[],index:0,wait:0};}
function makeTownDonkey(id){return {...TOWN_LAYOUT.donkeyInn.doors[id],id,mode:'home',target:'pen',
  route:[],index:0,wait:0,walk:0,step:0,dir:1,greetedDay:0,friendDay:0,waveUntil:0};}
function makeTownCatPlay() {
  return {day:0,choices:[false,false],done:[false,false],active:-1,ball:-1,bats:0,wait:0,balls:[],sessions:0};
}
function makeTownTeaParty() {
  return {visit:0,day:0,decided:false,chosen:false,automatic:false,paid:false,
    stage:'idle',route:[],index:0,wait:0,cost:0,returnHome:false};
}
function makeTownDog() {return {...TOWN_LAYOUT.gate,visit:0,present:false,mode:'away',route:[],index:0,
  target:'yard',wait:0,walk:0,step:0,dir:-1,wagUntil:0,greetedDay:0,friendDay:0,friendName:''};}
function makeTownTraveller() {
  return { x: TOWN_LAYOUT.gate.x, y: TOWN_LAYOUT.gate.y, dir: -1, walk: 0, step: 0,
    mode: 'away', route: [], index: 0, target: 'shop', day: 0, tier: 0, stayUntil: 0,
    wait: 0, waveUntil: 0, festival: null, offers: [], boughtDay: 0, chatDay: 0,
    cartAttached: false, commissioned: false,storyIndex:-1,storyHeard:false,
    greetings:{day:0,names:[],wait:0},carriedTea:0,restDay:0,drinking:false };
}
function makeTownState(day = 1) {
  return { version: 1, day: 0, seed: Math.floor(hash(day, 94, 611) * 4294967295) || 1,
    budgetMode: 'balanced', season: -1, allowance: 0, seasonSpent: 0,
    spentTotal: 0, spending: { goods: 0, projects: 0, care: 0, lanterns: 0,gatherings:0,outings:0 },
    merchantUnlocked: false, nextVisit: 0, visits: 0, traveller: makeTownTraveller(),
    inventory: Object.fromEntries(Object.keys(TOWN_GOODS).map(id => [id, 0])),
    plantings: { flowerPot: [], butterflySeed: [] },
    improvements: Object.fromEntries(Object.keys(TOWN_PROJECTS).map(id => [id, { level: 0, builtAt: 0, stages: [],
      wear: 0, agedAt: day, lastCare: 0 }])),
    construction: null, constructionCount: 0, maintenanceCount: 0, autoCareStreak: 0, childVisit: null, teaServed: 0,selfTea:0,
    events: [], birds: [], birdMeals:makeTownBirdMeals(), henMeal:makeTownHenMeal(), paperBoats:makeTownBoats(), courierMeal:makeTownCourierMeal(), butterflies: [], nectar:makeTownNectar(), ecologyDay: 0, careDay: 0,
    gardenChoice: {day:0,snails:false,hedgehog:false},critters:[],
    observations: {sparrow:0,kingfisher:0,robin:0,snail:0,hedgehog:0,firefly:0,wagtail:0,butterfly:0},
    fireflyChoice:makeTownFireflyChoice(),fireflies:[],
    postcards:makeTownPostcards(),sketch:makeTownSketch(),rainGear:makeTownRainGear(),fodder:makeTownFodder(),donkeyWater:makeTownDonkeyWater(day),hearth:makeTownHearth(),birdBath:makeTownBirdBath(day),dog:makeTownDog(),dogStretch:makeTownDogStretch(),donkeys:[],donkeyBond:makeTownDonkeyBond(),music:makeTownMusic(),chimes:makeTownChimes(),porchLights:makeTownPorchLights(),snacks:makeTownSnacks(),childSnack:makeTownChildSnack(),donkeyVisit:makeTownDonkeyVisit(),donkeyVisits:0,lastDonkeyVisit:0,
    flowerCare:makeTownFlowerCare(),catWater:makeTownCatWater(day),catCompany:makePlazaCatCompany(),eavesVisit:makePlazaEavesVisit(),squirrelMeal:makeSquirrelMeal(),catPlay:makeTownCatPlay(),teaParty:makeTownTeaParty(),teaParties:0,
    pavilion:{tea:0,served:0,minerTrip:0},lanternEvent:makeTownLanternEvent(),lanternCount:0 };
}
function validateTownState(town, day) {
  if(town)validateTownHenMeal(town,day);
  if(town)validateTownBoats(town,day);
  if(town)validateTownCourierMeal(town,day);
  const number = value => Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
  const integer = value => number(value) && Number.isInteger(value);
  const point = value => value && Number.isFinite(value.x) && Number.isFinite(value.y)
    && value.x >= -64 && value.x <= WORLD_W + 64 && value.y >= -64 && value.y <= WORLD_H + 64;
  const route = value => Array.isArray(value) && value.length <= 160 && value.every(point);
  const counts = (value, keys) => value && keys.every(key => Object.hasOwn(value, key) && integer(value[key]));
  const fail = () => { throw new Error('存档里的城镇发展状态不正确。'); };
  if(town && !Object.hasOwn(town,'donkeyVisit'))town.donkeyVisit=makeTownDonkeyVisit();
  if(town && !Object.hasOwn(town,'donkeyVisits'))town.donkeyVisits=0;
  if(town && !Object.hasOwn(town,'lastDonkeyVisit'))town.lastDonkeyVisit=0;
  if(town?.spending && !Object.hasOwn(town.spending,'outings'))town.spending.outings=0;
  const visit=town?.donkeyVisit;
  if(!visit || !integer(town.donkeyVisits) || !integer(town.lastDonkeyVisit) || town.lastDonkeyVisit>day
    || !integer(town.spending?.outings) || !integer(visit.day) || visit.day>day
    || !['decided','chosen','automatic','paid'].every(key=>typeof visit[key]==='boolean')
    || !['idle','out','wait','feed','return','home','done'].includes(visit.stage)
    || ![-1,0,1].includes(visit.donkey) || ![0,15,25,40].includes(visit.cost)
    || !route(visit.route) || !integer(visit.index) || visit.index>visit.route.length
    || !number(visit.wait) || visit.wait>3.5 || visit.paid && !visit.chosen
    || visit.chosen && (!visit.decided || visit.day<1 || visit.donkey<0 || visit.cost===0)
    || ['out','wait','feed','return','home'].includes(visit.stage) && !visit.chosen
    || visit.stage==='feed' && !visit.paid)fail();
  if(town?.improvements && !Object.hasOwn(town.improvements,'donkeyInn'))
    town.improvements.donkeyInn={level:0,builtAt:0,stages:[],wear:0,agedAt:day,lastCare:0};
  if(town && !Object.hasOwn(town,'donkeys'))town.donkeys=[];
  if(!Array.isArray(town?.donkeys) || town.donkeys.length>2
    || town.donkeys.length>(town.improvements?.donkeyInn?.level===3?2:town.improvements?.donkeyInn?.level?1:0)
    || town.donkeys.some((animal,id)=>animal.id!==id || !point(animal)
      || !inRect(animal.x,animal.y,TOWN_LAYOUT.donkeyInn.area.left,TOWN_LAYOUT.donkeyInn.area.top,
        TOWN_LAYOUT.donkeyInn.area.right,TOWN_LAYOUT.donkeyInn.area.bottom)
      || !['home','walk','graze','rest'].includes(animal.mode) || !['pen','home','fodder','water'].includes(animal.target)
      || !route(animal.route) || animal.route.some(p=>!inRect(p.x,p.y,TOWN_LAYOUT.donkeyInn.area.left,
        TOWN_LAYOUT.donkeyInn.area.top,TOWN_LAYOUT.donkeyInn.area.right,TOWN_LAYOUT.donkeyInn.area.bottom))
      || !integer(animal.index) || animal.index>animal.route.length
      || !['wait','walk','step','waveUntil'].every(key=>number(animal[key])) || ![-1,1].includes(animal.dir)
      || !['greetedDay','friendDay'].every(key=>integer(animal[key])&&animal[key]<=day)))fail();
  if(visit.chosen && visit.donkey>=town.donkeys.length)fail();
  if(town && !Object.hasOwn(town,'flowerCare'))town.flowerCare=makeTownFlowerCare();
  const flowers=town?.flowerCare,flowerVisit=flowers?.visit;
  if(!flowers || !integer(flowers.waterings) || !Array.isArray(flowers.pots) || flowers.pots.length>3
    || flowers.pots.length>town.inventory.flowerPot
    || flowers.pots.some(pot=>!number(pot.damp) || pot.damp>1 || !number(pot.boost) || pot.boost>.3
      || !number(pot.agedAt) || pot.agedAt>day+1 || !number(pot.lastWater) || pot.lastWater>day+1)
    || !flowerVisit || !integer(flowerVisit.day) || flowerVisit.day>day
    || !['idle','out','water','back','done'].includes(flowerVisit.stage)
    || !Array.isArray(flowerVisit.targets) || flowerVisit.targets.length>3
    || new Set(flowerVisit.targets).size!==flowerVisit.targets.length
    || flowerVisit.targets.some(id=>!integer(id) || id>=flowers.pots.length)
    || !integer(flowerVisit.index) || flowerVisit.index>flowerVisit.targets.length
    || !number(flowerVisit.wait) || flowerVisit.wait>1.2
    || ['out','water','back'].includes(flowerVisit.stage) && (flowerVisit.day<1 || !flowerVisit.targets.length))fail();
  if(town && !Object.hasOwn(town,'catPlay'))town.catPlay=makeTownCatPlay();
  const play=town?.catPlay,yard=TOWN_LAYOUT.catToyYard;
  const toyPoint=ball=>point(ball) && inRect(ball.x,ball.y,yard.left,yard.top,yard.right,yard.bottom);
  if(!play || !integer(play.day) || play.day>day || !integer(play.sessions)
    || !['choices','done'].every(key=>Array.isArray(play[key]) && play[key].length===2 && play[key].every(value=>typeof value==='boolean'))
    || ![-1,0,1].includes(play.active) || !Number.isInteger(play.ball) || play.ball< -1 || play.ball>2
    || !integer(play.bats) || play.bats>3 || !number(play.wait) || play.wait>1
    || !Array.isArray(play.balls) || play.balls.length>3 || play.balls.length>town.inventory.petToy
    || play.balls.some((ball,index)=>ball.id!==index || !toyPoint(ball) || !toyPoint({x:ball.tx,y:ball.ty}) || typeof ball.rolling!=='boolean')
    || (play.active<0 ? play.ball!==-1 || play.balls.some(ball=>ball.rolling)
      : play.ball<0 || !play.balls[play.ball] || !play.choices[play.active] || play.done[play.active]))fail();
  if(town && !Object.hasOwn(town,'teaParty'))town.teaParty=makeTownTeaParty();
  if(town && !Object.hasOwn(town,'teaParties'))town.teaParties=0;
  if(town?.spending && !Object.hasOwn(town.spending,'gatherings'))town.spending.gatherings=0;
  const party=town?.teaParty;
  if(!party || !integer(town.teaParties) || !integer(party.visit) || party.visit>town.visits
    || !integer(party.day) || party.day>day || !number(party.wait)
    || !['decided','chosen','automatic','paid','returnHome'].every(key=>typeof party[key]==='boolean')
    || !['idle','out','tea','return','home','done'].includes(party.stage)
    || !route(party.route) || !integer(party.index) || party.index>party.route.length
    || !integer(party.cost) || (party.chosen?![45,65,90].includes(party.cost):party.cost!==0)
    || party.chosen && (!party.decided || party.day<1 || party.visit<1)
    || party.paid && !party.chosen || party.stage==='tea' && !party.paid
    || ['out','tea','return','home'].includes(party.stage) && !party.chosen)fail();
  if(town && !Object.hasOwn(town,'selfTea'))town.selfTea=0;
  if(!integer(town?.selfTea))fail();
  if(town && !Object.hasOwn(town,'dog'))town.dog=makeTownDog();
  const dog=town?.dog;
  if(dog && !Object.hasOwn(dog,'friendDay'))dog.friendDay=0;
  if(dog && !Object.hasOwn(dog,'friendName'))dog.friendName='';
  if(dog && (!integer(dog.friendDay) || dog.friendDay>day
    || typeof dog.friendName!=='string' || dog.friendName!=='' && !TOWN_RESIDENT_NAMES.includes(dog.friendName)))fail();
  if(!point(dog) || !integer(dog.visit) || dog.visit>town.visits || typeof dog.present!=='boolean'
    || !['away','walk','rest','home'].includes(dog.mode) || !['yard','home','leave'].includes(dog.target)
    || !route(dog.route) || !integer(dog.index) || dog.index>dog.route.length
    || !['wait','walk','step','wagUntil'].every(key=>number(dog[key]))
    || !integer(dog.greetedDay) || dog.greetedDay>day || ![-1,1].includes(dog.dir))fail();
  validateTownDogStretch(town,day);
  if(town?.inventory)for(const id of ['riverPlate','forestCarving','crystalCase','pressedLeaves','pheasantClay','seedJar'])
    if(!Object.hasOwn(town.inventory,id))town.inventory[id]=0;
  if(town && !Object.hasOwn(town,'fireflyChoice'))town.fireflyChoice=makeTownFireflyChoice();
  if(town && !Object.hasOwn(town,'fireflies'))town.fireflies=[];
  if(town?.observations && !Object.hasOwn(town.observations,'firefly'))town.observations.firefly=0;
  const fireflyChoice=town?.fireflyChoice;
  if(!fireflyChoice || !integer(fireflyChoice.day) || fireflyChoice.day>day
    || !['wetland','meadow','appeared','observed'].every(key=>typeof fireflyChoice[key]==='boolean')
    || !Array.isArray(town.fireflies) || town.fireflies.length>10
    || new Set(town.fireflies.map(fly=>fly?.id)).size!==town.fireflies.length
    || town.fireflies.some(fly=>!point(fly) || !point(fly.target) || !integer(fly.id) || fly.id>9
      || !Object.hasOwn(TOWN_LAYOUT.fireflyHabitats,fly.habitat) || !number(fly.wait)
      || !number(fly.step) || !number(fly.fade) || fly.fade>1)
    || !fireflyChoice.appeared && town.fireflies.length>0)fail();
  if(town && !Object.hasOwn(town,'lanternEvent'))town.lanternEvent=makeTownLanternEvent();
  if(town && !Object.hasOwn(town,'lanternCount'))town.lanternCount=0;
  if(town?.spending && !Object.hasOwn(town.spending,'lanterns'))town.spending.lanterns=0;
  const lights=town?.lanternEvent;
  if(!lights || !integer(town.lanternCount) || !integer(lights.day) || lights.day>day
    || typeof lights.chosen!=='boolean' || typeof lights.launched!=='boolean'
    || !integer(lights.cost) || lights.cost>280 || !Array.isArray(lights.lanterns)
    || lights.lanterns.length>8 || (lights.chosen || lights.launched) && (lights.day<1 || lights.day%10!==0)
    || lights.launched && ![105,140,210,280].includes(lights.cost)
    || !lights.launched && (lights.cost!==0 || lights.lanterns.length!==0)
    || new Set(lights.lanterns.map(light=>light?.id)).size!==lights.lanterns.length
    || lights.lanterns.some(light=>!point(light) || !integer(light.id) || light.id>7
      || !number(light.age) || light.age>=26 || !number(light.wait) || light.wait>5
      || !integer(light.variant) || light.variant>2))fail();
  if (town && !Object.hasOwn(town,'maintenanceCount')) town.maintenanceCount = 0;
  if (town && !Object.hasOwn(town,'autoCareStreak')) town.autoCareStreak = 0;
  if (!integer(town?.autoCareStreak) || town.autoCareStreak > 2) fail();
  if (town && !Object.hasOwn(town,'gardenChoice')) town.gardenChoice = {day:0,snails:false,hedgehog:false};
  if (town && !Object.hasOwn(town,'critters')) town.critters = [];
  if (town && !Object.hasOwn(town,'observations')) town.observations = {sparrow:0,kingfisher:0,robin:0,snail:0,hedgehog:0,firefly:0,wagtail:0};
  if (town && !Object.hasOwn(town,'pavilion')) town.pavilion={tea:0,served:0,minerTrip:0};
  if (!town?.pavilion || !counts(town.pavilion,['tea','served','minerTrip'])
    || town.pavilion.tea>4 || town.pavilion.minerTrip>day) fail();
  if(town){validateTownCatWater(town,day);validatePlazaCatCompany(town,day);validatePlazaEavesVisit(town,day);validateSquirrelMeal(town,day);validateTownHearth(town,day);validateTownFodder(town,day);validateTownDonkeyWater(town,day);validateTownDonkeyBond(town,day);validateTownMusic(town,day);validateTownChimes(town,day);validateTownPorchLights(town,day);validateTownSnacks(town,day);validateTownChildSnack(town,day);validateTownRainGear(town);validateTownSketch(town,day);}
  if (!town || town.version !== 1 || !integer(town.day) || town.day > day || !integer(town.seed)
    || town.seed < 1 || town.seed > 4294967295 || !Object.hasOwn(TOWN_BUDGET_MODES, town.budgetMode)
    || !Number.isInteger(town.season) || town.season < -1 || town.season > Math.floor((day - 1) / 8)
    || !['allowance', 'seasonSpent', 'spentTotal', 'nextVisit', 'visits', 'constructionCount', 'maintenanceCount', 'teaServed', 'ecologyDay', 'careDay'].every(key => integer(town[key]))
    || typeof town.merchantUnlocked !== 'boolean'
    || !counts(town.spending, ['goods', 'projects', 'care', 'lanterns','gatherings','outings'])
    || !counts(town.inventory, Object.keys(TOWN_GOODS))) fail();
  validateTownPostcards(town,day);
  for (const [id, good] of Object.entries(TOWN_GOODS)) if (town.inventory[id] > good.stock) fail();
  if (!Object.hasOwn(town,'plantings')) town.plantings = Object.fromEntries(['flowerPot','butterflySeed']
    .map(id => [id, Array(town.inventory[id]).fill(0)]));
  if (!town.plantings || ['flowerPot','butterflySeed'].some(id => !Array.isArray(town.plantings[id])
    || town.plantings[id].length > town.inventory[id]
    || town.plantings[id].some(time => !number(time) || time > day + 1))) fail();
  if (!town.improvements || Object.keys(TOWN_PROJECTS).some(id => !town.improvements[id]
    || !Number.isInteger(town.improvements[id].level) || town.improvements[id].level < 0
    || town.improvements[id].level > 3 || !number(town.improvements[id].builtAt))) fail();
  for (const built of Object.values(town.improvements)) {
    if (!Object.hasOwn(built,'wear')) built.wear = 0;
    if (!Object.hasOwn(built,'agedAt')) built.agedAt = day;
    if (!Object.hasOwn(built,'lastCare')) built.lastCare = built.builtAt;
    if (!number(built.wear) || built.wear > 1 || !integer(built.agedAt) || built.agedAt > day
      || !number(built.lastCare) || built.lastCare > day + 1) fail();
    if (!Object.hasOwn(built,'stages')) built.stages = Array.from({ length: built.level },
      (_, index) => index === built.level - 1 ? built.builtAt : 0);
    if (!Array.isArray(built.stages) || built.stages.length > built.level
      || built.stages.some(time => !number(time) || time > day + 1)) fail();
  }
  const actor = town.traveller;
  if(actor.villageSettling!=null&&(typeof actor.villageSettling!=='boolean'||!route(actor.path)
    ||actor.goal!==null&&(typeof actor.goal!=='string'||actor.goal.length>100)))fail();
  if (actor && !Object.hasOwn(actor, 'commissioned')) actor.commissioned = !!town.construction;
  if (actor && !Object.hasOwn(actor,'storyIndex')) actor.storyIndex=-1;
  if (actor && !Object.hasOwn(actor,'storyHeard')) actor.storyHeard=false;
  if (actor && !Object.hasOwn(actor,'greetings')) actor.greetings={day:0,names:[],wait:0};
  if (actor && !Object.hasOwn(actor,'carriedTea')) actor.carriedTea=0;
  if(actor && !Object.hasOwn(actor,'restDay'))actor.restDay=0;
  if(actor && !Object.hasOwn(actor,'drinking'))actor.drinking=false;
  if(actor && (!integer(actor.restDay) || actor.restDay>day || typeof actor.drinking!=='boolean'))fail();
  if (actor && (!integer(actor.carriedTea) || actor.carriedTea>2)) fail();
  if (actor && (!Number.isInteger(actor.storyIndex) || actor.storyIndex < -1 || actor.storyIndex >= TOWN_STORIES.length
    || typeof actor.storyHeard!=='boolean' || !actor.greetings || !integer(actor.greetings.day)
    || actor.greetings.day>day || !number(actor.greetings.wait) || !Array.isArray(actor.greetings.names)
    || actor.greetings.names.length>3 || new Set(actor.greetings.names).size!==actor.greetings.names.length
    || actor.greetings.names.some(name=>!TOWN_RESIDENT_NAMES.includes(name)))) fail();
  if (!point(actor) || !['away', 'arrive', 'shop', 'walk', 'home', 'rest', 'leave', 'work','flowers'].includes(actor.mode)
    || !route(actor.route) || !integer(actor.index) || actor.index > actor.route.length
    || !['shop', 'home', 'porch', 'tea', 'leave', 'work','flowers'].includes(actor.target)
    || !Number.isInteger(actor.dir) || Math.abs(actor.dir) !== 1
    || typeof actor.cartAttached !== 'boolean' || typeof actor.commissioned !== 'boolean'
    || !['walk','step','wait','waveUntil'].every(key => number(actor[key]))
    || !['day','stayUntil','boughtDay','chatDay'].every(key => integer(actor[key]))
    || actor.day > day || actor.boughtDay > day || actor.chatDay > day
    || !Number.isInteger(actor.tier) || actor.tier < 0 || actor.tier > 3
    || !Array.isArray(actor.offers) || actor.offers.length > 5
    || new Set(actor.offers.map(offer => offer?.id)).size !== actor.offers.length
    || actor.offers.some(offer => !offer || !Object.hasOwn(TOWN_GOODS, offer.id)
      || !integer(offer.price) || offer.price < 1 || typeof offer.sold !== 'boolean')) fail();
  const specials = actor.offers.filter(offer => Object.hasOwn(offer, 'regularPrice'));
  if (specials.length > 1 || specials.some(offer => !integer(offer.regularPrice)
    || offer.regularPrice < Math.round(TOWN_GOODS[offer.id].price * .9)
    || offer.regularPrice > Math.round(TOWN_GOODS[offer.id].price * 1.1)
    || offer.price !== Math.max(1, Math.round(offer.regularPrice * .8))
    || offer.id !== 'birdFeed' && TOWN_GOODS[offer.id].kind !== 'supplies')) fail();
  if (actor.festival && (!integer(actor.festival.day) || actor.festival.day < 1 || actor.festival.day > day
    || typeof actor.festival.attending !== 'boolean'
    || !['out', 'gather', 'home', 'morning', 'back'].includes(actor.festival.stage)
    || !integer(actor.festival.index) || actor.festival.out && !route(actor.festival.out)
    || actor.festival.back && !route(actor.festival.back)
    || actor.festival.morning && !route(actor.festival.morning))) fail();
  const activity = actor.festival?.activity;
  if (activity && (!['snack','chat','watch','rest','dance','perform'].includes(activity.kind)
    || activity.spot !== null && (!integer(activity.spot) || activity.spot >= 22)
    || !route(activity.route) || !integer(activity.index) || activity.index > activity.route.length
    || !number(activity.wait) || !number(activity.blocked) || !integer(activity.cycle))) fail();
  const job = town.construction;
  if (job && !Object.hasOwn(job,'kind')) job.kind = 'build';
  if (job && (!Object.hasOwn(TOWN_PROJECTS, job.id) || !integer(job.level) || job.level < 1 || job.level > 3
    || !['build','care'].includes(job.kind)
    || job.level !== town.improvements[job.id].level + (job.kind === 'build' ? 1 : 0)
    || !number(job.progress) || job.progress > 1
    || !number(job.startedAt) || !integer(job.cost) || job.cost < 1)) fail();
  if ((actor.mode === 'work' || actor.target === 'work') && !job) fail();
  const outing = town.childVisit;
  if (outing && (!integer(outing.day) || outing.day > day || !['out','tea','return'].includes(outing.stage)
    || !route(outing.route) || !integer(outing.index) || outing.index > outing.route.length || !number(outing.wait))) fail();
  if (!Array.isArray(town.events) || town.events.length > 12 || town.events.some(event => !event
    || !integer(event.day) || event.day > day || typeof event.text !== 'string' || event.text.length > 250)) fail();
  validateTownBirdBath(town,day);
  const choice=town.gardenChoice;
  if (!choice || !integer(choice.day) || choice.day>day || typeof choice.snails!=='boolean'
    || typeof choice.hedgehog!=='boolean' || !counts(town.observations,['sparrow','kingfisher','robin','snail','hedgehog','firefly','wagtail'])
    || !Array.isArray(town.critters) || town.critters.length>3
    || new Set(town.critters.map(animal=>animal?.id)).size!==town.critters.length
    || town.critters.some(animal=>!point(animal) || !point(animal.target) || !['snail','hedgehog'].includes(animal.kind)
      || !['arrive','forage','leave','hide'].includes(animal.mode) || !integer(animal.id)
      || !['step','wait','shy'].every(key=>number(animal[key])) || typeof animal.noticed!=='boolean')) fail();
  validateTownNectar(town,day);
  validateTownBirdMeals(town,day);
  for (const [key, limit] of [['birds', 2]]) {
    if (key==='birds' && Array.isArray(town[key])) for (const bird of town[key]) {
      if (bird && !Object.hasOwn(bird,'noticed')) bird.noticed=false;
      if (bird && !Object.hasOwn(bird,'dir')) bird.dir=-1;
      if (bird && (!Number.isInteger(bird.dir) || Math.abs(bird.dir)!==1))fail();
      if (bird && (typeof bird.noticed!=='boolean' || !integer(bird.variant) || bird.variant>2)) fail();
    }
    if (!Array.isArray(town[key]) || town[key].length > limit || town[key].some(animal => !point(animal)
      || !['arrive','perch','dive','leave','fly'].includes(animal.mode) || !point(animal.target)
      || !['step','wait','action','lift','variant','id'].every(field => number(animal[field])))) fail();
  }
}
