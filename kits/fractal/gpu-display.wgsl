// Escape data stays on the GPU. Only verification samples are read back.
struct Display {
  width: u32,
  height: u32,
  count: u32,
  power: f32,
  colors: array<vec4<f32>,6>,
}
@group(0) @binding(0) var<storage,read> result: array<u32>;
@group(0) @binding(1) var<uniform> display: Display;

@vertex
fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  let positions=array<vec2<f32>,3>(vec2<f32>(-1.0,-1.0),vec2<f32>(3.0,-1.0),vec2<f32>(-1.0,3.0));
  return vec4<f32>(positions[index],0.0,1.0);
}

@fragment
fn fragment(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let x=min(u32(position.x),display.width-1u);
  let y=min(u32(position.y),display.height-1u);
  let pixel=(y*display.width+x)*2u;
  let iteration=result[pixel];
  if(iteration==0xffffffffu){return vec4<f32>(5.0,12.0,19.0,255.0)/255.0;}
  let radius=clamp(bitcast<f32>(result[pixel+1u]),17.0,1e30);
  let smooth_value=f32(iteration)+1.0-log2(max(1.0,log(sqrt(radius))/log(4.0)))/log2(display.power);
  let value=fract(smooth_value*0.028)*f32(display.count-1u);
  let index=u32(floor(value));
  let next=min(index+1u,display.count-1u);
  let color=mix(display.colors[index].rgb,display.colors[next].rgb,fract(value));
  return vec4<f32>(color*clamp((smooth_value-2.0)/8.0,0.0,1.0)/255.0,1.0);
}
