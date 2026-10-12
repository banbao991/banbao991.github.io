const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sandbox={};vm.createContext(sandbox);const run=code=>vm.runInContext(code,sandbox);
run(fs.readFileSync(path.resolve(__dirname,'../js/core/utils.js'),'utf8'));
// Compare against the unchanged original formula, including cold/warm calls.
run('const originalBlend=blendHexDirect;let directCalls=0;blendHexDirect=(...args)=>{directCalls++;return originalBlend(...args)}');
const colors=['#000000','#ffffff','#708854','#8f9d64','#C3CEBA','#abc','#invalid','x:1'];
for(const a of colors)for(const b of colors)for(const amount of [0,-0,1,.5,.500000000001,.12725,-1,2,NaN,Infinity]){
  sandbox.inputs=[a,b,amount];
  run('expected=originalBlend(...inputs);actual=blendHex(...inputs);warm=blendHex(...inputs)');
  assert.equal(sandbox.actual,sandbox.expected);assert.equal(sandbox.warm,sandbox.expected);
}
run("hexBlendCache.clear();hexBlendCacheSize=0;directCalls=0;blendHex('#708854','#8f9d64',.5);blendHex('#708854','#8f9d64',.5)");
assert.equal(run('directCalls'),1,'Warm calls skip the original parsing and channel formatting');
run("blendHex('#708854','#8f9d64',.500000000001)");assert.equal(run('directCalls'),2,'Exact amounts are not quantized even when output color matches');
run("for(let i=0;i<10000;i++){const amount=i/10001;if(blendHex('#708854','#8f9d64',amount)!==originalBlend('#708854','#8f9d64',amount))throw Error('Eviction changed color');if(hexBlendCacheSize>HEX_BLEND_CACHE_LIMIT)throw Error('Unbounded color cache')}");
assert.ok(run('[...hexBlendCache.values()].reduce((n,targets)=>n+[...targets.values()].reduce((m,values)=>m+values.size,0),0)')<=2048);
// Stateful coercion must run each time rather than cache an object identity.
run("let converted=0;const changing={valueOf(){return ++converted/10}};blendHex('#000000','#ffffff',changing);blendHex('#000000','#ffffff',changing)");
assert.equal(run('converted'),12,'Both old formulas still coerce twice for each of three channels');
assert.throws(()=>run('blendHex(null,"#ffffff",.5)'),/slice/);
console.log('Color cache passed: exact primitive inputs, cold/hit/eviction, bounded entries and original coercion.');
