const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../js');
const sandbox={ctx:{tag:'main'},draws:[],painters:0};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'core/utils.js'),'utf8'),sandbox);
const region=fs.readFileSync(path.join(root,'art/region-ground.js'),'utf8');
vm.runInContext(region.slice(region.indexOf('function colorChannels('),region.indexOf('function groundChannel(')),sandbox);
vm.runInContext(`function groundTilePainter(){painters++;const tiles=[];return {add(...tile){tiles.push(tile)},draw(){draws.push({context:ctx.tag,tiles})}}}`,sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'art/east/east-shore-ground.js'),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
run('const site={x:2407,y:831,rx:67,ry:45};drawEastShoreWaterGround(site,0);const first=eastShoreGroundCache.get(site);');
assert.equal(sandbox.painters,2);assert.equal(sandbox.draws.length,2);
assert.ok(sandbox.draws[0].tiles.every(t=>t[4].startsWith('rgba('))); // shore precedes water
assert.ok(sandbox.draws[1].tiles.every(t=>t[4].startsWith('#')));
run('drawEastShoreWaterGround(site,0)');assert.equal(sandbox.painters,2);
assert.equal(run('eastShoreGroundCache.get(site)===first'),true);
run('ctx={tag:"export"};drawEastShoreWaterGround(site,0)');assert.equal(sandbox.draws.at(-1).context,'export');
run('drawEastShoreWaterGround(site,.37)');assert.equal(sandbox.painters,4);
assert.equal(run('eastShoreGroundCache.get(site).water===first.water'),true);
const palette=run('eastShoreGroundCache.get(site).paletteKey');
run('drawEastShoreWaterGround(site,.37000000001)');
assert.equal(run('eastShoreGroundCache.get(site).paletteKey'),palette);assert.equal(sandbox.painters,4);
for(const field of ['x','y','rx','ry']){
 const before=sandbox.painters;run(`site.${field}+=1;drawEastShoreWaterGround(site,.37)`);
 assert.equal(sandbox.painters,before+2);
}
assert.equal(run('eastShoreGroundCache.get(site).water===first.water'),false);
console.log('East-shore ground passed: reuse, palette quantization, all layout invalidations, shore order and current export context.');
