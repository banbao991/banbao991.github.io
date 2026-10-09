'use strict';
// Rain refills the existing shallow dish; a saved daily choice brings one quiet visitor.
function townBirdBathWelcoming(){const weather=weatherVisual();return farm.phase>=.12&&farm.phase<.42
  &&seasonTransition().winter<.5&&weather.rain<.25&&weather.snow<.25;}
function townBathBirdAt(x,y){const bird=farm.town.birdBath.bird;return bird
  &&inRect(x,y,bird.x-20,bird.y-15,bird.x+22,bird.y+9)?bird:null;}
function townBathBirdActivity(){const bird=farm.town.birdBath.bird;return bird
  ?({arrive:'沿溪飞向浅水盘',perch:'在盘沿试试水',bathe:'扑扑翅膀洗澡',dry:'晾晾羽毛、摇摇长尾',leave:'沿溪飞走'})[bird.mode]
  :seasonTransition().winter>=.5?'寒冷时小鸟暂不下水':farm.town.birdBath.water<.25?'浅盘稍干，等下一场雨':'等一位晴日访客';}
function updateTownBirdBath(dt){
  if(farm.paused)return;
  const bath=farm.town.birdBath,site=TOWN_LAYOUT.birdBath,stamp=farm.day+farm.phase;
  if(!villageSiteOpen('herbs')||!farm.town.inventory.birdNest)return;
  if(!bath.ready){bath.ready=true;bath.water=.55;bath.agedAt=stamp;save();}
  const weather=weatherVisual(),elapsed=clamp(stamp-bath.agedAt,0,1);
  bath.water=clamp(bath.water+elapsed*(weather.rain*1.1-.18*(1-.75*seasonTransition().winter)*(1-weather.rain)),0,1);
  bath.agedAt=stamp;
  const welcoming=townBirdBathWelcoming();
  if(welcoming&&bath.water>=.25&&bath.day!==farm.day&&!bath.bird){
    bath.day=farm.day;bath.chosen=townRandom()<(bath.water>=.6?.6:.25);bath.spawned=false;
    if(bath.chosen){bath.spawned=true;bath.bird={...site.home,target:{...site.perch},day:farm.day,
      mode:'arrive',step:0,wait:0,cycles:0,noticed:false,dir:1};}
    save();
  }
  const bird=bath.bird;if(!bird)return;
  bird.step+=dt*9;
  if((!welcoming||bath.water<.10||bird.day!==farm.day)&&bird.mode!=='leave'){
    bird.mode='leave';bird.target={...site.home};bird.wait=0;save();
  }
  if(['perch','bathe','dry'].includes(bird.mode)){
    const duration=bird.mode==='perch'?.9:bird.mode==='bathe'?1.05:1.8;
    bird.wait=Math.min(duration,bird.wait+dt);
    if(bird.wait<duration)return;
    bird.wait=0;
    if(bird.mode==='perch'){bird.mode='bathe';bird.target={...site.water};bird.x=site.water.x;bird.y=site.water.y;}
    else if(bird.mode==='bathe'){
      bird.cycles++;bath.baths++;bath.water=Math.max(0,bath.water-.015);
      if(bird.cycles===3){bird.mode='dry';bird.target={...site.perch};bird.x=site.perch.x;bird.y=site.perch.y;}
    }else{bird.mode='leave';bird.target={...site.home};}
    save();return;
  }
  const dx=bird.target.x-bird.x,dy=bird.target.y-bird.y,length=Math.hypot(dx,dy),travel=Math.min(length,dt*90);
  if(Math.abs(dx)>.01)bird.dir=dx<0?-1:1;
  if(length>.01){bird.x+=dx/length*travel;bird.y+=dy/length*travel;}
  if(length<=travel+.01){
    bird.x=bird.target.x;bird.y=bird.target.y;
    if(bird.mode==='leave')bath.bird=null;
    else{bird.mode='perch';bird.wait=0;bath.visits++;townNote('一只白鹡鸰沿溪飞来，在浅水盘边摇摇长尾，准备洗个小澡。');}
    save();
  }
}
