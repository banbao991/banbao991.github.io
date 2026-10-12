const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sandbox={MINE_LAYOUT:{area:{left:1550,right:2090,top:1300,bottom:1920}},WORLD_H:1920,W:1152,H:816,
 farm:{view:{x:0,y:0,zoom:.425},development:{stage:0}},runtime:{actors:[1,2]},sceneSeason:{winter:0},rain:0,trace:[],built:0,ctx:{tag:'main'},cleared:false,
 weatherVisual(){return {rain:sandbox.rain};},villageWildPlantClearance(){return [sandbox.farm.development.stage];},
 villagePlantVisible(id,p,clearance){return !sandbox.cleared&&p.seed%3!==clearance[0]%3;},
 rect(...args){sandbox.trace.push({type:'rect',tag:sandbox.ctx.tag,args});},
 groundTilePainter(){sandbox.built++;const cells=[];return {add(...args){cells.push(args);},draw(){sandbox.trace.push({type:'group',tag:sandbox.ctx.tag,cells});}};}};
vm.createContext(sandbox);const run=s=>vm.runInContext(s,sandbox);
run(fs.readFileSync('kits/farm/js/core/utils.js','utf8'));
const source=fs.readFileSync('kits/farm/js/art/mine-art.js','utf8');run(source.slice(0,source.indexOf('function drawMineRail()')));
run(fs.readFileSync('kits/farm/tests/fixtures/mine-ground-reference.js','utf8'));
function compare(){const state=JSON.stringify([sandbox.farm,sandbox.runtime]);sandbox.trace=[];run('drawMineGround()');const actual=JSON.parse(JSON.stringify(sandbox.trace));sandbox.trace=[];run('qaReferenceMineGround()');assert.deepEqual(actual,JSON.parse(JSON.stringify(sandbox.trace)));assert.equal(JSON.stringify([sandbox.farm,sandbox.runtime]),state);}
compare();const count=sandbox.built;sandbox.trace=[];run('drawMineGround()');assert.equal(sandbox.built,count,'Hit must reuse all three original groups');
for(const winter of [1e-9,.12725,.5,.800001,1]){sandbox.sceneSeason.winter=winter;compare();compare();}
for(const rain of [0,.049999999,.050000001,.199999999,.200000001,.31275,1]){sandbox.rain=rain;compare();compare();}
sandbox.rain=.2;compare();const groups=sandbox.built;sandbox.rain=.200000001;sandbox.trace=[];run('drawMineGround()');assert.equal(sandbox.built,groups,'Rain only rebuilds at the original resolved ridge color change; puddle threshold remains live');compare();
for(const stage of [1,2,3,5]){sandbox.farm.development.stage=stage;compare();}sandbox.cleared=true;compare();sandbox.cleared=false;compare();
sandbox.MINE_LAYOUT.area.right+=1e-9;compare();sandbox.WORLD_H+=8;compare();sandbox.ctx={tag:'export'};compare();
const oldHash=sandbox.hash;sandbox.hash=(...args)=>oldHash(...args)*.99;compare();compare();
sandbox.farm.view={x:2300,y:2000,zoom:1};compare();assert.equal(sandbox.trace.length,0,'Offscreen gate stays live');sandbox.farm.view={x:0,y:0,zoom:.425};compare();
console.log('Mine ground passed: original ordered groups/rectangles, cold/hit, exact layout/winter/rain colors, hash replacement, live clearing/puddles/viewport, current export context and unchanged farm/runtime.');
