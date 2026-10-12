// Frozen pre-cache ground predicate for independent QA/test comparisons only.
function qaReferencePlantGroundAllowed(id,plant,context=villagePlantGroundContext()) {
    const {graph,buildings}=context;
    const {x,y}=plant,padding=plant.kind==='tree'?20:14;
    for(let bx=Math.floor((x-padding)/64);bx<=Math.floor((x+padding)/64);bx++)
      for(let by=Math.floor((y-padding)/64);by<=Math.floor((y+padding)/64);by++)
        if((graph.buckets.get(`${bx}:${by}`)||[]).some(r=>x>=r.x-padding&&x<=r.x+r.w+padding
          &&y>=r.y-padding&&y<=r.y+r.h+padding))return false;
    if(buildings.some(b=>inRect(x,y,b.left-padding,b.top-padding,b.right+padding,b.bottom+padding)))return false;
    if(riverAt(x,y,10)||pondAt(x,y)||lakeAt(x,y)||valleyLakeAt(x,y))return false;
    if(id==='nursery'&&(wetlandCreekAt(x,y,18)||wetlandMarshDepth(x,y)<1.08))return false;
    return true;
}
