const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../js'),sandbox={ctx:{tag:'main'},painters:0,draws:[],flecks:0,
 MARKET_LAYOUT:{district:{left:1432,top:730,right:2016,bottom:962},homes:[{x:1450},{x:1640},{x:1830}],stalls:[{x:1530},{x:1820}],fountain:{x:1713,y:886}},
 CENTRAL_PLAZA:{left:668,top:622,right:1190,bottom:974},open:[true,false],plazaOpen:false};
vm.createContext(sandbox);const run=code=>vm.runInContext(code,sandbox);
run(fs.readFileSync(path.join(root,'core/utils.js'),'utf8'));
const region=fs.readFileSync(path.join(root,'art/region-ground.js'),'utf8');
run(region.slice(region.indexOf('function smoothRange('),region.indexOf('function terrainNoise(')));
run(`function groundTilePainter(){painters++;const tiles=[];return {add(...tile){tiles.push(tile)},draw(){draws.push({context:ctx.tag,tiles})}}}
 function rect(){flecks++}function villageMarketStallOpen(index){return open[index]}
 function villageSiteOpen(){return plazaOpen}function plazaRightAt(y){return Math.min(CENTRAL_PLAZA.right,1136+Math.max(0,y-CENTRAL_PLAZA.top)*.82)}`);
run(fs.readFileSync(path.join(root,'art/village/village-ground.js'),'utf8'));
run('drawCachedVillageGround()');assert.equal(sandbox.painters,1);assert.equal(sandbox.draws.length,1);assert.equal(sandbox.flecks,115);
run('drawCachedVillageGround()');assert.equal(sandbox.painters,1);
run('plazaOpen=true;drawCachedVillageGround()');assert.equal(sandbox.painters,3);assert.equal(sandbox.draws.length,5);
run('plazaOpen=false;drawCachedVillageGround()');assert.equal(sandbox.painters,3);assert.equal(sandbox.draws.length,6);
run('ctx={tag:"export"};plazaOpen=true;drawCachedVillageGround()');assert.equal(sandbox.painters,3);assert.equal(sandbox.draws.at(-1).context,'export');
for(const change of ['open[1]=true','open[0]=false','MARKET_LAYOUT.homes[0].x++','MARKET_LAYOUT.stalls[1].x++','MARKET_LAYOUT.fountain.x++','MARKET_LAYOUT.fountain.y++',
 ...['left','top','right','bottom'].map(key=>`MARKET_LAYOUT.district.${key}++`)]){
 const before=sandbox.painters;run(change+';drawCachedVillageGround()');assert.equal(sandbox.painters,before+1);
}
for(const key of ['left','top','right','bottom']){
 const before=sandbox.painters;run(`CENTRAL_PLAZA.${key}++;drawCachedVillageGround()`);assert.equal(sandbox.painters,before+2);
}
console.log('Village ground passed: reuse, market/plaza gating, all ground layout invalidations and current export context.');
