'use strict';
// A short stop on the cow's actual pasture walk, with milking and shelter taking priority.
function cowGrazing(cow) { return !!cow.grazing && cow.grazing.duration > 0; }
function updateCowGrazing(cow, index, dt) {
  if (farm.paused) return cowGrazing(cow);
  const plan = cow.grazing, weather = weatherVisual();
  const allowed = farm.phase >= .05 && farm.phase < .46 && weather.rain < .35 && weather.snow < .2
    && seasonTransition().winter < .7
    && !workers.some(w => w.task?.type === 'milk' && w.task.index === index && distance(w, cow) < 36);
  if (cowGrazing(cow)) {
    if (!allowed || plan.day !== farm.day) { plan.duration = plan.elapsed = 0; return false; }
    plan.elapsed = Math.min(plan.duration, plan.elapsed + dt);
    if (plan.elapsed >= plan.duration) { plan.total++; plan.duration = plan.elapsed = 0; cow.wait = 0; }
    return true;
  }
  if (!allowed || plan?.day === farm.day || distance(cow, { x: cow.tx, y: cow.ty }) >= 5
    || hash(farm.day, index, 2301) >= .6 * (1 - seasonTransition().winter)) return false;
  cow.grazing = { day: farm.day, elapsed: 0, duration: 3.2 + hash(farm.day, index, 2302) * 1.2,
    total: plan?.total || 0 };
  return true;
}
function cowActivity(cow) {
  return cowGrazing(cow) ? '停下来低头吃草' : farm.phase >= NIGHT_START ? '回牛舍歇息' : '在牧场悠闲散步';
}
