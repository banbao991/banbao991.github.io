'use strict';
// Only the original head/neck changes; no second bird or overlay is drawn.
function drawEastMandarinHead(b){
 const company=eastDuckCompanyActive(),clock=farm.paused?now:2.4-farm.eastShore.company.remaining;
 const preen=company&&Math.sin(clock*4+b.id*1.2)>.15;
 if(preen){rect(3,-10,11,9,b.id?'#aa9e7c':'#729180');rect(6,-11,8,3,b.id?'#c0b599':'#d7c39d');rect(10,-7,2,1,'#424d40');rect(7,-3,7,3,'#c4a376');}
 else{rect(6,-16,10,12,b.id?'#aa9e7c':'#729180');rect(8,-17,8,3,b.id?'#c0b599':'#d7c39d');rect(12,-13,2,Math.sin(now*.7+b.id)>.985?1:2,'#424d40');rect(16,-10,7,3,'#c4a376');}
}
