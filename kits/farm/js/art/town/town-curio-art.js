'use strict';
// The cabinet is one grounded object; keepsakes are attached to its shelves.
function drawTownCurios() {
  if(!villageSiteOpen('traveller'))return;
  TOWN_LAYOUT.showcases.forEach((shelf,index)=>{
  if(!shelf.slots.some(slot=>farm.town.inventory[slot.id]))return;
  scenePart(index?'town-curio-cabinet:'+index:'town-curio-cabinet',shelf.bottom,()=>{
    const x=shelf.left,y=shelf.top;
    rect(x-2,shelf.bottom,70,5,'#526a4944');rect(x,y+8,66,61,'#a27853');
    rect(x+5,y+12,56,53,'#ccb58a');rect(x+7,y+14,52,48,'#e0cc9f');
    rect(x-3,y+4,72,8,'#87694c');rect(x+3,y,60,6,'#bb956a');
    rect(x+4,y+35,58,4,'#9b7854');rect(x+4,y+64,58,5,'#937151');
    for(const slot of shelf.slots)if(farm.town.inventory[slot.id])drawTownCurio(slot);
    rect(x,y+69,7,4,'#765e45');rect(x+59,y+69,7,4,'#765e45');
  });
  });
}
function drawTownCurio(slot) {
  const {x,y,id}=slot;
  if(id==='riverPlate'){
    circle(x,y-11,10,'#8aa9a1');circle(x,y-11,8,'#c6d6b7');
    rect(x-5,y-14,9,5,'#6d9696');rect(x+4,y-15,3,7,'#719895');
    rect(x-4,y-14,2,1,'#f0dfb2');rect(x-4,y-13,1,1,'#52695b');
    rect(x-8,y-1,17,2,'#ad8b60');
  }else if(id==='forestCarving'){
    rect(x-7,y-13,12,12,'#ad8154');rect(x-3,y-21,10,10,'#c29560');
    rect(x-3,y-24,3,5,'#a87b50');rect(x+4,y-23,3,4,'#a87b50');
    rect(x+3,y-18,2,2,'#655644');rect(x-12,y-16,7,10,'#b58d58');
    rect(x-14,y-17,6,6,'#c19b65');rect(x+1,y-6,6,5,'#8c7854');
    rect(x,y-8,8,3,'#bbab71');rect(x-9,y-1,18,2,'#a68b65');
  }else if(id==='pressedLeaves'){
    rect(x-11,y-25,23,25,'#a17e54');rect(x-8,y-22,17,19,'#ded6b1');
    rect(x-1,y-20,2,15,'#947954');rect(x-6,y-17,9,5,'#8fa374');rect(x-2,y-12,9,4,'#bfaa72');
  }else if(id==='pheasantClay'){
    rect(x-8,y-11,13,9,'#bb9570');rect(x+3,y-18,5,12,'#c6a27a');rect(x+4,y-21,7,5,'#b28d67');
    rect(x+8,y-20,1,1,'#695844');rect(x+10,y-18,3,1,'#d9c395');rect(x-16,y-8,10,2,'#a78660');rect(x-10,y-1,23,2,'#cbb48a');
  }else if(id==='seedJar'){
    rect(x-8,y-18,17,16,'#a5b8a6');rect(x-6,y-16,13,12,'#d0d8b9');rect(x-7,y-22,15,5,'#b79262');
    for(let i=0;i<5;i++)rect(x-4+i*2,y-9+i%2*3,2,2,'#a28553');rect(x-4,y-15,9,3,'#e9d9ac');
  }else{
    rect(x-17,y-12,34,11,'#a98256');rect(x-15,y-10,30,7,'#bba279');
    rect(x-9,y-17,7,10,'#92aea8');rect(x-7,y-21,3,6,'#bfd1b8');
    rect(x+1,y-15,9,8,'#d0ab8a');rect(x+4,y-19,3,6,'#e0c199');
    rect(x-12,y-6,24,2,'#d4bc8e');
  }
}
