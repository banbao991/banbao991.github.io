'use strict';
// Loaded only by the generated isolated QA page, never by index.html.
const qaStageNames=['ground','mineGround','villageGround','eastShore','creek','nurseryGround','riverCurrent','pond','collect','naturalCollect','roads','sorting','entities','weather'];
let qaSample=null,qaFrames=[],qaTimes={},qaLast=null,qaScenario='paused';
let qaPair=null,qaEntityProfile=null,qaNaturalProfile=null,qaNaturalFrame=null,qaNaturalDepth=0,qaAllowedDepth=0,qaNaturalMode='top',qaOptimization='terrain-colors';
const qaOriginal={drawBaseTerrain,villagePlantGroundContext,villagePlantGroundAllowed,drawVillageDevelopment,villageSceneProject,blendHex,render,drawRegionGround,drawEastShoreGround,drawPond,farmSceneItems,drawSceneItems,weatherAndLight,
  drawMineGround,drawVillageGround,drawWetlandCreek,drawNurseryGround,drawRiverCurrent,drawVillageRoadSurface,sortSceneItems,
  drawGroundTileGroups:typeof drawGroundTileGroups==='undefined'?null:drawGroundTileGroups};
function qaTimed(name,fn,args){const start=performance.now();try{return fn(...args);}finally{if(qaSample)qaTimes[name]=(qaTimes[name]||0)+performance.now()-start;}}
drawRegionGround=(...args)=>qaTimed('ground',qaOriginal.drawRegionGround,args);
drawEastShoreGround=(...args)=>qaTimed('eastShore',qaOriginal.drawEastShoreGround,args);
drawMineGround=(...args)=>qaTimed('mineGround',qaOriginal.drawMineGround,args);
drawVillageGround=(...args)=>qaTimed('villageGround',qaOriginal.drawVillageGround,args);
drawWetlandCreek=(...args)=>qaTimed('creek',qaOriginal.drawWetlandCreek,args);
drawNurseryGround=(...args)=>qaTimed('nurseryGround',qaOriginal.drawNurseryGround,args);
drawRiverCurrent=(...args)=>qaTimed('riverCurrent',qaOriginal.drawRiverCurrent,args);
drawVillageRoadSurface=(...args)=>qaTimed('roads',qaOriginal.drawVillageRoadSurface,args);
sortSceneItems=(...args)=>qaTimed('sorting',qaOriginal.sortSceneItems,args);
drawPond=(...args)=>qaTimed('pond',qaOriginal.drawPond,args);
drawVillageDevelopment=(...args)=>{
  qaNaturalDepth++;
  try{return qaTimed('naturalCollect',qaOriginal.drawVillageDevelopment,args);}
  finally{qaNaturalDepth--;}
};
// Profiling wrappers exist only in this isolated page. Child timings overlap
// their parents; water mode also adds timer overhead to groundAllowed itself.
function qaNaturalTimed(name,fn,args,water=false){
  if(!qaNaturalFrame||!qaNaturalDepth||(water?qaNaturalMode!=='water'||!qaAllowedDepth:qaNaturalMode!=='top'&&name!=='groundAllowed'))return fn(...args);
  const start=performance.now();if(name==='groundAllowed')qaAllowedDepth++;
  try{return fn(...args);}finally{
    if(name==='groundAllowed')qaAllowedDepth--;
    const frame=qaNaturalFrame;frame.ms[name]=(frame.ms[name]||0)+performance.now()-start;
    frame.counts[name]=(frame.counts[name]||0)+1;
  }
}
function qaNaturalRecord(name,start){
  const frame=qaNaturalFrame;frame.ms[name]=(frame.ms[name]||0)+performance.now()-start;
  frame.counts[name]=(frame.counts[name]||0)+1;
}
const qaNaturalOriginal={context:villagePlantGroundContext,allowed:villagePlantGroundAllowed,
  clearance:villageWildPlantClearance,visible:villagePlantVisible,
  river:riverAt,pond:pondAt,lake:lakeAt,valley:valleyLakeAt,creek:wetlandCreekAt,marsh:wetlandMarshDepth};
