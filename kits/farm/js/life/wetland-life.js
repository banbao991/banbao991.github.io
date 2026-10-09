'use strict';
// The wetland wildlife follows the same saved motion clock as the rest of the farm.
function wetlandStir() {
  return clamp((farm.nursery.wildlifeStirUntil - motionNow) / 2.2, 0, 1);
}
function wetlandWaterhenPosition() {
  const pace = .38;
  const stir = wetlandStir();
  const pool = NURSERY_LAYOUT.wetlandPool;
  const bird={
    x: pool.x + Math.sin(motionNow * pace) * (68 - seasonTransition().winter * 16)
      + Math.sin(motionNow * 7) * stir * 13,
    y: pool.y + Math.cos(motionNow * pace * 1.4) * 17 + Math.sin(motionNow * 5) * stir * 4,
    dir: Math.cos(motionNow * pace) >= 0 ? 1 : -1
  };
  if(wetlandWaterhenListening(bird))bird.dir=nurseryFrogContact().x<bird.x?-1:1;
  return bird;
}
function wetlandDragonflyActivity() {
  return (1 - smoothRange(.35, .82, seasonTransition().winter))
    * (1 - smoothRange(.28, .78, weatherVisual().rain))
    * smoothRange(.01, .08, farm.phase)
    * (1 - smoothRange(.48, .62, farm.phase));
}
function wetlandDragonfliesVisible() {
  return wetlandDragonflyActivity() > .12;
}
function wetlandDragonflyPosition(index) {
  const stir = wetlandStir();
  return {
    x: 176 + index * 231 + Math.sin(motionNow * (1.25 + index * .16) + index * 2.3) * (37 + stir * 21),
    y: 1715 + index * 107 + Math.cos(motionNow * 1.7 + index) * (20 + stir * 10)
  };
}
function wetlandFireflyActivity() {
  const season = seasonTransition();
  return (1 - smoothRange(.3, .78, Math.max(season.winter, season.autumn)))
    * (1 - smoothRange(.3, .8, weatherVisual().rain))
    * smoothRange(.53, .65, farm.phase)
    * (1 - smoothRange(.87, .99, farm.phase));
}
function wetlandFirefliesVisible() {
  return wetlandFireflyActivity() > .12;
}
function wetlandFireflyPosition(index) {
  const anchors = [[113, 1735], [145, 1850], [416, 1699], [486, 1857]];
  const [x, y] = anchors[index];
  return { x: x + Math.sin(motionNow * .8 + index * 2.1) * 7,
    y: y + Math.cos(motionNow * .65 + index * 1.7) * 6 };
}
function wetlandCreatureAt(x, y) {
  const bird = wetlandWaterhenPosition();
  if (Math.abs(x - bird.x) < 17 && Math.abs(y - bird.y) < 15)
    return { kind: 'waterhen' };
  if (wetlandDragonfliesVisible()) for (let index = 0; index < 2; index++) {
    const insect = wetlandDragonflyPosition(index);
    if (Math.abs(x - insect.x) < 12 && Math.abs(y - insect.y) < 10)
      return { kind: 'dragonfly', index };
  }
  if (wetlandFirefliesVisible()) for (let index = 0; index < 4; index++) {
    const insect = wetlandFireflyPosition(index);
    if (Math.abs(x - insect.x) < 10 && Math.abs(y - insect.y) < 10)
      return { kind: 'firefly', index };
  }
  return null;
}
function wetlandCreatureHint(creature) {
  if (creature.kind === 'waterhen') return wetlandWaterhenListening(wetlandWaterhenPosition())?'湿地黑水鸡 · 转头留意芦苇边的蛙声，点击看它划开水纹':'湿地黑水鸡 · 在睡莲间缓缓游动，点击看它划开水纹';
  if (creature.kind === 'dragonfly') return '蓝尾蜻蜓 · 晴天在浅洼上巡飞，点击看它转向';
  return '湿地萤火虫 · 暖夜在芦苇间亮起，点击看它们闪烁';
}
function interactWetlandCreature(creature) {
  farm.nursery.wildlifeStirUntil = motionNow + 2.2;
  record(creature.kind === 'waterhen'
    ? '黑水鸡划开浅洼水面，旁边的蜻蜓也跟着转了个弯。'
    : creature.kind === 'dragonfly'
      ? '蓝尾蜻蜓倏地转向，水面泛起一圈细小的涟漪。'
      : '萤火虫忽明忽暗，湿地边像亮起了几盏小灯。');
  save();
}
function wetlandPlantAt(x, y) {
  return WETLAND_PLANTS.find(plant => {
    const radius = plant.kind === 'lily' ? 16 : 12;
    return Math.abs(x - plant.x) < radius
      && y >= plant.y - (plant.kind === 'lily' ? 12 : 28) && y <= plant.y + 9;
  }) || null;
}
function wetlandPlantHint(plant) {
  if (plant.kind === 'cattail') return '香蒲 · 湿地水边扎根，秋天的穗子会渐渐变成暖棕色';
  if (plant.kind === 'iris') return seasonTransition().winter > .6
    ? '湿地鸢尾 · 冬天收起花瓣，静待春水' : '湿地鸢尾 · 温暖时开花，吸引蜻蜓在附近巡飞';
  if (plant.kind === 'lily') return `睡莲 · ${farm.nursery.wetness > .5 ? '水位充足，叶片舒展' : '浅水里慢慢生长'}，花朵白天开放`;
  return '莎草 · 守在浅洼边，为小动物留出隐蔽的草丛';
}
