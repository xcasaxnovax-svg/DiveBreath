const $=x=>document.getElementById(x),qa=s=>document.querySelectorAll(s);let IN=4,OUT=5,DUR=10,T={run:false,pause:false,start:0,ps:0,ph:0,cy:0,pauseAt:0},raf=0,C={run:false,start:0,last:0,ph:'in',i:[],o:[],timer:0};
const fmt=s=>{s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function buttons(){$('start').disabled=T.run&&!T.pause;$('pause').disabled=!T.run;$('stop').disabled=!T.run}
function resetTraining(){clearInterval(TRAINCOUNT_TIMER);TRAINCOUNT_TIMER=0;TRAINCOUNT=0;if($('trainingCountdown'))$('trainingCountdown').classList.add('hidden');cancelAnimationFrame(raf);T={run:false,pause:false,start:0,ps:0,ph:0,cy:0,pauseAt:0};$('phase').textContent='BEREIT';$('phaseTime').textContent='0.0';$('elapsed').textContent='00:00';$('cycles').textContent='0';$('bar').style.width='0%';$('lung').style.transform='scale(.88)';$('training').classList.remove('inhale','exhale');buttons()}
function startTrainingNow(){if(T.run&&T.pause){let d=performance.now()-T.pauseAt;T.start+=d;T.ps+=d;T.pause=false;buttons();raf=requestAnimationFrame(tick);return}if(T.run)return;let n=performance.now();T={run:true,pause:false,start:n,ps:n,ph:0,cy:0,pauseAt:0};buttons();raf=requestAnimationFrame(tick)}
function tick(n){if(!T.run||T.pause)return;let e=(n-T.start)/1000,d=T.ph?OUT:IN,p=(n-T.ps)/1000;if(e>=DUR*60){stopTraining();return}if(p>=d){T.ph=1-T.ph;if(!T.ph)T.cy++;T.ps=n;d=T.ph?OUT:IN;p=0}let f=Math.min(1,p/d);$('training').classList.toggle('inhale',!T.ph);$('training').classList.toggle('exhale',!!T.ph);$('phase').textContent=T.ph?'AUSATMEN':'EINATMEN';$('phaseTime').textContent=p.toFixed(1);$('elapsed').textContent=fmt(e);$('cycles').textContent=T.cy;$('bar').style.width=((T.ph?1-f:f)*100)+'%';$('bar').style.background=T.ph?'#ff7058':'#2ce4f5';let s=T.ph?1.06-f*.18:.88+f*.18;$('lung').style.transform=`scale(${s})`;let hue=T.ph?`drop-shadow(0 0 ${8+18*(1-f)}px #ff654d)`:`drop-shadow(0 0 ${8+22*f}px #18e4ff)`;$('lung').style.filter=hue;raf=requestAnimationFrame(tick)}
$('start').onclick=()=>{
 if(T.run&&T.pause){startTrainingNow();return}
 if(T.run||TRAINCOUNT)return;
 TRAINCOUNT=3;$('trainingCountBig').textContent='3';$('trainingCountdown').classList.remove('hidden');
 const pulse=()=>{let c=document.querySelector('.trainingCountCircle');c.classList.remove('pulse');void c.offsetWidth;c.classList.add('pulse');if(navigator.vibrate)navigator.vibrate(40)};
 pulse();
 TRAINCOUNT_TIMER=setInterval(()=>{TRAINCOUNT--;if(TRAINCOUNT>0){$('trainingCountBig').textContent=TRAINCOUNT;pulse()}else{clearInterval(TRAINCOUNT_TIMER);TRAINCOUNT_TIMER=0;TRAINCOUNT=0;$('trainingCountdown').classList.add('hidden');startTrainingNow()}},1000)
};$('pause').onclick=()=>{if(!T.run)return;if(!T.pause){T.pause=true;T.pauseAt=performance.now();cancelAnimationFrame(raf)}else startTrainingNow();buttons()};$('stop').onclick=()=>{T.run=false;T.pause=false;cancelAnimationFrame(raf);buttons()};$('reset').onclick=resetTraining;buttons();


let TRAINCOUNT=0,TRAINCOUNT_TIMER=0;
let CHECK={duration:60,state:'setup',run:false,paused:false,start:0,pauseAt:0,totalPause:0,last:0,phase:'in',ins:[],outs:[],timer:0,countTimer:0};
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v)), load=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}};
function resetCheck(){
 clearInterval(CHECK.timer);clearInterval(CHECK.countTimer);CHECK={duration:CHECK.duration||60,state:'setup',run:false,paused:false,start:0,pauseAt:0,totalPause:0,last:0,phase:'in',ins:[],outs:[],timer:0,countTimer:0};
 $('checkSetup').classList.remove('hidden');$('checkCountdownScreen').classList.add('hidden');$('checkRun').classList.add('hidden');$('checkResult').classList.add('hidden');
 $('tapText').textContent='EINATMEN';$('checkCycles').textContent='0';$('checkElapsed').textContent='00:00';$('stopwatch').textContent='00:00.0';$('checkCountdown').textContent=fmt(CHECK.duration)
}
function page(id){let old=document.querySelector('.page.active')?.id;if(old&&old!==id){if(old==='training')resetTraining();if(old==='check')resetCheck()}qa('.page').forEach(x=>x.classList.toggle('active',x.id===id));qa('nav button').forEach(x=>x.classList.toggle('sel',x.dataset.p===id));$('title').textContent=id==='check'?'Atem-Check':id==='customPage'?'Individuell':id==='log'?'Logbuch':id==='progress'?'Fortschritt':'Training';if(id==='log')renderDives();if(id==='progress')renderProgress()}
$('enter').onclick=()=>{$('welcome').classList.add('hidden');$('app').classList.remove('hidden');resetTraining()};
$('back').onclick=()=>{let id=document.querySelector('.page.active')?.id;if(id==='customPage'){page('training');return}if(id==='training')resetTraining();if(id==='check')resetCheck();$('app').classList.add('hidden');$('welcome').classList.remove('hidden')};
qa('nav button').forEach(b=>b.onclick=()=>page(b.dataset.p));
qa('.presets button[data-i]').forEach(b=>b.onclick=()=>{resetTraining();IN=+b.dataset.i;OUT=+b.dataset.o;qa('.presets button').forEach(x=>x.classList.toggle('sel',x===b));$('target').textContent=String(DUR).padStart(2,'0')+':00'});
$('custom').onclick=()=>{$('ci').textContent=IN;$('co').textContent=OUT;$('cd').textContent=DUR;page('customPage')};
qa('.step button').forEach(b=>b.onclick=()=>{let id=b.dataset.key==='in'?'ci':b.dataset.key==='out'?'co':'cd',v=+$(id).textContent+(+b.dataset.d),min=b.dataset.key==='dur'?1:2,max=b.dataset.key==='dur'?60:15;$(id).textContent=Math.max(min,Math.min(max,v))});
$('applyCustom').onclick=()=>{IN=+$('ci').textContent;OUT=+$('co').textContent;DUR=+$('cd').textContent;qa('.presets button').forEach(x=>x.classList.remove('sel'));$('custom').classList.add('sel');$('target').textContent=String(DUR).padStart(2,'0')+':00';page('training');resetTraining()};

