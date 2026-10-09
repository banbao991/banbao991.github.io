const assert = require('node:assert/strict');
const { run, element, getStoredSave } = require('./harness.cjs');

run("farm.events=[{day:0,time:'22:00',text:'昨天的消息'}];for(let i=0;i<25;i++)record('当天消息 '+i)");
assert.equal(run('farm.events.length'), 25);
assert.equal(element('event-list').children.length, 25);
assert.equal(run('farm.events[0].text'), '当天消息 24');
assert.equal(run('farm.events.every(event=>event.day===farm.day)'), true);
const children = element('event-list').children;
run('updateUI();updateUI()');
assert.equal(element('event-list').children, children, 'Unchanged entries keep their DOM nodes');

run('save()');
assert.equal(JSON.parse(getStoredSave()).state.events.length, 25);
assert.equal(run('parseFarmSave(JSON.parse(farmExportText())).events.length'), 25);
assert.equal(run(`(() => {
  const saved=JSON.parse(farmExportText());
  saved.state.events.push({day:0,time:'22:00',text:'昨天的消息'}, {day:2,time:'06:00',text:'未来的消息'});
  return parseFarmSave(saved).events.length;
})()`), 25, 'Import retains every current-day entry and excludes other days');

// Model real list offsets to verify that a newly prepended entry does not move the reader.
run(`(() => {
  const create=document.createElement;
  document.createElement=function(tag) {
    const item=create(tag);
    if(tag==='li') {
      Object.defineProperties(item, {
        offsetTop:{get(){return $('event-list').children.indexOf(item)*45+3;}},
        offsetHeight:{get(){return 33;}}
      });
      item.getBoundingClientRect=()=>({top:item.offsetTop,bottom:item.offsetTop+33});
    }
    return item;
  };
  journalSignature='';updateJournalUI();$('event-list').scrollTop=100;
})()`);
const anchorText = run('journalRenderedEvents[2].text');
run("record('最新消息')");
assert.equal(element('event-list').scrollTop, 145);
assert.equal(run('journalRenderedEvents[3].text'), anchorText);
assert.equal(element('event-list').style.maxHeight, '176px', 'Only four rows set the display height');

run('replaceFarmState(parseFarmSave(JSON.parse(farmExportText())))');
assert.equal(run('farm.events.length'), 26);
assert.equal(element('event-list').children.length, 26);
run('nextDay()');
assert.equal(run('farm.day'), 2);
assert.equal(run('farm.events.every(event=>event.day===2)'), true);
assert.equal(run('farm.events.some(event=>event.text.includes("当天消息")||event.text==="最新消息")'), false);
assert.ok(run('farm.events.length') > 0, 'Dawn messages survive the page change');
assert.equal(element('event-list').scrollTop, 0);
assert.equal(JSON.parse(getStoredSave()).state.events.every(event => event.day === 2), true);
console.log('Daily journal passed: all 25 entries, unchanged nodes, four-row scroll window, stable reading anchor, complete cache/export/import and fresh dawn page.');
