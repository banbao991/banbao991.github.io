'use strict';
// The same little painting is used on the actor, the cart and both album readers.
function drawTownSketchPage(target,page,progress=1) {
  const palette=page?.palette||{from:0,to:0,amount:0},mix=colors=>blendHex(colors[palette.from],colors[palette.to],palette.amount);
  const grass=mix(['#a4b580','#a4ba86','#c5b18a','#c8d3c2']),leaf=mix(['#7e9b6f','#729570','#ad8e6a','#98aea1']);
  const paint=(x,y,w,h,color)=>{target.fillStyle=color;target.fillRect(x,y,w,h);};
  paint(0,0,96,60,'#f1e1bb');paint(3,3,90,54,'#e7d9b7');
  if(!page)return;
  paint(6,6,84,27,'#bccfc6');paint(6,33,84,21,grass);
  if(progress<.22)return;
  if(page.topic==='bridge') {
    paint(35,7,26,46,'#83aca9');paint(38,14,4,2,'#c4d8c6');paint(51,39,7,2,'#c4d8c6');
    if(progress>.45){paint(12,26,72,10,'#ad8b62');for(let i=0;i<9;i++)paint(14+i*8,27,2,8,'#967750');
      paint(12,23,72,3,'#795f43');paint(12,35,72,3,'#795f43');}
  }else if(page.topic==='pavilion') {
    paint(8,16,22,9,leaf);paint(17,24,4,20,'#9b805d');paint(9,11,18,10,leaf);
    if(progress>.45){paint(34,21,49,5,'#916f50');paint(40,16,37,5,'#b28c64');
      paint(39,26,4,24,'#95774e');paint(74,26,4,24,'#95774e');paint(45,40,25,4,'#b89162');
      paint(47,44,3,7,'#8b7051');paint(65,44,3,7,'#8b7051');paint(54,36,5,4,'#f1e1bb');}
  }else if(page.topic==='donkeys') {
    paint(13,18,59,13,'#ac8f67');paint(11,14,63,5,'#8b6f52');paint(22,31,23,5,'#bcad8c');
    if(progress>.45){for(let i=0;i<6;i++)paint(9+i*15,41,3,11,'#a18a62');paint(9,44,78,2,'#b79b6b');
      paint(28,30,19,10,'#dfd9bd');paint(42,26,8,10,'#d3cfb4');paint(43,21,2,6,'#746a54');paint(48,21,2,6,'#746a54');
      paint(30,40,3,8,'#82745b');paint(43,40,3,8,'#82745b');paint(48,30,2,2,'#5f594b');}
  }else {
    paint(25,23,47,25,'#d8be90');paint(21,19,55,7,'#ab7e56');paint(29,14,39,6,'#bd9167');
    if(progress>.45){paint(52,31,12,17,'#98734e');paint(32,31,11,9,'#91b0a4');
      for(let i=0;i<3;i++){paint(15+i*10,45,7,7,'#b78762');paint(17+i*10,37,2,9,leaf);
        paint(15+i*10,35,6,4,mix(['#d3a093','#e1bb82','#c69b79','#d0d5c5']));}}
  }
  if(progress>.75){paint(9,50,3,2,'#ede0ba');paint(80,48,3,2,'#ede0ba');paint(7,7,4,2,'#e4e8cf');}
  if(progress>=1){paint(70,55,18,1,'#b19a74');paint(82,56,5,1,'#b19a74');}
}
function drawTownSketchAt(x,y,page,progress,scale) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);drawTownSketchPage(ctx,page,progress);ctx.restore();
}
function drawTownCartSketch() {
  const book=townSketchBookPoint();
  if(!book||book.open)return;
  const sketch=farm.town.sketch,page=sketch.pages[sketch.selected];
  rect(book.x-15,book.y-9,30,17,'#785f49');
  drawTownSketchAt(book.x-12,book.y-7,page,1,.25);
  rect(book.x-15,book.y+7,30,2,'#b18e61');
}
function drawTownSketching(actor) {
  if(!townSketchDrawing())return;
  const book=townSketchBookPoint(),pending=farm.town.sketch.pending;
  rect(book.x-14,book.y-8,28,17,'#765e48');drawTownSketchAt(book.x-12,book.y-6,pending,pending.progress,.25);
  rect(book.x-17,book.y+1,6,5,'#dfb28b');
  const sway=Math.round(Math.sin(now*5)*1);
  rect(book.x+10+sway,book.y,7,5,'#dfb28b');rect(book.x+8+sway,book.y-3,2,10,'#997852');
  rect(book.x+8+sway,book.y+6,2,2,'#574f40');
}
