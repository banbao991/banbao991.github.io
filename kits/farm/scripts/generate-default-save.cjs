// Offline authoring tool: advance the actual game loaded from index.html, never a player's cache.
// The harness provides DOM/canvas stubs; production rules still decide every purchase and project.
const assert = require('node:assert/strict');
const { run, painted, colors, context2d, fs, path, root } = require('../tests/harness.cjs');
// Offline generation needs no pixel trace; avoid keeping millions of mock draw operations.
context2d.fillRect = () => {};

const release = process.argv[2] || '1.2';
assert.match(release, /^\d+\.\d+(?:\.\d+)?$/);
const directory = path.join(root, 'saves', `v${release}`);
if (fs.existsSync(directory) && fs.readdirSync(directory).some(name => /\.zip$/i.test(name)))
  throw new Error('A release ZIP already exists; preserve it before generating a replacement.');

run(`Math=Object.create(Math);let authorSeed=712;
Math.random=()=>{authorSeed=(Math.imul(authorSeed,1664525)+1013904223)>>>0;return authorSeed/4294967296;};
let authorChecks=0,authorReady=false;
const authorPermanent=Object.keys(TOWN_GOODS).filter(id=>['decoration','ecology','curio'].includes(TOWN_GOODS[id].kind));
function authorMature(){return farm.development.completedCount===VILLAGE_PROJECT_IDS.length
  &&Object.values(farm.development.residents).every(r=>r.stage==='home')
  &&farm.upgrades===5&&farm.nursery.level===3
  &&Object.keys(TOWN_PROJECTS).every(id=>farm.town.improvements[id].level===3
    &&townImprovementGrowth(id)===1)
  &&authorPermanent.every(id=>farm.town.inventory[id]===TOWN_GOODS[id].stock)
  &&farm.town.donkeys.length===2;}
function authorSnapshotReady(){const w=weatherVisual();return authorMature()&&!isFestivalDay()
  &&seasonIndex()===0&&dayInSeason()>=3&&dayInSeason()<=6
  &&farm.phase>=.19&&farm.phase<.27&&w.cloud<.1
  &&farm.town.traveller.mode==='shop'&&!farm.town.construction;}
function authorAdvanceBatch(){for(let tick=0;tick<4000&&!authorReady&&farm.day<=2500;tick++){
  const elapsed=.2,dt=elapsed*(farm.phase>=NIGHT_START?2.1:1);
  now+=elapsed;motionNow+=elapsed;farm.phase+=dt/DAY_SECONDS;
  if(farm.phase>=NIGHT_START&&!farm.nightLogged){farm.nightLogged=true;record('天色渐暗，工人收工回家，动物们慢慢归巢。');}
  if(farm.phase>=1)nextDay();updateActors(dt);
  if(tick%1000===0){const archive=JSON.parse(farmExportText());parseFarmSave(archive);validateRuntimeSnapshot(archive.runtime);authorChecks++;}
  authorReady=authorSnapshotReady();
}}
function authorSummary(){return {day:farm.day,coins:farm.coins,completed:farm.development.completedCount,
  residents:Object.keys(farm.development.residents).length,nursery:farm.nursery.level,
  levels:Object.fromEntries(Object.entries(farm.town.improvements).map(([id,v])=>[id,v.level])),
  permanent:authorPermanent.filter(id=>farm.town.inventory[id]===TOWN_GOODS[id].stock).length,
  permanentTotal:authorPermanent.length,visits:farm.town.visits,checks:authorChecks,ready:authorReady};}`);
for (let batch=0; batch<2000 && !run('authorReady') && run('farm.day')<=2500; batch++) {
  run('authorAdvanceBatch()');
  painted.length=0; colors.length=0;
  if (batch%10===0 || run('authorReady')) console.log(JSON.stringify(run('authorSummary()')));
}
assert.equal(run('authorReady'),true,'Natural development did not reach the full release snapshot within 2500 days.');
// Set only presentation controls, retaining the actual world time, economy and actions.
run('farm.speed=1;farm.paused=true;farm.tool="inspect";farm.view={x:0,y:0,zoom:.7};clampCamera();');
const archive=run('farmExportText()');
assert.ok(Buffer.byteLength(archive)<run('FARM_ARCHIVE_MAX_BYTES'));
const text=JSON.parse(archive);
run(`const authored=importFarmText(${JSON.stringify(archive)});replaceFarmState(authored.state,authored.runtime);`);
assert.deepEqual(JSON.parse(run('farmExportText()')).state,text.state,'Restoration changed the release world.');
assert.deepEqual(JSON.parse(run('farmExportText()')).runtime,text.runtime,'Restoration changed the moving actors.');
const name=`苔谷农场-第${text.state.day}天`;
const bytes=run(`fflate.zipSync({[${JSON.stringify(name+'.json')}]:fflate.strToU8(${JSON.stringify(archive)})},{level:6})`);
assert.equal(run(`farmZipArchiveText(Uint8Array.from(${JSON.stringify([...bytes])}))`),archive);
fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(path.join(directory,name+'.zip'),bytes);
console.log(`Saved v${release}: ${name}.zip (${bytes.length} bytes), full runtime preserved; paused for inspection.`);
