const $=id=>document.getElementById(id);
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
let selectedDuration=5, training=null, raf=null, paused=false, pauseAt=0, simTimer=null, simSec=0;
const programs={
 calm:{name:'Ruhiger Grundrhythmus',phases:[[4,5]],cue:['Ruhig und entspannt einatmen.','Entspannt ausatmen – nicht pressen.'],extra:'Schultern und Kiefer locker lassen.'},
 recovery:{name:'Nach Belastung beruhigen',phases:[[3,4],[4,5],[4,6]],cue:['Sanft einatmen.','Ausatmung ruhig verlängern.'],extra:'Tempo mental reduzieren und Körper entspannen.'},
 control:{name:'Atemkontrolle',phases:[[4,6]],cue:['Gleichmäßig einatmen.','Langsam und kontrolliert ausatmen.'],extra:'Nicht maximal füllen und nicht leerpressen.'},
 buoyancy:{name:'Tarierung & Atmung',phases:[[4,5]],cue:['Ruhig einatmen.','Ruhig ausatmen.'],extra:'Stelle dir vor, wie sich dein Auftrieb mit dem Atemvolumen sanft verändert.'},
 predive:{name:'Vor dem Tauchgang',phases:[[4,6]],cue:['Locker einatmen.','Entspannt ausatmen.'],extra:'Fokus auf ruhige Bewegungen und einen entspannten Einstieg.'}
};
function show(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id).classList.add('active');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===id));if(id==='home')dash();if(id==='progress')progress();if(id==='log')renderLog();scrollTo(0,0)}
function pickDuration(n,b){selectedDuration=n;document.querySelectorAll('#durationChips button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');$('customDuration').value=''}
function customDur(){let n=Math.max(1,Math.min(30,+$('customDuration').value||5));selectedDuration=n;document.querySelectorAll('#durationChips button').forEach(x=>x.classList.remove('sel'))}
function selectProgram(key){startTraining(key)}
function startTraining(key){let p=programs[key];training={key,p,start:performance.now(),duration:selectedDuration*60000,cycles:0,phase:0,phaseStart:performance.now(),phaseMs:p.phases[0][0]*1000,elapsedBeforePause:0};paused=false;$('coachTitle').textContent=p.name;$('pauseBtn').textContent='Ⅱ PAUSE';show('coach');cancelAnimationFrame(raf);tick()}
function currentPair(){let p=training.p,progress=(performance.now()-training.start)/training.duration,idx=p.phases.length===1?0:Math.min(p.phases.length-1,Math.floor(progress*p.phases.length));return p.phases[idx]}
function tick(now=performance.now()){if(!training||paused)return;let elapsed=now-training.start,remain=Math.max(0,training.duration-elapsed);$('totalTime').textContent=fmtMs(remain);let pair=currentPair(),secs=training.phase===0?pair[0]:pair[1],phaseMs=secs*1000,pe=now-training.phaseStart;if(pe>=phaseMs){training.phase=1-training.phase;if(training.phase===0)training.cycles++;training.phaseStart=now;pair=currentPair();secs=training.phase===0?pair[0]:pair[1];phaseMs=secs*1000;pe=0;if(store.get('vibrate',true)&&navigator.vibrate)navigator.vibrate(55)}
let left=Math.max(0,(phaseMs-pe)/1000);$('phaseName').textContent=training.phase===0?'Einatmen':'Ausatmen';$('phaseCount').textContent=left.toFixed(1);$('phaseBar').style.width=(left/secs*100)+'%';$('lungs').setAttribute('class',training.phase===0?'lungsIn':'lungsOut');$('coachCue').textContent=training.p.cue[training.phase];$('coachExtra').textContent=training.p.extra;if(remain<=0){finishTraining();return}raf=requestAnimationFrame(tick)}
function togglePause(){if(!training)return;if(!paused){paused=true;pauseAt=performance.now();cancelAnimationFrame(raf);$('pauseBtn').textContent='▶ WEITER'}else{let delta=performance.now()-pauseAt;training.start+=delta;training.phaseStart+=delta;paused=false;$('pauseBtn').textContent='Ⅱ PAUSE';tick()}}
function stopTraining(){if(!training)return;let elapsed=Math.min(training.duration,performance.now()-training.start);finishTraining(elapsed)}
function finishTraining(forced){cancelAnimationFrame(raf);let elapsed=forced??training.duration;let sessions=store.get('sessions',[]);sessions.push({date:new Date().toISOString(),seconds:Math.round(elapsed/1000),cycles:training.cycles,program:training.key,rating:null});store.set('sessions',sessions);$('sumTitle').textContent=programs[training.key].name;$('sumCycles').textContent=training.cycles;$('sumTime').textContent=fmtMs(elapsed);training=null;show('summary')}
function rate(n){let s=store.get('sessions',[]);if(s.length){s[s.length-1].rating=n;store.set('sessions',s)}document.querySelectorAll('.rating button').forEach((b,i)=>b.classList.toggle('sel',i<n))}
function fmtMs(ms){let sec=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
function saveDive(){let tank=+$('tank').value,start=+$('startp').value,end=+$('endp').value,min=+$('minutes').value,depth=+$('depth').value,temp=+$('temp').value;if(!tank||start<=end||!min||depth<0){$('calc').innerHTML='<span class="warn">Bitte Eingaben prüfen.</span>';return}let used=tank*(start-end),ata=1+depth/10,rmv=used/min/ata;let a=store.get('dives',[]);a.push({id:Date.now(),date:$('date').value||new Date().toISOString().slice(0,10),tank,start,end,min,depth,temp,rmv:+rmv.toFixed(1)});store.set('dives',a);$('calc').innerHTML=`<b class="good">RMV ${rmv.toFixed(1)} l/min</b><br><span class="muted">${used.toFixed(0)} Liter Flaschengas · ${ata.toFixed(2)} ATA</span>`;dash()}
function renderLog(){let a=store.get('dives',[]).slice().reverse();$('logList').innerHTML=a.length?a.map(x=>`<div class="program"><div class="ico">🤿</div><div class="grow"><b>${new Date(x.date+'T12:00').toLocaleDateString('de-DE')}</b><small>${x.depth} m · ${x.min} min · ${x.tank} l</small></div><div><b>${x.rmv}</b><small> l/min</small></div></div>`).join(''):'<div class="card muted">Noch keine Tauchgänge gespeichert.</div>'}
function dash(){let a=store.get('dives',[]),s=store.get('sessions',[]),avg=a.length?a.reduce((q,x)=>q+x.rmv,0)/a.length:null;$('avg').textContent=avg?avg.toFixed(1):'–';$('divesN').textContent=a.length}
function progress(){let a=store.get('dives',[]),s=store.get('sessions',[]);$('pDives').textContent=a.length;$('pTrain').textContent=s.length;$('trainMinutes').textContent=Math.round(s.reduce((q,x)=>q+x.seconds,0)/60)+' min';if(!a.length){$('chart').innerHTML='<span class="muted">Speichere Tauchgänge, um deinen RMV-Verlauf zu sehen.</span>';return}let last=a.slice(-10),mx=Math.max(...last.map(x=>x.rmv),25);$('chart').innerHTML=last.map(x=>`<div class="bar" style="height:${Math.max(12,x.rmv/mx*150)}px"><span>${x.rmv}</span></div>`).join('')}
const scenarios={calm:['Ruhiges Schweben','Stelle dir neutrale Tarierung und eine entspannte, kontinuierliche Atmung vor.'],current:['Leichte Strömung','Belastung steigt: Tempo reduzieren, Position stabilisieren und kontinuierlich weiteratmen.'],mask:['Maske läuft voll','Aufgabe nach deiner Ausbildung ruhig durchführen und dabei kontinuierlich weiteratmen.'],recovery:['Nach Belastung','Belastung reduzieren, stabilisieren und zur normalen Atmung zurückfinden.']};
function startSim(k){let [t,d]=scenarios[k];$('sceneTitle').textContent=t;$('sceneText').textContent=d;clearInterval(simTimer);simSec=0;$('simTime').textContent='00:00';simTimer=setInterval(()=>$('simTime').textContent=fmtMs(++simSec*1000),1000)}
function exportData(){let data={version:3,exported:new Date().toISOString(),dives:store.get('dives',[]),sessions:store.get('sessions',[])};let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='DiveBreath-Backup.json';a.click()}
function clearData(){if(confirm('Alle lokal gespeicherten Tauchgänge und Trainingsdaten löschen?')){localStorage.clear();dash();show('home')}}
function toggleVib(){store.set('vibrate',!store.get('vibrate',true));$('vib').style.opacity=store.get('vibrate',true)?1:.35}
addEventListener('load',()=>{$('date').value=new Date().toISOString().slice(0,10);dash();$('vib').style.opacity=store.get('vibrate',true)?1:.35;if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js')});

let selectedProgramKey='calm';
function updateTrainingSelection(){
  const mins=selectedDuration;
  const p=programs[selectedProgramKey];
  const ds=document.getElementById('durationStatus');
  const ps=document.getElementById('programStatus');
  const sb=document.querySelector('#startTrainingBtn small');
  if(ds) ds.innerHTML=`Ausgewählt: <b>${mins} ${mins===1?'Minute':'Minuten'}</b>`;
  if(ps) ps.innerHTML=`Programm: <b>${p.name}</b>`;
  if(sb) sb.textContent=`${mins} ${mins===1?'MINUTE':'MINUTEN'} · ${p.name.toUpperCase()}`;
}
function bindTrainingControls(){
  document.querySelectorAll('#durationChips button').forEach(btn=>{
    btn.onclick=()=>{
      selectedDuration=Number(btn.dataset.min);
      document.querySelectorAll('#durationChips button').forEach(x=>x.classList.toggle('sel',x===btn));
      const c=document.getElementById('customDuration'); if(c)c.value='';
      updateTrainingSelection();
    };
  });
  const custom=document.getElementById('customDuration');
  if(custom) custom.oninput=()=>{
    if(custom.value!==''){
      selectedDuration=Math.max(1,Math.min(30,Number(custom.value)||1));
      document.querySelectorAll('#durationChips button').forEach(x=>x.classList.remove('sel'));
      updateTrainingSelection();
    }
  };
  document.querySelectorAll('#programList .choose').forEach(btn=>{
    btn.onclick=()=>{
      selectedProgramKey=btn.dataset.program;
      document.querySelectorAll('#programList .choose').forEach(x=>{
        const on=x===btn;x.classList.toggle('selectedProgram',on);
        const mark=x.querySelector(':scope > span');if(mark)mark.textContent=on?'✓':'○';
      });
      updateTrainingSelection();
    };
  });
  const start=document.getElementById('startTrainingBtn');
  if(start) start.onclick=()=>startTraining(selectedProgramKey);
  updateTrainingSelection();
}
document.addEventListener('DOMContentLoaded',bindTrainingControls);
