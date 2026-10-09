'use strict';
const TOWN_CHIME_PALETTES=[{name:'苔绿结绳',color:'#819887'},{name:'麦黄结绳',color:'#c6a46c'},{name:'栗红结绳',color:'#b77f70'}];
function townInstallChime(){const pieces=farm.town.chimes.pieces;
 while(pieces.length<farm.town.inventory.windchime){const index=pieces.length;
  pieces.push({palette:Math.floor(townRandom()*3),installedAt:farm.day+farm.phase,touchedUntil:0,noticedDay:0});
  townNote(`手作${TOWN_LAYOUT.chimes[index].type}安放在${TOWN_LAYOUT.chimes[index].name}，结绳慢慢展开。`);
 }
}
function townChimeGrowth(index){const piece=farm.town.chimes.pieces[index];return piece?clamp((farm.day+farm.phase-piece.installedAt)/.08,0,1):0;}
function townChimeAt(x,y){return TOWN_LAYOUT.chimes.find((point,index)=>villageSiteOpen(['traveller','herbs','nursery'][index])&&townChimeGrowth(index)>.02&&inRect(x,y,point.x-11,point.y-2,point.x+11,point.y+43));}
function townChimeDescription(index){const point=TOWN_LAYOUT.chimes[index],piece=farm.town.chimes.pieces[index];
 return !piece?`${point.name} · 下一个手作风铃的位置`
  :`${point.name} · ${point.type} · ${TOWN_CHIME_PALETTES[piece.palette].name} · ${townChimeGrowth(index)<1?'结绳正在慢慢展开':now<piece.touchedUntil?'正在轻轻摆动':'风里轻摆'} · 点击免费轻拨`;
}
function touchTownChime(index){const piece=farm.town.chimes.pieces[index];if(!piece||townChimeGrowth(index)<=.02)return;
 piece.touchedUntil=now+2.8;
 if(piece.noticedDay!==farm.day){piece.noticedDay=farm.day;record(`你轻拨${TOWN_LAYOUT.chimes[index].name}的${TOWN_LAYOUT.chimes[index].type}，${TOWN_CHIME_PALETTES[piece.palette].name}在风里轻轻摆动。`);}
 updateUI();save();
}
function townChimeSummary(){const count=farm.town.chimes.pieces.length;
 return count?`手作风铃 ${count}/3 件 · ${TOWN_LAYOUT.chimes.slice(0,count).map(point=>point.name).join('、')} · 点击檐下风铃可轻拨`
  :'手作风铃依次送到驿屋、阿栀与阿芽家檐下，每次买下一件。';
}
