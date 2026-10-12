function qaReferenceBaseTerrain(colors) {
  grass();
  const left = Math.max(0, Math.floor(farm.view.x / GROUND_STEP) - 1);
  const top = Math.max(0, Math.floor(farm.view.y / GROUND_STEP) - 1);
  const right = Math.min(groundColumns, Math.ceil((farm.view.x + W / farm.view.zoom) / GROUND_STEP) + 1);
  const bottom = Math.min(groundRows, Math.ceil((farm.view.y + H / farm.view.zoom) / GROUND_STEP) + 1);
  const ground=groundTilePainter();
  for (let gy = top; gy < bottom; gy++) for (let gx = left; gx < right; gx++) {
    const cell = groundCells[gy * groundColumns + gx];
    ground.add(cell.x, cell.y, GROUND_STEP, GROUND_STEP,
      `rgb(${groundChannel(cell, 0, colors)},${groundChannel(cell, 1, colors)},${groundChannel(cell, 2, colors)})`);
  }
  ground.draw();
  terrainDetails();
}
