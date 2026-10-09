'use strict';
const TOWN_SNACK_COLORS=['#94a87b','#c99086','#d0a274','#ba8b62'];
function drawTownSnack(x,y,theme,size=1){
 const color=TOWN_SNACK_COLORS[theme],w=Math.max(1,Math.round(7*size));
 if(theme===0){rect(x-w/2,y-2,w,4,color);rect(x-w/2+1,y-4,Math.max(1,w-2),3,color);}
 else{rect(x-w/2,y-4,w,6,color);rect(x-w/2,y-4,w,2,theme===1?'#e3b9a0':'#e0be91');}
 rect(x-1,y-3,2,2,theme===3?'#846044':'#d9ca9e');
}
function drawTownSnackBox(){const s=farm.town.snacks;if(!s.pantry.length)return;
 const {x,y}=TOWN_LAYOUT.pavilionTea;rect(x+5,y-4,6,5,TOWN_SNACK_COLORS[s.pantry[0]]);
 for(let i=0;i<s.pantry.length;i++)rect(x-9+i*4,y+3,2,2,'#eccea0');
}
function drawTownSnackPlate(){if(!townSnackEating())return false;
 const p=TOWN_LAYOUT.snackPlate,meal=farm.town.snacks.meal;
 rect(p.x-5,p.y,10,3,'#e8d7b3');drawTownSnack(p.x,p.y-2,meal.theme,Math.max(.2,1-meal.elapsed/2.4));return true;
}
function townSnackHandRaise(){return townSnackEating()?12+Math.sin(now*3)*3:undefined;}
function drawTownMinerSnack(){if(!townSnackEating())return;
 const meal=farm.town.snacks.meal,raise=townSnackHandRaise();
 drawTownSnack(miner.x+11,miner.y+2-raise,meal.theme,Math.max(.2,1-meal.elapsed/2.4));
}
function drawTownSnackParcel(actor){if(!farm.town.snacks.carried.length)return;
 rect(actor.x-16,actor.y+4,8,6,'#dfcfa8');rect(actor.x-13,actor.y+4,2,6,'#91a283');
}
