const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sandbox={farm:{view:{x:0,y:0,zoom:.425},paused:true},runtime:{actors:[1,2]},now:200,ctx:{tag:'main'},trace:[],built:0,
 pondDepth(x,y){return ((x-134)/84)**2+((y-190)/80)**2;},
 rect(...args){sandbox.trace.push({type:'rect',tag:sandbox.ctx.tag,args});},circle(...args){sandbox.trace.push({type:'circle',tag:sandbox.ctx.tag,args});},
 groundTilePainter(){sandbox.built++;const cells=[];return {add(...args){cells.push(args);},draw(){sandbox.trace.push({type:'group',tag:sandbox.ctx.tag,cells});}};}};
vm.createContext(sandbox);const run=s=>vm.runInContext(s,sandbox);
run(fs.readFileSync('kits/farm/js/core/utils.js','utf8'));
const source=fs.readFileSync('kits/farm/js/art/farm-art.js','utf8');run(source.slice(source.indexOf('let pondGroundCache='),source.indexOf('function drawPondDuck()')));
run(fs.readFileSync('kits/farm/tests/fixtures/pond-ground-reference.js','utf8'));
function compare(){const state=JSON.stringify([sandbox.farm,sandbox.runtime]);sandbox.trace=[];run('drawPond()');const actual=JSON.parse(JSON.stringify(sandbox.trace));sandbox.trace=[];run('qaReferencePond()');assert.deepEqual(actual,JSON.parse(JSON.stringify(sandbox.trace)));assert.equal(JSON.stringify([sandbox.farm,sandbox.runtime]),state);return actual;}
compare();const count=sandbox.built;sandbox.trace=[];run('drawPond()');assert.equal(sandbox.built,count,'Two original groups reused at exact stable input');
const previous=compare();sandbox.now+=.12725;const animated=compare();assert.notDeepEqual(previous,animated,'Water surface animation must stay live');
sandbox.ctx={tag:'export'};compare();const oldDepth=sandbox.pondDepth;sandbox.pondDepth=(x,y)=>oldDepth(x-12.37,y+19.83)*.98;compare();compare();
const oldHash=sandbox.hash;sandbox.hash=(...args)=>oldHash(...args)*.9;compare();compare();sandbox.farm.view={x:217.37,y:619.83,zoom:.73};compare();
sandbox.pondDepth=()=>1.09;compare();assert.equal(sandbox.trace[0].cells.length,0,'Exact depth threshold preserved');
sandbox.pondDepth=()=>.609999999;compare();sandbox.pondDepth=()=>.610000001;compare();
console.log('Pond ground passed: original ordered groups/rectangles, cold/hit, depth/hash changes, exact thresholds, live water animation, export context and unchanged farm/runtime.');
