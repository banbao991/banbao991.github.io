const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('kits/farm/js/core/development/development-vegetation.js','utf8');
const baseline=fs.readFileSync('kits/farm/tests/fixtures/plant-ground-reference.js','utf8');
const sandbox={farm:{day:742},runtime:{position:[1,2]},water:{river:false,pond:false,lake:false,valley:false,creek:false,depth:1.2},
 inRect:(x,y,l,t,r,b)=>x>=l&&x<r&&y>=t&&y<b};
for(const [name,key]of [['riverAt','river'],['pondAt','pond'],['lakeAt','lake'],['valleyLakeAt','valley'],['wetlandCreekAt','creek'],['wetlandMarshDepth','depth']])sandbox[name]=()=>sandbox.water[key];
vm.createContext(sandbox);vm.runInContext(source.slice(source.indexOf('let villagePlantGeometryCache='),source.indexOf('function villageProjectPlantFootprints(')),sandbox);vm.runInContext(baseline,sandbox);
const graph=roads=>{const buckets=new Map();for(const r of roads)for(let x=Math.floor(r.x/64);x<=Math.floor((r.x+r.w)/64);x++)for(let y=Math.floor(r.y/64);y<=Math.floor((r.y+r.h)/64);y++){const k=`${x}:${y}`;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(r);}return {nodes:roads,buckets};};
const before=JSON.stringify([sandbox.farm,sandbox.runtime]);let g=graph([{x:0,y:0,w:32,h:32},{x:80,y:100,w:32,h:24}]),buildings=[{left:160,top:0,right:200,bottom:40}];
const context=()=>({graph:g,buildings,geometry:sandbox.villagePlantGeometryContext(g,buildings)});
const compare=(plant,id='lake')=>{const c=context(),expected=sandbox.qaReferencePlantGroundAllowed(id,plant,c);assert.equal(sandbox.villagePlantGroundAllowed(id,plant,c),expected);assert.equal(sandbox.villagePlantGroundAllowed(id,plant,c),expected);return c;};
for(const kind of ['grass','tree'])for(const x of [-20,-14,0,32,46,46+1e-9,52,66,78,100,146,150,214-1e-9,214,214+1e-9,220,250])for(const y of [-20,0,32,46,46+1e-9,80,100,140])compare({x,y,kind});
let plant={x:250,y:250,kind:'grass'},c=compare(plant);assert.equal(context().geometry,c.geometry);
for(const key of ['x','y','kind']){plant[key]=key==='kind'?'tree':plant[key]+1e-9;compare(plant);}
// Open/move a building, rebuild/replace roads, and move a road rectangle in-place.
let previous=context().geometry;buildings.push({left:230,top:230,right:270,bottom:270});compare(plant);assert.notEqual(context().geometry,previous);
for(const field of ['left','top','right','bottom']){previous=context().geometry;buildings[0][field]+=1e-9;compare(plant);assert.notEqual(context().geometry,previous);}
buildings=[];g=graph([{x:240,y:240,w:32,h:32}]);compare(plant);previous=context().geometry;g.nodes[0].x+=1e-9;compare(plant);assert.notEqual(context().geometry,previous);
g=graph([]);for(const key of ['river','pond','lake','valley','creek']){sandbox.water[key]=true;compare(plant,'nursery');sandbox.water[key]=false;compare(plant,'nursery');}
for(const depth of [0,1.08-1e-9,1.08,1.08+1e-9,2]){sandbox.water.depth=depth;compare(plant,'nursery');compare(plant,'lake');}
// Caller-supplied contexts use the original checks without a retained geometry token.
const custom={graph:g,buildings};assert.equal(sandbox.villagePlantGroundAllowed('lake',plant,custom),sandbox.qaReferencePlantGroundAllowed('lake',plant,custom));
assert.equal(JSON.stringify([sandbox.farm,sandbox.runtime]),before);
console.log('Plant geometry cache passed: exact boundaries/kinds, moved/open buildings, road rebuild/value changes, live waters/depth, custom contexts and unchanged world/runtime.');
