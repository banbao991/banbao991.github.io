const assert = require('node:assert/strict');
const { run, element, exportPainted, exportColors, documentListeners } = require('./harness.cjs');

assert.equal(element('town-card').hidden, true);
const roster = element('resident-list');
assert.equal(roster.children.length, 6);
const originalButton = roster.children[0];
assert.equal(originalButton.children[0].textContent, '阿满');
assert.equal(originalButton.children[1].className, 'resident-portrait');
assert.equal(originalButton.children[1].width, 88);
assert.equal(originalButton.children.length, 2, 'Activity details belong in the hover tooltip');
assert.ok(element('construction-future').children.every(item => !item.textContent.startsWith('未来')));
run('updateUI()');
assert.equal(roster.children[0], originalButton);

originalButton.listeners.pointerenter();
assert.equal(element('resident-tooltip').hidden, false);
assert.ok(element('resident-tooltip').textContent.includes('阿满'));
run("workers[0].task={type:'milk'};updateUI()");
assert.ok(element('resident-tooltip').textContent.includes('挤牛奶'));
originalButton.listeners.pointerleave();
assert.equal(element('resident-tooltip').hidden, true);
originalButton.listeners.focus();
documentListeners.keydown.forEach(handler => handler({ key: 'Escape' }));
assert.equal(element('resident-tooltip').hidden, true);
run('workers[0].x=1800;workers[0].y=1100');
const beforeView = run('JSON.stringify(farm.view)');
originalButton.click();
assert.notEqual(run('JSON.stringify(farm.view)'), beforeView);

// Display-only animation has two front-facing eyes and changes while paused.
run('farm.paused=true');
const saveBefore = run('JSON.stringify({state:farm,runtime:captureRuntimeState()})');
exportPainted.length = 0; exportColors.length = 0;
run("drawVillageResidentPortrait(villageResidentRows.get('阿满').portrait,'阿满',0)");
const frame = JSON.stringify(exportPainted);
const eyes = exportPainted.filter((_, index) => exportColors[index] === '#4a473c');
assert.equal(eyes.length, 2);
assert.equal(eyes[0][1], eyes[1][1]);
exportPainted.length = 0; exportColors.length = 0;
run("drawVillageResidentPortrait(villageResidentRows.get('阿满').portrait,'阿满',1)");
assert.notEqual(JSON.stringify(exportPainted), frame);
assert.equal(run('JSON.stringify({state:farm,runtime:captureRuntimeState()})'), saveBefore);

// First arrival reveals the card; departures keep purchases/history accessible.
run('farm.town.visits=1;updateUI()');
assert.equal(element('town-card').hidden, false);
run("farm.town.traveller.mode='away';updateUI()");
assert.equal(element('town-card').hidden, false);
run('replaceFarmState(newFarm())');
assert.equal(element('town-card').hidden, true);
assert.equal(roster.children[0], originalButton);
assert.equal(element('resident-tooltip').hidden, true);
console.log('Resident sidebar passed: stable portraits, dynamic hover, focus/Escape, map location, paused read-only animation, future labels, first-visit card and reset.');
