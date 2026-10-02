'use strict';

let job=null;
const PALETTES={
  aurora:[[5,13,25],[18,58,82],[47,117,116],[166,219,143],[241,232,183],[97,155,165]],
  ember:[[12,11,25],[80,28,48],[179,56,51],[245,156,83],[255,230,171],[87,55,79]],
  mono:[[6,13,22],[55,69,76],[144,160,159],[242,244,223],[105,119,132]],
  candy:[[16,13,39],[87,37,141],[221,78,175],[255,177,172],[93,222,215]],
  ice:[[4,17,31],[15,59,98],[38,135,164],[146,222,217],[239,249,235]]
};
function decimalFixed(s,bits){
  const negative=s[0]==='-';const [a,b='']=s.replace(/^[+-]/,'').split('.');
  const d=10n**BigInt(b.length);const v=(BigInt(a)*d+BigInt(b||'0'))*(1n<<BigInt(bits))/d;
  return negative?-v:v;
}
function toFloat(v,S){return Number(v)/Number(S);}
function makeReference(j,maxSteps=j.iterations,refX=j.cx,refY=j.cy){
  const S=j.S,escape=16n*S*S;let x=j.kind==='julia'?refX:0n,y=j.kind==='julia'?refY:0n;
  const cr=j.kind==='julia'?j.kr:refX,ci=j.kind==='julia'?j.ki:refY;
  const ref=[];
  for(let n=0;n<=maxSteps;n++){
    ref.push([toFloat(x,S),toFloat(y,S)]);
    if(x*x+y*y>escape)break;
    const nx=(x*x-y*y)/S+cr,ny=(2n*x*y)/S+ci;x=nx;y=ny;
  }
  return ref;
}
function chooseLiveReference(j){
  if(j.size>=.01)return null;
  let best={values:j.ref||makeReference(j,112),x:j.cx,y:j.cy};
  if(best.values.length>=112)return best;
  const offsets=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
  for(const [ox,oy] of offsets){
    const x=j.cx+BigInt(ox)*j.span/4n;
    const y=j.cy+BigInt(oy)*j.span*BigInt(j.h)/(4n*BigInt(j.w));
    const values=makeReference(j,112,x,y);
    if(values.length>best.values.length)best={values,x,y};
    if(best.values.length>=112)break;
  }
  return best.values.length>=112?best:null;
}
function chooseGpuReference(j){
  let best={values:j.ref,x:j.cx,y:j.cy};
  if(best.values.length>=j.iterations+1)return best;
  const offsets=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
  for(const [ox,oy] of offsets){
    const x=j.cx+BigInt(ox)*j.span/4n;
    const y=j.cy+BigInt(oy)*j.span*BigInt(j.h)/(4n*BigInt(j.w));
    const values=makeReference(j,j.iterations,x,y);
    if(values.length>best.values.length)best={values,x,y};
    if(best.values.length>=j.iterations+1)break;
  }
  return best;
}
function makeJob(m){
  const j={...m,S:1n<<BigInt(m.bits),cx:BigInt(m.cx),cy:BigInt(m.cy),span:BigInt(m.span),start:performance.now()};
  j.kr=m.constant?decimalFixed(m.constant[0],m.bits):0n;
  j.ki=m.constant?decimalFixed(m.constant[1],m.bits):0n;
  j.mode=m.method==='快速浮点'?'float':m.method==='高精度参考轨道'?'perturb':'big';
  j.baseX=toFloat(j.cx,j.S);j.baseY=toFloat(j.cy,j.S);j.size=toFloat(j.span,j.S);
  j.krFloat=toFloat(j.kr,j.S);j.kiFloat=toFloat(j.ki,j.S);
  if(j.mode==='perturb')j.ref=makeReference(j);
  if((j.kind==='mandelbrot'||j.kind==='julia')&&j.mode!=='big')j.liveRef=chooseLiveReference(j);
  j.previewScale=m.previewScale||3;
  j.passes=[0,1];j.passIndex=0;j.tiles=[];j.tileIndex=0;j.doneTiles=0;
  prepareTiles(j);return j;
}
function prepareTiles(j){
  const scale=j.passIndex===0?j.previewScale:1;
  j.pw=Math.ceil(j.w/scale);j.ph=Math.ceil(j.h/scale);
  j.activeIterations=j.passIndex===0?Math.min(j.iterations,j.mode==='big'?72:120):j.iterations;
  const tileSize=j.passIndex===0?80:112, tiles=[];
  for(let y=0;y<j.ph;y+=tileSize)for(let x=0;x<j.pw;x+=tileSize)tiles.push({x,y,w:Math.min(tileSize,j.pw-x),h:Math.min(tileSize,j.ph-y)});
  tiles.sort((a,b)=>{const d=t=>Math.abs(t.x+t.w/2-j.pw/2)+Math.abs(t.y+t.h/2-j.ph/2);return d(a)-d(b);});
  j.tiles=tiles;j.tileIndex=0;
}
function nextQuadratic(x,y,j){
  let zx,zy,cr,ci;
  if(j.kind==='mandelbrot'){
    const yy=y*y, xp=x-.25, q=xp*xp+yy, bulb=x+1;
    if(q*(q+xp)<=.25*yy || bulb*bulb+yy<=.0625)return -1;
    zx=0;zy=0;cr=x;ci=y;
  }else{zx=x;zy=y;cr=j.krFloat;ci=j.kiFloat;}
  for(let n=0;n<j.activeIterations;n++){
    const xx=zx*zx, yy=zy*zy;
    zy=2*zx*zy+ci;
    zx=xx-yy+cr;
    const r2=zx*zx+zy*zy;
    if(r2>16)return smooth(n,r2,2);
  }
  return -1;
}
function nextFloat(x,y,j){
  if(j.kind==='mandelbrot'||j.kind==='julia')return nextQuadratic(x,y,j);
  let zx=j.kind==='julia'?x:0,zy=j.kind==='julia'?y:0;
  const cr=j.kind==='julia'?j.krFloat:x,ci=j.kind==='julia'?j.kiFloat:y;
  let px=0,py=0;
  for(let n=0;n<j.activeIterations;n++){
    let a=zx,b=zy;
    if(j.kind==='ship'){a=Math.abs(a);b=Math.abs(b);}
    if(j.kind==='perpendicular')a=Math.abs(a);
    let r=a*a-b*b,i=2*a*b;
    if(j.kind==='tricorn')i=-i;
    if(j.kind==='celtic'||j.kind==='buffalo')r=Math.abs(r);
    if(j.kind==='buffalo')i=Math.abs(i);
    if(j.kind==='power3'){r=(a*a-3*b*b)*a;i=(3*a*a-b*b)*b;}
    if(j.kind==='power4'){const rr=r,ii=i;r=rr*rr-ii*ii;i=2*rr*ii;}
    if(j.kind==='phoenix'){r-=0.5*px;i-=0.5*py;px=zx;py=zy;}
    zx=r+cr;zy=i+ci;
    const r2=zx*zx+zy*zy;
    if(r2>16)return smooth(n,r2,j.kind==='power3'?3:j.kind==='power4'?4:2);
  }
  return -1;
}
function smooth(n,r2,power){const v=n+1-Math.log2(Math.max(1,Math.log(Math.sqrt(r2))/Math.log(4)))/Math.log2(power);return Number.isFinite(v)?v:n;}
function nextPerturb(x,y,j){
  let dx=j.kind==='julia'?x:0,dy=j.kind==='julia'?y:0;
  const dcx=j.kind==='julia'?0:x,dcy=j.kind==='julia'?0:y;
  for(let n=0;n<j.activeIterations;n++){
    const z=j.ref[n];if(!z)return null;
    const ax=z[0]+dx,ay=z[1]+dy,r2=ax*ax+ay*ay;
    if(r2>16)return smooth(n,r2,2);
    if(Math.abs(dx)+Math.abs(dy)>Math.max(.1,Math.abs(z[0])+Math.abs(z[1]))*2)return null;
    const nx=2*(z[0]*dx-z[1]*dy)+(dx*dx-dy*dy)+dcx;
    const ny=2*(z[0]*dy+z[1]*dx)+2*dx*dy+dcy;
    dx=nx;dy=ny;
  }
  return -1;
}
function insideMandelbrot(x,y,S){
  const yy=y*y,xp=x-S/4n,q=xp*xp+yy,bulb=x+S;
  return q*(q+xp*S)*4n<=yy*S*S||(bulb*bulb+yy)*16n<=S*S;
}
function nextBig(x,y,j){
  const S=j.S,escape=16n*S*S;let zx=j.kind==='julia'?x:0n,zy=j.kind==='julia'?y:0n;
  if(j.kind==='mandelbrot'&&insideMandelbrot(x,y,S))return -1;
  const cr=j.kind==='julia'?j.kr:x,ci=j.kind==='julia'?j.ki:y;
  let px=0n,py=0n;
  for(let n=0;n<j.activeIterations;n++){
    let a=zx,b=zy;
    if(j.kind==='ship'){if(a<0n)a=-a;if(b<0n)b=-b;}
    if(j.kind==='perpendicular'&&a<0n)a=-a;
    let r=(a*a-b*b)/S,i=(2n*a*b)/S;
    if(j.kind==='tricorn')i=-i;
    if((j.kind==='celtic'||j.kind==='buffalo')&&r<0n)r=-r;
    if(j.kind==='buffalo'&&i<0n)i=-i;
    if(j.kind==='power3'){r=(a*a-3n*b*b)*a/(S*S);i=(3n*a*a-b*b)*b/(S*S);}
    if(j.kind==='power4'){const rr=r,ii=i;r=(rr*rr-ii*ii)/S;i=(2n*rr*ii)/S;}
    if(j.kind==='phoenix'){r-=px/2n;i-=py/2n;px=zx;py=zy;}
    zx=r+cr;zy=i+ci;
    const r2=zx*zx+zy*zy;
    if(r2>escape){
      const approx=Number((r2/(S*S)).toString());
      return smooth(n,Math.max(17,Math.min(approx,1e300)),j.kind==='power3'?3:j.kind==='power4'?4:2);
    }
  }
  return -1;
}
function verifyGpuSamples(j,samples){
  const S=j.S,escape=16n*S*S,w=BigInt(j.w),h=BigInt(j.h);
  let mismatches=0,large=0,insideMismatch=0;const examples=[];
  for(const [px,py,gpu] of samples){
    const x=j.cx+(BigInt(2*px+1-j.w)*j.span)/(2n*w);
    const y=j.cy+(h-BigInt(2*py+1))*j.span/(2n*w);
    if(j.kind==='mandelbrot'&&gpu===0xffffffff&&insideMandelbrot(x,y,S))continue;
    let zx=j.kind==='julia'?x:0n,zy=j.kind==='julia'?y:0n;
    const cr=j.kind==='julia'?j.kr:x,ci=j.kind==='julia'?j.ki:y;
    let actual=0xffffffff;
    for(let n=0;n<j.iterations;n++){
      const nx=(zx*zx-zy*zy)/S+cr;
      zy=(2n*zx*zy)/S+ci;zx=nx;
      if(zx*zx+zy*zy>escape){actual=n;break;}
    }
    if(actual!==gpu){
      mismatches++;
      if(actual===0xffffffff||gpu===0xffffffff)insideMismatch++;
      else if(Math.abs(actual-gpu)>1)large++;
      if(examples.length<5)examples.push([px,py,gpu,actual]);
    }
  }
  return {mismatches,large,insideMismatch,examples};
}
function color(t,j,out,k){
  if(t<0){out[k]=5;out[k+1]=12;out[k+2]=19;out[k+3]=255;return;}
  const palette=PALETTES[j.palette]||PALETTES.aurora;
  const v=((t*.028)%1+1)%1*(palette.length-1),i=Math.floor(v),f=v-i;
  const a=palette[i],b=palette[Math.min(i+1,palette.length-1)];
  const glow=Math.min(1,Math.max(0,(t-2)/8));
  out[k]=((a[0]*(1-f)+b[0]*f)*glow)|0;
  out[k+1]=((a[1]*(1-f)+b[1]*f)*glow)|0;
  out[k+2]=((a[2]*(1-f)+b[2]*f)*glow)|0;out[k+3]=255;
}
function renderTile(j,t){
  const pixels=new Uint8ClampedArray(t.w*t.h*4),passScale=j.passIndex===0?j.previewScale:1;
  const step=passScale*j.size/j.w;
  const firstX=((t.x+.5)*passScale-j.w/2)*j.size/j.w;
  const bigX=j.mode==='big'?Array.from({length:t.w},(_,col)=>j.cx+(BigInt(2*(t.x+col)*passScale+passScale-j.w)*j.span)/(2n*BigInt(j.w))):null;
  for(let row=0;row<t.h;row++){
    const py=(t.y+row+.5)*passScale;
    const offsetY=(j.h/2-py)/j.w;
    const deltaY=offsetY*j.size;
    const bigY=j.mode==='big'?j.cy+(BigInt(j.h-2*(t.y+row)*passScale-passScale)*j.span)/(2n*BigInt(j.w)):null;
    for(let col=0;col<t.w;col++){
      const deltaX=firstX+col*step;
      let value;
      if(j.mode==='float')value=nextFloat(j.baseX+deltaX,j.baseY+deltaY,j);
      else if(j.mode==='perturb'){
        value=nextPerturb(deltaX,deltaY,j);
        if(value===null){
          const offsetX=((t.x+col+.5)*passScale-j.w/2)/j.w;
          const bx=j.cx+BigInt(Math.round(offsetX*1000000000))*j.span/1000000000n;
          const by=j.cy+BigInt(Math.round(offsetY*1000000000))*j.span/1000000000n;
          value=nextBig(bx,by,j);
        }
      }else{
        value=nextBig(bigX[col],bigY,j);
      }
      color(value,j,pixels,(row*t.w+col)*4);
    }
  }
  const progress=j.passIndex===0?Math.round((j.tileIndex/j.tiles.length)*20):20+Math.round((j.tileIndex/j.tiles.length)*79);
  postMessage({type:'tile',id:j.id,pass:j.passIndex,x:t.x,y:t.y,w:t.w,h:t.h,pixels:pixels.buffer,progress:Math.min(99,progress)},[pixels.buffer]);
}
function step(j){
  if(job!==j)return;
  try{
    const t=j.tiles[j.tileIndex++];renderTile(j,t);j.doneTiles++;
    if(j.tileIndex>=j.tiles.length){
      if(j.passIndex===0)postMessage({type:'previewDone',id:j.id});
      j.passIndex++;
      if(j.passIndex>=j.passes.length){postMessage({type:'done',id:j.id,seconds:((performance.now()-j.start)/1000).toFixed(1)});return;}
      prepareTiles(j);
    }
    setTimeout(()=>step(j),0);
  }catch(error){postMessage({type:'error',id:j.id,message:String(error.message||error)});}
}
onmessage=e=>{
  if(e.data.type==='cancel'){job=null;return;}
  if(e.data.type==='resumeCpu'){
    const active=job;
    if(active&&active.id===e.data.id&&active.waitingGpu){active.waitingGpu=false;setTimeout(()=>step(active),0);}
    return;
  }
  if(e.data.type==='verifyGpu'){
    const active=job;
    if(active&&active.id===e.data.id){
      const verification=verifyGpuSamples(active,e.data.samples);
      postMessage({type:'gpuVerification',id:active.id,...verification,checked:e.data.samples.length});
    }
    return;
  }
  if(e.data.type!=='render')return;
  try{
    job=makeJob(e.data);const active=job;
    if(active.liveRef){
      const length=Math.min(112,active.liveRef.values.length),data=new Float32Array(112*4);
      for(let i=0;i<length;i++){data[i*4]=active.liveRef.values[i][0];data[i*4+1]=active.liveRef.values[i][1];}
      postMessage({type:'reference',id:active.id,length,refX:String(active.liveRef.x),refY:String(active.liveRef.y),data:data.buffer},[data.buffer]);
      active.liveRef=null;
    }
    if(active.wantGpu&&active.mode==='perturb'){
      const reference=chooseGpuReference(active);
      if(reference.values.length>=active.iterations+1){
        const data=new Float32Array(reference.values.length*4);
        for(let i=0;i<reference.values.length;i++){
          const real=reference.values[i][0],imag=reference.values[i][1];
          const realHi=Math.fround(real),imagHi=Math.fround(imag);
          data[i*4]=realHi;data[i*4+1]=Math.fround(real-realHi);
          data[i*4+2]=imagHi;data[i*4+3]=Math.fround(imag-imagHi);
        }
        postMessage({type:'gpuReference',id:active.id,length:reference.values.length,
          refX:String(reference.x),refY:String(reference.y),data:data.buffer},[data.buffer]);
        active.waitingGpu=true;
      }else postMessage({type:'gpuReference',id:active.id,length:0});
    }
    if(!active.waitingGpu)setTimeout(()=>step(active),0);
  }catch(error){postMessage({type:'error',id:e.data.id,message:String(error.message||error)});}
};
