'use strict';
// One world-space painter queue. Ground surfaces draw before the queue is flushed.
let sceneQueue = null;
function scenePart(id, y, draw, order = 0, layer = 0) {
  if(!villageSceneItemVisible(id))return;
  if (sceneQueue) sceneQueue.push({ id, y, order, layer, draw });
  else draw();
}
function sortSceneItems(items) {
  return items.sort((a, b) => (a.layer || 0) - (b.layer || 0)
    || a.y - b.y || (a.order || 0) - (b.order || 0));
}
function collectSceneItems(drawScene) {
  const previous = sceneQueue, items = [];
  sceneQueue = items;
  try { drawScene(); }
  finally { sceneQueue = previous; }
  return sortSceneItems(items);
}
function drawSceneItems(items) {
  for (const item of sortSceneItems(items)) if(villageSceneItemVisible(item.id))item.draw();
}
// Depth uses the unanimated sole/contact point, never a jumping or swaying sprite.
function actorDepth(actor, sole = 22) { return actor.y + sole; }
