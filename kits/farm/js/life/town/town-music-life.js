'use strict';
const TOWN_MUSIC_NAMES=['春芽圆舞','溪风小调','栗叶慢拍','炉边摇篮'];
function townMusicAllowed(){const weather=weatherVisual();return farm.town.inventory.musicBox>0
  &&!isFestivalDay()&&farm.phase>=.05&&farm.phase<.46&&weather.rain<.25&&weather.snow<.25;}
function townMusicAudience(){const town=farm.town,people=[];
  if(town.traveller.mode==='rest'&&!town.traveller.festival&&!townSketchDrawing()
    &&distance(town.traveller,TOWN_LAYOUT.merchantSeat)<2)people.push({id:'merchant',remaining:town.teaParty.stage==='tea'?4-town.teaParty.wait:town.traveller.wait});
  if(town.childVisit?.stage==='tea'&&!villageWalker.festival&&distance(villageWalker,TOWN_LAYOUT.childSeat)<2)
    people.push({id:'child',remaining:3.5-town.childVisit.wait});
  if(town.teaParty.stage==='tea'&&!orderKeeper.festival&&townTeaPartyGuestSeated())
    people.push({id:'keeper',remaining:4-town.teaParty.wait});
  return people;
}
function townMusicPlaying(){return farm.town.music.stage==='play';}
function finishTownMusic(completed=false){const music=farm.town.music;
  if(!townMusicPlaying())return;
  music.stage='idle';music.elapsed=0;music.listeners=[];
  if(completed){music.plays++;townNote(`驿屋茶桌上的音乐盒奏完「${TOWN_MUSIC_NAMES[music.theme]}」，大家各自接着过日子。`);}
  save();
}
function startTownMusic(automatic=false){const music=farm.town.music;
  if(farm.paused&&automatic||!townMusicAllowed()||townMusicPlaying()||music.startedDay===farm.day
    ||(.46-farm.phase)*DAY_SECONDS<2.4)return false;
  const people=townMusicAudience().filter(person=>person.remaining>=2.4);
  if(automatic&&!people.length)return false;
  Object.assign(music,{day:farm.day,decided:true,startedDay:farm.day,stage:'play',elapsed:0,theme:seasonIndex(),automatic,
    listeners:people.map(person=>person.id)});
  save();return true;
}
function updateTownMusic(dt){
  if(farm.paused)return;
  const music=farm.town.music;
  if(music.day!==farm.day){finishTownMusic();Object.assign(music,{day:farm.day,decided:false});}
  if(townMusicPlaying()){
    if(!townMusicAllowed()||music.automatic&&!townMusicAudience().some(person=>music.listeners.includes(person.id))){finishTownMusic();return;}
    music.elapsed=Math.min(2.4,music.elapsed+dt);
    if(music.elapsed>=2.4)finishTownMusic(true);
    return;
  }
  if(music.decided||music.startedDay===farm.day||!townMusicAllowed()
    ||(.46-farm.phase)*DAY_SECONDS<2.4+dt||!townMusicAudience().some(person=>person.remaining>=2.4+dt))return;
  music.decided=true;
  if(townRandom()<.65)startTownMusic(true);else save();
}
function townMusicListening(id){return townMusicPlaying()&&townMusicAudience().some(person=>person.id===id);}
function townMusicDescription(){const music=farm.town.music;
  return !farm.town.inventory.musicBox?'添置音乐盒后，茶桌边偶尔会有一段四季小调。'
    :townMusicPlaying()?`音乐盒 · 「${TOWN_MUSIC_NAMES[music.theme]}」 · 小调 ${Math.round(music.elapsed/2.4*100)}%`
    :`音乐盒 · 已完整奏过 ${music.plays} 回 · ${music.startedDay===farm.day?'今日发条已用，明天再听':townMusicAllowed()?'点击免费上弦，晴好喝茶时也会自行奏一回':'晴好白天再听，雨雪与欢庆时收好'}`;
}
function windTownMusic(){if(!startTownMusic())record(townMusicDescription());else record(`你轻轻上弦，茶桌上的音乐盒开始奏「${TOWN_MUSIC_NAMES[farm.town.music.theme]}」。`);updateUI();save();}
