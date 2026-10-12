function qaReferencePond() {
  const water=groundTilePainter(),highlights=groundTilePainter();
  for (let y = 104; y < 276; y += 8) for (let x = 44; x < 247; x += 8) {
    const d = pondDepth(x, y);
    if (d < 1.09) water.add(x, y, 8, 8, d > .83 ? '#b6b888' : d > .66 ? '#6eafa9' : '#5f9fa9');
    if (d < .61 && hash(x, y, 4) > .86) highlights.add(x+2, y+2, 5, 2, '#91c4bb');
  }
  water.draw();highlights.draw();
  for (const [x, y] of [[72, 144],[217, 194],[92, 259],[222, 236]]) {
    rect(x, y, 3, 15, '#657e53'); rect(x+5, y-3, 3, 18, '#6e8551'); rect(x-4, y+4, 4, 2, '#d4af6c');
  }
  circle(114 + Math.sin(now*.7)*3, 213, 10, '#6aab78'); rect(109, 208, 7, 3, '#86bd80');
  rect(172 + Math.sin(now)*4, 178, 20, 2, '#b7d8c2'); rect(180 + Math.sin(now)*4, 182, 12, 2, '#b7d8c2');
}

