const assert=require('node:assert/strict'),fs=require('node:fs');
const {run}=require('./harness.cjs');
run(fs.readFileSync('kits/farm/tests/fixtures/terrain-colors-reference.js','utf8'));
run(`
let terrainTrace=[],terrainColorCalls=0;
const terrainOriginalChannel=groundChannel;
groundChannel=(...args)=>{terrainColorCalls++;return terrainOriginalChannel(...args);};
grass=()=>terrainTrace.push('grass');terrainDetails=()=>terrainTrace.push('details');
groundTilePainter=()=>({add(...args){terrainTrace.push(args);},draw(){terrainTrace.push('draw');}});
let terrainPalette=['#91ab76','#a5b781','#759965','#a4b97c','#aaa371','#88a66f','#93aa72'].map(colorChannels);
`);
function compare(){
  const state=run('JSON.stringify({farm,runtime:captureRuntimeState()})');
  run('terrainTrace=[];drawBaseTerrain(terrainPalette)');const actual=run('JSON.stringify(terrainTrace)');
  const calls=run('terrainColorCalls');
  run('terrainTrace=[];qaReferenceBaseTerrain(terrainPalette)');
  assert.equal(actual,run('JSON.stringify(terrainTrace)'),'Original ordered cells, exact colors and details');
  assert.equal(run('JSON.stringify({farm,runtime:captureRuntimeState()})'),state);
  return calls;
}
run('farm.paused=true;farm.view={x:217.37,y:619.83,zoom:.73};groundColorCache=null;terrainColorCalls=0');
compare();run('terrainColorCalls=0');assert.equal(compare(),0,'Hit does not recalculate any terrain channel');
run('terrainColorCalls=0;farm.view={x:100,y:400,zoom:.7}');const newlySeen=compare();assert.ok(newlySeen>0,'Newly exposed cells filled lazily');
run('terrainColorCalls=0');assert.equal(compare(),0,'Stable palette and camera hit');
run('terrainPalette=terrainPalette.map(c=>[...c]);terrainPalette[0][0]+=.12725;terrainColorCalls=0');assert.ok(compare()>0,'Exact fractional palette invalidates');
run('groundChannel=(...args)=>terrainOriginalChannel(...args)+1;terrainColorCalls=0');compare();
run('ctx={tag:"export"};W=WORLD_W;H=WORLD_H;farm.view={x:0,y:0,zoom:1}');compare();
run('farm=newFarm();farm.paused=true;terrainPalette=terrainPalette.map(c=>c.map(x=>x*.81));farm.view={x:0,y:0,zoom:.425};W=1152;H=816');compare();
assert.equal(run('farm.day'),1);
console.log('Terrain colors passed: frozen original draw order/colors, lazy exposure, exact palette and channel changes, camera/export/new-world and complete farm/runtime unchanged.');
