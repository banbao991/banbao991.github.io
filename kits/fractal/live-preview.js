'use strict';

// Fill exposed areas while a completed, full-resolution frame follows input.
function createLiveRenderer(canvas){
  let gl;
  try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:true});}catch{}
  if(!gl)return null;
  const floatTexture=gl.getExtension('OES_texture_float');
  canvas.dataset.deepPreview=floatTexture?'float-texture':'unavailable';
  const vertex=`attribute vec2 aPosition;
    void main(){gl_Position=vec4(aPosition,0.0,1.0);}`;
  const fragment=`precision highp float;
    uniform vec2 uSize,uCenter,uConstant,uDeltaCenter;
    uniform float uSpan;
    uniform int uKind,uIterations,uPaletteCount,uDeep,uRefLength;
    uniform vec3 uPalette[6];
    uniform sampler2D uReference;
    vec2 multiply(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
    vec3 stopColor(int i){
      if(i==0)return uPalette[0];if(i==1)return uPalette[1];
      if(i==2)return uPalette[2];if(i==3)return uPalette[3];
      if(i==4)return uPalette[4];return uPalette[5];
    }
    void main(){
      float escape=-1.0,r2=0.0,power=(uKind==5?3.0:uKind==6?4.0:2.0);
      if(uDeep==1){
        vec2 offset=uDeltaCenter+(gl_FragCoord.xy-uSize*.5)*(uSpan/uSize.x);
        vec2 delta=uKind==0?vec2(0.0):offset;
        vec2 deltaC=uKind==0?offset:vec2(0.0);
        for(int n=0;n<112;n++){
          if(n>=uIterations||n>=uRefLength)break;
          vec2 reference=texture2D(uReference,vec2((float(n)+.5)/112.0,.5)).xy;
          vec2 actual=reference+delta;r2=dot(actual,actual);
          if(r2>16.0){escape=float(n);break;}
          delta=2.0*multiply(reference,delta)+multiply(delta,delta)+deltaC;
        }
      }else{
        vec2 point=uCenter+(gl_FragCoord.xy-uSize*.5)*(uSpan/uSize.x);
        vec2 z=vec2(0.0),c=point,previous=vec2(0.0);
        if(uKind>=1&&uKind<=4){z=point;c=uConstant;}
        if(uKind==0){
          float yy=point.y*point.y,xp=point.x-.25,q=xp*xp+yy,bulb=point.x+1.0;
          if(q*(q+xp)<=.25*yy||bulb*bulb+yy<=.0625){gl_FragColor=vec4(5.0,12.0,19.0,255.0)/255.0;return;}
        }
        for(int n=0;n<112;n++){
          if(n>=uIterations)break;
          float a=z.x,b=z.y;
          if(uKind==7){a=abs(a);b=abs(b);}
          if(uKind==11)a=abs(a);
          float real=a*a-b*b,imag=2.0*a*b;
          if(uKind==8)imag=-imag;
          if(uKind==9||uKind==10)real=abs(real);
          if(uKind==10)imag=abs(imag);
          if(uKind==5){real=a*(a*a-3.0*b*b);imag=b*(3.0*a*a-b*b);}
          if(uKind==6){float rr=real,ii=imag;real=rr*rr-ii*ii;imag=2.0*rr*ii;}
          if(uKind==12){real-=.5*previous.x;imag-=.5*previous.y;previous=z;}
          z=vec2(real,imag)+c;r2=dot(z,z);
          if(r2>16.0){escape=float(n);break;}
        }
      }
      if(escape<0.0){gl_FragColor=vec4(5.0,12.0,19.0,255.0)/255.0;return;}
      float smoothValue=escape+1.0-log2(max(1.0,log(sqrt(r2))/log(4.0)))/log2(power);
      float v=fract(smoothValue*.028)*float(uPaletteCount-1);
      int index=int(floor(v));float blend=fract(v);
      int nextIndex=index+1;if(nextIndex>=uPaletteCount)nextIndex=uPaletteCount-1;
      vec3 color=mix(stopColor(index),stopColor(nextIndex),blend);
      color*=clamp((smoothValue-2.0)/8.0,0.0,1.0);
      gl_FragColor=vec4(color/255.0,1.0);
    }`;
  function shader(type,source){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
    return s;
  }
  let program;
  try{
    program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  }catch(error){console.warn('WebGL 预览不可用',error);return null;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniform=name=>gl.getUniformLocation(program,name);
  const u={size:uniform('uSize'),center:uniform('uCenter'),constant:uniform('uConstant'),deltaCenter:uniform('uDeltaCenter'),span:uniform('uSpan'),kind:uniform('uKind'),iterations:uniform('uIterations'),palette:uniform('uPalette[0]'),paletteCount:uniform('uPaletteCount'),deep:uniform('uDeep'),refLength:uniform('uRefLength'),reference:uniform('uReference')};
  const referenceTexture=floatTexture?gl.createTexture():null;
  if(referenceTexture){
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,referenceTexture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.uniform1i(u.reference,0);
  }
  const palettes={
    aurora:[[5,13,25],[18,58,82],[47,117,116],[166,219,143],[241,232,183],[97,155,165]],
    ember:[[12,11,25],[80,28,48],[179,56,51],[245,156,83],[255,230,171],[87,55,79]],
    mono:[[6,13,22],[55,69,76],[144,160,159],[242,244,223],[105,119,132]],
    candy:[[16,13,39],[87,37,141],[221,78,175],[255,177,172],[93,222,215]],
    ice:[[4,17,31],[15,59,98],[38,135,164],[146,222,217],[239,249,235]]
  };
  let lastPalette='',lastReference=null;
  return {
    draw(view){
      const density=Math.min(window.devicePixelRatio||1,1.25);
      const width=Math.max(1,Math.round(view.width*density)),height=Math.max(1,Math.round(view.height*density));
      let rectangles=[[0,0,width,height]];
      if(view.coverage){
        const c=view.coverage;
        const clampX=x=>Math.max(0,Math.min(width,x));
        const clampY=y=>Math.max(0,Math.min(height,y));
        const left=clampX(Math.ceil(c.left*width/view.width)),right=clampX(Math.floor(c.right*width/view.width));
        const top=clampY(Math.ceil(c.top*height/view.height)),bottom=clampY(Math.floor(c.bottom*height/view.height));
        if(right>left&&bottom>top)rectangles=[[0,0,left,height],[right,0,width-right,height],
          [left,0,right-left,top],[left,bottom,right-left,height-bottom]].filter(r=>r[2]>0&&r[3]>0);
      }
      const previewPixels=rectangles.reduce((sum,r)=>sum+r[2]*r[3],0);
      canvas.dataset.previewPixels=String(previewPixels);
      canvas.dataset.fullPixels=String(width*height);
      if(!previewPixels)return false;
      const denominator=1n<<BigInt(view.bits);
      if(view.bits>=1020)return false;
      const size=Number(view.span)/Number(denominator);
      if(!Number.isFinite(size))return false;
      const direct=size>=Math.max(0.0003,view.width*2e-7);
      const reference=view.reference;
      let dx=0,dy=0;
      if(!direct){
        if(!referenceTexture||!reference||reference.id!==view.fractalId||view.kind>4||size<1e-30||reference.length<8)return false;
        const shift=BigInt(view.bits-reference.bits);
        const rx=shift>=0n?reference.cx<<shift:reference.cx>>-shift;
        const ry=shift>=0n?reference.cy<<shift:reference.cy>>-shift;
        dx=Number(view.cx-rx)/Number(denominator);dy=Number(view.cy-ry)/Number(denominator);
        if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)>.001)return false;
      }
      const x=Number(view.cx)/Number(denominator),y=Number(view.cy)/Number(denominator);
      if(!Number.isFinite(x)||!Number.isFinite(y))return false;
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height);gl.useProgram(program);
      gl.uniform2f(u.size,width,height);gl.uniform2f(u.center,x,y);
      gl.uniform2f(u.constant,Number(view.constant?.[0]||0),Number(view.constant?.[1]||0));
      gl.uniform1f(u.span,size);gl.uniform1i(u.kind,view.kind);gl.uniform1i(u.iterations,Math.min(112,view.iterations));
      gl.uniform1i(u.deep,direct?0:1);
      if(!direct){
        gl.uniform2f(u.deltaCenter,dx,dy);gl.uniform1i(u.refLength,reference.length);
        if(lastReference!==reference){
          gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,referenceTexture);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,112,1,0,gl.RGBA,gl.FLOAT,reference.data);
          lastReference=reference;
        }
      }
      const paletteName=view.palette in palettes?view.palette:'aurora';
      if(lastPalette!==paletteName){
        const stops=palettes[paletteName];gl.uniform1i(u.paletteCount,stops.length);
        gl.uniform3fv(u.palette,new Float32Array(Array.from({length:6},(_,i)=>stops[Math.min(i,stops.length-1)]).flat()));
        lastPalette=paletteName;
      }
      gl.enable(gl.SCISSOR_TEST);
      for(const [x,y,w,h] of rectangles){gl.scissor(x,height-y-h,w,h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
      gl.disable(gl.SCISSOR_TEST);
      return true;
    }
  };
}
