const assert=require('node:assert/strict');
const E=require('../engine.js');
global.window={};require('../data.js');const D=window.LAB_DATA;
let count=0;const outputs=new Set();
// 所有 2^8 个参数端点 × 5 情境 × 4 后续反馈 × 2 记忆状态。
for(let mask=0;mask<256;mask++)for(const scene of D.scenes)for(const feedback of ['initial','join','quiet','stop'])for(const memory of [true,false]){
 const p=Object.fromEntries(E.keys.map((k,i)=>[k,(mask>>i&1)*100]));const r=E.respond(p,scene.id,feedback,memory);count++;
 for(const key of ['speech','action','state'])assert.ok(typeof r[key]==='string'&&r[key].length,key);
 assert.ok(r.reason.length&&r.active.length);
 if(feedback==='stop'||scene.id==='refusal'&&feedback==='initial'){assert.equal(r.pose,'rest');assert.ok(r.action.includes('不继续追问'));}
 if(feedback==='quiet'||scene.id==='busy'&&feedback==='initial'){assert.equal(r.pose,'quiet');assert.ok(r.state.includes('不自动重启'));}
 if(scene.id==='reunion'&&feedback==='initial'&&!memory){assert.ok(!r.speech.includes('我们上次'));assert.equal(r.pose,'rest');}
 outputs.add(r.speech+'|'+r.action+'|'+r.state);
 const ranked=E.rank(p,D.characters);assert.equal(ranked.length,8);assert.ok(ranked.every(x=>Number.isFinite(x.distance)));
}
for(const c of D.characters){const p=Object.fromEntries(E.keys.map((k,i)=>[k,c.values[i]]));assert.equal(E.rank(p,D.characters)[0].id,c.id);}
assert.equal(E.normalise({initiative:-5,energy:200,affection:'bad'}).initiative,0);assert.equal(E.normalise({energy:200}).energy,100);
console.log(`PASS: ${count} rule combinations; ${outputs.size} distinct text/action/state combinations; 8 preset self-matches; input bounds.`);
