'use strict';
// This visit borrows one existing sparrow and 阿宁; their positions remain in runtime.
function makePlazaEavesVisit() { return {day:0,decided:false,chosen:false,stage:'idle',bird:-1,site:-1,
  wait:0,greeted:false,childWait:0,childDir:1,encounters:0}; }
function validatePlazaEavesVisit(town,day) {
  if(!Object.hasOwn(town,'eavesVisit'))town.eavesVisit=makePlazaEavesVisit();
  const v=town.eavesVisit,integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!v||!integer(v.day)||v.day>day||!['decided','chosen','greeted'].every(key=>typeof v[key]==='boolean')
    ||!['idle','out','perch','back','done'].includes(v.stage)||!Number.isInteger(v.bird)||v.bird< -1||v.bird>4
    ||!Number.isInteger(v.site)||v.site< -1||v.site>=PLAZA_EAVES_SITES.length
    ||!Number.isFinite(v.wait)||v.wait<0||v.wait>6||!Number.isFinite(v.childWait)||v.childWait<0||v.childWait>3.2
    ||![-1,1].includes(v.childDir)||!integer(v.encounters)||v.encounters>day
    ||v.chosen&&(!v.decided||v.day<1||v.bird<0||v.site<0)
    ||!v.chosen&&(v.bird!==-1||v.site!==-1||v.greeted||!['idle','done'].includes(v.stage))
    ||!v.decided&&(v.chosen||v.stage!=='idle')
    ||v.greeted&&(!['perch','back','done'].includes(v.stage)||v.encounters<1)
    ||v.childWait>0&&(!v.greeted||v.stage!=='perch')
    ||['out','perch','back'].includes(v.stage)&&!v.chosen)
    throw new Error('存档里的屋檐麻雀来访不正确。');
}
