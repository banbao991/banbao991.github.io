module.exports=function checkTownCurios(run,assert){
  const checks=run(`(() => {
    const original=farm,result={tiers:true,payment:true,save:true,stock:true,depth:true,space:true,hints:true};
    try{
      farm=newFarm();farm.coins=600000;farm.phase=.16;farm.town.merchantUnlocked=true;
      const actor=farm.town.traveller;Object.assign(actor,{mode:'shop',...TOWN_LAYOUT.counter});
      for(const slot of TOWN_LAYOUT.showcase.slots){
        const good=TOWN_GOODS[slot.id];actor.offers=[{id:slot.id,price:good.price,sold:false}];
        const coins=farm.coins;result.payment &&=townBuy(slot.id) && farm.coins===coins-good.price
          && farm.town.inventory[slot.id]===1 && !townBuy(slot.id);
        result.hints &&=townDescribe(slot.x,slot.y-8)?.text.includes(good.name===TOWN_GOODS.riverPlate.name?'青瓷':good.name===TOWN_GOODS.forestCarving.name?'松鼠':'矿石');
      }
      const item=farmSceneItems().find(item=>item.id==='town-curio-cabinet');
      result.depth=item && item.y===TOWN_LAYOUT.showcase.bottom && (item.layer||0)===0;
      const saved=JSON.stringify(farm.town);farm=parseFarmSave({version:1,state:JSON.parse(JSON.stringify(farm))});
      result.save=JSON.stringify(farm.town)===saved;
      const shelf=TOWN_LAYOUT.showcase;
      for(let x=shelf.left;x<=shelf.right;x+=5)for(let y=shelf.top;y<=shelf.bottom;y+=5)
        result.space &&=!townRoadAt(x,y) && !riverAt(x,y)
          && !inRect(x,y,TOWN_LAYOUT.home.left,TOWN_LAYOUT.home.top,TOWN_LAYOUT.home.right,TOWN_LAYOUT.home.bottom);
      for(const [coins,tier]of [[5000,0],[20000,1],[100000,2],[500000,3]]){
        farm.town=makeTownState();farm.coins=coins;townBeginVisit();
        result.tiers &&=farm.town.traveller.offers.every(offer=>TOWN_GOODS[offer.id].tier<=tier)
          && farm.town.traveller.offers.some(offer=>TOWN_GOODS[offer.id].tier===tier);
      }
      for(const [id,good]of Object.entries(TOWN_GOODS))farm.town.inventory[id]=good.stock;
      // No remaining goods is a valid visit: stories and repair work still remain available.
      townBeginVisit();result.stock=farm.town.traveller.offers.length===0 && farm.town.traveller.storyIndex>=0;
      farm.town.inventory.teaBlend=0;townBeginVisit();
      result.stock &&=farm.town.traveller.offers.length===1 && farm.town.traveller.offers[0].id==='teaBlend';
      return result;
    }finally{farm=original;updateUI();}
  })()`);
  for(const [name,passed]of Object.entries(checks))assert.ok(passed,`Traveller keepsake failed: ${name}`);
  console.log('Curio checks passed: wealth tiers, one purchase, permanent save, useful stock, empty-stock visit, shelf depth, space and hints.');
};
