'use strict';
// Purchased seeds and bird food affect real saved visitors, rather than only a counter.
function townBirdPerch(bird) {
  return bird.variant === 1 ? { x: TOWN_LAYOUT.birdhouse.x, y: TOWN_LAYOUT.birdhouse.y - 42 }
    : { x: TOWN_LAYOUT.feeding.x, y: TOWN_LAYOUT.feeding.y - 4 };
}
function townPlantGrowth(id, index) {
  const boost=id==='flowerPot'?(farm.town.flowerCare.pots[index]?.boost || 0):0;
  return clamp((farm.day + farm.phase - (farm.town.plantings[id]?.[index] || 0) + boost) / 1.2, 0, 1);
}
function makeTownBird(variant) {
  const home = variant === 1 ? { x: 220, y: 1140 } : { x: 2240, y: 1060 };
  return { ...home, id: variant, variant, mode: 'arrive', target: { ...home }, step: 0,
    wait: 0, action: 0, lift: 0, noticed:false,dir:-1,meal:variant===1?null:makeTownBirdMeal(farm.day) };
}
function updateTownEcology(dt) {
  if (farm.paused) return;
  const town = farm.town;
  const weather=weatherVisual();
  const welcoming = weather.rain<.25 && weather.snow<.25
    && farm.phase >= .07 && farm.phase < .45;
  if (welcoming && town.ecologyDay !== farm.day) {
    town.ecologyDay = farm.day;
    if (villageSiteOpen('traveller') && town.inventory.birdFeed > 0 && !town.birds.some(bird => bird.variant !== 1)) {
      const variant=seasonTransition().winter>.5 && townRandom()<.65 ? 2 : 0;
      const bird = makeTownBird(variant); bird.target = townBirdPerch(bird); town.birds.push(bird);
      townNote(`驿屋的谷粒引来一只${variant===2?'冬日知更鸟':'小雀'}，正沿草坪飞向浅盘。`);
    }
    if (villageSiteOpen('herbs') && town.inventory.birdNest > 0 && !town.birds.some(bird => bird.variant === 1) && townRandom() < .72) {
      const bird = makeTownBird(1); bird.target = townBirdPerch(bird); town.birds.push(bird);
      townNote('一只翠鸟发现溪畔巢箱，沿着西南小湖飞来歇脚。');
    }

  }
  for (const bird of town.birds) {
    bird.step += dt * 10;
    if ((!welcoming || !villageSiteOpen(bird.variant===1?'herbs':'traveller') || bird.variant!==1 && !bird.meal.taken && bird.meal.day!==farm.day) && bird.mode !== 'leave') {
      bird.mode = 'leave'; bird.target = bird.variant === 1 ? { x: 220, y: 1140 } : { x: 2240, y: 1060 };
    }
    if (bird.mode === 'perch') {
      updateTownBirdMeal(bird,dt);
      bird.wait += dt;
      if (bird.variant === 1 && bird.wait > 4) {
        bird.mode = 'dive'; bird.action = 0; bird.target = { x: 235, y: 1220 };
      }
    } else {
      const dx = bird.target.x - bird.x, dy = bird.target.y - bird.y;
      if(Math.abs(dx)>.01)bird.dir=dx<0?-1:1;
      const length = Math.hypot(dx, dy), travel = Math.min(length, dt * (bird.variant === 1 ? 115 : 90));
      if (length > .01) { bird.x += dx / length * travel; bird.y += dy / length * travel; }
      if (length <= travel + .01) {
        bird.x = bird.target.x; bird.y = bird.target.y;
        if (bird.mode === 'dive') {
          bird.action += dt;
          if (bird.action > .8) { bird.mode = 'arrive'; bird.target = townBirdPerch(bird); }
        } else if (bird.mode !== 'leave') {
          bird.mode = 'perch'; bird.wait = 0;
          if(!beginTownBirdMeal(bird)){bird.mode='leave';bird.target={x:2240,y:1060};}
        }
      }
    }
  }
  town.birds = town.birds.filter(bird => bird.mode !== 'leave' || distance(bird, bird.target) > 1);
}
