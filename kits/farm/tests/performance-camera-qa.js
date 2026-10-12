'use strict';
// Isolated camera benchmark. Production page never loads this file.
const cameraBaseReference=qaReferenceBaseTerrain,cameraBaseCurrent=drawBaseTerrain,cameraRenderReference=render;
let cameraTest=null;
render=(...args)=>{
  if(!cameraTest)return cameraRenderReference(...args);
  const job=cameraTest,frame=job.frames.length;
  const t=(performance.now()-job.started)/1000;
  farm.view={x:200+80*Math.sin(t),y:420+80*Math.cos(t),zoom:job.mode==='zoom'?.73+.04*Math.sin(t):.73};
  const view={...farm.view},state=frame===0?JSON.stringify({farm,runtime:captureRuntimeState()}):null;
  const row={},pngs=[];
  const old=drawBaseTerrain;
  try{
    for(const mode of job.single?[job.single]:(frame%2?['cached','raw']:['raw','cached'])){
      drawBaseTerrain=mode==='raw'?cameraBaseReference:cameraBaseCurrent;
      baseTerrainCache.key=null;
      const start=performance.now();cameraRenderReference(...args);row[mode]=performance.now()-start;
      if(frame===0){pngs.push(canvas.toDataURL('image/png'));if(state!==JSON.stringify({farm,runtime:captureRuntimeState()}))throw Error('Camera painter mutated state');}
    }
  }finally{drawBaseTerrain=old;}
  if(frame===0&&!job.single){job.pixelIdentical=pngs[0]===pngs[1];if(!job.pixelIdentical)throw Error('Camera colors changed pixels');}
  row.stamp=performance.now();
  job.frames.push(row);
  if(performance.now()-job.started>=12000){
    cameraTest=null;farm.view=job.view;baseTerrainCache.key=null;
    const rows=job.frames.slice(20),stats=key=>{const v=rows.map(r=>r[key]).sort((a,b)=>a-b);return {mean:v.reduce((a,b)=>a+b,0)/v.length,p95:v[Math.floor((v.length-1)*.95)],max:v.at(-1)};};
    const timings=job.single?{paint:stats(job.single),fps:(rows.length-1)*1000/(rows.at(-1).stamp-rows[0].stamp),implementation:job.single}:{raw:stats('raw'),cached:stats('cached'),firstPNGIdentical:job.pixelIdentical};
    document.getElementById('camera-result').textContent=JSON.stringify({experiment:'camera terrain colors',mode:job.mode,frames:rows.length,day:farm.day,phase:farm.phase,paused:farm.paused,weather:farm.weather,canvas:[W,H],display:[canvas.getBoundingClientRect().width,canvas.getBoundingClientRect().height],lastView:view,...timings,firstFarmAndRuntimeUnchanged:true,note:job.single?'Single render with deterministic camera motion; diagnostic camera FPS, not stationary full-map FPS.':'Paired render timings; not product FPS. Camera moves before both draws.'},null,2);
  }
};
window.addEventListener('load',()=>{
  const panel=document.createElement('section');panel.style.cssText='position:fixed;z-index:100000;right:12px;top:8px;background:white;padding:8px;font:12px monospace';
  for(const mode of ['pan','zoom']){
    const button=document.createElement('button');button.textContent='地表颜色评估 '+mode;
    button.onclick=()=>{qaSample=null;qaPair=null;qaEntityProfile=null;qaNaturalProfile=null;if(typeof groundColorCache!=='undefined')groundColorCache=null;cameraTest={mode,started:performance.now(),frames:[],view:{...farm.view}};document.getElementById('camera-result').textContent='镜头移动配对采样…';};panel.append(button);
  }
  for(const single of ['raw','cached']){
    const button=document.createElement('button');button.textContent='镜头单绘制 '+single;
    button.onclick=()=>{qaSample=null;qaPair=null;qaEntityProfile=null;qaNaturalProfile=null;if(typeof groundColorCache!=='undefined')groundColorCache=null;cameraTest={mode:'pan',single,started:performance.now(),frames:[],view:{...farm.view}};document.getElementById('camera-result').textContent='单绘制镜头采样…';};panel.append(button);
  }
  const result=document.createElement('pre');result.id='camera-result';result.style.cssText='max-height:320px;overflow:auto';panel.append(result);document.body.append(panel);
});
