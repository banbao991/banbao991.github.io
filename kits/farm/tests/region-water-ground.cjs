const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync('kits/farm/js/'+p,'utf8');
const sandbox={SOUTH_LAKE_SHIFT_Y:64,LAKE_X:242,LAKE_Y:929,LAKE_RX:146,LAKE_RY:95,VALLEY_LAKE_CENTER:{x:195,y:1220},WORLD_H:1920,WORLD_W:2560,
 farm:{day:742,view:{x:0,y:0,zoom:.425}},runtime:{animal:[1,2]},ctx:{tag:'main'},sceneSeason:{winter:0,palette:{grass:'#99aa77',grass2:'#8f9e66',dark:'#556633',flower:'#ffccaa'}},trace:[],built:0,
 groundTilePainter(){sandbox.built++;const cells=[];return {add(...args){cells.push(args);},draw(){sandbox.trace.push({tag:sandbox.ctx.tag,cells});}};}};
for(const name of ['drawCachedBaseTerrain','drawMineGround','drawVillageGround','drawEastShoreGround','drawWetlandCreek','drawNurseryGround','drawRiverCurrent','rect'])sandbox[name]=()=>{};
vm.createContext(sandbox);const run=s=>vm.runInContext(s,sandbox);
run(read('core/utils.js'));
let world=read('core/world-layout.js');run(world.slice(world.indexOf('function riverCenterAt('),world.indexOf('function bridgeAt(')));run(world.slice(world.indexOf('function valleyLakeDepth('),world.indexOf('function valleyLakeAt(')));
let lake=read('life/lake.js');run(lake.slice(lake.indexOf('function lakeDepth('),lake.indexOf('function lakeAt(')));
let region=read('art/region-ground.js');run(region.slice(region.indexOf('function lakePixel('),region.indexOf('function drawBaseTerrain(')));sandbox.colorChannels=()=>[];
run(read('art/region-water-ground.js'));run(region.slice(region.indexOf('function drawRegionGround()'),region.indexOf('function drawRegionPaths()')));
run(fs.readFileSync('kits/farm/tests/fixtures/region-water-reference.js','utf8'));
const snapshot=JSON.stringify([sandbox.farm,sandbox.runtime]);
function compare(){sandbox.trace=[];run('drawRegionGround()');const cached=JSON.parse(JSON.stringify(sandbox.trace));sandbox.trace=[];run('qaReferenceRegionGround()');assert.deepEqual(cached,JSON.parse(JSON.stringify(sandbox.trace)));}
compare();let count=sandbox.built;sandbox.trace=[];run('drawRegionGround()');assert.equal(sandbox.built,count,'Same exact geometry/colors reuse all five original groups');compare();
for(const winter of [1e-9,.12725,.5,.800001,1]){sandbox.sceneSeason.winter=winter;compare();compare();}
for(const field of ['LAKE_X','LAKE_Y','LAKE_RX','LAKE_RY','SOUTH_LAKE_SHIFT_Y']){sandbox[field]+=.000000001;compare();compare();}
for(const field of ['x','y']){sandbox.VALLEY_LAKE_CENTER[field]+=.000000001;compare();compare();}
sandbox.WORLD_H+=8;compare();sandbox.ctx={tag:'export'};compare();sandbox.farm.view={x:217.37,y:619.83,zoom:.73};compare();sandbox.farm.view={x:0,y:0,zoom:.425};
for(const name of ['riverCenterAt','lakeDepth','valleyLakeDepth','hash']){const previous=sandbox[name];sandbox[name]=(...args)=>previous(...args);compare();compare();}
assert.equal(JSON.stringify([sandbox.farm,sandbox.runtime]),snapshot);
console.log('Region water groups passed: ordered original geometry/colors, cold/hit, exact lake inputs, lake center, world height, function replacement, current export context and unchanged world/runtime.');
