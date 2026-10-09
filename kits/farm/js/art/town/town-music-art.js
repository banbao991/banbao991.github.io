'use strict';
function townMusicFade(){const m=farm.town.music;return townMusicPlaying()?clamp(Math.min(m.elapsed/.25,(2.4-m.elapsed)/.25),0,1):0;}
function townMusicHeadLift(id){return townMusicListening(id)?Math.round(Math.sin(now*(farm.town.music.theme===3?3:5))*townMusicFade()):0;}
function drawTownMusic(){
  const point=TOWN_LAYOUT.music,music=farm.town.music;
  if(!townMusicPlaying())return;
  const colors=['#986354','#527f79','#976d3e','#687d8b'],fade=townMusicFade();
  rect(point.x+6,point.y+4+Math.round(Math.sin(now*5)),2,4,'#ddc297');
  for(let i=0;i<3;i++){
    const progress=(music.elapsed*1.4+i*.32)%1,alpha=fade*(1-progress)*.85;
    const x=point.x-3+i*7+Math.sin(now*2+i)*1.5,y=point.y-4-progress*23;
    ctx.save();ctx.globalAlpha*=alpha;
    rect(x,y,2,7,colors[music.theme]);rect(x-3,y+6,4,3,colors[music.theme]);
    if((i+music.theme)%2===0)rect(x+1,y,4,2,colors[music.theme]);
    ctx.restore();
  }
}
