'use strict';

// WebGPU render paths: direct float, scaled perturbation, and fixed-point preview.
function createPrecisionRenderer(canvas){
  if(!navigator.gpu)return null;
  const Q=1n<<144n, MASK=(1n<<160n)-1n;
  const palettes={
    aurora:[[5,13,25],[18,58,82],[47,117,116],[166,219,143],[241,232,183],[97,155,165]],
    ember:[[12,11,25],[80,28,48],[179,56,51],[245,156,83],[255,230,171],[87,55,79]],
    mono:[[6,13,22],[55,69,76],[144,160,159],[242,244,223],[105,119,132]],
    candy:[[16,13,39],[87,37,141],[221,78,175],[255,177,172],[93,222,215]],
    ice:[[4,17,31],[15,59,98],[38,135,164],[146,222,217],[239,249,235]]
  };
  let initialization,device,pipelines={},displayPipeline,format,token=0,busy=false,pending=null;
  let buffers={},computedSignature=null;
  let context;
  try{context=canvas.getContext('webgpu');}catch{}
  if(!context)return null;
  async function initialize(){
    const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
    if(!adapter)throw Error('WebGPU adapter unavailable');
    canvas.dataset.adapter=[adapter.info?.vendor,adapter.info?.architecture,adapter.info?.description].filter(Boolean).join(' / ')||'WebGPU';
    device=await adapter.requestDevice();
    format=navigator.gpu.getPreferredCanvasFormat();
    context.configure({device,format,alphaMode:'opaque'});
    device.lost.then(()=>{device=null;pipelines={};displayPipeline=null;buffers={};computedSignature=null;initialization=null;});
  }
  function pipelineFor(mode){
    if(!pipelines[mode])pipelines[mode]=(async()=>{
      const filename=mode==='float'?'gpu-float.wgsl?v=1':mode==='perturb'?'gpu-perturb.wgsl?v=4':'gpu-precision.wgsl?v=2';
      const response=await fetch(filename);
      if(!response.ok)throw Error(`Shader HTTP ${response.status}`);
      const module=device.createShaderModule({code:await response.text()});
      const info=await module.getCompilationInfo();
      const errors=info.messages.filter(message=>message.type==='error');
      if(errors.length)throw Error(errors.map(e=>`${e.lineNum}:${e.linePos} ${e.message}`).join('\n'));
      return device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'main'}});
    })();
    return pipelines[mode];
  }
  function displayPipelineFor(){
    displayPipeline??=(async()=>{
      const response=await fetch('gpu-display.wgsl?v=2');
      if(!response.ok)throw Error(`Display shader HTTP ${response.status}`);
      const module=device.createShaderModule({code:await response.text()});
      const info=await module.getCompilationInfo();
      const errors=info.messages.filter(message=>message.type==='error');
      if(errors.length)throw Error(errors.map(e=>`${e.lineNum}:${e.linePos} ${e.message}`).join('\n'));
      return device.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vertex'},
        fragment:{module,entryPoint:'fragment',targets:[{format}]},primitive:{topology:'triangle-list'}});
    })();
    return displayPipeline;
  }
  function bufferFor(name,size,usage){
    let buffer=buffers[name];
    if(!buffer||buffer.size<size){
      buffer?.destroy();
      buffer=device.createBuffer({size:Math.max(256,2**Math.ceil(Math.log2(size))),usage});
      buffers[name]=buffer;
      if(name==='output')computedSignature=null;
      canvas.dataset.bufferAllocations=String(Number(canvas.dataset.bufferAllocations||0)+1);
    }
    return buffer;
  }
  function limbs(value,data,offset){
    let encoded=value&MASK;
    for(let i=0;i<10;i++){data[offset+i]=Number(encoded&65535n);encoded>>=16n;}
  }
  function config(view){
    if(view.kind!=='mandelbrot'&&view.kind!=='julia')return null;
    const widthCss=Math.max(1,view.width),heightCss=Math.max(1,view.height);
    const density=Math.min(window.devicePixelRatio||1,1.25,Math.sqrt(360000/(widthCss*heightCss)));
    const width=Math.max(1,Math.round(widthCss*density)),height=Math.max(1,Math.round(heightCss*density));
    const scale=1n<<BigInt(view.bits);
    const step=view.span*Q/(scale*BigInt(width));
    // WebGL perturbation already handles shallower views more cheaply.
    if(view.span*10n**29n>=scale||step<8n)return null;
    const data=new Uint32Array(54);
    data[0]=width;data[1]=height;data[2]=Math.min(160,view.iterations);data[3]=view.kind==='julia'?1:0;
    const centerX=view.cx*Q/scale,centerY=view.cy*Q/scale;
    limbs(centerX-step*BigInt(width-1)/2n,data,4);
    limbs(centerY+step*BigInt(height-1)/2n,data,14);
    limbs(step,data,24);
    if(view.kind==='julia'){
      const constant=view.constant||['0','0'];
      const decimal=s=>{
        const negative=String(s).startsWith('-');
        const [whole,fraction='']=String(s).replace(/^[+-]/,'').split('.');
        const value=(BigInt(whole)*10n**BigInt(fraction.length)+BigInt(fraction||'0'))*Q/10n**BigInt(fraction.length);
        return negative?-value:value;
      };
      limbs(decimal(constant[0]),data,34);limbs(decimal(constant[1]),data,44);
    }
    return {width,height,data,palette:view.palette,mode:'limbs'};
  }
  function floatConfig(view){
    if(view.bits>=1020)return null;
    const scale=1n<<BigInt(view.bits),span=Number(view.span)/Number(scale);
    const width=view.outputWidth,height=view.outputHeight;
    const threshold=Math.max(0.0003,view.width*2e-7);
    if(!Number.isFinite(span)||span<threshold||width*height>6200000)return null;
    const data=new Uint32Array(9),floats=new Float32Array(data.buffer);
    data[0]=width;data[1]=height;data[2]=view.iterations;data[3]=view.kindIndex;
    floats[4]=Number(view.cx)/Number(scale);floats[5]=Number(view.cy)/Number(scale);floats[6]=span;
    floats[7]=Number(view.constant?.[0]||0);floats[8]=Number(view.constant?.[1]||0);
    if(![floats[4],floats[5],floats[6]].every(Number.isFinite))return null;
    return {width,height,data,palette:view.palette,mode:'float',power:view.kind==='power3'?3:view.kind==='power4'?4:2};
  }
  function perturbConfig(view,reference){
    if(view.kind!=='mandelbrot'&&view.kind!=='julia')return null;
    if(!reference||reference.length<view.iterations+1||reference.bits!==view.bits)return null;
    const factor=Math.min(1,Math.sqrt(6200000/(view.outputWidth*view.outputHeight)));
    const width=Math.max(1,Math.round(view.outputWidth*factor));
    const height=Math.max(1,Math.round(view.outputHeight*factor));
    const scale=1n<<BigInt(view.bits);
    if(view.bits>=1020)return null;
    const span=Number(view.span)/Number(scale);
    const step=span/width;
    const dx=Number(view.cx-reference.cx)/Number(view.span);
    const dy=Number(view.cy-reference.cy)/Number(view.span);
    if(!Number.isFinite(step)||step<1e-37||![dx,dy].every(Number.isFinite))return null;
    const data=new Uint32Array(12),floats=new Float32Array(data.buffer);
    data[0]=width;data[1]=height;data[2]=view.iterations;data[3]=view.kind==='julia'?1:0;
    const split=(value,offset)=>{const hi=Math.fround(value);floats[offset]=hi;floats[offset+1]=Math.fround(value-hi);};
    split(span,4);split(dx,6);split(dy,8);split(1/width,10);
    return {width,height,data,palette:view.palette,mode:'perturb',orbit:reference.data};
  }
  function present(job,output,pipeline){
    const cpuStarted=performance.now();
    const stops=palettes[job.palette]||palettes.aurora;
    const data=new Uint32Array(28),floats=new Float32Array(data.buffer);
    data[0]=job.width;data[1]=job.height;data[2]=stops.length;floats[3]=job.power||2;
    for(let i=0;i<6;i++)floats.set([...stops[Math.min(i,stops.length-1)],255],4+i*4);
    const settings=bufferFor('display',data.byteLength,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST);
    device.queue.writeBuffer(settings,0,data);
    if(canvas.width!==job.width||canvas.height!==job.height){canvas.width=job.width;canvas.height=job.height;}
    const group=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[
      {binding:0,resource:{buffer:output}},{binding:1,resource:{buffer:settings}}]});
    const encoder=device.createCommandEncoder();
    const pass=encoder.beginRenderPass({colorAttachments:[{view:context.getCurrentTexture().createView(),
      clearValue:{r:5/255,g:12/255,b:19/255,a:1},loadOp:'clear',storeOp:'store'}]});
    pass.setPipeline(pipeline);pass.setBindGroup(0,group);pass.draw(3);pass.end();
    device.queue.submit([encoder.finish()]);
    canvas.dataset.cpuPaintMs=(performance.now()-cpuStarted).toFixed(1);
  }
  async function execute(job){
    busy=true;
    try{
      initialization??=initialize();
      await initialization;
      if(job.token!==token)return;
      const [chosen,display]=await Promise.all([pipelineFor(job.mode),displayPipelineFor()]);
      if(job.token!==token)return;
      const size=job.width*job.height*8;
      const input=bufferFor('input',job.data.byteLength,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
      const output=bufferFor('output',size,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC);
      device.queue.writeBuffer(input,0,job.data);
      let entries=[{binding:0,resource:{buffer:input}},{binding:1,resource:{buffer:output}}];
      if(job.mode==='perturb'){
        const orbitBuffer=bufferFor('orbit',job.orbit.byteLength,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
        device.queue.writeBuffer(orbitBuffer,0,job.orbit);
        entries=[{binding:0,resource:{buffer:input}},{binding:1,resource:{buffer:orbitBuffer}},{binding:2,resource:{buffer:output}}];
      }
      const encoder=device.createCommandEncoder();
      const signature=job.mode==='float'?Array.from(job.data).join(':'):null;
      if(signature===null||signature!==computedSignature){
        const bindGroup=device.createBindGroup({layout:chosen.getBindGroupLayout(0),entries});
        const pass=encoder.beginComputePass();
        pass.setPipeline(chosen);pass.setBindGroup(0,bindGroup);
        pass.dispatchWorkgroups(Math.ceil(job.width/8),Math.ceil(job.height/8));pass.end();
      }
      const samples=[];
      let readback;
      if(job.mode==='perturb'){
        readback=bufferFor('samples',169*4,GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ);
        for(let row=0;row<13;row++)for(let col=0;col<13;col++){
          const x=Math.min(job.width-1,Math.floor((col+.5)*job.width/13));
          const y=Math.min(job.height-1,Math.floor((row+.5)*job.height/13));
          encoder.copyBufferToBuffer(output,(y*job.width+x)*8,readback,samples.length*4,4);
          samples.push([x,y,0]);
        }
      }
      const computeStarted=performance.now();
      device.queue.submit([encoder.finish()]);
      if(readback){
        await readback.mapAsync(GPUMapMode.READ,0,169*4);
        const values=new Uint32Array(readback.getMappedRange(0,169*4));
        for(let i=0;i<samples.length;i++)samples[i][2]=values[i];
        readback.unmap();
      }else await device.queue.onSubmittedWorkDone();
      computedSignature=signature;
      canvas.dataset.computeMs=(performance.now()-computeStarted).toFixed(1);
      if(job.token!==token||job.valid&&!job.valid())return;
      present(job,output,display);
      canvas.dataset.readbackBytes=String(samples.length*4);
      canvas.dataset.gpuMode=job.mode;
      canvas.dataset.gpuMs=String(Math.round(performance.now()-job.started));
      // Publish metadata in the same task as presentation: input cannot sneak
      // between updating the canvas image and updating its world coordinates.
      job.done(job.mode,{width:job.width,height:job.height,samples,ms:Math.round(performance.now()-job.started)});
      await device.queue.onSubmittedWorkDone();
    }catch(error){
      console.warn('WebGPU 渲染不可用',error);
      if(job.token===token)job.failed?.(error);
    }finally{
      busy=false;
      if(pending){const next=pending;pending=null;execute(next);}
    }
  }
  return {
    request(view,done,valid){
      const next=config(view);
      token++;
      if(!next){pending=null;return false;}
      const job={...next,token,done,valid,started:performance.now()};
      if(busy)pending=job;else execute(job);
      return true;
    },
    requestPerturb(view,reference,done,failed,valid){
      const next=perturbConfig(view,reference);
      token++;
      if(!next){pending=null;return false;}
      const job={...next,token,done,failed,valid,started:performance.now()};
      if(busy)pending=job;else execute(job);
      return true;
    },
    requestFloat(view,done,failed,valid){
      const next=floatConfig(view);
      token++;
      if(!next){pending=null;return false;}
      const job={...next,token,done,failed,valid,started:performance.now()};
      if(busy)pending=job;else execute(job);
      return true;
    },
    cancel(){token++;pending=null;}
  };
}
