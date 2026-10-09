'use strict';
// The low ridge ends the mine. Shed, trough, animals and fence segments share contact depth.
function drawTownMineBoundary(){
  const ridge=TOWN_LAYOUT.ridge;
  for(let i=ridge.first;i<11;i++){
    const x=(ridge.left+ridge.right)/2+Math.round(Math.sin(i*1.8)*3),y=Math.min(ridge.bottom-4,ridge.originY+82+i*60);
    scenePart(`town-mine-boundary:${i}`,y,()=>{
      const winter=sceneSeason.winter;
      const stone=blendHex(blendHex('#8d967c','#9ea48a',hash(i,937)*.4),'#bdc9c0',winter*.85);
      const light=blendHex('#abb093','#dae0d5',winter*.85);
      const height=52+Math.round(hash(i,938)*29),half=26+Math.round(hash(i,939)*8);
      rect(x-34,y-10,68,10,'#78866a55');
      rect(x-half,y-26,half*2,19,stone);rect(x-half+6,y-height+22,half*2-12,height-47,stone);
      const peak=i%2?-7:5;
      rect(x+peak-12,y-height+5,27,23,stone);rect(x+peak-5,y-height,15,9,light);
      rect(x-half+9,y-height+24,18,5,light);rect(x-half+2,y-21,half,4,light);
      rect(x+half-14,y-height+24,7,height-40,'#7b866e');rect(x+half-6,y-24,6,14,'#7b866e');
      rect(x-17,y-8,18,5,blendHex('#91a576','#c6d2c5',winter));
      if(i%3===1){rect(x+26,y-14,4,12,'#758a60');rect(x+21,y-19,15,7,'#94a675');}
    });
  }
}
function drawTownDonkey(animal){
  const x=animal.x,y=animal.y,d=animal.dir;
  const color=animal.id?'#ad8563':'#a5a899',shade=animal.id?'#85654e':'#7c867b';
  const idle=now+animal.id*2,sway=Math.round(Math.sin(idle*2)*1.5);
  const grazing=animal.mode==='graze' && animal.waveUntil<now;
  const nibbling=animal.target==='fodder'&&farm.town.fodder.eating&&farm.town.fodder.active===animal.id;
  const drinking=farm.town.donkeyWater.active===animal.id&&farm.town.donkeyWater.stage==='drink';
  const pose=townDonkeyNuzzlePose(animal);
  const headY=y-(drinking?16:nibbling?7:grazing?1:12)+(nibbling?Math.round(Math.sin(idle*2)):0)+pose.lift,headX=x+d*(15+pose.reach);
  rect(x-18,y+11,36,4,'#58714b55');
  for(const dx of [-10,9]){const step=animal.mode==='walk'?Math.round(Math.sin(animal.step+(dx<0?0:Math.PI))*2):0;
    rect(x+dx,y+2,4,10+step,shade);rect(x+dx-1,y+11+step,6,3,'#656556');}
  rect(x-14,y-13,28,17,color);rect(x-11,y-16,24,9,color);
  rect(x-10,y-12,20,5,animal.id?'#c69e77':'#bbc0ac');
  rect(x-d*17,y-12+sway,3,16,shade);rect(x-d*18,y+2+sway,5,3,'#655b4b');
  rect(headX-6,headY-7,12,17,color);rect(headX+d*4-3,headY+3,9,6,'#d5c4a3');
  rect(headX-5,headY-18,3,13,shade);rect(headX+2,headY-19+sway,3,14,shade);
  rect(headX-4,headY-16,1,7,'#dabfa0');
  if(Math.sin(idle*.9)>.96)rect(headX+d*3,headY-2,3,1,'#514d40');
  else rect(headX+d*3,headY-3,2,2,'#444a40');
  rect(headX+d*7,headY+5,2,2,'#71644f');
  if(drinking)rect(headX+d*7,headY+7+Math.round(Math.sin(idle*4)),2,2,'#b2d4c6');
  if(nibbling){rect(headX-11,headY+5,7,1,'#e0ce88');rect(headX-10,headY+6,2,3,'#c4b576');}
  if(animal.waveUntil>now){rect(x-1,y-38,3,3,'#e5c595');rect(x-4,y-34,9,3,'#efd7aa');}
}
function drawTownDonkeyInn(){
  drawTownMineBoundary();
  const level=farm.town.improvements.donkeyInn.level;if(!level)return;
  const site=TOWN_LAYOUT.donkeyInn,home=site.stable,pen=site.pen;
  scenePart('town-donkey-shed',home.bottom,()=>{
    const x=home.left,y=home.top;
    rect(x-4,home.bottom,152,7,'#5e714d55');rect(x+6,y+46,132,70,'#bf9b6e');
    rect(x+11,y+50,122,56,'#d6b889');
    for(const door of site.doors){rect(door.x-18,y+68,36,52,'#74664a');rect(door.x-13,y+70,26,47,'#8d8060');}
    rect(x+8,y+116,128,5,'#bea577');rect(x+7,y+53,5,67,'#916a47');rect(x+132,y+53,5,67,'#916a47');
    rect(x-8,y+27,160,25,'#8d7154');rect(x+5,y+12,135,18,'#a18b65');
    rect(x+22,y+3,102,13,'#b5a07a');
    for(let i=0;i<7;i++)rect(x+12+i*18,y+25,12,3,'#c8b28a');
    rect(x+62,y+54,22,13,'#a17c52');rect(x+64,y+57,18,6,'#e0c799');
    rect(x+117,y+102,14,10,'#d8bb75');rect(x+115,y+100,18,4,'#e5cf98');
    if(level>2){rect(x+30,y+108,10,7,'#d0bd92');rect(x+28,y+105,14,4,'#ebd6ab');}
  });
  const fence=(id,x1,y1,x2,y2)=>scenePart(id,Math.max(y1,y2)+4,()=>{
    if(y1===y2){rect(x1,y1-14,x2-x1,4,'#c1a078');rect(x1,y1-6,x2-x1,3,'#a88761');
      for(let x=x1;x<=x2;x+=28){rect(x,y1-20,4,24,'#9b7955');rect(x-1,y1-22,6,3,'#d8ba8d');}}
    else{rect(x1,y1-14,3,y2-y1+4,'#ba9970');
      for(let y=y1;y<=y2;y+=24){rect(x1-1,y-18,4,22,'#997753');rect(x1-2,y-20,6,3,'#d5b78a');}}
  });
  fence('town-donkey-north-west',pen.left,pen.top,site.northGate.x-20,pen.top);
  fence('town-donkey-north-east',site.northGate.x+20,pen.top,pen.right,pen.top);
  for(let y=pen.top;y<pen.bottom;y+=24){const end=Math.min(y+24,pen.bottom);
    fence(`town-donkey-west:${y}`,pen.left,y,pen.left,end);}
  for(const [start,finish]of [[pen.top,site.gate.y-18],[site.gate.y+18,pen.bottom]])
    for(let y=start;y<finish;y+=24)fence(`town-donkey-east:${y}`,pen.right,y,pen.right,Math.min(y+24,finish));
  fence('town-donkey-south',pen.left,pen.bottom,pen.right,pen.bottom);
  const notice=site.notice;
  scenePart('town-donkey-notice',notice.y+27,()=>{
    rect(notice.x-2,notice.y,4,27,'#967552');rect(notice.x-14,notice.y-10,28,17,'#c2a37a');
    rect(notice.x-11,notice.y-7,22,11,'#e1cba4');rect(notice.x-6,notice.y-3,9,3,'#d9955d');
    rect(notice.x+3,notice.y-6,3,4,'#8f9c6c');
  });
  if(level>1){const {x,y}=site.trough;
    scenePart('town-donkey-water',y+14,()=>{
      rect(x-18,y+4,36,10,'#938261');rect(x-20,y,40,8,'#bcad88');drawTownDonkeyTroughWater(x,y);
      rect(x-19,y-34,3,38,'#96734e');rect(x+16,y-34,3,38,'#96734e');
      rect(x-25,y-40,50,7,'#91a590');rect(x-18,y-46,36,7,'#b2bda0');
    });
  }
  drawTownFodder();
  for(const animal of farm.town.donkeys)if(townDonkeyVisible(animal))
    scenePart(`town-donkey:${animal.id}`,animal.y+14,()=>drawTownDonkey(animal),10);
}
