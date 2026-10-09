'use strict';
// Snacks belong to the table's depth, never a separate foreground overlay.
function drawTownTeaPartySnacks(x,y) {
  if(farm.town.teaParty.stage!=='tea')return;
  rect(x-5,y+2,19,4,'#f0deba');rect(x-3,y+5,15,2,'#b4b99c');
  const colors=['#dcaea0','#d5ba72','#bd925d','#cb9b6e'];
  const color=blendHex(colors[sceneSeason.from],colors[sceneSeason.to],sceneSeason.amount);
  for(let i=0;i<3;i++){
    rect(x-3+i*5,y+i%2,4,4,color);rect(x-2+i*5,y+i%2,2,1,'#efd5a2');
  }
}
