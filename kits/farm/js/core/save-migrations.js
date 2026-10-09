'use strict';
// All save entry points migrate the validated old state before checking new construction data.
function migrateFarmSave(saved) {
  const state=saved.state;
  if(state.development==null)state.development=makeLegacyVillageDevelopment(state,saved.runtime);
  // Existing grass keeps its deterministic locations and full-grown appearance.
  if(state.development.maintenance==null)state.development.maintenance=makeVillageMaintenanceState(state.day);
  // Retire the tea-yard detour while retaining the rest of an existing farm's
  // construction progress. In-flight town outings rejoin the northern road.
  if(Array.isArray(state.development.roads))
    state.development.roads=state.development.roads.filter(id=>!/^traveller-[89]:/.test(id));
  const town=state.town;
  for(const actor of [town?.traveller,town?.dog,town?.childVisit,town?.teaParty]){
    for(const point of Array.isArray(actor?.route)?actor.route:[]){
      if(point?.y===986&&[1988,2036,2052,2272].includes(point.x))point.y=950;
    }
  }
  return saved;
}
