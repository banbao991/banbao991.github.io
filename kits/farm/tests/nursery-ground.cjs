const assert=require('node:assert/strict');
const {run,sandbox,imageContext2d,exportPainted}=require('./harness.cjs');
run('let nurseryBuilds=0;const actualNurseryBuild=buildNurseryGround;buildNurseryGround=(colors)=>{nurseryBuilds++;return actualNurseryBuild(colors)}');
const state=run('JSON.stringify(farm)');
run('drawNurseryGround();drawNurseryGround()');assert.equal(run('nurseryBuilds'),1);
assert.equal(run('JSON.stringify(farm)'),state);
const first=run('nurseryGroundCache.layers');
run('sceneSeason.winter+=1e-12;drawNurseryGround()');assert.equal(run('nurseryBuilds'),1,'Same actual colors keep the same groups');
run('farm.nursery.wetness+=1e-12;drawNurseryGround()');assert.equal(run('nurseryBuilds'),2,'Wetness is never rounded for caching');
assert.notEqual(run('nurseryGroundCache.layers'),first);
run('sceneSeason.winter=.5;drawNurseryGround()');assert.equal(run('nurseryBuilds'),3);
const changes=run(`[
 ...NURSERY_LAYOUT.wetlandLobes.flatMap((_,i)=>['x','y','rx','ry'].map(k=>'NURSERY_LAYOUT.wetlandLobes['+i+'].'+k+'++')),
 ...['x','y','rx','ry'].map(k=>'NURSERY_LAYOUT.wetlandPool.'+k+'++'),
 ...NURSERY_LAYOUT.wetlandPuddles.flatMap((_,i)=>['x','y','rx','ry'].map(k=>'NURSERY_LAYOUT.wetlandPuddles['+i+'].'+k+'++'))]`);
for(const change of changes){const before=run('nurseryBuilds');run(change+';drawNurseryGround()');assert.equal(run('nurseryBuilds'),before+1);}
const before=run('nurseryBuilds');sandbox.nurseryExportContext=imageContext2d;
run('const oldNurseryContext=ctx;ctx=nurseryExportContext;drawNurseryGround();ctx=oldNurseryContext');
assert.equal(run('nurseryBuilds'),before);assert.ok(exportPainted.length>0,'Reuse groups in the current export context');
run('farm=newFarm();drawNurseryGround()');assert.equal(run('nurseryBuilds'),before+1,'A different loaded wetness immediately rebuilds');
console.log('Nursery ground passed: exact wetness, actual colors, all lobe/basin fields, current export context, reset and read-only drawing.');
