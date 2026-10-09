'use strict';
function townInstallPorchLight(){const pieces=farm.town.porchLights.pieces;
 while(pieces.length<farm.town.inventory.lantern){const index=pieces.length;
  pieces.push({installedAt:farm.day+farm.phase,from:1,level:1,changedAt:0,noticedDay:0});
  townNote(`暖光纸灯安放在${TOWN_LAYOUT.porchLights[index].name}，傍晚会慢慢亮起。`);
 }
}
function townPorchLightGrowth(index){const piece=farm.town.porchLights.pieces[index];return piece?clamp((farm.day+farm.phase-piece.installedAt)/.05,0,1):0;}
function townPorchLightLevel(index){const piece=farm.town.porchLights.pieces[index];if(!piece)return 0;
 const t=clamp((now-piece.changedAt)/1.2,0,1),smooth=t*t*(3-2*t);
 return piece.from+(piece.level-piece.from)*smooth;
}
function townPorchLightAt(x,y){return TOWN_LAYOUT.porchLights.find((point,index)=>villageSiteOpen(['traveller','forest','mine'][index])&&townPorchLightGrowth(index)>.02&&inRect(x,y,point.x-10,point.y-13,point.x+10,point.y+22));}
function townPorchLightDescription(index){const point=TOWN_LAYOUT.porchLights[index],piece=farm.town.porchLights.pieces[index];
 return !piece?`${point.name} · 下一盏纸灯的位置`
  :`${point.name} · 暖光纸灯 · ${townPorchLightGrowth(index)<1?'正在安放':piece.level===1?'暖光':'柔光'} · 入夜渐亮、天亮渐暗 · 点击免费换亮度`;
}
function toggleTownPorchLight(index){const piece=farm.town.porchLights.pieces[index];if(!piece||townPorchLightGrowth(index)<=.02)return;
 piece.from=townPorchLightLevel(index);piece.level=piece.level===1?.5:1;piece.changedAt=now;
 if(piece.noticedDay!==farm.day){piece.noticedDay=farm.day;record(`你把${TOWN_LAYOUT.porchLights[index].name}的纸灯调成${piece.level===1?'暖光':'柔光'}，夜归的门边留着一抹温暖。`);}
 updateUI();save();
}
function townPorchLightSummary(){const count=farm.town.porchLights.pieces.length;
 return count?`檐下纸灯 ${count}/3 盏 · ${TOWN_LAYOUT.porchLights.slice(0,count).map(point=>point.name).join('、')} · 点击灯可免费调亮度`
  :'暖光纸灯依次安放到驿屋、阿森与阿矿家门边。';
}
