'use strict';
let villageMaintenanceUIState=null;
let villageMaintenanceUICompleted=0;
function updateVillageMaintenanceUI() {
  const panel=$('maintenance-panel'),m=farm.development.maintenance;
  if(!panel)return;
  if(villageMaintenanceUIState!==m){$('maintenance-feedback').textContent='';villageMaintenanceUIState=m;villageMaintenanceUICompleted=m.completedJobs;}
  if(m.completedJobs!==villageMaintenanceUICompleted){$('maintenance-feedback').textContent='';villageMaintenanceUICompleted=m.completedJobs;}
  panel.hidden=!villageMaintenanceOpen();if(panel.hidden)return;
  const job=m.job,count=villageMatureWeeds().length;
  const rest=isFestivalDay()?' · 欢庆日休工':farm.phase>=NIGHT_START?' · 夜间休息':!villageWorkingWeather()?' · 等天气好转':'';
  $('maintenance-status').textContent=job?`草地养护 · 已清理 ${job.cleared} / ${VILLAGE_MAINTENANCE.target} 簇${rest}`
    :`草地养护 · 可清理 ${count} 簇 · ${villageMaintenanceReason(false,count)||'准备新一轮养护'}`;
  $('maintenance-total').textContent=`累计清理 ${m.clearedTotal} 簇 · 养护支出 ${m.spentTotal} 金`;
  const button=$('maintenance-request'),reason=villageMaintenanceReason(true,count);
  button.textContent=`委托除草 · ${VILLAGE_MAINTENANCE.target} 簇 / ${VILLAGE_MAINTENANCE.price} 金`;
  button.disabled=!!reason;button.title=reason||`阿梁和阿砚将清理 ${VILLAGE_MAINTENANCE.target} 簇杂草`;
  $('construction-status').textContent=job?'阿梁、阿砚受托照料村庄草地':'主要工程已完成，施工队兼顾草地养护';
}
$('maintenance-request').addEventListener('click',()=>{
  const started=startVillageMaintenance(true);
  $('maintenance-feedback').textContent=started?'委托已安排，阿梁和阿砚会在合适的天气出门。':villageMaintenanceReason(true);
  updateUI();
});
