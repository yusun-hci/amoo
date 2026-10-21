/* 纯函数规则引擎：场景/边界 > 人格表达。无网络调用。 */
(function(root){
 const keys=['initiative','energy','affection','curiosity','autonomy','caution','persistence','play'];
 function normalise(input={}){return Object.fromEntries(keys.map(k=>[k,Number.isFinite(Number(input[k]))?Math.max(0,Math.min(100,Number(input[k]))):50]));}
 function rank(input,characters){const p=normalise(input);return characters.map(c=>({...c,distance:Math.sqrt(keys.reduce((n,k,i)=>n+(p[k]-c.values[i])**2,0)/keys.length)})).sort((a,b)=>a.distance-b.distance);}
 function respond(input,scene,feedback='initial',memory=true){
 const p=normalise(input),high=k=>p[k]>=67,low=k=>p[k]<=33;
 let speech='',action='',state='',reason=[],active=[];
 let stop=(scene==='refusal'&&feedback==='initial')||feedback==='stop',quiet=(scene==='busy'&&feedback==='initial')||feedback==='quiet';
 if(stop){speech=high('affection')?'好，收到。我会停下来，你想找我时再叫我。':'好，我停下。';action='停止邀请与挥手；保持距离，不继续追问。';state='结束互动 · 等待用户重新发起';reason.push('明确拒绝优先于主动性、活力与持续性。');active=['affection'];}
 else if(quiet){speech=high('affection')?'好，我会安静下来。需要我时再叫我。':'收到，我先保持安静。';action=high('autonomy')?'收起互动动作，原地转入自己的安静活动。':'停止主动邀请，原地安静等待。';state='安静模式 · 不自动重启互动';reason.push('忙碌或安静偏好限制主动发起，高活力不转化为打扰。');active=['affection','autonomy'];}
 else if(feedback==='join'){
 speech=high('play')?'来玩个镜像小游戏？你做一个动作，我试着跟上。':'我们慢慢练一次击掌，好吗？';action=high('energy')?'小幅举手，等待用户确认后开始活动。':'轻轻抬手，等待确认；不主动触碰用户。';state=high('persistence')?'共同活动 · 分步骤继续，随时可退出':'共同活动 · 一轮后询问是否切换';active=['play','energy','persistence'];reason.push('先获得活动确认；持续性影响活动节奏，不覆盖停止指令。');}
 else if(scene==='meeting'){
 speech=(high('affection')?'你好，见到你真好。':'你好，我是 Amoo。')+(high('curiosity')?'你愿意告诉我，你喜欢安静陪伴还是一起探索吗？':low('initiative')?'你想认识我时，可以先叫我。':'想和我打个招呼吗？');
 action=high('caution')?'保持距离，轻轻点头，先观察用户回应。':high('energy')?'原地小幅挥手，随后停下等待。':'原地抬头示意，保持舒缓节奏。';state=low('initiative')?'等待用户发起':'已发出一次邀请 · 等待回应';active=['affection','curiosity','initiative','caution','energy'];reason.push('第一次见面不调用私人记忆；谨慎程度影响距离与试探方式。');}
 else if(scene==='home'){
 speech=(high('affection')?'回来啦，见到你真好。':'回来啦。')+(low('initiative')?'我在这儿，需要时叫我就好。':'想聊两句，还是让我安静陪着？');action=high('caution')?'保持距离，轻轻点头，不主动靠近。':high('energy')?'小幅挥手迎接，随即收起动作，等待选择。':'柔和抬头回应，原地等待。';state=low('initiative')?'低负担陪伴 · 等待用户选择':'一次轻量邀请 · 不连续追问';active=['affection','initiative','caution','energy'];reason.push('疲惫由用户明确表达，不依赖情绪诊断；问候后等待选择。');}
 else if(scene==='reunion'){
 speech=memory?(high('affection')?'你回来啦！':'又见面了。')+(high('persistence')?'我们上次练过击掌，想接着练一轮吗？':high('curiosity')?'我们练过击掌。今天想继续，还是换个新玩法？':'我们练过击掌，要再试一次吗？'):'又见面了。当前没有可调用的共同记忆，我们可以重新选一个小游戏。';
 action=memory?(high('energy')?'举起一只手作邀请，等待确认后再击掌。':'轻轻抬手示意，不主动触碰。'):'保持中性欢迎动作，不表演“记得”某段经历。';state=memory?'调用授权记忆 · 等待确认':'记忆已关闭 · 不调用历史';active=['affection','persistence','curiosity','energy'];reason.push(memory?'仅调用演示中授权的击掌记忆，不虚构其他经历。':'关闭记忆后，语言与动作一起移除共同经历线索。');}
 const t=high('energy')?'活泼':low('energy')?'轻柔':'适中';
 reason.push('表达活力：'+t+'；所有移动与触碰仅为网页中的设计意图。');
 return {speech,action,state,reason,active,pose:stop?'rest':quiet?'quiet':feedback==='join'?'play':scene==='reunion'?(memory?'wave':'rest'):high('energy')?'wave':'rest',limited:stop||quiet,wait:Math.round(3+p.caution/25),p};
 }
 const api={keys,normalise,rank,respond};root.LabEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
