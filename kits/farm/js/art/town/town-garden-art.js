'use strict';
// Leaf cover and visitors are ground entities; their feet determine their drawing depth.
function drawTownGardenVisitors() {
  if(farm.town.improvements.travellerGarden.level){
    const home=TOWN_LAYOUT.gardenHabitat.home;
    scenePart('town-garden-leaf-cover',home.y+3,()=>{
      for(let i=0;i<7;i++){
        const x=home.x-15+hash(i,92,61)*30,y=home.y-7+hash(i,48,63)*11;
        rect(x,y,6,3,i%2?'#a59b73':'#b6ac82');
      }
      rect(home.x-11,home.y-2,24,3,'#829367');
    });
  }
  for(const animal of farm.town.critters)if(animal.mode!=='hide')
    scenePart(`town-garden-critter:${animal.id}`,animal.y+3,()=>drawTownCritter(animal),10);
}
function drawTownCritter(animal) {
  const x=Math.round(animal.x),y=Math.round(animal.y);
  const dir=animal.target.x<animal.x?-1:1;
  const pulse=Math.sin(farm.paused?now*2:animal.step*3+animal.id);
  ctx.save();ctx.translate(x,y);ctx.scale(dir,1);
  if(animal.kind==='snail'){
    rect(-9,0,18,3,'#a7b29a');rect(-8,-1,14,2,'#bfccb0');
    rect(-7,-8,11,8,'#b9a078');rect(-5,-10,7,2,'#cbb78c');
    rect(-5,-6,7,3,'#8f8061');rect(-3,-5,3,3,'#d0be92');
    if(animal.shy<=0){
      rect(6,-4,5,5,'#b8c7aa');rect(8,-8+pulse,1,5,'#9ba98f');
      rect(11,-7-pulse,1,5,'#9ba98f');rect(8,-8+pulse,2,2,'#6c765e');
    }
  }else{
    rect(-12,-8,22,10,'#a68b67');rect(-9,-12,15,5,'#bba27d');
    for(let i=0;i<5;i++)rect(-9+i*4,-11+i%2*2,2,6,'#d3be93');
    rect(8,-5,9,6,'#d0b18a');rect(16,-3,3,3,'#6f614a');
    if(animal.shy<=0)rect(10,-5,2,2,'#5c5948');
    rect(-8,2,4,2+(animal.mode==='arrive'?pulse:0),'#847452');rect(5,2,4,3,'#847452');
  }
  ctx.restore();
}
