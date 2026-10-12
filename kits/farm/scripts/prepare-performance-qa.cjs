// Isolated browser pages. The baseline snapshot is created once and never overwritten.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'.qa-performance');
const originals=['mine-art.js','region-water-ground.js','drawing-context.js','farm-art.js','region-ground.js','scene-depth.js','render.js','east/east-shore-art.js','nursery-art.js','village-art.js','development/development-road-art.js','development/development-art.js'];
// Optional baseline directory lets a later run reuse an archived pre-change painter.
// Without it, run this script BEFORE editing production rendering files.
const baseline=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'js/art');
for(const file of originals)if(!fs.existsSync(path.join(baseline,file)))throw Error(`Missing baseline: ${file}`);
fs.mkdirSync(path.join(qa,'before'),{recursive:true});
for(const file of originals){const dest=path.join(qa,'before',file);fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest))fs.copyFileSync(path.join(baseline,file),dest);}
// The color utility has its own snapshot; older archives predate this change.
const colorBaseline=process.argv[2]?path.join(baseline,'core-utils.js'):path.join(root,'js/core/utils.js');
if(!fs.existsSync(colorBaseline))throw Error('Missing baseline: core-utils.js');
const colorSnapshot=path.join(qa,'before/core-utils.js');
if(!fs.existsSync(colorSnapshot))fs.copyFileSync(colorBaseline,colorSnapshot);
const vegetationBaseline=process.argv[2]?path.join(baseline,'core-vegetation.js'):path.join(root,'js/core/development/development-vegetation.js');
if(!fs.existsSync(vegetationBaseline))throw Error('Missing baseline: core-vegetation.js');
const vegetationSnapshot=path.join(qa,'before/core-vegetation.js');
if(!fs.existsSync(vegetationSnapshot))fs.copyFileSync(vegetationBaseline,vegetationSnapshot);
const vegetationBaselineSource=fs.readFileSync(vegetationSnapshot,'utf8');
let allowedReference=vegetationBaselineSource.slice(vegetationBaselineSource.indexOf('function villagePlantGroundAllowed('),vegetationBaselineSource.indexOf('function villageProjectPlantFootprints('));
if(vegetationBaselineSource.includes('function villagePlantGeometryAllowed('))allowedReference=fs.readFileSync(path.join(root,'tests/fixtures/plant-ground-reference.js'),'utf8');
fs.writeFileSync(path.join(qa,'plant-ground-reference.js'),allowedReference.replace('function villagePlantGroundAllowed(','function qaReferencePlantGroundAllowed('));
const contextEnd=vegetationBaselineSource.includes('// Only the latest road/building')?vegetationBaselineSource.indexOf('// Only the latest road/building'):vegetationBaselineSource.indexOf('function villagePlantGroundAllowed(');
const plantContextReference=vegetationBaselineSource.slice(vegetationBaselineSource.indexOf('function villagePlantGroundContext('),contextEnd);
fs.writeFileSync(path.join(qa,'plant-context-reference.js'),plantContextReference.replace('function villagePlantGroundContext(','function qaReferencePlantContext('));
const maintenanceBaseline=process.argv[2]?path.join(baseline,'maintenance-life.js'):path.join(root,'js/life/development/maintenance-life.js');
const maintenanceSnapshot=path.join(qa,'before/maintenance-life.js');
if(!fs.existsSync(maintenanceBaseline))throw Error('Missing baseline: maintenance-life.js');
if(!fs.existsSync(maintenanceSnapshot))fs.copyFileSync(maintenanceBaseline,maintenanceSnapshot);
const colorSource=fs.readFileSync(colorSnapshot,'utf8');
const colorFunction=colorSource.includes('function blendHexDirect(')?'blendHexDirect':'blendHex';
const colorReference=colorSource.slice(colorSource.indexOf(`function ${colorFunction}(`));
fs.writeFileSync(path.join(qa,'color-reference.js'),colorReference.replace(`function ${colorFunction}(`,'function qaReferenceBlendHex('));
const developmentSource=fs.readFileSync(path.join(qa,'before/development/development-art.js'),'utf8');
let collectionReference=developmentSource.slice(developmentSource.indexOf('function drawVillageDevelopment()'));
if(collectionReference.includes('villageWildPlants(id,context)'))collectionReference=fs.readFileSync(path.join(root,'tests/fixtures/development-collection-reference.js'),'utf8');
fs.writeFileSync(path.join(qa,'collection-reference.js'),collectionReference.replace('function drawVillageDevelopment()','function qaReferenceDevelopmentCollection()'));
const projectFunction=developmentSource.includes('function villageSceneProjectDirect(')?'villageSceneProjectDirect':'villageSceneProject';
const projectReference=developmentSource.slice(developmentSource.indexOf(`function ${projectFunction}(`),developmentSource.indexOf('function villageSceneItemVisible('));
fs.writeFileSync(path.join(qa,'project-reference.js'),projectReference.replace(`function ${projectFunction}(`,'function qaReferenceVillageSceneProject('));
const regionSource=fs.readFileSync(path.join(qa,'before/region-ground.js'),'utf8');
const baseReference=fs.readFileSync(path.join(root,'tests/fixtures/terrain-colors-reference.js'),'utf8');
fs.writeFileSync(path.join(qa,'terrain-colors-reference.js'),baseReference);
let regionReference=regionSource.slice(regionSource.indexOf('function drawRegionGround()'),regionSource.indexOf('function drawRegionPaths()'));
if(regionReference.includes('drawRegionLakeGround('))regionReference=fs.readFileSync(path.join(root,'tests/fixtures/region-water-reference.js'),'utf8');
fs.writeFileSync(path.join(qa,'region-water-reference.js'),regionReference.replace('function drawRegionGround()','function qaReferenceRegionGround()'));
const mineSource=fs.readFileSync(path.join(qa,'before/mine-art.js'),'utf8');
let mineReference=mineSource.slice(mineSource.indexOf('function drawMineGround()'),mineSource.indexOf('function drawMineRail()'));
if(mineReference.includes('drawMineGroundStrata('))mineReference=fs.readFileSync(path.join(root,'tests/fixtures/mine-ground-reference.js'),'utf8');
fs.writeFileSync(path.join(qa,'mine-ground-reference.js'),mineReference.replace('function drawMineGround()','function qaReferenceMineGround()'));
const farmArtSource=fs.readFileSync(path.join(qa,'before/farm-art.js'),'utf8');
let pondReference=farmArtSource.slice(farmArtSource.indexOf('function drawPond()'),farmArtSource.indexOf('function drawPondDuck()'));
if(pondReference.includes('drawPondGround('))pondReference=fs.readFileSync(path.join(root,'tests/fixtures/pond-ground-reference.js'),'utf8');
fs.writeFileSync(path.join(qa,'pond-ground-reference.js'),pondReference.replace('function drawPond()','function qaReferencePond()'));
const eastSource=fs.readFileSync(path.join(qa,'before/east/east-shore-art.js'),'utf8');
const contextSource=fs.readFileSync(path.join(qa,'before/drawing-context.js'),'utf8').replace(/\r\n/g,'\n');
let groundReference;
if(contextSource.includes('function drawGroundTileGroupsDirect(groups)')){
 groundReference=contextSource.slice(contextSource.indexOf('function drawGroundTileGroupsDirect(groups)'),contextSource.indexOf('let rain ='))
  .replace('function drawGroundTileGroupsDirect(groups)','function qaReferenceGroundTileGroups(groups)');
}else{
 const painter=contextSource.slice(contextSource.indexOf('function groundTilePainter()'),contextSource.indexOf('let rain ='));
 const body=painter.slice(painter.indexOf('    draw(){')+'    draw(){'.length,painter.lastIndexOf('    }\n  };'));
 if(!body.includes('const transform=ctx.getTransform'))throw Error('Missing ground path baseline.');
 groundReference='function qaReferenceGroundTileGroups(groups) {'+body+'}\n';
}
fs.writeFileSync(path.join(qa,'ground-path-reference.js'),groundReference);
const reference=eastSource.slice(eastSource.indexOf('function drawEastShoreGround()'),eastSource.indexOf('function drawEastShoreScenery()'));
if(!reference.includes('function drawEastShoreGround()'))throw Error('Missing east-shore ground baseline.');
fs.writeFileSync(path.join(qa,'east-shore-reference.js'),reference.replace('function drawEastShoreGround()','function qaReferenceEastShoreGround()'));
const villageSource=fs.readFileSync(path.join(qa,'before/village-art.js'),'utf8');
const nurserySource=fs.readFileSync(path.join(qa,'before/nursery-art.js'),'utf8');
const nurseryReference=nurserySource.slice(nurserySource.indexOf('function drawNurseryGround()'),nurserySource.indexOf('function drawNurseryBed('));
fs.writeFileSync(path.join(qa,'nursery-reference.js'),nurseryReference.replace('function drawNurseryGround()','function qaReferenceNurseryGround()'));
const villageReference=villageSource.slice(villageSource.indexOf('function drawVillageGround()'),villageSource.indexOf('function drawVillage()'));
fs.writeFileSync(path.join(qa,'village-ground-reference.js'),villageReference.replace('function drawVillageGround()','function qaReferenceVillageGround()'));
const roadSource=fs.readFileSync(path.join(qa,'before/development/development-road-art.js'),'utf8');
const roadReference=roadSource.slice(roadSource.indexOf('function drawVillageRoadSurface()'));
if(!roadReference.startsWith('function drawVillageRoadSurface()'))throw Error('Missing road surface baseline.');
fs.writeFileSync(path.join(qa,'road-reference.js'),roadReference.replace('function drawVillageRoadSurface()','function qaReferenceVillageRoadSurface()'));
// Instrument the current ground predicate only in the generated QA page.
// Preserve its checks and early returns, with finally covering rejected plants.
function eligibilityProfile(source){
  if(source.includes('function villagePlantGeometryAllowed('))source=fs.readFileSync(path.join(root,'tests/fixtures/plant-ground-reference.js'),'utf8').replace('function qaReferencePlantGroundAllowed(','function villagePlantGroundAllowed(')+'function villageProjectPlantFootprints(';
  let ref=source.slice(source.indexOf('function villagePlantGroundAllowed('),source.indexOf('function villageProjectPlantFootprints('));
  const roadMarker=ref.includes('    for(let bx=')?'    for(let bx=':'    for(const key of villagePlantRoadKeys(';
  for(const marker of [roadMarker,'    if(buildings.some(','    if(riverAt('])if(!ref.includes(marker))throw Error('Ground profiling boundary changed: '+marker);
  return ref.replace('function villagePlantGroundAllowed(','function qaProfileGroundAllowed(')
    .replace(roadMarker,"    const roadStart=performance.now();try{\n"+roadMarker)
    .replace('    if(buildings.some(',"    }finally{qaNaturalRecord('roads',roadStart); }\n    const buildingStart=performance.now();try{\n    if(buildings.some(")
    .replace('    if(riverAt(',"    }finally{qaNaturalRecord('buildings',buildingStart); }\n    if(riverAt(");
}
fs.writeFileSync(path.join(qa,'eligibility-profile.js'),eligibilityProfile(fs.readFileSync(path.join(root,'js/core/development/development-vegetation.js'),'utf8')));
fs.writeFileSync(path.join(qa,'before/eligibility-profile.js'),eligibilityProfile(vegetationBaselineSource));
const allBaselineAvailable=!contextSource.includes('drawGroundTileGroupsDirect')&&!regionSource.includes('drawCachedBaseTerrain(')&&!vegetationBaselineSource.includes('villagePlantGeometryAllowed(')&&!developmentSource.includes('villageSceneProjectDirect(');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8')
  .replace('<head>',`<head><script>const qaAllBaselineAvailable=${allBaselineAvailable};</script><base href="/kits/farm/"><script>Storage.prototype.getItem=function(){return null;};Storage.prototype.setItem=function(){};Storage.prototype.removeItem=function(){};</script>`)
  .replace('<script src="js/ui/app.js" defer></script>','<script src="js/ui/app.js" defer></script><script src=".qa-performance/east-shore-reference.js" defer></script><script src=".qa-performance/village-ground-reference.js" defer></script><script src=".qa-performance/road-reference.js" defer></script><script src=".qa-performance/nursery-reference.js" defer></script><script src=".qa-performance/ground-path-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
for(const mode of ['before','after']){
  let page=html.replace('<body>',`<body data-qa-mode="${mode}">`);
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/color-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/project-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/eligibility-profile.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/plant-ground-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/region-water-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/collection-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/mine-ground-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/pond-ground-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/plant-context-reference.js" defer></script><script src="tests/performance-qa.js" defer></script>');
  page=page.replace('<script src="tests/performance-qa.js" defer></script>','<script src=".qa-performance/terrain-colors-reference.js" defer></script><script src="tests/performance-qa.js" defer></script><script src="tests/performance-camera-qa.js" defer></script>');
  if(mode==='before')page=page.replace('src="js/life/development/maintenance-life.js"','src=".qa-performance/before/maintenance-life.js"');
  if(mode==='before')page=page.replace('src=".qa-performance/eligibility-profile.js"','src=".qa-performance/before/eligibility-profile.js"');
  if(mode==='before')page=page.replace('src="js/core/development/development-vegetation.js"','src=".qa-performance/before/core-vegetation.js"');
  if(mode==='before')for(const file of originals)page=page.replace(`src="js/art/${file}"`,`src=".qa-performance/before/${file}"`);
  if(mode==='before')page=page.replace('src="js/core/utils.js"','src=".qa-performance/before/core-utils.js"');
  page=page.replace(/(src|href)="((?:js|css|tests|\.qa-performance)[^"]+)"/g,(_match,attribute,url)=>`${attribute}="${url}?qa=${Date.now()}"`);
  fs.writeFileSync(path.join(qa,mode+'.html'),page);
}
console.log('Prepared .qa-performance/before.html and after.html; player cache isolated.');
