'use strict';

const FRACTALS = [
  {id:'mandelbrot',kind:'mandelbrot',name:'Mandelbrot 集',latin:'CLASSIC · Z² + C',symbol:'M',formula:'zₙ₊₁ = zₙ² + c',subtitle:'在边界之间，发现无限的细节。',description:'从零出发，反复平方并加上像素对应的复数。永不逃离的参数点组成著名的心形轮廓。',tags:['参数平面','二次迭代'],bg:'#203c36',color:'#b6e894',view:['-0.5','0','4']},
  {id:'rabbit',kind:'julia',name:'Julia · 兔子',latin:'JULIA · RABBIT',symbol:'◌',formula:'zₙ₊₁ = zₙ² − 0.123 + 0.746i',subtitle:'三片相连的枝叶，藏在复平面的缝隙里。',description:'固定参数 c = −0.123 + 0.746i，让每个像素作为初始点迭代，形成著名的 Douady 兔子。',tags:['Julia 集','连通'],constant:['-0.123','0.746'],bg:'#3f2446',color:'#f5b4ea',view:['0','0','3.4']},
  {id:'dendrite',kind:'julia',name:'Julia · 闪电',latin:'JULIA · DENDRITE',symbol:'ϟ',formula:'zₙ₊₁ = zₙ² + i',subtitle:'一条没有内部的树枝，向四方延伸。',description:'令 c = i，得到细长且不断分叉的 Julia 树枝。边界本身就是整个集合。',tags:['Julia 集','树枝'],constant:['0','1'],bg:'#183c4a',color:'#9cdcf0',view:['0','0','3.4']},
  {id:'spiral',kind:'julia',name:'Julia · 漩涡',latin:'JULIA · SPIRAL',symbol:'✺',formula:'zₙ₊₁ = zₙ² − 0.74543 + 0.11301i',subtitle:'细密旋臂，层层旋进。',description:'特殊参数 c = −0.74543 + 0.11301i 会生成精细卷曲的 Julia 图案。',tags:['Julia 集','螺旋'],constant:['-0.74543','0.11301'],bg:'#443221',color:'#efce91',view:['0','0','3.4']},
  {id:'dust',kind:'julia',name:'Julia · 星尘',latin:'JULIA · DUST',symbol:'✧',formula:'zₙ₊₁ = zₙ² + 0.285 + 0.01i',subtitle:'散落的小岛，每一座都通往下一层。',description:'参数 c = 0.285 + 0.01i，使轮廓散成大量细碎岛屿。',tags:['Julia 集','离散'],constant:['0.285','0.01'],bg:'#42314a',color:'#e8b8f2',view:['0','0','3.4']},
  {id:'multibrot3',kind:'power3',name:'三次 Multibrot',latin:'MULTIBROT · POWER 3',symbol:'3',formula:'zₙ₊₁ = zₙ³ + c',subtitle:'从二次到三次，生长出全新的对称。',description:'把 Mandelbrot 公式中的平方改为三次幂。主瓣与卫星结构随之改变。',tags:['参数平面','三次幂'],bg:'#264451',color:'#a4e1ed',view:['0','0','3.2']},
  {id:'multibrot4',kind:'power4',name:'四次 Multibrot',latin:'MULTIBROT · POWER 4',symbol:'4',formula:'zₙ₊₁ = zₙ⁴ + c',subtitle:'四次迭代，更多花瓣与分叉。',description:'四次幂让参数平面出现三重旋转对称，边缘仍可不断放大。',tags:['参数平面','四次幂'],bg:'#3a374e',color:'#c4baf5',view:['0','0','3.2']},
  {id:'ship',kind:'ship',name:'燃烧之船',latin:'BURNING SHIP',symbol:'♨',formula:'zₙ₊₁ = (|Re zₙ| + i|Im zₙ|)² + c',subtitle:'一艘由火焰与尖塔组成的船。',description:'每次平方之前，将实部和虚部取绝对值。折叠复平面后，边界呈现火焰状尖塔。',tags:['非解析','火焰'],bg:'#4b2e24',color:'#f6be84',view:['-0.4','-0.5','4']},
  {id:'tricorn',kind:'tricorn',name:'三角帽',latin:'TRICORN · MANDELBAR',symbol:'△',formula:'zₙ₊₁ = (conj zₙ)² + c',subtitle:'镜像迭代，长出三角形的边界。',description:'把 z 先共轭再平方，虚部符号翻转，生成三个主要分枝。',tags:['反全纯','三重对称'],bg:'#263e4d',color:'#a7dce8',view:['0','0','4']},
  {id:'celtic',kind:'celtic',name:'凯尔特结',latin:'CELTIC MANDELBROT',symbol:'⌘',formula:'zₙ₊₁ = |Re(zₙ²)| + i·Im(zₙ²) + c',subtitle:'将实部折起，得到交错的结与弧线。',description:'对平方结果的实部取绝对值，让经典图形发生一次横向折叠。',tags:['折叠变体','结纹'],bg:'#244438',color:'#ade5ac',view:['-0.2','0','4']},
  {id:'buffalo',kind:'buffalo',name:'水牛分形',latin:'BUFFALO FRACTAL',symbol:'♜',formula:'zₙ₊₁ = |Re(zₙ²)| + i|Im(zₙ²)| + c',subtitle:'双向折叠，雕出峭壁般的轮廓。',description:'平方后对实部、虚部都取绝对值。这是常见的 Buffalo 变体之一。',tags:['折叠变体','双绝对值'],bg:'#46402d',color:'#e5d79c',view:['-0.4','-0.4','4']},
  {id:'perpendicular',kind:'perpendicular',name:'垂直之船',latin:'PERPENDICULAR SHIP',symbol:'⌁',formula:'zₙ₊₁ = (|Re zₙ| + i·Im zₙ)² + c',subtitle:'只折叠一个方向，火焰便改了形状。',description:'只对迭代点的实部取绝对值，再平方加 c；与燃烧之船形成对照。',tags:['船形变体','单轴折叠'],bg:'#3d343e',color:'#e7b5d1',view:['-0.4','-0.5','4']},
  {id:'phoenix',kind:'phoenix',name:'凤凰分形',latin:'PHOENIX FRACTAL',symbol:'✹',formula:'zₙ₊₁ = zₙ² + c − 0.5zₙ₋₁',subtitle:'记住上一步，于是羽翼重复生长。',description:'在二次迭代里加入前一个轨道点。记忆项改变了动力系统，带来羽毛般的纹理。',tags:['记忆迭代','参数平面'],bg:'#50322a',color:'#f7b292',view:['0','0','3.4']}
];

