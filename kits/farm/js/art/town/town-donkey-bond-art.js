'use strict';
// Contact depth and feet stay with the original animal; only its neck/head gently move.
function townDonkeyNuzzlePose(animal){const bond=farm.town.donkeyBond;
  if(bond.stage!=='nuzzle')return {reach:0,lift:0};
  const mix=Math.min(1,bond.wait/.5,(4.4-bond.wait)/.5);
  return {reach:Math.round(mix*(2+Math.sin(now*2.1)*.7)),lift:Math.round(mix*Math.sin(now*2.1+animal.id*.7))};
}
