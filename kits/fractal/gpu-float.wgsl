// Full-resolution fast path for views whose pixel spacing is safe in f32.
@group(0) @binding(0) var<storage,read> params: array<u32>;
@group(0) @binding(1) var<storage,read_write> result: array<u32>;

@compute @workgroup_size(8,8)
fn main(@builtin(global_invocation_id) id: vec3<u32>){
  let width=params[0];let height=params[1];
  if(id.x>=width||id.y>=height){return;}
  let iterations=params[2];let kind=params[3];
  let size=bitcast<f32>(params[6]);
  let step=size/f32(width);
  let point=vec2<f32>(
    bitcast<f32>(params[4])+(f32(id.x)+0.5-f32(width)*0.5)*step,
    bitcast<f32>(params[5])+(f32(height)*0.5-f32(id.y)-0.5)*step
  );
  let julia=kind>=1u&&kind<=4u;
  var z=vec2<f32>(0.0);
  var c=point;
  if(julia){z=point;c=vec2<f32>(bitcast<f32>(params[7]),bitcast<f32>(params[8]));}
  let pixel=(id.y*width+id.x)*2u;
  result[pixel]=0xffffffffu;result[pixel+1u]=0u;
  if(kind==0u){
    let yy=point.y*point.y;
    let xp=point.x-0.25;
    let q=xp*xp+yy;
    let bulb=point.x+1.0;
    if(q*(q+xp)<=0.25*yy||(bulb*bulb+yy)<=0.0625){return;}
  }
  var previous=vec2<f32>(0.0);
  for(var n=0u;n<iterations;n++){
    var a=z.x;var b=z.y;
    if(kind==7u){a=abs(a);b=abs(b);}
    if(kind==11u){a=abs(a);}
    var real=a*a-b*b;
    var imaginary=2.0*a*b;
    if(kind==8u){imaginary=-imaginary;}
    if(kind==9u||kind==10u){real=abs(real);}
    if(kind==10u){imaginary=abs(imaginary);}
    if(kind==5u){real=a*(a*a-3.0*b*b);imaginary=b*(3.0*a*a-b*b);}
    if(kind==6u){let rr=real;let ii=imaginary;real=rr*rr-ii*ii;imaginary=2.0*rr*ii;}
    if(kind==12u){real-=0.5*previous.x;imaginary-=0.5*previous.y;previous=z;}
    z=vec2<f32>(real,imaginary)+c;
    let radius=dot(z,z);
    if(radius>16.0){
      result[pixel]=n;
      result[pixel+1u]=bitcast<u32>(radius);
      break;
    }
  }
}
