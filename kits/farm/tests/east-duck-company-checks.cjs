module.exports=function checkEastDuckCompany(run,assert){
 const result=run(`(()=>{
 const original=farm,runtime=JSON.parse(JSON.stringify(captureRuntimeState())),r={};
 const world=()=>{const x=captureRuntimeState();delete x.now;return JSON.stringify({farm,x});};
 const saved=()=>{const before=world(),s=importFarmText(farmExportText());replaceFarmState(s.state,s.runtime);return before===world();};
 function setup(){farm=newFarm();farm.day=Array.from({length:7},(_,i)=>i+9).find(d=>hash(d,0,883)<.6);farm.phase=.3;farm.weather=farm.weatherFrom='sunny';prepareFestival();ensureValleyHerbs();spawnForageForDay();spawnFishForDay();for(const b of farm.eastShore.ducks)Object.assign(b,EAST_SHORE.duckSpots[b.id][2],{day:farm.day,chosen:true,mode:'rest',goal:'water',wait:5,target:{...EAST_SHORE.duckSpots[b.id][2]}});}
 try{
 setup();const positions=farm.eastShore.ducks.map(b=>({x:b.x,y:b.y})),waits=farm.eastShore.ducks.map(b=>b.wait),targets=JSON.stringify(farm.eastShore.ducks.map(b=>b.target)),money=farm.coins,seed=farm.town.seed;
 updateEastDuckCompany(.05);r.real=eastDuckCompanyActive()&&farm.eastShore.company.remaining===2.4&&farm.eastShore.ducks.every((b,i)=>distance(b,positions[i])===0&&b.wait===waits[i])&&targets===JSON.stringify(farm.eastShore.ducks.map(b=>b.target));
 for(let i=0;i<12;i++)updateEastShore(.05);r.half=saved()&&farm.eastShore.company.remaining>1.5&&farm.eastShore.company.count===0;
 const b=farm.eastShore.ducks[0];r.hint=describe(b.x,b.y-8).text.includes('同伴');greetEastShore({animal:b,type:'duck'});r.click=eastDuckCompanyActive()&&saved();
 farm.paused=true;const frozen=world();updateEastShore(10);tick(last+65);renderCompleteFarmCanvas();r.pause=frozen===world();farm.paused=false;
 const items=farmSceneItems();r.depth=items.filter(i=>i.id.startsWith('east-mandarin:')).length===2&&items.find(i=>i.id==='east-mandarin:0').y===b.y+7;
 for(let i=0;i<40;i++)updateEastShore(.05);r.complete=farm.eastShore.company.count===1&&farm.eastShore.company.lastDay===farm.day&&farm.eastShore.company.remaining===0&&farm.eastShore.ducks.every((b,i)=>distance(b,positions[i])===0&&Math.abs(b.wait-(waits[i]-2.6))<.001)&&saved();
 updateUI();farm.ledgerExpanded=true;updateLedgerUI();r.ui=$('east-shore-status').textContent.includes('已相伴 1 回')&&$('ledger-east-company').textContent==='1 回';
 for(const b of farm.eastShore.ducks)b.wait=5;updateEastDuckCompany(.05);r.once=farm.eastShore.company.count===1&&!eastDuckCompanyActive();r.free=farm.coins===money&&farm.town.seed===seed;
 setup();farm.eastShore.ducks[0].wait=2;updateEastDuckCompany(.05);r.shortStop=!eastDuckCompanyActive()&&!farm.eastShore.company.started;
 setup();farm.eastShore.ducks[1].x=2258;updateEastDuckCompany(.05);r.far=!eastDuckCompanyActive();
 setup();farm.eastShore.ducks[1].mode='swim';updateEastDuckCompany(.05);r.moving=!eastDuckCompanyActive();
 setup();updateEastDuckCompany(.05);farm.weather=farm.weatherFrom='rain';for(let i=0;i<400;i++)updateEastShore(.05);r.rain=!eastDuckCompanyActive()&&farm.eastShore.company.count===0&&farm.eastShore.company.started&&farm.eastShore.ducks.every(b=>b.mode==='sleep')&&saved();
 setup();updateEastDuckCompany(.05);farm.phase=.65;for(let i=0;i<400;i++)updateEastShore(.05);r.night=!eastDuckCompanyActive()&&farm.eastShore.company.count===0&&farm.eastShore.ducks.every(b=>b.mode==='sleep');
 setup();farm.day=30;farm.phase=.3;updateEastDuckCompany(.05);r.winter=!eastDuckCompanyActive();
 setup();const old=JSON.parse(farmExportText());delete old.state.eastShore.company;const loaded=importFarmText(JSON.stringify(old));r.legacy=loaded.state.eastShore.company.count===0&&JSON.stringify(loaded.state.eastShore.ducks)===JSON.stringify(farm.eastShore.ducks)&&JSON.stringify(loaded.runtime)===JSON.stringify(captureRuntimeState());
 r.reject=true;for(const change of [s=>s.eastShore.company.remaining=-1,s=>s.eastShore.company.chosen='yes',s=>s.eastShore.company.count=1,s=>s.eastShore.company.day=s.day+1,s=>Object.assign(s.eastShore.company,{remaining:2,started:true,chosen:false})]){const d=JSON.parse(farmExportText());change(d.state);try{importFarmText(JSON.stringify(d));r.reject=false;}catch(_){}}
 return r;
 }finally{replaceFarmState(original,runtime);updateUI();}
 })()`);
 for(const [k,v]of Object.entries(result))assert.ok(v,'Duck company '+k+': '+JSON.stringify(result));
 console.log('Duck company passed: actual near resting birds, original waits/targets/positions, halfway/full restoration, pause/click, one daily completion, rain/night cancellation and real nests, winter, original depth/UI and legacy validation.');
};