villagePlantGroundContext=(...args)=>qaNaturalTimed('context',qaNaturalOriginal.context,args);
villagePlantGroundAllowed=(...args)=>qaNaturalTimed('groundAllowed',qaNaturalFrame&&qaNaturalDepth&&qaNaturalMode==='geometry'?qaProfileGroundAllowed:qaNaturalOriginal.allowed,args);
villageWildPlantClearance=(...args)=>qaNaturalTimed('clearance',qaNaturalOriginal.clearance,args);
villagePlantVisible=(...args)=>qaNaturalTimed('visible',qaNaturalOriginal.visible,args);
riverAt=(...args)=>qaNaturalTimed('river',qaNaturalOriginal.river,args,true);
pondAt=(...args)=>qaNaturalTimed('pond',qaNaturalOriginal.pond,args,true);
lakeAt=(...args)=>qaNaturalTimed('lake',qaNaturalOriginal.lake,args,true);
valleyLakeAt=(...args)=>qaNaturalTimed('valley',qaNaturalOriginal.valley,args,true);
wetlandCreekAt=(...args)=>qaNaturalTimed('creek',qaNaturalOriginal.creek,args,true);
wetlandMarshDepth=(...args)=>qaNaturalTimed('marsh',qaNaturalOriginal.marsh,args,true);
farmSceneItems=(...args)=>qaTimed('collect',qaOriginal.farmSceneItems,args);
drawSceneItems=(items)=>{
  const profile=qaEntityProfile;
  if(!profile)return qaTimed('entities',qaOriginal.drawSceneItems,[items]);
  const measured=items.map(item=>({...item,draw(){
    const start=performance.now();try{return item.draw();}finally{
      const id=item.id.split(':')[0],entry=profile.costs.get(id)||{ms:0,count:0};
      entry.ms+=performance.now()-start;entry.count++;profile.costs.set(id,entry);
    }
  }}));
  qaOriginal.drawSceneItems(measured);profile.frames++;
  if(performance.now()-profile.started>=12000){
    qaEntityProfile=null;
    document.getElementById('qa-result').textContent=JSON.stringify({profile:'entity callbacks',frames:profile.frames,
      canvas:[W,H],zoom:farm.view.zoom,day:farm.day,phase:farm.phase,paused:farm.paused,weather:farm.weather,
      costs:[...profile.costs].map(([id,cost])=>({id,meanMs:cost.ms/profile.frames,meanCount:cost.count/profile.frames}))
        .sort((a,b)=>b.meanMs-a.meanMs),note:'Callback instrumentation only; do not interpret its FPS as product FPS.'},null,2);
  }
};
weatherAndLight=(...args)=>qaTimed('weather',qaOriginal.weatherAndLight,args);
render=(...args)=>{
  if(qaPair){
    const pair=qaPair,base=drawBaseTerrain,cache=drawCachedBaseTerrain,east=drawEastShoreGround,village=drawVillageGround,roads=drawVillageRoadSurface,nursery=drawNurseryGround,ground=drawGroundTileGroups,color=blendHex,project=villageSceneProject,allowed=villagePlantGroundAllowed,region=drawRegionGround,collection=drawVillageDevelopment,mine=drawMineGround,pond=drawPond,plantContext=villagePlantGroundContext,record={};
    const order=pair.frames.length%2?['cached','raw']:['raw','cached'];
    const firstState=qaOptimization==='all'&&pair.frames.length===0?JSON.stringify({farm,runtime:captureRuntimeState()}):null;
    const firstPNGs=[];
    try{for(const mode of order){
      drawBaseTerrain=['all','terrain-colors'].includes(qaOptimization)?(mode==='raw'?qaReferenceBaseTerrain:qaOriginal.drawBaseTerrain):base;
      villagePlantGroundContext=qaOptimization==='all'?(mode==='raw'?qaReferencePlantContext:qaOriginal.villagePlantGroundContext):plantContext;
      drawCachedBaseTerrain=['all','base'].includes(qaOptimization)&&mode==='raw'?(_key,draw)=>draw():cache;
      drawEastShoreGround=['all','east-shore'].includes(qaOptimization)?(mode==='raw'?qaReferenceEastShoreGround:qaOriginal.drawEastShoreGround):east;
      drawVillageGround=['all','village-ground'].includes(qaOptimization)?(mode==='raw'?qaReferenceVillageGround:qaOriginal.drawVillageGround):village;
      drawVillageRoadSurface=['all','roads'].includes(qaOptimization)?(mode==='raw'?qaReferenceVillageRoadSurface:qaOriginal.drawVillageRoadSurface):roads;
      drawNurseryGround=['all','nursery'].includes(qaOptimization)?(mode==='raw'?qaReferenceNurseryGround:qaOriginal.drawNurseryGround):nursery;
      drawGroundTileGroups=['all','ground-paths'].includes(qaOptimization)?(mode==='raw'?qaReferenceGroundTileGroups:qaOriginal.drawGroundTileGroups):ground;
      blendHex=['all','colors'].includes(qaOptimization)?(mode==='raw'?qaReferenceBlendHex:qaOriginal.blendHex):color;
      villageSceneProject=['all','projects'].includes(qaOptimization)?(mode==='raw'?qaReferenceVillageSceneProject:qaOriginal.villageSceneProject):project;
      villagePlantGroundAllowed=['all','plant-geometry'].includes(qaOptimization)?(mode==='raw'?qaReferencePlantGroundAllowed:qaOriginal.villagePlantGroundAllowed):allowed;
      drawRegionGround=['all','region-water'].includes(qaOptimization)?(mode==='raw'?qaReferenceRegionGround:qaOriginal.drawRegionGround):region;
      drawVillageDevelopment=['all','shared-context'].includes(qaOptimization)?(mode==='raw'?qaReferenceDevelopmentCollection:qaOriginal.drawVillageDevelopment):collection;
      drawMineGround=['all','mine-ground'].includes(qaOptimization)?(mode==='raw'?qaReferenceMineGround:qaOriginal.drawMineGround):mine;
      drawPond=['all','pond-ground'].includes(qaOptimization)?(mode==='raw'?qaReferencePond:qaOriginal.drawPond):pond;
      const start=performance.now();qaOriginal.render(...args);record[mode]=performance.now()-start;
      if(firstState){if(JSON.stringify({farm,runtime:captureRuntimeState()})!==firstState)throw Error('Cumulative mode changed farm/runtime');firstPNGs.push(canvas.toDataURL('image/png'));}
    }}finally{drawBaseTerrain=base;drawCachedBaseTerrain=cache;drawEastShoreGround=east;drawVillageGround=village;drawVillageRoadSurface=roads;drawNurseryGround=nursery;drawGroundTileGroups=ground;blendHex=color;villageSceneProject=project;villagePlantGroundAllowed=allowed;drawRegionGround=region;drawVillageDevelopment=collection;drawMineGround=mine;drawPond=pond;villagePlantGroundContext=plantContext;}
    if(firstState){pair.firstRenderStateUnchanged=true;pair.firstRenderPixelIdentical=firstPNGs[0]===firstPNGs[1];if(!pair.firstRenderPixelIdentical)throw Error('Cumulative mode PNG mismatch');}
    pair.frames.push(record);
    if(performance.now()-pair.started>=12000){
      const frames=pair.frames.slice(20),summary=key=>{
        const values=frames.map(f=>f[key]).sort((a,b)=>a-b);
        return {mean:values.reduce((a,b)=>a+b,0)/values.length,p95:values[Math.floor((values.length-1)*.95)],max:values.at(-1)};
      };
      qaPair=null;document.getElementById('qa-result').textContent=JSON.stringify({optimization:qaOptimization,scenario:qaScenario,pairedFrames:frames.length,
        day:farm.day,phase:farm.phase,paused:farm.paused,weather:farm.weather,
        canvas:[W,H],zoom:farm.view.zoom,...(qaOptimization==='all'?{firstRenderStateUnchanged:pair.firstRenderStateUnchanged,firstRenderPixelIdentical:pair.firstRenderPixelIdentical}:{}),raw:summary('raw'),cached:summary('cached')},null,2);
    }return;
  }
  const natural=qaNaturalProfile;
  const checkState=natural&&natural.frames.length===0?JSON.stringify({farm,runtime:captureRuntimeState()}):null;
  if(natural)qaNaturalFrame={ms:{},counts:{}};
  const start=performance.now();
  try{qaOriginal.render(...args);}finally{
    if(natural){
      const frame=qaNaturalFrame;frame.render=performance.now()-start;qaNaturalFrame=null;
      if(checkState!==null){
        if(JSON.stringify({farm,runtime:captureRuntimeState()})!==checkState){
          qaNaturalProfile=null;throw Error('Natural profiler render changed world state');
        }
        // One synchronous direct render uses the same animation clock. Compare
        // encoded PNGs, without reading pixels from the live drawing context.
        const measuredPNG=canvas.toDataURL('image/png');qaOriginal.render(...args);
        natural.firstRenderPixelIdentical=canvas.toDataURL('image/png')===measuredPNG;
        if(!natural.firstRenderPixelIdentical||JSON.stringify({farm,runtime:captureRuntimeState()})!==checkState){
          qaNaturalProfile=null;throw Error('Natural profiler changed pixels or runtime');
        }
      }
      natural.frames.push(frame);
      if(performance.now()-natural.started>=12000){
        qaNaturalProfile=null;
        const frames=natural.frames.slice(20),names=[...new Set(frames.flatMap(f=>Object.keys(f.ms)))];
        const stats=values=>{values.sort((a,b)=>a-b);return {mean:values.reduce((a,b)=>a+b,0)/values.length,p95:values[Math.floor((values.length-1)*.95)],max:values.at(-1)};};
        const bounds=canvas.getBoundingClientRect();
        document.getElementById('qa-result').textContent=JSON.stringify({profile:'natural eligibility',mode:qaNaturalMode,scenario:qaScenario,
          frames:frames.length,canvas:[W,H],display:[bounds.width,bounds.height],zoom:farm.view.zoom,day:farm.day,phase:farm.phase,paused:farm.paused,weather:farm.weather,
          firstRenderWorldAndRuntimeUnchanged:true,firstRenderPixelIdentical:natural.firstRenderPixelIdentical,render:stats(frames.map(f=>f.render)),
          functions:names.map(name=>({name,...stats(frames.map(f=>f.ms[name]||0)),meanCalls:frames.reduce((sum,f)=>sum+(f.counts[name]||0),0)/frames.length})).sort((a,b)=>b.mean-a.mean),
          note:'Inclusive parent/child times overlap; instrumentation adds overhead. These are diagnostic timings, not product FPS or optimization gains.'},null,2);
      }
    }
  }
  if(!qaSample)return;
  const elapsed=performance.now()-start,stamp=start;
  qaFrames.push({render:elapsed,interval:qaLast===null?null:stamp-qaLast,...qaTimes});qaTimes={};qaLast=stamp;
  if(stamp-qaSample.started>=12000){
    const mean=key=>qaFrames.reduce((sum,f)=>sum+(f[key]||0),0)/qaFrames.length;
    const sorted=qaFrames.map(f=>f.render).sort((a,b)=>a-b),intervals=qaFrames.slice(1).map(f=>f.interval);
    const bounds=canvas.getBoundingClientRect();
    const result={mode:document.body.dataset.qaMode,scenario:qaScenario,day:farm.day,phase:farm.phase,paused:farm.paused,weather:farm.weather,
      canvas:[W,H],display:[bounds.width,bounds.height],zoom:farm.view.zoom,frames:qaFrames.length,
      fps:intervals.length*1000/intervals.reduce((sum,x)=>sum+x,0),renderMean:mean('render'),renderP95:sorted[Math.floor((sorted.length-1)*.95)],renderMax:sorted.at(-1),
      stages:Object.fromEntries(qaStageNames.map(key=>[key,mean(key)]))};
    qaSample=null;document.getElementById('qa-result').textContent=JSON.stringify(result,null,2);
  }
};
async function qaLoad(scenario){
  qaSample=null;qaPair=null;qaEntityProfile=null;qaNaturalProfile=null;const archive=await readDefaultFarmArchive();replaceFarmState(archive.state,archive.runtime);
  farm.paused=scenario!=='running';qaScenario=scenario;
  if(scenario==='night')farm.phase=.76;
  if(scenario==='rain')farm.weather=farm.weatherFrom='rain';
  if(scenario==='snow'){farm.day=767;farm.weather=farm.weatherFrom='snow';}
  now=200;setZoom(0);updateUI();
  document.getElementById('qa-result').textContent='就绪 · '+scenario;
}
async function qaCompareCache(){
  if(document.body.dataset.qaMode!=='after')return;
  qaEntityProfile=null;qaNaturalProfile=null;qaSample=null;qaPair=null;
  const original={base:drawBaseTerrain,plantContext:villagePlantGroundContext,pond:drawPond,mine:drawMineGround,collection:drawVillageDevelopment,region:drawRegionGround,allowed:villagePlantGroundAllowed,project:villageSceneProject,color:blendHex,farm,ctx,W,H,now,motionNow,sceneSeason,cache:drawCachedBaseTerrain,east:drawEastShoreGround,village:drawVillageGround,roads:drawVillageRoadSurface,nursery:drawNurseryGround,
    ground:typeof drawGroundTileGroups==='undefined'?null:drawGroundTileGroups};
  const jobs=[];
  const compare=label=>{
    const setMode=raw=>{
      drawBaseTerrain=['all','terrain-colors'].includes(qaOptimization)?(raw?qaReferenceBaseTerrain:qaOriginal.drawBaseTerrain):original.base;
      villagePlantGroundContext=qaOptimization==='all'?(raw?qaReferencePlantContext:qaOriginal.villagePlantGroundContext):original.plantContext;
      drawPond=['all','pond-ground'].includes(qaOptimization)?(raw?qaReferencePond:qaOriginal.drawPond):original.pond;
      drawMineGround=['all','mine-ground'].includes(qaOptimization)?(raw?qaReferenceMineGround:qaOriginal.drawMineGround):original.mine;
      drawVillageDevelopment=['all','shared-context'].includes(qaOptimization)?(raw?qaReferenceDevelopmentCollection:qaOriginal.drawVillageDevelopment):original.collection;
      drawRegionGround=['all','region-water'].includes(qaOptimization)?(raw?qaReferenceRegionGround:qaOriginal.drawRegionGround):original.region;
      villagePlantGroundAllowed=['all','plant-geometry'].includes(qaOptimization)?(raw?qaReferencePlantGroundAllowed:qaOriginal.villagePlantGroundAllowed):original.allowed;
      blendHex=['all','colors'].includes(qaOptimization)?(raw?qaReferenceBlendHex:qaOriginal.blendHex):original.color;
      villageSceneProject=['all','projects'].includes(qaOptimization)?(raw?qaReferenceVillageSceneProject:qaOriginal.villageSceneProject):original.project;
      drawCachedBaseTerrain=['all','base'].includes(qaOptimization)&&raw?(_key,draw)=>draw():original.cache;
      drawEastShoreGround=['all','east-shore'].includes(qaOptimization)?(raw?qaReferenceEastShoreGround:qaOriginal.drawEastShoreGround):original.east;
      drawVillageGround=['all','village-ground'].includes(qaOptimization)?(raw?qaReferenceVillageGround:qaOriginal.drawVillageGround):original.village;
      drawVillageRoadSurface=['all','roads'].includes(qaOptimization)?(raw?qaReferenceVillageRoadSurface:qaOriginal.drawVillageRoadSurface):original.roads;
      drawNurseryGround=['all','nursery'].includes(qaOptimization)?(raw?qaReferenceNurseryGround:qaOriginal.drawNurseryGround):original.nursery;
      if(original.ground)drawGroundTileGroups=['all','ground-paths'].includes(qaOptimization)?(raw?qaReferenceGroundTileGroups:qaOriginal.drawGroundTileGroups):original.ground;
    };
    const snapshot=()=>JSON.stringify({farm,runtime:captureRuntimeState()});
    const state=snapshot();setMode(true);render();
    if(snapshot()!==state)throw Error('Reference painter changed world state');
    // Repeated getImageData on the live canvas can switch Chromium from GPU to
    // CPU rasterization, changing fractional pixel antialiasing during the test.
    // Freeze PNGs instead; decode each onto a separate readback-only canvas.
    const expected=ctx.canvas.toDataURL('image/png');
    setMode(false);
    // Test both the rebuild and the following cache hit.
    baseTerrainCache.key=null;groundColorCache=null;
    if(['all','mine-ground'].includes(qaOptimization)){mineGroundStrataCache=null;mineRockGeometryCache=null;}
    if(['all','pond-ground'].includes(qaOptimization))pondGroundCache=null;
    if(['all','colors'].includes(qaOptimization)){hexBlendCache.clear();hexBlendCacheSize=0;}
    if(['all','region-water'].includes(qaOptimization)){regionLakeGroundCache=null;regionValleyGroundCache=null;regionRiverGroundCache=null;}
    if(['all','plant-geometry'].includes(qaOptimization))villagePlantGeometryCache=null;
    if(['all','projects'].includes(qaOptimization))villageSceneProjectCache.clear();
    if(typeof eastShoreGroundCache!=='undefined')for(const site of [EAST_SHORE.spring,EAST_SHORE.pond])eastShoreGroundCache.delete(site);
    if(typeof villageYardGroundCache!=='undefined'){villageYardGroundCache=null;villagePlazaGroundCache=null;}
    if(typeof villageRoadPaintCache!=='undefined')villageRoadPaintCache=null;
    if(typeof nurseryGroundCache!=='undefined')nurseryGroundCache=null;
    for(const pass of (['ground-paths','mine-ground','pond-ground','terrain-colors','all'].includes(qaOptimization)?['rebuild','path-build','hit','raw-again']:['rebuild','hit','raw-again'])){
      if(pass==='raw-again')setMode(true);
      render();if(snapshot()!==state)throw Error('Painter changed world state');
      jobs.push({label,pass,expected,actual:ctx.canvas.toDataURL('image/png')});
    }
    setMode(false);
  };
  try{
    farm=structuredClone(farm);farm.paused=true;now=200;motionNow=100;
    for(const [day,phase,weather]of [[742,.19,'sun'],[742,.76,'sun'],[742,.19,'rain'],
      [767,.19,'snow'],[751,.4,'sun'],[752,.4,'sun'],[753,.4,'sun'],[815,.4,'sun'],[760,.4,'sun']]){
      farm.day=day;farm.phase=phase;farm.weather=farm.weatherFrom=weather;
      compare(`day ${day} / ${phase} / ${weather}`);
    }
    farm.view={x:217.37,y:619.83,zoom:.73};compare('fractional pan and zoom');
    if(['nursery','ground-paths','colors','projects','plant-geometry','region-water','shared-context','mine-ground','pond-ground','terrain-colors','all'].includes(qaOptimization))for(const wetness of [0,.12725,.5,.800001,1]){
      farm.nursery.wetness=wetness;compare(`exact wetness ${wetness}`);
    }
    farm=newFarm();farm.paused=true;farm.view={x:0,y:0,zoom:.425};compare('initial map');
    if(['roads','ground-paths','colors','projects','plant-geometry','region-water','shared-context','mine-ground','pond-ground','terrain-colors','all'].includes(qaOptimization)){
      farm.development.roads.push('west-south:0');farm.development.revision++;compare('one road segment completed');
      farm.development.active='herbs';farm.development.projects.herbs.status='active';
      farm.development.projects.herbs.stage='road';farm.development.projects.herbs.chunkWork=50;
      compare('active road construction');
      farm.development.roads.push('bridge-2-west:0');farm.development.revision++;compare('shared road segment completed');
    }
    farm=structuredClone(original.farm);farm.paused=true;
    farm.development.projects.mine.status='natural';compare('ore stall closed / plaza open');
    farm.upgrades=4;compare('both stalls closed / plaza open');
    farm.development.projects.plaza.status='natural';compare('both stalls and plaza closed');
    if(['all','mine-ground'].includes(qaOptimization)){
      farm=structuredClone(original.farm);farm.paused=true;farm.development.active='mine';
      const project=farm.development.projects.mine;project.status='active';project.stage='clear';project.work=VILLAGE_WORK_DAY*.5;
      compare('mine clearing in progress');project.stage='build';project.work=VILLAGE_PROJECTS.mine.days*VILLAGE_WORK_DAY*.7;
      compare('mine construction in progress');farm.view={x:2300,y:2000,zoom:1};compare('mine offscreen');
    }
    farm=structuredClone(original.farm);farm.paused=true;
    canvas.width=W=1536;canvas.height=H=864;farm.view={x:0,y:0,zoom:minimumZoom()};compare('wide viewport');
    canvas.width=W=864;canvas.height=H=1200;farm.view={x:0,y:0,zoom:minimumZoom()};compare('tall viewport');
    const surface=document.createElement('canvas');surface.width=W=WORLD_W;surface.height=H=WORLD_H;
    ctx=surface.getContext('2d',{alpha:false});farm.view={x:0,y:0,zoom:1};compare('full-map export context');
  }finally{
    drawBaseTerrain=original.base;villagePlantGroundContext=original.plantContext;drawPond=original.pond;drawMineGround=original.mine;drawVillageDevelopment=original.collection;drawRegionGround=original.region;villagePlantGroundAllowed=original.allowed;villageSceneProject=original.project;blendHex=original.color;drawCachedBaseTerrain=original.cache;drawEastShoreGround=original.east;drawVillageGround=original.village;drawVillageRoadSurface=original.roads;drawNurseryGround=original.nursery;if(original.ground)drawGroundTileGroups=original.ground;farm=original.farm;ctx=original.ctx;W=original.W;H=original.H;
    canvas.width=W;canvas.height=H;now=original.now;motionNow=original.motionNow;sceneSeason=original.sceneSeason;
    baseTerrainCache.key=null;groundColorCache=null;render();
  }
  const decode=async url=>{
    const bitmap=await createImageBitmap(await(await fetch(url)).blob());
    const surface=document.createElement('canvas');surface.width=bitmap.width;surface.height=bitmap.height;
    const reader=surface.getContext('2d',{willReadFrequently:true});reader.drawImage(bitmap,0,0);bitmap.close();
    return reader.getImageData(0,0,surface.width,surface.height).data;
  };
  const results=[];
  for(const job of jobs){
    const [expected,actual]=await Promise.all([decode(job.expected),decode(job.actual)]);let changed=0,max=0;
    for(let i=0;i<actual.length;i+=4){let different=false;for(let k=0;k<4;k++){
      const diff=Math.abs(actual[i+k]-expected[i+k]);max=Math.max(max,diff);different||=diff!==0;
    }if(different)changed++;}
    results.push({label:job.label,pass:job.pass,changedPixels:changed,maxChannelDifference:max});
  }
  document.getElementById('qa-result').textContent=JSON.stringify({optimization:qaOptimization,worldStateUnchanged:true,runtimeStateUnchanged:true,pixelChecks:results},null,2);
}
window.addEventListener('load',async()=>{
  const bar=document.createElement('section');bar.id='qa-controls';
  bar.style.cssText='position:fixed;z-index:99999;left:12px;top:8px;padding:8px;background:#fffaf0;border:1px solid #ceb88e;border-radius:8px;max-width:640px;font:12px monospace';
  const selection=document.createElement('select');selection.setAttribute('aria-label','对比优化点');
  for(const [value,label]of [['terrain-colors','镜头变化地表颜色复用'],['pond-ground','水鸭池固定底色分组'],['mine-ground','矿坡固定地面与碎石'],['shared-context','原筛选函数单帧共用上下文'],['region-water','河湖静态地面分组复用'],['plant-geometry','植物道路与建筑判断复用'],['projects','对象工程分类复用'],['colors','精确颜色复用'],['ground-paths','地面分组路径复用'],['nursery','湿地精确湿度缓存'],['roads','道路路径复用'],['village-ground','村口与广场地面'],['east-shore','东岸水面几何'],['base','基础地表缓存']]){const option=document.createElement('option');option.value=value;option.textContent=label;selection.append(option);}
  if(qaAllBaselineAvailable){const option=document.createElement('option');option.value='all';option.textContent='全部优化与原始版本';selection.append(option);}
  selection.onchange=()=>{qaSample=null;qaPair=null;qaEntityProfile=null;qaNaturalProfile=null;qaOptimization=selection.value;};bar.append(selection);
  for(const scenario of ['paused','running','night','rain','snow']){
    const button=document.createElement('button');button.textContent='准备 '+scenario;button.onclick=()=>void qaLoad(scenario);bar.append(button);
  }
  const measure=document.createElement('button');measure.textContent='采样 12 秒';measure.onclick=()=>{
    qaPair=null;qaEntityProfile=null;qaNaturalProfile=null;qaFrames=[];qaTimes={};qaLast=null;qaSample={started:performance.now()};document.getElementById('qa-result').textContent='正在采样…';
  };bar.append(measure);
  const pair=document.createElement('button');pair.textContent='交替耗时对比';pair.disabled=document.body.dataset.qaMode!=='after';pair.onclick=()=>{
    qaSample=null;qaEntityProfile=null;qaNaturalProfile=null;qaPair={started:performance.now(),frames:[]};document.getElementById('qa-result').textContent='同一帧交替采样…';
  };bar.append(pair);
  const profile=document.createElement('button');profile.textContent='分析实体 12 秒';profile.onclick=()=>{
    qaSample=null;qaPair=null;qaEntityProfile={started:performance.now(),frames:0,costs:new Map()};
    document.getElementById('qa-result').textContent='分析实体回调…';
  };bar.append(profile);
  const naturalMode=document.createElement('select');naturalMode.setAttribute('aria-label','自然地块分项');
  for(const [value,label]of [['top','地块判断与清场'],['geometry','原判断道路与建筑'],['water','水域判断']]){const option=document.createElement('option');option.value=value;option.textContent=label;naturalMode.append(option);}
  naturalMode.onchange=()=>{qaNaturalProfile=null;qaNaturalMode=naturalMode.value;};bar.append(naturalMode);
  const naturalProfile=document.createElement('button');naturalProfile.textContent='分析自然地块 12 秒';naturalProfile.onclick=()=>{
    qaSample=null;qaPair=null;qaEntityProfile=null;qaNaturalProfile={started:performance.now(),frames:[]};
    document.getElementById('qa-result').textContent='分析自然地块判断…';
  };bar.append(naturalProfile);
  const capture=document.createElement('button');capture.textContent='固定时钟截图';capture.onclick=()=>{
    qaNaturalProfile=null;qaSample=null;qaPair=null;qaEntityProfile=null;
    const oldNow=now,oldMotion=motionNow,oldPause=farm.paused;
    try{
      now=200;motionNow=100;farm.paused=true;render();
      canvas.toBlob(blob=>{
        const url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download=`farm-perf-${document.body.dataset.qaMode}-${qaScenario}.png`;
        link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      },'image/png');
    }
    finally{now=oldNow;motionNow=oldMotion;farm.paused=oldPause;}
  };bar.append(capture);
  const compare=document.createElement('button');compare.textContent='验证缓存一致性';compare.onclick=()=>{
    qaSample=null;qaPair=null;document.getElementById('qa-result').textContent='正在比较固定 PNG…';
    // Release the input event before the heavier full-map comparisons.
    setTimeout(()=>void qaCompareCache().catch(error=>{document.getElementById('qa-result').textContent='验证失败：'+error.message;}),0);
  };bar.append(compare);
  const hide=document.createElement('button');hide.textContent='隐藏验证工具';hide.onclick=()=>bar.remove();bar.append(hide);
  const result=document.createElement('pre');result.id='qa-result';result.style.cssText='margin:6px 0 0;max-height:170px;overflow:auto';bar.append(result);
  document.body.append(bar);await qaLoad('paused');
});