const $ = id => document.getElementById(id);
const viewport = $('viewport'), canvas = $('fractal'), ctx = canvas.getContext('2d',{alpha:false});
const liveCanvas=$('live-preview'),liveRenderer=createLiveRenderer(liveCanvas);
const gpuCanvas=$('gpu-preview'),gpuRenderer=createPrecisionRenderer(gpuCanvas);
const worker = new Worker('render-worker.js?v=9');
const catalog = $('catalog');
let current = FRACTALS[0], bits = 128, cx, cy, span, renderId = 0, toastTimer, resizeTimer;
let viewWidth = 1, viewHeight = 1, paintedView = null, activeRender = null, renderTimer = null, renderDueSince = 0;
let liveFrame=0,referenceOrbit=null,gpuPaintedView=null,liveCoverage=null,lastReadoutAt=0,lastRenderMs=120;
const pointers = new Map();
let gesture = null;

function decimalFixed(value, precisionBits=bits){
  const s=String(value).trim();
  if(!/^[+-]?\d+(?:\.\d+)?$/.test(s)) throw Error('无效坐标');
  const negative=s[0]==='-';
  const t=s.replace(/^[+-]/,'');
  const [whole,fraction='']=t.split('.');
  const denom=10n**BigInt(fraction.length);
  const num=BigInt(whole)*denom+BigInt(fraction||'0');
  const result=num*(1n<<BigInt(precisionBits))/denom;
  return negative?-result:result;
}
function fixedDecimal(value, places=18){
  const neg=value<0n, a=neg?-value:value, s=1n<<BigInt(bits);
  const base=10n**BigInt(places),rounded=(a*base+s/2n)/s;
  const whole=rounded/base, fraction=(rounded%base).toString().padStart(places,'0').replace(/0+$/,'');
  return `${neg?'-':''}${whole}${fraction?'.'+fraction:''}`;
}
function resetView(fractal=current){
  bits=128;
  cx=decimalFixed(fractal.view[0]);cy=decimalFixed(fractal.view[1]);span=decimalFixed(fractal.view[2]);
  paintedView=null;canvas.classList.remove('has-paint');
  gpuCanvas.classList.remove('is-visible');gpuPaintedView=null;gpuRenderer?.cancel();
  requestLive();
  render();
}
function ensurePrecision(){
  const threshold=BigInt(Math.max(viewWidth,500))*(1n<<80n);
  while(span<threshold){
    bits+=64;cx<<=64n;cy<<=64n;span<<=64n;
    if(gesture){gesture.cx<<=64n;gesture.cy<<=64n;gesture.span<<=64n;}
  }
}
function showToast(message){const e=$('toast');e.textContent=message;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),2800);}
function renderCatalog(){
  catalog.innerHTML='';
  for(const f of FRACTALS){
    const b=document.createElement('button');b.type='button';b.className='catalog-item';b.dataset.id=f.id;
    b.innerHTML=`<span class="catalog-art"></span><span><strong></strong><small></small></span>`;
    b.querySelector('.catalog-art').textContent=f.symbol;
    b.querySelector('.catalog-art').style.setProperty('--art-bg',f.bg);
    b.querySelector('.catalog-art').style.setProperty('--art-color',f.color);
    b.querySelector('strong').textContent=f.name;b.querySelector('small').textContent=f.latin;
    b.addEventListener('click',()=>selectFractal(f.id));catalog.append(b);
  }
  $('catalog-count').textContent=`${FRACTALS.length} 种景观`;
}
function selectFractal(id){
  current=FRACTALS.find(f=>f.id===id)||FRACTALS[0];
  for(const item of catalog.children)item.classList.toggle('active',item.dataset.id===current.id);
  $('top-title').textContent=current.name;$('hero-title').textContent=current.name;
  $('hero-subtitle').textContent=current.subtitle;$('canvas-formula').textContent=current.formula;
  $('detail-title').textContent=current.name;$('detail-description').textContent=current.description;
  $('detail-symbol').textContent=current.symbol;
  $('detail-tags').replaceChildren(...current.tags.map(t=>{const e=document.createElement('span');e.textContent=t;return e;}));
  resetView();
}
function formatZoom(){
  const base=decimalFixed(current.view[2]);
  if(span===base)return '1×';
  const exp=base.toString(2).length-span.toString(2).length;
  if(exp<40){const ratio=Number(base*100n/span)/100;return `${ratio.toLocaleString('zh-CN',{maximumFractionDigits:1})}×`;}
  return `约 2^${exp} ×`;
}
function updateReadout(method, full=false){
  $('coord').textContent=`${fixedDecimal(cx,18)} ${cy<0n?'−':'+'} ${fixedDecimal(cy<0n?-cy:cy,18)}i`;
  if(full)$('coord').title=`${fixedDecimal(cx,100)} ${cy<0n?'-':'+'} ${fixedDecimal(cy<0n?-cy:cy,100)}i`;
  $('zoom').textContent=formatZoom();$('method').textContent=method;
}
function targetSize(){
  const width=Math.max(1,viewport.clientWidth),height=Math.max(1,viewport.clientHeight);
  const quality=Number($('quality').value),cap=quality<1?1100000:quality<2?3200000:6200000;
  const factor=Math.min((window.devicePixelRatio||1)*quality,Math.sqrt(cap/(width*height)),8192/Math.max(width,height));
  viewWidth=Math.max(1,Math.round(width*factor));viewHeight=Math.max(1,Math.round(height*factor));
}
function ratio(num,den){return Number(num*1000000000n/den)/1e9;}
function paintedAtCurrentBits(){
  if(!paintedView)return null;
  const shift=BigInt(bits-paintedView.bits);
  return shift>=0n?{cx:paintedView.cx<<shift,cy:paintedView.cy<<shift,span:paintedView.span<<shift}:
    {cx:paintedView.cx>>-shift,cy:paintedView.cy>>-shift,span:paintedView.span>>-shift};
}
function displayCurrentView(animate=false){
  const old=paintedAtCurrentBits();
  const w=viewport.clientWidth,h=viewport.clientHeight;
  liveCoverage=null;
  if(old){
    const scale=ratio(old.span,span);
    const tx=(1-scale)*w/2+ratio(old.cx-cx,span)*w;
    const ty=(1-scale)*h/2-ratio(old.cy-cy,span)*w;
    canvas.classList.toggle('zoom-animate',animate);
    canvas.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${scale})`;
    liveCoverage={left:tx,top:ty,right:tx+scale*w,bottom:ty+scale*h};
  }
  if(gpuPaintedView){
    const shift=BigInt(bits-gpuPaintedView.bits);
    const previous=shift>=0n?{cx:gpuPaintedView.cx<<shift,cy:gpuPaintedView.cy<<shift,span:gpuPaintedView.span<<shift}:
      {cx:gpuPaintedView.cx>>-shift,cy:gpuPaintedView.cy>>-shift,span:gpuPaintedView.span>>-shift};
    const gpuScale=ratio(previous.span,span);
    const gpuX=(1-gpuScale)*w/2+ratio(previous.cx-cx,span)*w;
    const gpuY=(1-gpuScale)*h/2-ratio(previous.cy-cy,span)*w;
    gpuCanvas.style.transform=`translate3d(${gpuX}px,${gpuY}px,0) scale(${gpuScale})`;
    liveCoverage={left:gpuX,top:gpuY,right:gpuX+gpuScale*w,bottom:gpuY+gpuScale*h};
  }
}
function requestLive(){
  if(liveFrame||cx===undefined)return;
  liveFrame=requestAnimationFrame(timestamp=>{
    liveFrame=0;
    // Input events may arrive faster than the display refresh rate.
    displayCurrentView(false);
    if(timestamp-lastReadoutAt>=80){updateReadout($('method').textContent);lastReadoutAt=timestamp;}
    if(!liveRenderer)return;
    const visible=liveRenderer.draw({bits,cx,cy,span,width:viewport.clientWidth,height:viewport.clientHeight,
      kind:FRACTALS.indexOf(current),fractalId:current.id,constant:current.constant,
      iterations:Number($('iterations').value),palette:$('palette').value,reference:referenceOrbit,coverage:liveCoverage});
    liveCanvas.classList.toggle('is-visible',visible);
  });
}
function hideLive(){
  if(liveFrame){cancelAnimationFrame(liveFrame);liveFrame=0;}
  liveCanvas.classList.remove('is-visible');
}
function stopRender(){
  clearTimeout(renderTimer);renderTimer=null;
  renderDueSince=0;
  if(activeRender?.fallbackTimer)clearTimeout(activeRender.fallbackTimer);
  renderId++;
  activeRender=null;
  worker.postMessage({type:'cancel'});
  gpuRenderer?.cancel();
}
function requestRender(delay=0){
  if(cx===undefined)return;
  if(!delay)stopRender();
  else{
    const now=performance.now();if(!renderDueSince)renderDueSince=now;
    clearTimeout(renderTimer);
    const scaleNum=bits<1020?Number(span)/Number(1n<<BigInt(bits)):0;
    const shallow=scaleNum>=Math.max(0.0003,viewport.clientWidth*2e-7);
    const interval=gpuCanvas.dataset.gpuMs?Math.max(shallow?48:96,Math.min(180,lastRenderMs*1.5)):180;
    if(now-renderDueSince>=interval){renderDueSince=0;startRender();return;}
  }
  $('render-badge').textContent=delay?'移动中':'准备计算';
  renderTimer=setTimeout(()=>{renderDueSince=0;startRender();},delay);
}
function render(){requestRender(0);}
function isCurrentView(r){return bits===r.view.bits&&cx===r.view.cx&&cy===r.view.cy&&span===r.view.span;}
function startWorker(r){
  if(activeRender!==r||r.workerStarted||!isCurrentView(r))return;
  r.workerStarted=true;
  r.preview=document.createElement('canvas');
  r.preview.width=Math.ceil(r.w/r.previewScale);r.preview.height=Math.ceil(r.h/r.previewScale);
  r.previewCtx=r.preview.getContext('2d',{alpha:false});
  const v=r.gpuInput;
  const scaleNum=v.bits<1020?Number(v.span)/Number(1n<<BigInt(v.bits)):0;
  const directThreshold=Math.max(0.0003,v.width*2e-7);
  const wantGpu=Boolean(gpuRenderer)&&r.method==='高精度参考轨道'&&scaleNum<directThreshold&&scaleNum>=1e-37;
  worker.postMessage({type:'render',id:r.id,w:r.w,h:r.h,previewScale:r.previewScale,
    bits:v.bits,cx:String(v.cx),cy:String(v.cy),span:String(v.span),kind:v.kind,
    constant:v.constant||null,iterations:v.iterations,palette:v.palette,method:r.method,wantGpu});
  if(r.method==='BigInt 高精度')requestGpuPreview(r);
}
function requestDirectGpu(r){
  if(!gpuRenderer)return false;
  const done=(mode,result)=>{
    if(activeRender!==r||!isCurrentView(r))return;
    if(result.width!==r.w||result.height!==r.h){startWorker(r);return;}
    if(r.fallbackTimer)clearTimeout(r.fallbackTimer);
    if(r.workerStarted)worker.postMessage({type:'cancel'});
    acceptGpuFrame(r);
    $('render-badge').textContent=`GPU 已完成 · ${Math.round(performance.now()-r.started)} ms`;
    $('method').textContent='WebGPU 并行计算';activeRender=null;
  };
  const failed=()=>{if(activeRender===r&&isCurrentView(r))startWorker(r);};
  const eligible=gpuRenderer.requestFloat(r.gpuInput,done,failed,()=>activeRender===r&&isCurrentView(r));
  if(eligible)r.fallbackTimer=setTimeout(()=>startWorker(r),1100);
  return eligible;
}
function acceptGpuFrame(r){
  // Keep the finished frame on the GPU, including while it is dragged/scaled.
  paintedView=null;canvas.classList.remove('has-paint');
  gpuPaintedView=r.view;gpuCanvas.style.transform='none';gpuCanvas.classList.add('is-visible');
  lastRenderMs=performance.now()-r.started;
  hideLive();
}
function requestGpuPreview(r,reference=null){
  if(!gpuRenderer)return;
  const view=r.gpuInput;
  const show=(mode,result)=>{
    if(activeRender!==r)return;
    gpuPaintedView=r.view;gpuCanvas.classList.add('is-visible');displayCurrentView(false);
    liveCanvas.classList.remove('is-visible');
    $('method').textContent=mode==='perturb'?'WebGPU 高分辨率扰动 · Worker 精修':'WebGPU 多段定点预览 · Worker 精修';
    $('render-badge').textContent='WebGPU 预览已就绪 · 精修中';
    if(mode==='perturb'&&result.width===r.w&&result.height===r.h&&
      bits===r.view.bits&&cx===r.view.cx&&cy===r.view.cy&&span===r.view.span){
      r.gpuReady=result;
      $('render-badge').textContent='GPU 高清图已就绪 · 抽样核对中';
      worker.postMessage({type:'verifyGpu',id:r.id,samples:result.samples});
    }else if(reference)gpuFailed();
  };
  const gpuFailed=()=>{if(activeRender===r)worker.postMessage({type:'resumeCpu',id:r.id});};
  const valid=()=>activeRender===r&&isCurrentView(r);
  const perturbEligible=reference&&gpuRenderer.requestPerturb(view,reference,show,gpuFailed,valid);
  const eligible=perturbEligible||gpuRenderer.request(view,show,valid);
  if(perturbEligible)r.fallbackTimer=setTimeout(gpuFailed,1800);
  if(reference&&!perturbEligible)gpuFailed();
  if(!eligible){gpuCanvas.classList.remove('is-visible');gpuPaintedView=null;}
}
function startRender(){
  clearTimeout(renderTimer);renderTimer=null;
  if(activeRender?.fallbackTimer)clearTimeout(activeRender.fallbackTimer);
  worker.postMessage({type:'cancel'});renderId++;activeRender=null;
  gpuRenderer?.cancel();
  targetSize();ensurePrecision();
  const scaleNum=bits<1020?Number(span)/Number(1n<<BigInt(bits)):0;
  const quadratic=['mandelbrot','julia'].includes(current.kind);
  const directThreshold=Math.max(0.0003,viewport.clientWidth*2e-7);
  const method=quadratic&&gpuRenderer&&scaleNum<directThreshold&&scaleNum>=1e-37?'高精度参考轨道':
    scaleNum>=1e-12?'快速浮点':(scaleNum>=1e-280&&quadratic?'高精度参考轨道':'BigInt 高精度');
  updateReadout(method,true);
  const previewScale=method==='BigInt 高精度'?5:3;
  const gpuInput={bits,cx,cy,span,width:viewport.clientWidth,height:viewport.clientHeight,
    outputWidth:viewWidth,outputHeight:viewHeight,kind:current.kind,constant:current.constant,
    kindIndex:FRACTALS.indexOf(current),iterations:Number($('iterations').value),palette:$('palette').value};
  activeRender={id:renderId,preview:null,previewCtx:null,view:{bits,cx,cy,span},fractalId:current.id,w:viewWidth,h:viewHeight,method,gpuInput,previewScale,started:performance.now()};
  $('render-badge').textContent='预览中 · 0%';
  if(!requestDirectGpu(activeRender))startWorker(activeRender);
}
worker.onmessage=e=>{
  const m=e.data,r=activeRender;if(!r||m.id!==r.id)return;
  if(m.type==='reference'){
    referenceOrbit={id:r.fractalId,bits:r.view.bits,cx:BigInt(m.refX),cy:BigInt(m.refY),length:m.length,data:new Float32Array(m.data)};
    liveCanvas.dataset.referenceLength=String(m.length);
    requestLive();
  }else if(m.type==='gpuReference'){
    const reference=m.length?{bits:r.view.bits,cx:BigInt(m.refX),cy:BigInt(m.refY),length:m.length,data:new Float32Array(m.data)}:null;
    requestGpuPreview(r,reference);
  }else if(m.type==='tile'){
    const data=new ImageData(new Uint8ClampedArray(m.pixels),m.w,m.h);
    if(m.pass===0)r.previewCtx.putImageData(data,m.x,m.y);
    else ctx.putImageData(data,m.x,m.y);
    if(!r.gpuReady)$('render-badge').textContent=`计算中 · ${m.progress}%`;
  }else if(m.type==='gpuVerification'){
    gpuCanvas.dataset.verification=`${m.checked}:${m.mismatches}:${m.large}:${m.insideMismatch}`;
    gpuCanvas.dataset.verificationExamples=JSON.stringify(m.examples||[]);
    if(r.gpuReady&&m.mismatches===0&&bits===r.view.bits&&cx===r.view.cx&&cy===r.view.cy&&span===r.view.span){
      if(r.fallbackTimer)clearTimeout(r.fallbackTimer);
      worker.postMessage({type:'cancel'});
      acceptGpuFrame(r);
      $('render-badge').textContent=`GPU 已完成 · ${Math.round(performance.now()-r.started)} ms · ${m.checked} 点核对`;
      $('method').textContent='WebGPU 扰动 · BigInt 抽样核对';
      activeRender=null;
    }else{
      if(r.fallbackTimer)clearTimeout(r.fallbackTimer);
      r.gpuReady=null;
      $('render-badge').textContent=`CPU 精修中 · ${m.mismatches} 点待修正`;
      worker.postMessage({type:'resumeCpu',id:r.id});
    }
  }else if(m.type==='previewDone'){
    canvas.classList.remove('zoom-animate');canvas.style.transform='none';
    canvas.width=r.w;canvas.height=r.h;
    ctx.imageSmoothingEnabled=true;ctx.drawImage(r.preview,0,0,r.w,r.h);
    paintedView=r.view;
    canvas.classList.add('has-paint');
    displayCurrentView(false);
    r.preview=null;r.previewCtx=null;
  }else if(m.type==='done'){
    lastRenderMs=performance.now()-r.started;
    $('render-badge').textContent='已完成 · '+m.seconds+'s';activeRender=null;
    if(bits===r.view.bits&&cx===r.view.cx&&cy===r.view.cy&&span===r.view.span){
      hideLive();gpuCanvas.classList.remove('is-visible');gpuPaintedView=null;
      $('method').textContent=r.method;
    }
  }
  else if(m.type==='error'){$('render-badge').textContent='渲染失败';showToast(m.message);activeRender=null;}
};
worker.onerror=e=>{$('render-badge').textContent='渲染失败';showToast(`计算线程错误：${e.message}`);};
function zoomAt(factor,x,y){
  const w=Math.max(1,viewport.clientWidth),h=viewport.clientHeight;
  const oldSpan=span,newSpan=span*1000000000n/BigInt(Math.max(1,Math.round(factor*1e9)));
  const q=1000000n,denom=BigInt(w)*q;
  cx+=BigInt(Math.round((x-w/2)*1e6))*(oldSpan-newSpan)/denom;
  cy-=BigInt(Math.round((y-h/2)*1e6))*(oldSpan-newSpan)/denom;
  span=newSpan>0n?newSpan:1n;
  requestLive();
  requestRender(32);
}
function gestureBase(){
  const values=[...pointers.values()],r=viewport.getBoundingClientRect();
  if(!values.length){gesture=null;return;}
  const a=values[0],b=values[1]||a;
  gesture={cx,cy,span,x:(a.x+b.x)/2-r.left,y:(a.y+b.y)/2-r.top,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};
}
function updateGesture(){
  if(!gesture||!pointers.size)return;
  const values=[...pointers.values()],r=viewport.getBoundingClientRect(),a=values[0],b=values[1]||a;
  const x=(a.x+b.x)/2-r.left,y=(a.y+b.y)/2-r.top,w=Math.max(1,viewport.clientWidth),h=viewport.clientHeight;
  const factor=values.length>1?Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance:1;
  const newSpan=gesture.span*1000000n/BigInt(Math.max(1,Math.round(factor*1e6)));
  const q=1000000n,denom=BigInt(w)*q;
  const worldX=gesture.cx+BigInt(Math.round((gesture.x-w/2)*1e6))*gesture.span/denom;
  const worldY=gesture.cy-BigInt(Math.round((gesture.y-h/2)*1e6))*gesture.span/denom;
  span=newSpan>0n?newSpan:1n;
  cx=worldX-BigInt(Math.round((x-w/2)*1e6))*span/denom;
  cy=worldY+BigInt(Math.round((y-h/2)*1e6))*span/denom;
  requestLive();
  requestRender(32);
}
viewport.addEventListener('pointerdown',e=>{
  if(e.target.closest('button'))return;
  stopRender();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gestureBase();
  viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});updateGesture();});
function endGesture(e){
  if(!pointers.has(e.pointerId))return;
  pointers.delete(e.pointerId);gestureBase();
  if(!pointers.size){viewport.classList.remove('dragging');requestRender(16);}
}
viewport.addEventListener('pointerup',endGesture);viewport.addEventListener('pointercancel',endGesture);
viewport.addEventListener('wheel',e=>{
  e.preventDefault();const r=viewport.getBoundingClientRect();
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientHeight:1);
  zoomAt(Math.exp(Math.max(-0.5,Math.min(0.5,-delta*.0015))),e.clientX-r.left,e.clientY-r.top);
},{passive:false});
viewport.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;const r=viewport.getBoundingClientRect();zoomAt(1.8,e.clientX-r.left,e.clientY-r.top);});
$('zoom-in').addEventListener('click',()=>zoomAt(1.8,viewport.clientWidth/2,viewport.clientHeight/2));
$('zoom-out').addEventListener('click',()=>zoomAt(1/1.8,viewport.clientWidth/2,viewport.clientHeight/2));
$('reset').addEventListener('click',()=>resetView());
for(const id of ['iterations','palette','quality'])$(id).addEventListener('change',()=>{if(id==='iterations')$('iteration-value').textContent=$('iterations').value;requestLive();render();});
$('iterations').addEventListener('input',()=>{$('iteration-value').textContent=$('iterations').value;});
$('download').addEventListener('click',()=>{
  const source=gpuPaintedView&&gpuCanvas.classList.contains('is-visible')?gpuCanvas:canvas;
  const name=`fractal-${current.id}-${Date.now()}.png`;
  source.toBlob(blob=>{
    if(!blob){showToast('图片暂未就绪，请稍后保存');return;}
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);showToast('图片已保存');
  },'image/png');
});
$('share').addEventListener('click',async()=>{
  const u=new URL(location.href);u.searchParams.set('f',current.id);u.searchParams.set('b',bits);u.searchParams.set('x',String(cx));u.searchParams.set('y',String(cy));u.searchParams.set('s',String(span));u.searchParams.set('i',$('iterations').value);u.searchParams.set('p',$('palette').value);
  try{await navigator.clipboard.writeText(u.href);showToast('视图链接已复制');}catch{showToast('浏览器未允许复制链接');}
});
window.addEventListener('resize',()=>{requestLive();clearTimeout(resizeTimer);resizeTimer=setTimeout(render,180);});
renderCatalog();
const params=new URLSearchParams(location.search),initial=FRACTALS.find(f=>f.id===params.get('f'))||FRACTALS[0];
selectFractal(initial.id);
try{
  if(params.has('b')&&params.has('x')&&params.has('y')&&params.has('s')){
    const b=Number(params.get('b'));if(!Number.isInteger(b)||b<64||b>20000)throw Error('precision');
    const x=params.get('x'),y=params.get('y'),s=params.get('s');if(![x,y,s].every(v=>/^-?\d{1,7000}$/.test(v)))throw Error('coordinate');
    bits=b;cx=BigInt(x);cy=BigInt(y);span=BigInt(s);if(span<=0n)throw Error('span');
    const i=Number(params.get('i'));if(i>=80&&i<=1600){$('iterations').value=i;$('iteration-value').textContent=i;}
    if([...$('palette').options].some(o=>o.value===params.get('p')))$('palette').value=params.get('p');
    requestLive();
    render();
  }
}catch{showToast('分享链接中的视图参数无效，已显示默认景观');resetView();}
