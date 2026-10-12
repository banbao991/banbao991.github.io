const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sandbox={};vm.createContext(sandbox);const run=code=>vm.runInContext(code,sandbox);
run("const MARKET_LAYOUT={stalls:[{x:10},{x:20}]};let farm={development:{}};const open=new Set();let residentWorking=true;function villageSiteOpen(id){return open.has(id)}function villageResidentWorking(){return residentWorking}");
const source=fs.readFileSync(path.resolve(__dirname,'../js/art/development/development-art.js'),'utf8');
run(source.slice(0,source.indexOf('function drawVillageRoads()')));
run('const originalProject=villageSceneProjectDirect;let directCalls=0;villageSceneProjectDirect=id=>{directCalls++;return originalProject(id)}');
const ids=['village-stall:20','village-stall:10','fishing-cabin','pier-post:1','lake-boat','angler-fishing','forest-cabin','forest-keeper',
 'valley-windmill','valley-worker-home','valley-rocking-chair','herb:mint','worker:阿栀','valley-garden-air',
 'nursery-home','nursery-bench','nursery-bed:1','nursery-keeper','wetland-lookout','wetland-bridge','valley-sign','valley-posts',
 'mine-home','miner','sheep-barn','pasture-bench','worker:阿牧','pasture-worker-home','goat-barn',
 'traveller-home','traveller-cart','town-showcase:1','plaza-stage','plaza-well','plaza-bench','plaza-flower','plaza-shrub',
 'town-garden','town-firewood','town-hearth','east-garden-bed','town-tea-chimes','town-pavilion-tea-box',
 'east-picnic-bench','east-spring-bench','natural-site:herbs:1','chicken:10:20','courier'];
for(const id of ids){sandbox.id=id;assert.equal(run('villageSceneProject(id)'),run('originalProject(id)'));assert.equal(run('villageSceneProject(id)'),run('originalProject(id)'));}
run("directCalls=0;villageSceneProjectCache.clear();villageSceneProject('unknown');villageSceneProject('unknown')");
assert.equal(run('directCalls'),1,'Null classifications are cached too');
run("villageSceneProject('village-stall:20');MARKET_LAYOUT.stalls[1].x=21");
assert.equal(run("villageSceneProject('village-stall:20')"),null);assert.equal(run("villageSceneProject('village-stall:21')"),'mine');
run("for(let i=0;i<10000;i++){const id='chicken:'+i+':20';if(villageSceneProject(id)!==originalProject(id))throw Error('Classification changed');if(villageSceneProjectCache.size>2048)throw Error('Unbounded identifiers')}");
assert.equal(run("villageSceneItemVisible('nursery-home')"),false);
run("open.add('nursery')");assert.equal(run("villageSceneItemVisible('nursery-home')"),true,'Opening a project is evaluated live, independent of cached classification');
run("open.delete('nursery')");assert.equal(run("villageSceneItemVisible('nursery-home')"),false);
run("open.add('forest');residentWorking=false");assert.equal(run("villageSceneItemVisible('forest-keeper')"),false);
run("residentWorking=true");assert.equal(run("villageSceneItemVisible('forest-keeper')"),true,'Resident availability remains live');
run('farm={development:null}');assert.equal(run("villageSceneItemVisible('nursery-home')"),true,'Legacy saves preserve the visibility fallback');
console.log('Scene project cache passed: all mapping branches, exact IDs, moved stall, bounded moving IDs and live project/resident visibility.');
