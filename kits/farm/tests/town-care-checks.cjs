module.exports = function checkTownCare(run, assert) {
  const checks = run(`(() => {
    const originalFarm = farm;
    const result = { weather:true, once:true, pause:true, payment:true, finish:true,
      preservation:true, save:true, priority:true, reserve:true, limits:true };
    const prepare = () => {
      farm = newFarm();farm.day=29;farm.phase=.1;farm.coins=200000;
      farm.town=makeTownState(29);farm.town.budgetMode='off';farm.town.merchantUnlocked=true;
      Object.assign(farm.town.traveller,{...TOWN_LAYOUT.counter,mode:'shop',day:29,stayUntil:30});
      for (const id of Object.keys(TOWN_PROJECTS)) Object.assign(farm.town.improvements[id],
        {level:2,builtAt:25,stages:[21,25],wear:.8,lastCare:25});
    };
    try {
      prepare();const built=farm.town.improvements.catComfort;
      farm.day++;farm.weather='rain';farm.weatherFrom='rain';
      updateTownCare();const wet=built.wear-.8;
      updateTownCare();result.once=built.wear===.8+wet;
      built.wear=.8;built.agedAt=29;farm.weather='sunny';farm.weatherFrom='sunny';
      updateTownCare();const dry=built.wear-.8;result.weather=wet>dry && dry>0;
      farm.paused=true;farm.day++;const frozen=built.wear;updateTownCare();
      result.pause=built.wear===frozen && built.agedAt===30;
      for(const id of Object.keys(TOWN_PROJECTS)) {
        prepare();const actor=farm.town.traveller;
        const stages=JSON.stringify(farm.town.improvements[id].stages),coins=farm.coins,cost=townCarePrice(id);
        result.payment &&=townCommissionCare(id) && !townCommissionCare(id)
          && farm.coins===coins-cost && farm.town.spending.care===cost;
        const progress=farm.town.construction.progress;farm.paused=true;updateTownTraveller(10);
        result.pause &&=farm.town.construction.progress===progress;farm.paused=false;
        let holiday=null;
        for(let i=0;i<14000&&farm.town.construction;i++){
          farm.phase+=.05/DAY_SECONDS;
          if(farm.phase>=1){farm.day++;farm.phase=0;updateTownPlanning();}
          updateTownTraveller(.05);
          if(farm.day===30){holiday??=farm.town.construction.progress;
            result.pause &&=farm.town.construction.progress===holiday;}
        }
        result.finish &&=!farm.town.construction && farm.town.maintenanceCount===1
          && farm.coins===coins-cost && farm.town.improvements[id].wear===0;
        result.preservation &&=farm.town.improvements[id].level===2
          && JSON.stringify(farm.town.improvements[id].stages)===stages;
        result.save &&=JSON.stringify(parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))}).town)
          ===JSON.stringify(farm.town);
      }
      prepare();farm.phase=.22;farm.town.budgetMode='balanced';farm.town.allowance=15000;
      // Non-urgent care leaves room for new stages; very weathered sites get priority.
      townChooseCommission();result.priority=farm.town.construction?.kind==='build';
      prepare();farm.phase=.22;farm.town.budgetMode='balanced';farm.town.allowance=15000;
      farm.town.improvements.catComfort.wear=.9;townChooseCommission();
      result.priority &&=farm.town.construction?.kind==='care' && farm.town.construction.id==='catComfort';
      const malformed=JSON.parse(JSON.stringify(farm));malformed.town.improvements.catComfort.wear=2;
      try{parseFarmSave({version:1,state:malformed});result.limits=false;}catch(_){}
      prepare();farm.coins=townReserve();result.reserve=!townCommissionCare('catComfort');
      return result;
    } finally {farm=originalFarm;updateUI();}
  })()`);
  for (const [name, passed] of Object.entries(checks)) assert.ok(passed, `Town care failed: ${name}`);
  console.log('Town care checks passed: weather, daily aging, payment, pause, festivals, six jobs, preservation, priorities and save.');
};
