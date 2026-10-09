module.exports = function checkTownDevelopment(run, assert) {
  const result = run(`(() => {
    const originalFarm = farm;
    const answers = {};
    const prepare = () => {
      farm = newFarm(); farm.day = 41; farm.phase = .22; farm.coins = 300000;
      farm.town = makeTownState(41); farm.town.merchantUnlocked = true;
      farm.town.allowance = 15000;
      Object.assign(farm.town.traveller, {...TOWN_LAYOUT.counter, mode:'shop', day:41, stayUntil:42});
      for (const built of Object.values(farm.town.improvements)) Object.assign(built,
        {level:1, builtAt:15, stages:[15], wear:1, agedAt:41, lastCare:15});
    };
    const newVisit = () => {farm.town.construction = null; farm.town.traveller.commissioned = false;};
    try {
      prepare(); const original = JSON.stringify(farm.town), coins = farm.coins;
      for (let i=0;i<20;i++) {townDevelopmentPlan(); townDevelopmentDescription(); updateTownUI();}
      answers.readOnly = JSON.stringify(farm.town) === original && farm.coins === coins;
      townChooseCommission(); answers.firstCare = farm.town.construction.kind==='care' && farm.town.autoCareStreak===1;
      const paid = farm.coins; townChooseCommission(); answers.once = farm.coins===paid;
      newVisit(); townChooseCommission(); answers.secondCare = farm.town.construction.kind==='care' && farm.town.autoCareStreak===2;
      newVisit(); const plan=townDevelopmentPlan();
      answers.turn = plan.kind==='build' && plan.reason==='turn' && townDevelopmentDescription().includes('养护忙完，添些新设施');
      const saved = JSON.stringify(farm.town); farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      answers.save = saved===JSON.stringify(farm.town) && JSON.stringify(townDevelopmentPlan())===JSON.stringify(plan);
      townChooseCommission(); answers.build = farm.town.construction.kind==='build' && farm.town.autoCareStreak===0;
      answers.stages = Object.values(farm.town.improvements).every(b=>b.level===1 && b.stages[0]===15);
      prepare(); farm.town.autoCareStreak=2; farm.town.allowance=townCarePrice('catComfort');
      townChooseCommission(); answers.careFallback = farm.town.construction.kind==='care' && farm.town.autoCareStreak===2;
      prepare(); farm.town.autoCareStreak=2;
      for(const built of Object.values(farm.town.improvements))Object.assign(built,{level:3,stages:[11,13,15]});
      townChooseCommission(); answers.maxed = farm.town.construction.kind==='care';
      prepare(); farm.town.autoCareStreak=2;farm.coins=townReserve();
      townChooseCommission(); answers.reserve = !farm.town.construction && farm.town.autoCareStreak===2;
      prepare(); farm.town.autoCareStreak=2;farm.town.budgetMode='off';
      townChooseCommission(); answers.off = !farm.town.construction && townDevelopmentDescription().includes('手动安排');
      townCommissionCare('catComfort'); answers.manual = farm.town.autoCareStreak===2;
      newVisit(); townCommission('catComfort'); answers.manual &&=farm.town.autoCareStreak===2;
      prepare(); farm.paused=true;townChooseCommission();answers.pause=!farm.town.construction;
      farm.paused=false;farm.day=40;townChooseCommission();answers.festival=!farm.town.construction;
      farm.day=41;farm.phase=.31;townChooseCommission();answers.timing=!farm.town.construction;
      farm.phase=.22;farm.town.traveller.mode='home';townChooseCommission();answers.home=!farm.town.construction;
      prepare();for(const built of Object.values(farm.town.improvements))built.wear=.4;
      farm.town.improvements.donkeyInn.builtAt=7;farm.town.improvements.donkeyInn.stages=[7];
      answers.oldest = townDevelopmentPlan().id==='donkeyInn';
      farm.town.improvements.catComfort.level=0;farm.town.improvements.catComfort.stages=[];
      answers.lowest = townDevelopmentPlan().id==='catComfort';
      prepare(); const old=JSON.parse(JSON.stringify(farm));delete old.town.autoCareStreak;
      answers.default = parseFarmSave({version:1,state:old}).town.autoCareStreak===0;
      answers.invalid=true;
      for(const invalid of [-1,3,1.5,'2',null]) {
        const bad=JSON.parse(JSON.stringify(farm));bad.town.autoCareStreak=invalid;
        try {parseFarmSave({version:1,state:bad});answers.invalid=false;}catch(_){}
      }
      return answers;
    } finally {farm=originalFarm;updateUI();}
  })()`);
  for(const [key, passed] of Object.entries(result)) assert.ok(passed, 'Town development failed: '+key);
  console.log('Town development checks passed: two-care turn, oldest eligible stage, read-only preview, budget, manual, pause, festivals and saves.');
};
