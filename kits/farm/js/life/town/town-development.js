'use strict';
// A read-only plan is shared by automatic commissions and the player's explanation.
function townDevelopmentPlan() {
  const town = farm.town;
  if (town.budgetMode === 'off' || town.construction || town.traveller.commissioned || !townShopOpen()) return null;
  const builds = Object.keys(TOWN_PROJECTS).filter(id => townCanCommission(id, true))
    .sort((a, b) => town.improvements[a].level - town.improvements[b].level
      || town.improvements[a].builtAt - town.improvements[b].builtAt
      || townProjectPrice(a) - townProjectPrice(b));
  const urgent = townCareCandidates(true)[0];
  if (urgent && (town.autoCareStreak < 2 || !builds.length)) return { kind: 'care', id: urgent, reason: 'urgent' };
  if (builds.length) return { kind: 'build', id: builds[0], reason: urgent ? 'turn' : 'development' };
  const care = townCareCandidates()[0];
  return care ? { kind: 'care', id: care, reason: 'upkeep' } : null;
}
function townChooseCommission() {
  if (farm.paused || farm.phase < .20 || farm.phase > .30) return;
  const plan = townDevelopmentPlan();
  if (!plan) return;
  if (plan.kind === 'build') townCommission(plan.id, true);
  else townCommissionCare(plan.id, true);
}
function townDevelopmentDescription() {
  const town = farm.town, job = town.construction;
  if (job) return `本趟已安排${job.kind === 'care' ? '养护' : '建设'}${TOWN_PROJECTS[job.id].name}。`;
  if (town.budgetMode === 'off') return '手动安排：由你选择修建或养护，已接委托继续完成。';
  if (town.traveller.commissioned) return '本趟修缮已安排好，你也可以再请阿棠帮忙。';
  const plan = townDevelopmentPlan();
  if (plan) {
    const action = plan.kind === 'care' ? '养护' : `建设第 ${town.improvements[plan.id].level + 1} 阶段`;
    const reason = { urgent: '先照料需要整理的地方', turn: '养护忙完，添些新设施',
      development: '先修还没完工的地方', upkeep: '先照料现有设施' }[plan.reason];
    const price = plan.kind === 'care' ? townCarePrice(plan.id) : townProjectPrice(plan.id);
    return `安排参考：${TOWN_PROJECTS[plan.id].name} · ${action} · ${price} 金。${reason}。`;
  }
  return `${town.autoCareStreak >= 2 ? '养护忙完，等下一项建设。' : '需要整理的地方先照料，再慢慢添新设施。'}${townShopOpen() ? '当前预算或积蓄不足，或设施暂不需要委托。' : '等阿棠营业后再看看。'}`;
}
