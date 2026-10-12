const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sandbox={constructed:0,fills:[],matrix:{a:.425,b:0,c:0,d:.425,e:-92.38225,f:-263.42775}};
vm.createContext(sandbox);const run=code=>vm.runInContext(code,sandbox);
run(`class Path2D{constructor(){constructed++;this.rects=[]}rect(...r){this.rects.push(r)}}
 const ctx={tag:'main',getTransform(){return matrix},beginPath(){this.rects=[]},rect(...r){this.rects.push(r)},
 fill(p){fills.push({tag:this.tag,color:this.fillStyle,rects:(p?p.rects:this.rects).map(r=>[...r])})}};`);
const source=fs.readFileSync(path.resolve(__dirname,'../js/art/drawing-context.js'),'utf8');
run(source.slice(source.indexOf('const groundTileDrawCache='),source.indexOf('let rain =')));
run(`let lastGroups=null;const actualGroundDraw=drawGroundTileGroups;
 drawGroundTileGroups=(groups,revision)=>{lastGroups=groups;actualGroundDraw(groups,revision)};
 const painter=groundTilePainter();painter.add(1.2,2.3,8,8,'#abc');painter.add(9.2,2.3,8,8,'#abc');painter.add(17.2,2.3,8,8,'rgba(1,2,3,.45)');`);
function compare(){
 run('fills=[];painter.draw()');const cached=JSON.parse(JSON.stringify(sandbox.fills));
 run('fills=[];drawGroundTileGroupsDirect(lastGroups)');assert.deepEqual(JSON.parse(JSON.stringify(sandbox.fills)),cached);
}
compare();assert.equal(sandbox.constructed,0,'One-use painters do not allocate native paths');
compare();assert.equal(sandbox.constructed,2);compare();assert.equal(sandbox.constructed,2);
run("ctx.tag='export'");compare();assert.equal(sandbox.constructed,2,'Same transform in another context can reuse paths');
for(const change of ['matrix.e+=.1','matrix.f-=.27','matrix.a=.73','matrix.d=.62','matrix.b=.1','matrix.c=.2','matrix.a=-1',
 'matrix={a:1,b:0,c:0,d:1,e:0,f:0}','ctx.getTransform=undefined']){
 run(change);compare();compare();
}
const before=sandbox.constructed;run("painter.add(25,2,8,8,'#abc')");compare();assert.equal(sandbox.constructed,before);
compare();assert.equal(sandbox.constructed,before+2,'Adding any tile invalidates previously completed paths');
run('Path2D=undefined');compare();assert.equal(sandbox.constructed,before+2);
console.log('Ground paths passed: exact fractional alignment, lazy reuse, added tiles, transforms, export context and fallback.');
