'use strict';
// Advance life systems in a fixed order; rendering never advances the simulation.
function updateActors(dt) {
  updateFarmAnimals(dt);
  updateFarmWorkers(dt);
  updateCourier(dt);
  updateVillageWalker(dt);
  updateAngler(dt);
  updateOrderKeeper(dt);
  updateAnglerFishing(dt);
  updateForestKeeper(dt);
  updateWildlife(dt);
  updateLake(dt);
  updateValleyLife(dt);
  updateRidgeLife(dt);
  updateMeadowLife(dt);
  updateNurseryLife(dt);
  updateMineLife(dt);
  updatePlazaLife(dt);
}
