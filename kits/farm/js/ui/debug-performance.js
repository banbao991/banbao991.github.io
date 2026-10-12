'use strict';
// Transient diagnostics only: neither farm nor runtime snapshots contain these values.
const debugPerformancePanel=$('debug-performance');
const debugPerformanceStatus=$('debug-performance-status');
const debugPerformanceFields=Object.fromEntries(['fps','interval','total','max','simulation','render','ui','save'].map(key=>[key,$(`debug-${key}`)]));
const debugPerformance={lastStamp:null,windowStart:null,frames:0,intervals:0,intervalSum:0,total:0,max:0,simulation:0,render:0,ui:0,save:0,start:0,mark:0};

function resetDebugPerformance(){
  Object.assign(debugPerformance,{lastStamp:null,windowStart:null,frames:0,intervals:0,intervalSum:0,total:0,max:0,simulation:0,render:0,ui:0,save:0});
}
debugPerformancePanel.addEventListener('toggle',()=>{
  resetDebugPerformance();
  if(debugPerformancePanel.open){
    for(const field of Object.values(debugPerformanceFields))field.textContent='—';
    debugPerformanceStatus.textContent='正在采样…';
  }
});
document.addEventListener('visibilitychange',()=>{
  // Background throttling and the gap on return must not contaminate visible FPS.
  resetDebugPerformance();
  if(debugPerformancePanel.open)debugPerformanceStatus.textContent=document.hidden?'页面在后台 · 暂停统计':'正在采样…';
});

function beginDebugPerformanceFrame(stamp){
  if(!debugPerformancePanel.open||document.hidden)return false;
  const d=debugPerformance;
  if(d.lastStamp!==null&&stamp<d.lastStamp)resetDebugPerformance();
  if(d.windowStart===null)d.windowStart=stamp;
  if(d.lastStamp!==null){d.intervalSum+=stamp-d.lastStamp;d.intervals++;}
  d.lastStamp=stamp;
  d.start=d.mark=performance.now();
  return true;
}

function markDebugPerformanceStage(stage){
  const mark=performance.now();
  debugPerformance[stage]+=mark-debugPerformance.mark;
  debugPerformance.mark=mark;
}

function finishDebugPerformanceFrame(stamp){
  const d=debugPerformance,elapsed=performance.now()-d.start;
  d.frames++;d.total+=elapsed;d.max=Math.max(d.max,elapsed);
  if(stamp-d.windowStart<1000)return;
  debugPerformanceFields.fps.textContent=d.intervalSum>0?(d.intervals*1000/d.intervalSum).toFixed(1):'—';
  debugPerformanceFields.interval.textContent=d.intervals?(d.intervalSum/d.intervals).toFixed(2):'—';
  for(const key of ['total','simulation','render','ui','save'])debugPerformanceFields[key].textContent=(d[key]/d.frames).toFixed(2);
  debugPerformanceFields.max.textContent=d.max.toFixed(2);
  debugPerformanceStatus.textContent=`${farm.paused?'已暂停 · 绘制继续':'正在运行'} · ${d.frames} 帧采样`;
  // Keep the boundary timestamp so the next window includes its first interval.
  const lastStamp=d.lastStamp;
  resetDebugPerformance();
  d.lastStamp=d.windowStart=lastStamp;
}
