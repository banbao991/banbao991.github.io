'use strict';
// The hand, carrot and paper bag stay attached to 阿宁's ordinary contact-depth item.
function drawTownDonkeyVisitProp(x,y){const visit=farm.town.donkeyVisit;
  if(visit.stage==='feed'){
    const bob=Math.round(Math.sin(now*2)*1);
    rect(x-15,y-5+bob,7,4,'#e2b990');rect(x-18,y-7+bob,5,4,'#efcba3');
    rect(x-24,y-7+bob,9,3,'#df965a');rect(x-20,y-8+bob,6,1,'#efb477');
    rect(x-16,y-11+bob,2,4,'#8ca473');rect(x-14,y-10+bob,3,2,'#a6b88a');
    rect(x+11,y+2,7,9,'#b69b6c');rect(x+10,y,9,3,'#dbc294');
  }else if(visit.stage==='return'&&visit.paid){rect(x+10,y+4,7,7,'#c0aa7e');rect(x+9,y+3,9,2,'#e0ca9f');}
}
