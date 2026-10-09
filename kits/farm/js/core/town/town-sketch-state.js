'use strict';
// A small bounded album, not a second snapshot of the people or map.
const TOWN_SKETCH_TOPICS = ['yard','bridge','pavilion','donkeys'];
function makeTownSketch() { return {seen:[],day:0,pending:null,pages:[],selected:-1}; }
function validateTownSketch(town,day) {
  if(!Object.hasOwn(town,'sketch'))town.sketch=makeTownSketch();
  if(town.inventory&&!Object.hasOwn(town.inventory,'sketchbook'))town.inventory.sketchbook=0;
  const sketch=town.sketch,integer=n=>Number.isSafeInteger(n)&&n>=0&&n<=day;
  const page=p=>p&&TOWN_SKETCH_TOPICS.includes(p.topic)&&Number.isInteger(p.season)&&p.season>=0&&p.season<4
    &&integer(p.day)&&p.day>0&&p.palette&&[p.palette.from,p.palette.to].every(n=>Number.isInteger(n)&&n>=0&&n<4)
    &&Number.isFinite(p.palette.amount)&&p.palette.amount>=0&&p.palette.amount<=1&&p.season===(p.palette.amount>=.5?p.palette.to:p.palette.from);
  const fail=()=>{throw new Error('存档里的旅人写生册状态不正确。');};
  if(!sketch||!Array.isArray(sketch.seen)||sketch.seen.length>4
    ||new Set(sketch.seen).size!==sketch.seen.length||sketch.seen.some(id=>!TOWN_SKETCH_TOPICS.includes(id))
    ||!integer(sketch.day)||!Array.isArray(sketch.pages)||sketch.pages.length>16
    ||sketch.pages.some(p=>!page(p)||!integer(p.finished)||p.finished<p.day||p.finished>sketch.day||!sketch.seen.includes(p.topic))
    ||new Set(sketch.pages.map(p=>p.topic+':'+p.season)).size!==sketch.pages.length
    ||!Number.isInteger(sketch.selected)||sketch.selected< -1||sketch.selected>=sketch.pages.length
    ||(sketch.pages.length>0?sketch.selected<0:sketch.selected!==-1))fail();
  if(sketch.pending!==null&&(!page(sketch.pending)||sketch.pending.day>sketch.day||!sketch.seen.includes(sketch.pending.topic)
    ||!Number.isFinite(sketch.pending.progress)||sketch.pending.progress<0||sketch.pending.progress>=1
    ||sketch.pages.some(p=>p.topic===sketch.pending.topic&&p.season===sketch.pending.season)))fail();
  if(!town.inventory.sketchbook&&(sketch.pending||sketch.pages.length))fail();
}
