'use strict';
function makeTownMusic(){return {day:0,decided:false,stage:'idle',elapsed:0,theme:0,startedDay:0,automatic:false,listeners:[],plays:0};}
function validateTownMusic(town,day){
  if(!Object.hasOwn(town,'music'))town.music=makeTownMusic();
  const music=town.music,integer=n=>Number.isSafeInteger(n)&&n>=0;
  if(!music||!integer(music.day)||music.day>day||!integer(music.startedDay)||music.startedDay>day
    ||typeof music.decided!=='boolean'||typeof music.automatic!=='boolean'||!['idle','play'].includes(music.stage)
    ||![0,1,2,3].includes(music.theme)||!integer(music.plays)||!Number.isFinite(music.elapsed)||music.elapsed<0||music.elapsed>2.4
    ||!Array.isArray(music.listeners)||music.listeners.length>3||new Set(music.listeners).size!==music.listeners.length
    ||music.listeners.some(id=>!['merchant','child','keeper'].includes(id))
    ||(music.stage==='play'?(!town.inventory.musicBox||!music.decided||music.startedDay!==music.day||music.day<1
      ||music.automatic&&!music.listeners.length):music.elapsed!==0||music.listeners.length))
    throw new Error('存档里的音乐盒小调状态不正确。');
}