qa('.durations button').forEach(b=>b.onclick=()=>{qa('.durations button').forEach(x=>x.classList.toggle('sel',x===b));CHECK.duration=+b.dataset.min*60;$('durValue').textContent=b.dataset.min});
$('durMinus').onclick=()=>{let v=Math.max(1,+$('durValue').textContent-1);$('durValue').textContent=v;CHECK.duration=v*60;qa('.durations button').forEach(x=>x.classList.remove('sel'))};
$('durPlus').onclick=()=>{let v=Math.min(30,+$('durValue').textContent+1);$('durValue').textContent=v;CHECK.duration=v*60;qa('.durations button').forEach(x=>x.classList.remove('sel'))};

$('startCheck').onclick=()=>{CHECK.duration=+$('durValue').textContent*60;startCountdown()};
function startCountdown(){
 CHECK.state='countdown';$('checkSetup').classList.add('hidden');$('checkCountdownScreen').classList.remove('hidden');$('chosenDuration').textContent=fmt(CHECK.duration);
 let n=3;setCount(n);CHECK.countTimer=setInterval(()=>{n--;if(n>0)setCount(n);else{clearInterval(CHECK.countTimer);beginCheck()}},1000)
}
function setCount(n){$('countTop').textContent=n;$('countBig').textContent=n;$('countHint').textContent=n;let c=document.querySelector('.countCircle');c.classList.remove('pulse');void c.offsetWidth;c.classList.add('pulse');if(navigator.vibrate)navigator.vibrate(40)}
function beginCheck(){
 CHECK.state='run';CHECK.run=true;CHECK.paused=false;CHECK.start=performance.now();CHECK.last=CHECK.start;CHECK.totalPause=0;CHECK.phase='in';CHECK.ins=[];CHECK.outs=[];
 $('checkCountdownScreen').classList.add('hidden');$('checkRun').classList.remove('hidden');$('tapText').textContent='AUSATMEN';$('phaseHelp').textContent='Drücken, sobald du mit dem Ausatmen beginnst';$('checkPhase').textContent='Einatmen';$('checkPhase').style.color='#25e5f6';$('diverScene').classList.remove('exhaling');$('tap').className='breathBtn inhaleBtn';$('phaseBarFill').style.width='0%';CHECK.timer=setInterval(updateCheck,100)
}
function activeElapsed(){return CHECK.run?(performance.now()-CHECK.start-CHECK.totalPause)/1000:0}
function updateCheck(){if(!CHECK.run||CHECK.paused)return;let e=activeElapsed();$('checkElapsed').textContent=fmt(e);$('stopwatch').textContent=fmt(e)+'.'+Math.floor((e%1)*10);$('checkCountdown').textContent=fmt(Math.max(0,CHECK.duration-e));let phaseElapsed=CHECK.last?(performance.now()-CHECK.last)/1000:0;$('phaseBarFill').style.width=Math.min(100,(phaseElapsed/8)*100)+'%';if(e>=CHECK.duration)finishCheck()}
function puff(){let box=$('bubbles');if(!box)return;for(let i=0;i<7;i++){let b=document.createElement('i');b.className='bubble';let s=6+Math.random()*14;b.style.width=s+'px';b.style.height=s+'px';b.style.setProperty('--x',(Math.random()*70-10)+'px');b.style.setProperty('--t',(1.6+Math.random()*1.6)+'s');b.style.marginLeft=(Math.random()*25)+'px';box.appendChild(b);setTimeout(()=>b.remove(),3400)}}
$('tap').onclick=()=>{
 if(!CHECK.run||CHECK.paused)return;let n=performance.now();
 if(!CHECK.last){CHECK.last=n;CHECK.phase='in';setNext('out');return}
 let d=(n-CHECK.last)/1000;
 if(CHECK.phase==='in'){CHECK.ins.push(d);CHECK.phase='out';setNext('in');puff()}
 else{CHECK.outs.push(d);CHECK.phase='in';setNext('out')}
 CHECK.last=n;$('checkCycles').textContent=Math.min(CHECK.ins.length,CHECK.outs.length);$('phaseBarFill').style.width='0%'
};
function setNext(next){
 let ex=next==='in'; // current measured phase after tap is exhale when next requested action is inhale
 $('tapText').textContent=next==='in'?'EINATMEN':'AUSATMEN';
 $('phaseHelp').textContent=next==='in'?'Drücken, sobald du mit dem Einatmen beginnst':'Drücken, sobald du mit dem Ausatmen beginnst';
 $('checkPhase').textContent=CHECK.phase==='out'?'Ausatmen':'Einatmen';
 $('checkPhase').style.color=CHECK.phase==='out'?'#ffae26':'#25e5f6';
 $('tap').className='breathBtn '+(next==='in'?'inhaleBtn':'exhaleBtn');
 $('diverScene').classList.toggle('exhaling',CHECK.phase==='out');
}
$('pauseCheck').onclick=()=>{if(!CHECK.run)return;if(!CHECK.paused){CHECK.paused=true;CHECK.pauseAt=performance.now();$('pauseCheck').innerHTML='▶ <small>Weiter</small>'}else{let d=performance.now()-CHECK.pauseAt;CHECK.totalPause+=d;if(CHECK.last)CHECK.last+=d;CHECK.paused=false;$('pauseCheck').innerHTML='Ⅱ <small>Pause</small>'}};
$('finish').onclick=finishCheck;
function finishCheck(){
 if(!CHECK.run)return;let elapsed=Math.min(CHECK.duration,activeElapsed());clearInterval(CHECK.timer);CHECK.run=false;CHECK.paused=false;
 let n=Math.min(CHECK.ins.length,CHECK.outs.length),ins=CHECK.ins.slice(0,n),outs=CHECK.outs.slice(0,n),cycles=ins.map((v,i)=>v+outs[i]),ai=avg(ins),ao=avg(outs),freq=n/(Math.max(elapsed,1)/60),m=avg(cycles),sd=Math.sqrt(avg(cycles.map(v=>(v-m)**2))),stable=Math.max(0,Math.min(100,100-(sd/(m||1))*100)),half=Math.max(1,Math.floor(cycles.length/2)),first=avg(cycles.slice(0,half)),last=avg(cycles.slice(-half)),trend=first&&last?(last-first)/first:0;
 $('checkRun').classList.add('hidden');$('checkResult').classList.remove('hidden');$('rDuration').textContent=fmt(elapsed)+' Min.';$('rBreaths').textContent=n;$('rFreq').textContent=n?freq.toFixed(1)+' / Min.':'–';$('rIn').textContent=ai?ai.toFixed(1)+' Sek.':'–';$('rOut').textContent=ao?ao.toFixed(1)+' Sek.':'–';$('rRatio').textContent=ai&&ao?'1 : '+(ao/ai).toFixed(1):'–';$('rStable').textContent=n>=2?stable.toFixed(0)+' %':'–';$('rTrend').textContent=Math.abs(trend)<.08?'stabil':trend>0?'langsamer':'schneller';
 let title,praise,klass,msg;if(n<3){title='Noch zu wenige Atemzüge';praise='Für eine aussagekräftige Auswertung brauchen wir mindestens drei vollständige Atemzyklen.';klass='warn';msg='<strong>Tipp:</strong> Tippe beim tatsächlichen Wechsel zwischen Ein- und Ausatmung.'}
 else if(stable>=88){title='Sehr gut! 👏';praise='Dein Atemrhythmus war ruhig und sehr gleichmäßig.';klass='good';msg='<strong>Starker Check:</strong> Deine Atemzyklen waren sehr konstant. Festige dieses natürliche, kontinuierliche Muster weiter.'}
 else if(stable>=75){title='Guter Atem-Check 👍';praise='Dein Rhythmus war bereits recht gleichmäßig.';klass='good';msg='<strong>Tipp:</strong> Konzentriere dich auf einen entspannten, kontinuierlichen Rhythmus – ohne Atempausen.'}
 else{title='Da ist noch Potenzial';praise='Deine Atemzyklen haben stärker geschwankt.';klass='warn';msg='<strong>Tipp:</strong> Erzwinge keine besonders langsame Atmung. Suche einen angenehmen, gleichmäßigen Rhythmus und halte die Luft nicht an.'}
 if(n>=4&&trend<-.12)msg+='<br><br>Gegen Ende wurden deine Atemzyklen kürzer.';else if(n>=4&&trend>.12)msg+='<br><br>Im Verlauf wurden deine Atemzyklen länger und ruhiger.';else if(n>=4)msg+='<br><br>Dein Tempo blieb insgesamt stabil.';
 $('resultTitle').textContent=title;$('resultPraise').textContent=praise;$('feedback').className='feedback '+klass;$('feedback').innerHTML=msg;drawCheckChart(cycles);
 let hist=load('db_checks');hist.unshift({date:new Date().toISOString(),duration:elapsed,breaths:n,freq,ai,ao,stable,trend});store('db_checks',hist.slice(0,50))
}
function drawCheckChart(a){let c=$('checkChart'),x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);if(!a.length)return;let max=Math.max(...a,1),min=Math.min(...a),range=Math.max(1,max-min);x.strokeStyle='#29e5f5';x.lineWidth=4;x.beginPath();a.forEach((v,i)=>{let X=25+(c.width-50)*(a.length===1?.5:i/(a.length-1)),Y=c.height-25-(v-min)/range*(c.height-50);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke()}
$('newCheck').onclick=resetCheck;$('resultBack').onclick=resetCheck;

function calcRmv(){let min=+$('diveMin').value,depth=+$('diveDepth').value,tank=+$('tankLiters').value,s=+$('startBar').value,e=+$('endBar').value;if(!(min>0&&tank>0&&s>e&&depth>=0))return null;return tank*(s-e)/min/(1+depth/10)}
['diveMin','diveDepth','tankLiters','startBar','endBar'].forEach(id=>$(id).addEventListener('input',()=>{let r=calcRmv();$('rmvPreview').textContent=r?'Geschätztes RMV/SAC: '+r.toFixed(1)+' L/min (auf Oberflächendruck umgerechnet).':'RMV wird aus Flasche, Druckverbrauch, Tauchzeit und Ø Tiefe berechnet.'}));
$('saveDive').onclick=()=>{let r=calcRmv();if(r===null){$('rmvPreview').textContent='Bitte gültige Werte eingeben. Startdruck muss über Enddruck liegen.';return}let dives=load('db_dives');dives.unshift({id:Date.now(),date:$('diveDate').value||new Date().toISOString().slice(0,10),min:+$('diveMin').value,depth:+$('diveDepth').value,tank:+$('tankLiters').value,start:+$('startBar').value,end:+$('endBar').value,rmv:r});store('db_dives',dives);renderDives();$('rmvPreview').textContent='Gespeichert – RMV/SAC: '+r.toFixed(1)+' L/min.'};
function renderDives(){let dives=load('db_dives'),box=$('diveList');box.innerHTML=dives.length?dives.map(d=>`<div class="diveCard"><button data-del="${d.id}">✕</button><b>${d.date}</b><br>${d.min} Min. · Ø ${d.depth} m · ${d.tank} L · ${d.start}→${d.end} bar<br><b>RMV/SAC ${d.rmv.toFixed(1)} L/min</b></div>`).join(''):'<div class="panel">Noch keine Tauchgänge gespeichert.</div>';qa('[data-del]').forEach(b=>b.onclick=()=>{store('db_dives',dives.filter(d=>d.id!=b.dataset.del));renderDives()})}
function renderProgress(){let checks=load('db_checks'),dives=load('db_dives');$('pChecks').textContent=checks.length;$('pStability').textContent=checks.length?avg(checks.filter(x=>x.stable!=null).map(x=>x.stable)).toFixed(0)+' %':'–';$('pDives').textContent=dives.length;$('pRmv').textContent=dives.length?dives[0].rmv.toFixed(1)+' L/min':'–';$('checkHistory').innerHTML=checks.length?checks.slice(0,8).map(c=>`<div class="diveCard">${new Date(c.date).toLocaleDateString('de-DE')} · ${c.breaths} Atemzüge · ${c.freq.toFixed(1)}/min · Stabilität ${c.stable.toFixed(0)}%</div>`).join(''):'Noch keine Checks gespeichert.'}
$('diveDate').value=new Date().toISOString().slice(0,10);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
