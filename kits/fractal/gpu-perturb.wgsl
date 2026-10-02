// Scaled complex perturbation with double-float arithmetic (hi + lo).
// The per-pixel delta is divided by the viewport span to keep very small
// pixel offsets in the normal f32 range throughout the early iterations.
alias DD = vec2<f32>;
struct Complex { re: DD, im: DD }

@group(0) @binding(0) var<storage, read> params: array<u32>;
@group(0) @binding(1) var<storage, read> orbit: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> result: array<u32>;

fn number(x: f32) -> DD { return vec2<f32>(x,0.0); }
fn dd_add(a: DD,b: DD) -> DD {
  let sum=a.x+b.x;
  let v=sum-a.x;
  let error=((b.x-v)+(a.x-(sum-v)))+a.y+b.y;
  let hi=sum+error;
  return vec2<f32>(hi,error-(hi-sum));
}
fn dd_neg(a: DD) -> DD { return -a; }
fn dd_sub(a: DD,b: DD) -> DD { return dd_add(a,dd_neg(b)); }
fn dd_mul(a: DD,b: DD) -> DD {
  let product=a.x*b.x;
  let error=fma(a.x,b.x,-product)+a.x*b.y+a.y*b.x;
  let hi=product+error;
  return vec2<f32>(hi,error-(hi-product));
}
fn complex_add(a: Complex,b: Complex) -> Complex {
  return Complex(dd_add(a.re,b.re),dd_add(a.im,b.im));
}
fn complex_product(a: Complex,b: Complex) -> Complex {
  return Complex(dd_sub(dd_mul(a.re,b.re),dd_mul(a.im,b.im)),
    dd_add(dd_mul(a.re,b.im),dd_mul(a.im,b.re)));
}
fn complex_scale(a: Complex,s: DD) -> Complex {
  return Complex(dd_mul(a.re,s),dd_mul(a.im,s));
}

@compute @workgroup_size(8,8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let width=params[0];
  let height=params[1];
  if(id.x>=width || id.y>=height){return;}
  let span=DD(bitcast<f32>(params[4]),bitcast<f32>(params[5]));
  let center_re=DD(bitcast<f32>(params[6]),bitcast<f32>(params[7]));
  let center_im=DD(bitcast<f32>(params[8]),bitcast<f32>(params[9]));
  let inverse_width=DD(bitcast<f32>(params[10]),bitcast<f32>(params[11]));
  let x_pixels=f32(id.x)+0.5-f32(width)*0.5;
  let y_pixels=f32(height)*0.5-f32(id.y)-0.5;
  let offset=Complex(dd_add(center_re,dd_mul(number(x_pixels),inverse_width)),
    dd_add(center_im,dd_mul(number(y_pixels),inverse_width)));
  let julia=params[3]==1u;
  var delta=Complex(number(0.0),number(0.0));
  var delta_c=offset;
  if(julia){delta=offset;delta_c=Complex(number(0.0),number(0.0));}
  let pixel=(id.y*width+id.x)*2u;
  result[pixel]=0xffffffffu;
  result[pixel+1u]=0u;
  for(var n=0u;n<=params[2];n++){
    let reference_parts=orbit[n];
    let reference=Complex(reference_parts.xy,reference_parts.zw);
    let physical_delta=complex_scale(delta,span);
    let actual=complex_add(reference,physical_delta);
    let radius=actual.re.x*actual.re.x+actual.im.x*actual.im.x;
    if(radius>16.0){
      result[pixel]=max(n,1u)-1u;
      result[pixel+1u]=bitcast<u32>(radius);
      break;
    }
    if(n==params[2]){break;}
    delta=complex_add(complex_add(complex_scale(complex_product(reference,delta),number(2.0)),
      complex_product(physical_delta,delta)),delta_c);
  }
}
