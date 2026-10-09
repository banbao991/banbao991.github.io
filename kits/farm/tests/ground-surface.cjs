const assert=require('node:assert/strict');
const {run,context2d}=require('./harness.cjs');
const originalFill=context2d.fill,originalTransform=context2d.getTransform;
let fills=[];
context2d.fill=function(){fills.push({color:this.fillStyle,tiles:(this.pathRectangles||[]).map(r=>[...r])});originalFill.call(this);};
try{
  // Different colors/opacity meet at exact device pixels under a fractional camera.
  for(const zoom of [.7,.9,1.37,1.6]){
    const transform={a:zoom,d:zoom,b:0,c:0,e:-37.31,f:-49.47};
    context2d.getTransform=()=>transform;fills=[];
    run('var surfaceCheckPaint=groundTilePainter()');
    run("surfaceCheckPaint.add(16,24,8,8,'#639ba6');surfaceCheckPaint.add(24,24,8,8,'rgba(74,124,103,.56)');surfaceCheckPaint.add(16,32,8,8,'#639ba6');surfaceCheckPaint.draw()");
    assert.equal(fills.length,2,'Same-color neighbors share one fill');
    const pixels=fills.flatMap(fill=>fill.tiles.map(([x,y,w,h])=>[x*zoom+transform.e,y*zoom+transform.f,(x+w)*zoom+transform.e,(y+h)*zoom+transform.f]));
    for(const rect of pixels)for(const coordinate of rect)assert.ok(Math.abs(coordinate-Math.round(coordinate))<1e-9);
    assert.ok(Math.abs(pixels[0][2]-pixels[2][0])<1e-9,'Different opacity bands share the exact edge');
    assert.ok(Math.abs(pixels[0][3]-pixels[1][1])<1e-9,'Vertical neighbors share the exact edge');
  }
  context2d.getTransform=()=>({a:1,d:1,b:0,c:0,e:0,f:0});
  const before=run('JSON.stringify({state:farm,runtime:captureRuntimeState()})');
  const cases=[['drawPond()',['#5f9fa9'],1],['drawRegionGround()',['#639ba6','#679ba3','#64a2aa'],1],
    ['drawWetlandCreek()',['#75a9a4'],1],['drawNurseryGround()',['#619b9d'],run('NURSERY_LAYOUT.wetlandPuddles.length+1')],
    ['drawEastShoreGround()',['#689fa7'],2]];
  for(const [draw,colors,limit]of cases){
    fills=[];run(draw);
    for(const color of colors){const matching=fills.filter(fill=>fill.color===color);assert.ok(matching.length>0&&matching.length<=limit,`${draw}: continuous ${color} surfaces`);}
  }
  assert.equal(run('JSON.stringify({state:farm,runtime:captureRuntimeState()})'),before,'Ground drawing never changes world progress');
  // Identity painting keeps the existing raster shoreline used by mouse hit tests.
  fills=[];run('drawPond()');
  for(const fill of fills.filter(fill=>['#b6b888','#6eafa9','#5f9fa9'].includes(fill.color)))
    for(const [x,y,w,h]of fill.tiles){assert.equal(w,8);assert.equal(h,8);assert.equal(run(`pondAt(${x}+.5,${y}+.5)`),true);}
  assert.equal(run('JSON.stringify(parseFarmSave(JSON.parse(farmExportText())).development)===JSON.stringify(farm.development)'),true);
  console.log('Ground surfaces passed: fractional pixel alignment, continuous colors/opacity, all lake/river ground families, original shoreline hits, read-only drawing and saves.');
}finally{context2d.fill=originalFill;if(originalTransform)context2d.getTransform=originalTransform;else delete context2d.getTransform;}
