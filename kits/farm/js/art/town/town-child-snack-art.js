'use strict';
function townChildSnackHandRaise(){return townChildSnackEating()?smoothRange(0,.35,farm.town.childSnack.meal.elapsed)*(12+Math.sin(now*3)*2):null;}
function drawTownChildSnack(){if(!townChildSnackEating())return;
 const m=farm.town.childSnack.meal;
 drawTownSnack(Math.round(villageWalker.x)+9,Math.round(villageWalker.y)+5-townChildSnackHandRaise(),m.theme,Math.max(.2,1-m.elapsed/2.4));
}
function drawTownChildSnackPlate(){if(!townChildSnackEating())return;
 const p=TOWN_LAYOUT.childSnackPlate,m=farm.town.childSnack.meal;
 rect(p.x-4,p.y,9,3,'#ead9b8');drawTownSnack(p.x,p.y-2,m.theme,Math.max(.2,1-m.elapsed/2.4));
}
