const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync('kits/farm/js/'+p,'utf8');
const plants={lake:[{x:1,y:2,seed:1,kind:'grass'},{x:3,y:4,seed:2,kind:'tree'}],nursery:[{x:5,y:6,seed:3,kind:'grass'}]};
const weeds=new Map([['lake:1',{id:'lake:1',source:'lake',x:1,y:2,seed:1,original:true}],['new-4',{id:'new-4',source:'lake',x:7,y:8,seed:4,original:false}]]);
const sandbox={VILLAGE_PROJECT_IDS:['lake','nursery'],farm:{development:{projects:{lake:{status:'natural'},nursery:{status:'active'}},maintenance:{plants:{}},crew:[],residents:{}}},runtime:{position:[1,2]},contexts:0,blocked:new Set(),cleared:[],seen:[],parts:[],painted:[],
 villagePlantGroundContext(){sandbox.contexts++;return {blocked:sandbox.blocked};},villageWildPlantCandidates:id=>plants[id],villageGrassCatalog:()=>weeds,
 villagePlantGroundAllowed(id,p,c){sandbox.seen.push(c);return !c.blocked.has(p.seed);},villagePlantVisible:(id,p,c)=>!c.includes(p.seed),villageWildPlantClearance:()=>sandbox.cleared,
 scenePart(id,y,draw){sandbox.parts.push({id,y,draw});},drawVillageWildTree(id,p){sandbox.parts.push({id:'tree:'+id+':'+p.seed,y:p.y,draw(){}});},drawVillageWildGrass:p=>sandbox.painted.push({...p}),
 drawVillageCrewHome(){},drawVillagePastureHome(){},drawVillageConstructionFrame(id){sandbox.parts.push({id:'build:'+id,y:1,draw(){}});}};
vm.createContext(sandbox);const run=s=>vm.runInContext(s,sandbox);
let core=read('core/development/development-vegetation.js');run(core.slice(core.indexOf('function villageWildPlants('),core.indexOf('function villagePlantGroundContext(')));
let life=read('life/development/maintenance-life.js');run(life.slice(life.indexOf('function villageGrassGrowth('),life.indexOf('function villageWeedManaged(')));
let art=read('art/development/development-art.js');run(art.slice(art.indexOf('function drawVillageDevelopment()')));run(fs.readFileSync('kits/farm/tests/fixtures/development-collection-reference.js','utf8'));
function capture(fn){sandbox.contexts=0;sandbox.parts=[];sandbox.seen=[];sandbox.painted=[];fn();for(const p of sandbox.parts)p.draw();return {parts:sandbox.parts.map(p=>[p.id,p.y]),painted:JSON.parse(JSON.stringify(sandbox.painted)),contexts:sandbox.contexts,seen:[...sandbox.seen]};}
for(const blocked of [[],[1],[2,4]])for(const cleared of [[],[3],[1,4]])for(const growth of [0,.4,1]){
 sandbox.blocked=new Set(blocked);sandbox.cleared=cleared;sandbox.farm.development.maintenance.plants={'lake:1':{growth},'new-4':{growth}};
 const state=JSON.stringify([sandbox.farm,sandbox.runtime]);const old=capture(()=>sandbox.qaReferenceDevelopmentCollection()),next=capture(()=>sandbox.drawVillageDevelopment());
 assert.deepEqual(next.parts,old.parts);assert.deepEqual(next.painted,old.painted);assert.equal(old.contexts,3);assert.equal(next.contexts,1);assert.ok(next.seen.every(c=>c===next.seen[0]));assert.equal(JSON.stringify([sandbox.farm,sandbox.runtime]),state);
 // Default callers still obtain a fresh context; explicit snapshot is reused without re-creation.
 sandbox.contexts=0;sandbox.villageWildPlants('lake');sandbox.villageVisibleWeeds();assert.equal(sandbox.contexts,2);
 const context=sandbox.villagePlantGroundContext(),before=sandbox.contexts;
 const explicit=sandbox.villageWildPlants('lake',context);assert.deepEqual(explicit,sandbox.villageWildPlants('lake'));sandbox.villageVisibleWeeds(sandbox.cleared,true,context);assert.equal(sandbox.contexts,before+1);
}
sandbox.farm.development=null;sandbox.contexts=0;sandbox.drawVillageDevelopment();assert.equal(sandbox.contexts,0);
console.log('Shared plant context passed: original ordered scene/paint results, live growth/clearance/ground changes, one collection context, fresh default callers, explicit context and unchanged world/runtime.');
