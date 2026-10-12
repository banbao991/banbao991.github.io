const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sandbox={farm:{view:{x:0,y:0,zoom:1}},W:100,H:100,constructed:0,fills:[],bridges:0,flecks:[],
 paint:{edges:[{x:0,y:4,w:12,alpha:48},{x:2,y:6,w:9,alpha:52},{x:200,y:6,w:5,alpha:48}],
 graph:{nodes:[{x:1,y:2,w:40,h:8},{x:40,y:2,w:10,h:8,bridge:2},{x:50,y:2,w:12,h:8,footBridge:true}]},flecks:[{x:3,y:4}]}};
vm.createContext(sandbox);const run=code=>vm.runInContext(code,sandbox);
run(`class Path2D{constructor(){constructed++;this.rects=[];}rect(...r){this.rects.push(r)}}
 function rect(...r){flecks.push(r)}function drawRiverBridge(){bridges++}
 const ctx={tag:'main',beginPath(){this.rects=[]},rect(...r){this.rects.push(r)},
 fill(p){fills.push({tag:this.tag,color:this.fillStyle,path:p,rects:(p?p.rects:this.rects).map(r=>[...r])})}};`);
run(fs.readFileSync(path.resolve(__dirname,'../js/art/development/development-road-art.js'),'utf8'));
run('villageRoadPaint=()=>paint;drawVillageRoadSurface()');
assert.equal(sandbox.constructed,3);
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.fills.map(f=>f.rects))),[[[0,4,12,1]],[[2,6,9,1]],[[1,2,40,8]]]);
const first=sandbox.fills.slice();run("ctx.tag='export';drawVillageRoadSurface()");
assert.equal(sandbox.constructed,3);assert.equal(sandbox.bridges,2,'Bridge scenery is registered on every frame');
assert.equal(sandbox.flecks.length,4,'Grains and wooden footbridge keep their original per-frame paint');
for(let i=0;i<3;i++)assert.equal(sandbox.fills[i+3].path,first[i].path);
assert.equal(sandbox.fills.at(-1).tag,'export');
run('farm.view.x=150.25;drawVillageRoadSurface()');
assert.equal(sandbox.constructed,5);assert.equal(sandbox.fills.at(-1).path,first[2].path);
assert.equal(sandbox.fills.at(-3).rects[0][0],200,'Panning rebuilds the edge selection');
for(const change of ['farm.view.y++','farm.view.zoom=.75','W++','H++']){
 const before=sandbox.constructed;run(change+';drawVillageRoadSurface()');assert.equal(sandbox.constructed,before+2);
}
const before=sandbox.constructed;run('paint={...paint};delete paint.bodyPath;delete paint.pathBounds;drawVillageRoadSurface()');
assert.equal(sandbox.constructed,before+3,'A replaced graph/paint starts a new set of paths');
run('Path2D=undefined;drawVillageRoadSurface()');
assert.ok(sandbox.fills.slice(-3).every(f=>f.path===undefined),'Fallback contexts use ordinary current paths');
assert.equal(sandbox.fills.at(-1).color,'#d0b586');
console.log('Road paths passed: path reuse, exact edge selection, view/size/graph invalidation, export context and per-frame bridges.');
