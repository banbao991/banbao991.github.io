'use strict';
// Only the shared invitation is new; both animals keep their original saved positions/routes.
function makeTownDonkeyBond(){return {day:0,decided:false,stage:'idle',left:-1,spots:[],wait:0,sessions:0};}
function validateTownDonkeyBond(town,day){
  if(!Object.hasOwn(town,'donkeyBond'))town.donkeyBond=makeTownDonkeyBond();
  const bond=town.donkeyBond,integer=n=>Number.isSafeInteger(n)&&n>=0,active=bond&&bond.stage!=='idle';
  const meadow=TOWN_LAYOUT.donkeyBond;
  if(!bond||!integer(bond.day)||bond.day>day||typeof bond.decided!=='boolean'
    ||!['idle','out','nuzzle'].includes(bond.stage)||!integer(bond.sessions)
    ||!Number.isFinite(bond.wait)||bond.wait<0||bond.wait>(bond.stage==='out'?8:4.4)
    ||!Array.isArray(bond.spots)||bond.spots.length!==(active?2:0)
    ||bond.spots.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)
      ||!inRect(p.x,p.y,meadow.left,meadow.top,meadow.right,meadow.bottom))
    ||(active?(!bond.decided||bond.day<1||town.donkeys.length!==2||![0,1].includes(bond.left)
      ||Math.abs(bond.spots[1].x-bond.spots[0].x-50)>.001
      ||Math.abs(bond.spots[1].y-bond.spots[0].y-4)>.001):bond.left!==-1||bond.wait!==0))
    throw new Error('存档里的小驴相伴状态不正确。');
  if(active&&town.donkeys.some(animal=>{
    const spot=bond.spots[animal.id===bond.left?0:1];
    return animal.target!=='pen'||!['walk','rest'].includes(animal.mode)
      ||!inRect(animal.x,animal.y,meadow.left,meadow.top,meadow.right,meadow.bottom)
      ||(bond.stage==='nuzzle'?distance(animal,spot)>.01:!animal.route.length||distance(animal.route.at(-1),spot)>.01);
  }))throw new Error('存档里的小驴相伴路线不正确。');
}
