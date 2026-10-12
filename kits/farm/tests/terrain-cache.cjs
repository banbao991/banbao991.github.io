const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const transform={a:.425,b:0,c:0,d:.425,e:32,f:0};
function context(surface){return {canvas:surface,saves:0,blits:0,
  getTransform:()=>({...transform}),setTransform(){},fillRect(){},
  save(){this.saves++;},restore(){this.saves--;},drawImage(){this.blits++;}};}
const canvas={},main=context(canvas),offscreen={},raster=context(offscreen);offscreen.getContext=()=>raster;
const sandbox={canvas,ctx:main,W:1152,H:816,farm:{view:{x:0,y:0,zoom:.425}},
  document:{createElement:()=>offscreen}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/art/terrain-cache.js'),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
run('let draws=0;function paint(){draws++;if(ctx!==baseTerrainCache.context)throw Error("wrong context");}');
run('drawCachedBaseTerrain("spring",paint);drawCachedBaseTerrain("spring",paint);');
assert.equal(run('draws'),1);assert.equal(main.blits,2);assert.equal(main.saves,0);
assert.equal(sandbox.ctx,main);
for(const change of ['farm.view.x=.25','farm.view.y=.5','farm.view.zoom=.73','W=1536','H=864']){
  const before=run('draws');run(`${change};drawCachedBaseTerrain("spring",paint);`);assert.equal(run('draws'),before+1);
}
transform.e=1.25;let before=run('draws');run('drawCachedBaseTerrain("spring",paint)');assert.equal(run('draws'),before+1);
before=run('draws');run('drawCachedBaseTerrain("winter",paint)');assert.equal(run('draws'),before+1);
assert.throws(()=>run('drawCachedBaseTerrain("broken",()=>{throw Error("paint failed");})'),/paint failed/);
assert.equal(sandbox.ctx,main);assert.equal(run('baseTerrainCache.key'),null);
before=run('draws');run('drawCachedBaseTerrain("winter",paint)');assert.equal(run('draws'),before+1);
const savedKey=run('baseTerrainCache.key'),savedCanvas=run('baseTerrainCache.canvas');
const exportContext=context({});sandbox.ctx=exportContext;
run('drawCachedBaseTerrain("export",()=>{draws++;})');
assert.equal(exportContext.blits,0);assert.equal(run('baseTerrainCache.key'),savedKey);
assert.equal(run('baseTerrainCache.canvas'),savedCanvas);assert.equal(sandbox.ctx,exportContext);
sandbox.ctx={};run('drawCachedBaseTerrain("mock",()=>{draws++;})');
assert.equal(run('baseTerrainCache.key'),savedKey);
assert.deepEqual(Object.keys(sandbox.farm),['view']);
console.log('terrain-cache: hit, palette, camera, transform, size, failure recovery and export isolation passed');
