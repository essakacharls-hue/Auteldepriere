(()=>{
/* ================= Données ================= */
const DAYS=['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
const DSHORT={LUNDI:'Lun',MARDI:'Mar',MERCREDI:'Mer',JEUDI:'Jeu',VENDREDI:'Ven',SAMEDI:'Sam',DIMANCHE:'Dim'};
const JOURS7=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};
let today=new Date();today.setHours(0,0,0,0);
const p2=n=>String(n).padStart(2,'0');
/* formats imposés partout : date jj/mm/aa, heure 24 h */
const jma=d=>{d=new Date(d);return isNaN(d)?'':p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(-2)};
const jm=d=>{d=new Date(d);return isNaN(d)?'':p2(d.getDate())+'/'+p2(d.getMonth()+1)};
const mm2=d=>{d=new Date(d);return isNaN(d)?'':String(d.getFullYear()).slice(-2)};
const hm24=d=>{d=new Date(d);return isNaN(d)?'':p2(d.getHours())+':'+p2(d.getMinutes())};
const wjma=d=>{d=new Date(d);return isNaN(d)?'':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][d.getDay()]+' '+jma(d)};
const stamp24=t=>{const m=String(t||'').match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);return m?m[3]+'/'+m[2]+'/'+m[1].slice(2)+(m[4]?' '+m[4]+':'+m[5]:''):String(t||'')};

/* saisie des dates en jj/mm/aa (au lieu du calendrier du téléphone) */
function parseJMA(v){const m=String(v||'').trim().match(/^(\d{1,2})[\/.\-\s](\d{1,2})[\/.\-\s](\d{2}|\d{4})$/);if(!m)return'';
  const y=m[3].length===2?2000+(+m[3]):+m[3];const d=new Date(y,+m[2]-1,+m[1]);if(d.getMonth()!==+m[2]-1||d.getDate()!==+m[1])return'';return iso(d)}
const dv=id=>{const el=document.getElementById(id);if(!el)return'';const r=parseJMA(el.value);if(!r&&el.value.trim())toast('Date invalide : écrivez-la en jj/mm/aa, par ex. 21/10/26.');return r};
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset||t.dataset.date===undefined||e.inputType==='deleteContentBackward')return;
  const dg=t.value.replace(/\D/g,'').slice(0,6);t.value=dg.length>4?dg.slice(0,2)+'/'+dg.slice(2,4)+'/'+dg.slice(4):dg.length>2?dg.slice(0,2)+'/'+dg.slice(2):dg});
const fmt=s=>{if(!s)return'';const d=new Date(s+'T00:00');return isNaN(d)?s:jma(d)};
function monday(d){const x=new Date(d);const k=(x.getDay()+6)%7;x.setDate(x.getDate()-k);x.setHours(0,0,0,0);return x}
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2600)}
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const todayDay=()=>DAYS[(today.getDay()+6)%7];

const D={songs:[],nights:[],themes:[],subj:{},exauces:[],prog:[],settings:{},journal:{},me:'',week:{},loaded:false};
let IDX={};
function reindex(){IDX={};Object.values(D.subj).forEach(s=>{if(s.statut!=='Actif')return;(IDX[s.code]=IDX[s.code]||[]).push(s)});
  Object.values(IDX).forEach(a=>a.sort((x,y)=>(y.prio-x.prio)||(x.ordre-y.ordre)))}
const SET=()=>D.settings;
const num=(k,def)=>{const v=+SET()[k];return isNaN(v)||SET()[k]===''?def:v};
const LOT=()=>Math.max(3,Math.min(30,num('lot',10)));
const NBE=()=>Math.max(10,Math.min(300,num('nbEglise',100)));
const list_=k=>String(SET()[k]||'').split(',').map(s=>s.trim()).filter(Boolean);
const sansCommuns=()=>list_('sansCommuns');
function TH(){return D.themes.filter(t=>t.statut!=='Retiré').slice().sort((a,b)=>a.o-b.o)}
function byCode(c){return D.themes.find(t=>t.c===c)}
function subjects(code){return IDX[code]||[]}
function weekIndex(){const d=new Date((SET().debut||'2026-10-05')+'T00:00');return Math.floor((monday(today)-monday(d))/(7*864e5))}
const lotOff=ls.get('apg_lotoff',{});
function lotFor(code,n){const L=Math.max(1,Math.ceil(n/LOT()));const w=weekIndex()+(lotOff[code]||0);return((w%L)+L)%L}


/* ================= Icônes ================= */
const ICONS={
 flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
 book:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
 star:'<path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z"/>',
 church:'<path d="M12 2v4M10 4h4M6 21V11l6-4 6 4v10M3 21h18M10 21v-4a2 2 0 0 1 4 0v4"/>',
 sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
 sword:'<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>',
 home:'<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
 compass:'<circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
 users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 tag:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
 landmark:'<path d="M3 21h18M5 18v-7M9.5 18v-7M14.5 18v-7M19 18v-7M12 3l9 5H3z"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
 globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
 check:'<path d="M20 6L9 17l-5-5"/>',
 pencil:'<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
 refresh:'<path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 layers:'<path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
 x:'<path d="M18 6L6 18M6 6l12 12"/>',
 calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 wand:'<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5"/>',
 undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
 upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
 share:'<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
 left:'<path d="M15 18l-6-6 6-6"/>',right:'<path d="M9 18l6-6-6-6"/>',
 copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
 user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
 crown:'<path d="M2 8l4 10h12l4-10-6 4-4-7-4 7z"/><path d="M6 21h12"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 up:'<path d="M18 15l-6-6-6 6"/>',down:'<path d="M6 9l6 6 6-6"/>',
 swap:'<path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
 mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/>',
 play:'<path d="M6 4l14 8-14 8z"/>',pause:'<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
 skipf:'<path d="M5 4l10 8-10 8zM19 5v14"/>',skipb:'<path d="M19 20L9 12l10-8zM5 19V5"/>',
 eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'
};
const ic=(n,c)=>`<svg class="i${c?' '+c:''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;
const CATS={COMBATS:['#D33F49','sword'],INSTANCE:['#4B2E91','landmark'],'MEMB MAIS':['#0E8A7E','home'],ACTIVITE:['#C27C0E','briefcase'],ACSF:['#2F5BD3','church'],SITUATION:['#8A3FC2','compass'],COMMUN:['#5D6B82','users'],AUTRE:['#7A7591','tag']};
const PAL=[['#B5487A','heart'],['#2D8A4E','globe'],['#9C5A1A','tag'],['#3C6FB0','book'],['#6C4BC2','star']];
function catStyle(k){if(CATS[k])return CATS[k];let h=0;for(const ch of String(k))h=(h*31+ch.charCodeAt(0))>>>0;return PAL[h%PAL.length]}

/* ================= Serveur (feuille Google via Apps Script) ================= */
let CFG=ls.get('apg_cfg',null);
class NetErr extends Error{}
const QUEUE=['saveSong','deleteSong','reorderSongs','saveNight','deleteNight','setStatut','editSubject','logJournal','saveDay','saveSettings','addTemoignage','deleteExauce','deleteEvent'];
async function call(fn,...args){
  if(!CFG||!CFG.url)throw new Error("L'application n'est pas encore connectée.");
  let res;
  try{res=await fetch(CFG.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({k:CFG.key,j:CFG.jeton||'',fn,a:args,me:CFG.me})})}
  catch(e){throw new NetErr('Pas de connexion internet.')}
  let j;try{j=await res.json()}catch(e){throw new Error("Réponse inattendue du serveur. Vérifiez l'adresse (elle se termine par /exec) et que le déploiement est accessible à « Tout le monde ».")}
  if(!j.ok){const er=new Error(j.err||'Erreur du serveur.');er.code=j.code;if(j.code==='MOTDEPASSE'&&!(document.getElementById('lock')&&!document.getElementById('lock').hidden))setTimeout(()=>showLock('enter','Le mot de passe a été changé. Entrez le nouveau.'),0);throw er}
  if(j.sync&&j.sync.ts)ls.set('apg_lastwrite',j.sync);
  markSync();
  return j.r;
}
let outbox=ls.get('apg_outbox',[]);
const saveOutbox=()=>ls.set('apg_outbox',outbox);
const pending=()=>outbox.length?`En attente (${outbox.length})`:'';
async function flush(){
  if(flush.busy||!outbox.length)return 0;flush.busy=true;let n=0;
  try{while(outbox.length){const x=outbox[0];
      try{await call(x.fn,...x.a)}catch(e){if(e instanceof NetErr)break;toast("Une action en attente n'a pas pu être enregistrée : "+e.message)}
      outbox.shift();saveOutbox();n++}}
  finally{flush.busy=false;if(outbox.length)setSync(pending())}
  return n;
}
async function act(fn,args,okMsg){
  setSync('Enregistrement…');
  try{if(outbox.length)await flush();const r=await call(fn,...args);setSync(pending()||'Enregistré');if(okMsg)toast(okMsg);return r}
  catch(e){
    if(e instanceof NetErr&&QUEUE.includes(fn)){outbox.push({fn,a:args});saveOutbox();setSync(pending());toast((okMsg?okMsg+' ':'')+'Hors ligne : ce sera envoyé dès le retour du réseau.');return undefined}
    setSync(e instanceof NetErr?'Hors ligne':'Erreur');
    toast(e instanceof NetErr?'Pas de connexion : cette action demande internet. Réessayez une fois connecté.':"Échec de l'enregistrement : "+(e&&e.message||e));
    if(!(e instanceof NetErr))load();throw e}
}
function quiet(fn,a){call(fn,...a).catch(e=>{if(e instanceof NetErr){outbox=outbox.filter(x=>!(x.fn===fn&&x.a[0]===a[0]));outbox.push({fn,a});saveOutbox();setSync(pending())}})}
let syncState='';
/* ----- Vérification continue de la connexion au serveur ----- */
const hb={ok:false,at:0,ms:0,busy:false};
async function heartbeat(showToast){
  if(!CFG||hb.busy||!unlocked)return;if(document.hidden&&!showToast)return;hb.busy=true;const t0=Date.now();
  try{await call('ping');Object.assign(hb,{ok:true,at:Date.now(),ms:Date.now()-t0});
    if(outbox.length){const n=await flush();if(n)load()}
    if(!/…$/.test(syncState))setSync(pending()||'Connecté');
    if(showToast)toast(`Connecté au serveur. Réponse en ${(hb.ms/1000).toFixed(1).replace('.',',')} s.`)}
  catch(e){Object.assign(hb,{ok:false,at:Date.now()});
    const msg=e instanceof NetErr?(navigator.onLine?'Serveur injoignable':'Hors ligne'):'Erreur serveur';setSync(outbox.length?msg+' · '+outbox.length+' en attente':msg);
    if(showToast)toast(e instanceof NetErr?(navigator.onLine?"Le serveur ne répond pas. Vérifiez l'adresse /exec ou réessayez dans un instant.":'Pas de connexion internet sur cet appareil.'):'Le serveur répond mais refuse : '+e.message)}
  finally{hb.busy=false}}
const lastSync=()=>ls.get('apg_lastsync',0);
function markSync(){ls.set('apg_lastsync',Date.now());if(syncState)paintSync()}
function syncShort(ts){if(!ts)return'';const d=new Date(ts),n=new Date();const hm=hm24(d);
  const d0=new Date(d);d0.setHours(0,0,0,0);const n0=new Date(n);n0.setHours(0,0,0,0);const k=Math.round((n0-d0)/864e5);
  return k===0?hm:k===1?'hier '+hm:jma(d)+' '+hm}
function syncLong(ts){if(!ts)return'jamais';const d=new Date(ts);return wjma(d)+' à '+hm24(d)}
const lastWrite=()=>ls.get('apg_lastwrite',null);
function syncDetail(){const w=lastWrite(),ts=lastSync();
  return (hb.at?(hb.ok?`Connecté au serveur : vérifié à ${hm24(new Date(hb.at))} (réponse en ${(hb.ms/1000).toFixed(1).replace('.',',')} s). `:`Serveur injoignable depuis ${hm24(new Date(hb.at))}. `):'')+(w&&w.ts?`Dernière synchronisation : ${w.par||'quelqu’un'}, ${syncLong(w.ts)}.`:'Aucune modification envoyée pour l’instant.')+(ts?` Cet appareil a vérifié la feuille ${syncLong(ts)}.`:'')}
function paintSync(){const s=$('#sync');const t=syncState;const busy=/…$/.test(t)||t==='Non connecté';const w=lastWrite();
  s.innerHTML=`<span>${esc(t)}</span>${!busy&&w&&w.ts?`<span class="st">${esc(syncShort(w.ts))} · <span class="who">${esc(w.par||'?')}</span></span>`:''}`;
  s.title=syncDetail();s.setAttribute('aria-label',t+'. '+syncDetail());
  s.classList.toggle('on',t==='Enregistré'||t==='À jour'||t==='Connecté');s.classList.toggle('off',/^Hors ligne|^Erreur|^Serveur/.test(t))}
function setSync(t){syncState=t;paintSync()}
setInterval(()=>{if(syncState)paintSync()},60000);
setInterval(()=>heartbeat(),120000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)heartbeat()});
$('#sync').addEventListener('click',()=>{if(syncState&&syncState!=='Non connecté')toast(syncState+'. '+syncDetail())});
let lastLoad=0;
function applyData(r,live){
  D.themes=r.themes.map(t=>({c:t[0],d:t[1],o:t[2],k:t[3],t:t[4],statut:t[5]}));
  D.subj={};r.subjects.forEach(s=>D.subj[s[0]]={id:s[0],code:s[1],text:s[2],prio:s[3],statut:s[4],ordre:s[5],dstatut:s[6],aj:s[7]||0});D.pairs=r.pairs||[];D.rewrite=r.rewrite||null;
  D.nights=r.nights||[];D.songs=r.songs||[];D.exauces=r.exauces;D.prog=r.prog;D.settings=r.settings;D.journal=r.journal;D.me=r.me||(CFG&&CFG.me)||'';D.loaded=true;
  if(live&&r.today){const t=new Date(r.today+'T00:00');if(!isNaN(t)&&iso(t)===iso(new Date()))today=t}
  reindex();
}
async function load(){
  if(!CFG){showSetup();return}
  if(!unlocked)return;
  setSync('Chargement…');
  await flush();
  try{
    const r=await call('getData');applyData(r,true);ls.set('apg_cache',r);
    lastLoad=Date.now();Object.assign(hb,{ok:true,at:Date.now()});setSync(pending()||'À jour');await loadWeek();render();
  }catch(e){
    const c=ls.get('apg_cache',null);
    if(e instanceof NetErr&&c){if(!D.loaded)applyData(c,false);D.week=ls.get('apg_wk_'+st.week,{});setSync(outbox.length?'En attente ('+outbox.length+')':'Hors ligne');render();toast('Hors ligne : affichage de la dernière version enregistrée sur cet appareil.');return}
    setSync(e instanceof NetErr?'Hors ligne':'Erreur');
    $('#view').innerHTML=`<div class="empty">${esc(e&&e.message||'Chargement impossible.')}<br><br>${e instanceof NetErr?'Vérifiez la connexion, puis touchez « Actualiser ».':'<button class="btn" id="cfChange">Revoir la connexion</button>'}</div>`}
}
async function loadWeek(){try{D.week=await call('getWeek',st.week);ls.set('apg_wk_'+st.week,D.week)}catch(e){D.week=ls.get('apg_wk_'+st.week,{})}}

/* ================= Connexion et installation ================= */
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const b64e=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=t=>JSON.parse(decodeURIComponent(escape(atob(t.replace(/-/g,'+').replace(/_/g,'/')))));
function parseInvite(v){const m=String(v||'').match(/#i=([A-Za-z0-9_-]+)/);if(!m)return null;try{const o=b64d(m[1]);return o&&o.u?o:null}catch(e){return null}}
function inviteLink(){return location.origin+location.pathname+'#i='+b64e({u:CFG.url,k:CFG.key})}
let preset=parseInvite(location.hash);if(preset)history.replaceState(null,'',location.pathname);
function showSetup(msg,tried){
  setSync('Non connecté');const p=tried||preset||CFG||{};
  $('#pagehead').innerHTML=`<div class="pagehead">${ic('flame')}<h2>Bienvenue sur l'Autel</h2></div>`;
  $('#view').innerHTML=`<div class="card"><b class="ctitle">${ic('link')}Connecter l'application à votre feuille Google</b>
   <p class="muted mt">À faire une seule fois sur chaque appareil. ${preset?"Le lien d'invitation a rempli l'adresse et la clé : indiquez seulement votre prénom.":"Collez le lien d'invitation reçu, ou l'adresse du serveur et la clé (étapes 3 et 4 de l'onglet GUIDE du classeur)."}</p>
   ${msg?`<p class="muted note" style="color:var(--warn)">${esc(msg)}</p>`:''}
   <div class="col mt"><label class="f">Lien d'invitation ou adresse du serveur (se termine par /exec)<input type="url" id="cfUrl" value="${esc(p.u||p.url||'')}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off"></label>
   <label class="f">Clé secrète<input type="text" id="cfKey" value="${esc(p.k||p.key||'')}" placeholder="ABCD-EFGH-JKLM" autocomplete="off" autocapitalize="characters"></label>
   <label class="f">Votre prénom (pour le journal de prière)<input type="text" id="cfMe" value="${esc((tried&&tried.me)||(CFG&&CFG.me)||'')}" placeholder="ex. Paul"></label>
   <div class="acts left"><button class="btn primary" id="cfGo">${ic('check')}Connecter</button>${CFG?'<button class="btn" id="cfBack">Annuler</button>':''}</div></div></div>`;
}
async function connect(){
  let u=$('#cfUrl').value.trim(),k=$('#cfKey').value.trim().toUpperCase();const me=$('#cfMe').value.trim();
  const inv=parseInvite(u);if(inv){u=inv.u;k=k||inv.k}
  if(!/^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u)){toast("L'adresse doit commencer par https://script.google.com/ et se terminer par /exec.");return}
  if(/\/dev\/?(\?.*)?$/.test(u)){showSetup("Cette adresse se termine par /dev : c'est l'adresse de TEST, elle ne marche que pour le propriétaire. Prenez celle qui se termine par /exec dans Apps Script > Déployer > Gérer les déploiements.",{u,k,me});return}
  u=u.replace(/\?.*$/,'');
  if(!k){toast('Saisissez la clé secrète.');return}
  if(!me){toast('Saisissez votre prénom.');return}
  const old=CFG;CFG={url:u,key:k,me};setSync('Connexion…');
  try{const r=await call('authStatus');ls.set('apg_cfg',CFG);preset=null;st.tab='jour';setSync('Connecté');showLock(r.hasPwd?'enter':'create',r.hasPwd?'Connecté au serveur. Entrez le mot de passe de la famille.':'Connecté au serveur. Créez maintenant le mot de passe d’ouverture.')}
  catch(e){CFG=old;showSetup(e instanceof NetErr?'Pas de connexion internet. Réessayez une fois connecté.':e.message,{u,k,me})}
}
let instEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();instEvt=e;$('#install').hidden=false});
window.addEventListener('appinstalled',()=>{instEvt=null;$('#install').hidden=true;toast('Application installée sur cet appareil.')});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
async function installApp(){
  if(instEvt){instEvt.prompt();try{await instEvt.userChoice}catch(e){}instEvt=null;$('#install').hidden=true;return}
  if(standalone()){toast("L'application est déjà installée.");return}
  toast(isIOS?"Sur iPhone : dans Safari, touchez Partager puis « Sur l'écran d'accueil ».":"Dans le menu du navigateur, choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».");
}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='cfGo')connect();
  else if(b.id==='cfBack'){D.loaded?render(true):load()}
  else if(b.id==='cfChange'){D.loaded=false;showSetup()}
  else if(b.id==='install'||b.id==='instBtn')installApp();
  else if(b.id==='invCopy'){const l=inviteLink();try{await navigator.clipboard.writeText(l);toast("Lien d'invitation copié. Envoyez-le à la personne à inviter.")}catch(_){prompt("Copiez ce lien d'invitation :",l)}}
  else if(b.id==='invShare'){try{await navigator.share({title:'Autel de Prière Familial',text:"Ouvre ce lien pour installer l'Autel de Prière Familial :",url:inviteLink()})}catch(_){}}
});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(b&&b.id==='testConn'){b.disabled=true;await heartbeat(true);render(true)}});
document.addEventListener('change',e=>{if(e.target.id==='setMe'){const v=e.target.value.trim();if(!v)return;CFG.me=v;ls.set('apg_cfg',CFG);D.me=v;toast('Prénom enregistré sur cet appareil.');load()}});
window.addEventListener('online',()=>{flush().then(n=>{if(n)toast('Actions en attente envoyées.');load()})});
window.addEventListener('offline',()=>{hb.ok=false;hb.at=Date.now();setSync(outbox.length?'Hors ligne · '+outbox.length+' en attente':'Hors ligne')});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

/* ================= État d'affichage ================= */
const st={tab:ls.get('apg_tab','jour'),day:todayDay(),thDay:'LUNDI',thCode:null,q:'',open:null,edit:null,gest:null,imp:null,
  exYear:'',exQ:'',chSeg:ls.get('apg_chseg','Louange'),chQ:'',chEdit:null,chBulk:false,ceSeg:'sem',ceDay:(today.getDay()+6)%7,ceEdit:null,ceConfirm:null,evEdit:null,week:iso(monday(today))};
let prie=ls.get('apg_prie_'+iso(today),{});
/* ouverture depuis le lanceur « Prière du jour » : #jour */
if(location.hash==='#jour'){st.tab='jour';st.day=todayDay();ls.set('apg_tab','jour');history.replaceState(null,'',location.pathname+location.search)}

/* ================= Prière du jour ================= */
function subjLi(x,num,withCheck){
  const done=withCheck&&prie[x.id];
  return `<li class="${done?'done':''}">${withCheck?`<input type="checkbox" data-prie="${esc(x.id)}" ${done?'checked':''} aria-label="Prié">`:'<span></span>'}
   <div class="tx"><span class="n">${num}.</span>${x.prio?'<span class="star" title="Prioritaire">★ </span>':''}${esc(x.text)}</div>
   <div class="acts"><button class="btn small icon" data-exa="${esc(x.id)}" aria-label="Marquer ce sujet comme exaucé" title="Marquer comme exaucé">${ic('star')}</button><button class="btn small icon" data-edit="${esc(x.id)}" aria-label="Modifier" title="Modifier">${ic('pencil')}</button>${withCheck?'':`<button class="btn small icon" data-ret="${esc(x.id)}" aria-label="Retirer de la prière" title="Retirer de la prière">${ic('x')}</button>`}</div>
   ${st.edit===x.id?`<div class="panel warm"><label class="f">Modifier le sujet<textarea id="edTx">${esc(x.text)}</textarea></label><label class="inl"><input type="checkbox" id="edPrio" ${x.prio?'checked':''}> Prioritaire ★ (en tête du lot 1)</label>
     <div class="acts left"><button class="btn primary" data-edsave="${esc(x.id)}">${ic('check')}Enregistrer la modification</button><button class="btn" data-cancel>Annuler</button></div></div>`:''}
   ${st.open===x.id?`<div class="panel"><label class="f">Témoignage (facultatif)<textarea id="tem" placeholder="Ce que Dieu a fait…"></textarea></label>
     <label class="f">Nouveau sujet pour le remplacer (facultatif)<textarea id="remp" placeholder="Ce pour quoi prier ensuite sur ce même point…"></textarea><span style="font-weight:400">Il prendra sa place en tête du lot 1 de ce thème.</span></label>
     <div class="row"><label class="f">Date de l'exaucement<input type="text" inputmode="numeric" autocomplete="off" placeholder="jj/mm/aa" maxlength="8" data-date id="temd" value="${fmt(iso(today))}"></label><div class="acts left" style="flex:0 0 auto"><button class="btn primary" data-conf="${esc(x.id)}">${ic('star')}Enregistrer comme exaucé</button><button class="btn" data-cancel>Annuler</button></div></div></div>`:''}
  </li>`;
}
function themeCard(t){
  const N=LOT();const all=subjects(t.c);const L=Math.max(1,Math.ceil(all.length/N));const lot=lotFor(t.c,all.length);const items=all.slice(lot*N,lot*N+N);const [col,icn]=catStyle(t.k);
  const dn=items.filter(x=>prie[x.id]).length;const isToday=st.day===todayDay();
  return `<section class="theme" style="--cat:${col}"><div class="thead"><span class="ticon">${ic(icn)}</span><div class="tmeta"><div class="code"><span class="chip">${esc(t.k)}</span>${esc(t.c)}${isToday&&items.length?` <span class="tprog${dn===items.length?' full':''}">${dn}/${items.length}</span>`:''}
   <span class="lotnav"><button data-lot="${esc(t.c)}" data-d="-1" aria-label="Lot précédent">${ic('left')}</button><span>Lot ${lot+1}/${L}</span><button data-lot="${esc(t.c)}" data-d="1" aria-label="Lot suivant">${ic('right')}</button></span></div><h3>${esc(t.t)}</h3></div></div>
   ${items.length?`<ol class="subj">${items.map((x,i)=>subjLi(x,lot*N+i+1,true)).join('')}</ol>`:`<div class="empty" style="margin:12px;border-radius:12px">Aucun sujet actif dans ce thème. Ajoutez-en dans l'onglet « Thèmes ».</div>`}</section>`;
}
function dayThemes(day){const sc=!sansCommuns().includes(day);return TH().filter(t=>t.d===day||(sc&&t.d==='TOUS LES JOURS'))}
function dayStats(){const N=LOT();const th=dayThemes(st.day);let tot=0,done=0;th.forEach(t=>{const a=subjects(t.c);const l=lotFor(t.c,a.length);a.slice(l*N,l*N+N).forEach(x=>{tot++;if(prie[x.id])done++})});return{th,tot,done}}
function vHero(){
  const {th,tot,done}=dayStats();const min=Math.round(tot*num('secondes',30)/60);const cible=num('cible',0);const isToday=st.day===todayDay();
  const mon=monday(today);const k=DAYS.indexOf(st.day);const dd=new Date(mon);dd.setDate(dd.getDate()+k);
  const C=2*Math.PI*40;const p=isToday&&tot?done/tot:0;const note=SET()['note_'+st.day];
  const ring=isToday?`<div class="ring" role="img" aria-label="${done} sujets priés sur ${tot}"><svg viewBox="0 0 92 92"><circle class="bg" cx="46" cy="46" r="40"/><circle class="fg" cx="46" cy="46" r="40" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}"/></svg><div><b>${done}/${tot}</b><small>${done&&done===tot?'Accompli':'priés'}</small></div></div>`:'';
  return `<section class="hero"><div class="hero-top"><div><div class="hero-day">${JOURS7[k]}</div><div class="hero-date">${isToday?jma(dd):'Programme du '+JOURS7[k].toLowerCase()+' '+jm(dd)}</div></div>${ring}</div>
   ${note?`<p class="hero-note">${ic('flame')}<span>${esc(note)}</span></p>`:''}
   <div class="hero-stats"><span>${ic('layers')}${th.length} thèmes</span><span>${ic('list')}${tot} sujets</span><span>${ic('clock')}${Math.floor(min/60)?Math.floor(min/60)+' h ':''}${min%60} min</span><span>${ic('calendar')}Semaine ${weekIndex()+1}</span></div>
   <div class="days" role="tablist">${DAYS.map((d,i)=>{const x=new Date(mon);x.setDate(x.getDate()+i);return `<button data-day="${d}" class="${d===st.day?'sel':''} ${todayDay()===d?'today':''}" aria-label="${JOURS7[i]}"><small>${DSHORT[d]}</small><b>${x.getDate()}</b></button>`}).join('')}</div></section>`;
}
function vJour(){
  const {th}=dayStats();const showCommun=!sansCommuns().includes(st.day);const cible=num('cible',0);const {tot}=dayStats();const min=Math.round(tot*num('secondes',30)/60);
  const exaW=D.exauces.filter(s=>s.date>=iso(monday(today))).length;
  const jd=Object.values(D.journal);const complets=jd.filter(v=>v.t&&v.f>=v.t).length;
  return `<div class="opts"><span class="inl">${ic('star')} ${exaW} exaucement${exaW>1?'s':''} cette semaine</span><span class="inl">${ic('flame')} ${complets} jour${complets>1?'s':''} accompli${complets>1?'s':''} ce mois</span>
  <label><input type="checkbox" id="commDay" ${showCommun?'checked':''}> Thèmes communs ce jour-là</label></div>
  ${st.day===todayDay()&&tot?`<div class="acts left" style="margin:0 0 14px"><button class="btn primary" id="runJour">${ic('play')}Commencer la séance (${Math.floor(min/60)?Math.floor(min/60)+' h ':''}${min%60} min)</button>${(()=>{const ids=jourIds();const nd=ids.filter(id=>prie[id]).length;return (nd<ids.length?`<button class="btn ok" id="allJour">${ic('check')}Valider toute la séance</button>`:'')+(nd?`<button class="btn" id="noneJour">${ic('undo')}Tout décocher</button>`:'')})()}</div>`:''}
  ${th.length?'<div class="tgrid">'+th.map(themeCard).join('')+'</div>':`<div class="empty">Aucun thème pour ce jour. Créez-en un dans l'onglet « Thèmes », ou déplacez-y un thème existant.</div>`}`;
}

/* ================= Thèmes et sujets ================= */
const catsList=()=>list_('categories').length?list_('categories'):['COMBATS','INSTANCE','MEMB MAIS','ACTIVITE','ACSF','SITUATION','COMMUN','AUTRE'];
async function pickCat(){const nw=($('#gCatNew')?.value||'').trim().toUpperCase();if(nw){if(!catsList().includes(nw)){const c=[...catsList(),nw].join(',');D.settings.categories=c;act('saveSettings',[{categories:c}])}return nw}return $('#gCat').value}
function gestCard(t){
  const G=st.gest;const dayOpts=sel=>['TOUS LES JOURS',...DAYS].map(d=>`<option ${d===sel?'selected':''}>${d}</option>`).join('');
  const catOpts=sel=>[...new Set([...catsList(),sel].filter(Boolean))].map(c=>`<option ${c===sel?'selected':''}>${esc(c)}</option>`).join('');
  const hidden=D.themes.filter(x=>x.statut==='Retiré');let inner='';
  if(G==='new')inner=`<div class="row mt"><label class="f" style="flex:2 1 220px">Nom du nouveau thème<input type="text" id="gName" placeholder="ex. Voyage en famille"></label><label class="f">Jour<select id="gDay">${dayOpts(st.thDay)}</select></label><label class="f">Catégorie<select id="gCat">${catOpts('SITUATION')}</select></label><label class="f">ou nouvelle catégorie<input type="text" id="gCatNew" placeholder="ex. MALADES"></label></div>
    <div class="acts left mt"><button class="btn primary" id="gCreate">Créer le thème</button><button class="btn" id="gClose">Annuler</button></div>`;
  else if(G==='edit'&&t)inner=`<div class="row mt"><label class="f" style="flex:2 1 220px">Nom<input type="text" id="gName" value="${esc(t.t)}"></label><label class="f">Jour<select id="gDay">${dayOpts(t.d)}</select></label><label class="f">Catégorie<select id="gCat">${catOpts(t.k)}</select></label><label class="f">ou nouvelle catégorie<input type="text" id="gCatNew" placeholder="ex. MALADES"></label></div>
    <div class="acts left mt"><button class="btn primary" id="gSave">Enregistrer</button><button class="btn" id="gClose">Annuler</button><span style="flex:1"></span><button class="btn" id="gDel">Retirer ce thème</button></div>`;
  else if(G==='del'&&t)inner=`<p class="mt">Retirer « ${esc(t.t)} » de la prière ? Ses sujets sont conservés et le thème pourra être rétabli.</p><div class="acts left"><button class="btn primary" id="gDelOk">Oui, retirer</button><button class="btn" id="gClose">Annuler</button></div>`;
  return `<div class="card"><div class="acts left" style="align-items:center"><b style="flex:1 1 200px">Thèmes du ${esc(st.thDay.toLowerCase())}</b><button class="btn" id="gNew">${ic('plus')}Nouveau thème</button>${t?`<button class="btn" id="gEdit">${ic('pencil')}Renommer ou changer de jour</button><button class="btn" data-move="-1">↑ Monter</button><button class="btn" data-move="1">↓ Descendre</button>`:''}</div>${inner}
    ${hidden.length&&!G?`<p class="muted mt">Thèmes retirés : ${hidden.map(x=>`<button class="btn small" data-unhide="${esc(x.c)}">Rétablir ${esc(x.t)}</button>`).join(' ')}</p>`:''}</div>`;
}
/* --- import --- */
function loadLib(src,g){return new Promise((ok,ko)=>{if(window[g])return ok(window[g]);const s=document.createElement('script');s.src=src;s.onload=()=>ok(window[g]);s.onerror=()=>ko(new Error('lib'));document.head.appendChild(s)})}
function cleanLine(s){return String(s??'').replace(/^\s*(\d+[\.\)]|[-•*–▪●★])\s*/,'').replace(/\s+/g,' ').trim()}
function matchTheme(v,partial){if(v==null||v==='')return null;const n=norm(v);const T=TH();
  const a=T.find(t=>norm(t.c)===n);if(a)return a.c;const b=T.find(t=>norm(t.t)===n);if(b)return b.c;
  if(!partial)return null;const p=T.find(t=>n.length>3&&n.length<90&&(norm(t.t).includes(n)||n.includes(norm(t.t))));return p?p.c:null}
async function parseFile(f){
  const name=f.name.toLowerCase();const rows=[];
  if(name.endsWith('.docx')){
    const m=await loadLib('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js','mammoth');
    const r=await m.extractRawText({arrayBuffer:await f.arrayBuffer()});let cur=null;
    r.value.split(/\n+/).forEach(l=>{const raw=l.trim();if(!raw)return;
      const th=matchTheme(raw.replace(/^[A-Z]{3}-\d{2}\s+/,'').replace(/^\[[^\]]*\]\s*/,''),true)||matchTheme(raw.split(/\s+/)[0]);
      if(th&&raw.length<90&&!/[.!?]$/.test(raw.replace(/\([^)]*\)\.?$/,'').trim())){cur=th;return}
      const tx=cleanLine(raw);if(tx.length>=8&&!/^lot\s*\d+$/i.test(tx))rows.push({text:tx,code:cur})});
  }else if(/\.(xlsx|xlsm|xls|csv)$/.test(name)){
    const X=await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','XLSX');
    const wb=X.read(await f.arrayBuffer(),{type:'array'});
    wb.SheetNames.forEach(sn=>{const data=X.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:''});if(!data.length)return;
      let hi=-1,cS=-1,cT=-1,cP=-1;
      for(let i=0;i<Math.min(5,data.length);i++){data[i].forEach((v,j)=>{const n=norm(v);if(/sujet|priere|texte/.test(n)&&cS<0){cS=j;hi=i}if(/theme|code/.test(n)&&cT<0){cT=j;hi=i}if(/priorit/.test(n)&&cP<0)cP=j});if(cS>=0)break}
      const sheetTheme=matchTheme(sn,true);
      data.slice(hi+1).forEach(r=>{let tx=cS>=0?r[cS]:r.reduce((a,v)=>String(v).length>String(a).length?v:a,'');tx=cleanLine(tx);if(tx.length<8)return;
        let code=cT>=0?matchTheme(r[cT],true):null;if(!code&&cT<0)code=r.map(v=>matchTheme(v)).find(Boolean)||null;if(!code)code=sheetTheme;
        const pr=cP>=0?/^(oui|1|x|precision|★|vrai|true)/i.test(norm(r[cP])):null;rows.push({text:tx,code,prio:pr})})});
  }else if(name.endsWith('.txt')){(await f.text()).split(/\n+/).forEach(l=>{const tx=cleanLine(l);if(tx.length>=8)rows.push({text:tx,code:null})})}
  else throw new Error('format');
  return rows;
}
const impTarget=r=>r.code||st.imp.def;
function markDups(){const I=st.imp;const ex={};I.rows.forEach(r=>{const c=impTarget(r);if(!ex[c])ex[c]=new Set(subjects(c).map(x=>norm(x.text)));const k=norm(r.text);r.dup=ex[c].has(k);ex[c].add(k)})}
function impCard(){
  const I=st.imp;
  if(!I)return `<div class="card imp"><div class="row"><div style="flex:3 1 260px"><b>Importer des sujets depuis un fichier</b><div class="muted">Word (.docx), Excel (.xlsx, .csv) ou texte. Un sujet par ligne ou par paragraphe. Dans Excel, une colonne « Thème » ou « Code » range chaque sujet dans le bon thème.</div></div>
    <label class="btn primary" style="flex:0 0 auto;text-align:center">Choisir un fichier<input type="file" id="impFile" accept=".docx,.xlsx,.xlsm,.xls,.csv,.txt" hidden></label></div></div>`;
  if(I.loading)return `<div class="card imp">Lecture de « ${esc(I.name)} »…</div>`;
  const ok=I.rows.filter(r=>!r.dup);const dups=I.rows.length-ok.length;const auto=I.rows.filter(r=>r.code).length;
  return `<div class="card imp"><b>Import de « ${esc(I.name)} »</b><p class="muted">${I.rows.length} sujet(s) lu(s) · ${auto} rangé(s) automatiquement${dups?` · ${dups} déjà présent(s), ignoré(s)`:''}</p>
   <div class="row"><label class="f" style="flex:2 1 240px">Thème pour les sujets sans thème reconnu<select id="impDef">${TH().map(x=>`<option value="${esc(x.c)}" ${x.c===I.def?'selected':''}>${esc(x.c+' · '+x.t)}</option>`).join('')}</select></label>
   <label class="inl" style="flex:0 0 auto"><input type="checkbox" id="impPrio" ${I.prio?'checked':''}> Prioritaires ★</label></div>
   <div class="tblwrap"><table class="imptab"><tbody>${I.rows.slice(0,300).map((r,i)=>`<tr${r.dup?' style="opacity:.45"':''}><td class="c">${i+1}</td><td>${esc(r.text)}</td><td class="c">${esc(impTarget(r))}${r.dup?' · déjà présent':''}</td></tr>`).join('')}</tbody></table></div>
   <div class="acts left mt"><button class="btn primary" id="impGo" ${ok.length&&!I.busy?'':'disabled'}>${I.busy?'Import en cours…':`Importer ${ok.length} sujet(s)`}</button><button class="btn" id="impCancel" ${I.busy?'disabled':''}>Annuler</button></div></div>`;
}
function vThemes(){
  const list=TH().filter(t=>t.d===st.thDay);if(!st.thCode||!list.find(t=>t.c===st.thCode))st.thCode=list[0]?.c||null;
  const t=st.thCode?byCode(st.thCode):null;const all=t?subjects(t.c):[];const q=norm(st.q);let body='';
  if(q){const hits=[];TH().forEach(th=>subjects(th.c).forEach((x,i)=>{if(norm(x.text).includes(q))hits.push([th,x,i])}));
    body=`<p class="muted">${hits.length} sujet(s) trouvé(s)${hits.length>200?' — 200 premiers affichés':''}.</p><div class="theme"><ol class="subj">${hits.slice(0,200).map(([th,x,i])=>subjLi({...x,text:`[${th.t}] ${x.text}`},i+1,false)).join('')}</ol></div>`}
  else if(!t)body=gestCard(null)+`<div class="empty">Aucun thème pour ce jour. Créez-en un ci-dessus.</div>`;
  else{const N=LOT();let html='';all.forEach((x,i)=>{if(i%N===0)html+=`<li class="lotsep">Lot ${i/N+1}</li>`;html+=subjLi(x,i+1,false)});
    const ret=Object.values(D.subj).filter(s=>s.code===t.c&&s.statut==='Retiré');
    body=gestCard(t)+impCard()+`<div class="card"><div class="row"><label class="f" style="flex:3 1 260px">Nouveau sujet pour « ${esc(t.t)} »<input type="text" id="newTx" placeholder="Disons au Seigneur : …"></label><label class="inl" style="flex:0 0 auto"><input type="checkbox" id="newPrio" checked> Prioritaire ★</label><button class="btn primary" id="addBtn" style="flex:0 0 auto">${ic('plus')}Ajouter</button></div></div>
     <section class="theme" style="--cat:${catStyle(t.k)[0]}"><div class="thead"><span class="ticon">${ic(catStyle(t.k)[1])}</span><div class="tmeta"><div class="code"><span class="chip">${esc(t.k)}</span>${esc(t.c)} · ${all.length} sujets actifs · ${Math.max(1,Math.ceil(all.length/N))} lots</div><h3>${esc(t.t)}</h3></div></div><ol class="subj">${html}</ol></section>
     ${ret.length?`<h2>Sujets retirés</h2><div class="theme">${ret.map(s=>`<div class="ex"><div>${esc(s.text)}</div><div class="meta">Retiré le ${fmt(s.dstatut)} <button class="btn small" data-restore="${esc(s.id)}">${ic('undo')}Remettre en prière</button></div></div>`).join('')}</div>`:''}`}
  return rwCard()+`<div class="row" style="margin-bottom:12px"><label class="f">Jour<select id="thDay">${['TOUS LES JOURS',...DAYS].map(d=>`<option ${d===st.thDay?'selected':''}>${d}</option>`).join('')}</select></label>
   <label class="f" style="flex:2 1 240px">Thème<select id="thCode">${list.map(x=>`<option value="${esc(x.c)}" ${x.c===st.thCode?'selected':''}>${esc(x.c+' · '+x.t)}</option>`).join('')}</select></label>
   <label class="f">Rechercher dans tous les sujets<input type="text" id="q" value="${esc(st.q)}" placeholder="ex. santé, travail…"></label></div>${body}`;
}

/* ================= Exaucés ================= */
function vExauces(){
  const all=D.exauces.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const years=[...new Set(all.map(s=>(s.date||'').slice(0,4)).filter(Boolean))].sort().reverse();
  const qn=norm(st.exQ);const ex=all.filter(s=>(!st.exYear||(s.date||'').startsWith(st.exYear))&&(!qn||norm(s.text+' '+s.note+' '+s.theme).includes(qn)));
  const y=iso(today).slice(0,4),m=iso(today).slice(0,7);const by={};all.forEach(s=>{const k=s.theme||'Témoignage libre';by[k]=(by[k]||0)+1});
  const top=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,4);
  return `<div class="summary"><div><b>${all.length}</b><span>Exaucés en tout</span></div><div><b>${all.filter(s=>(s.date||'').startsWith(y)).length}</b><span>Cette année</span></div><div><b>${all.filter(s=>(s.date||'').startsWith(m)).length}</b><span>Ce mois-ci</span></div><div><span>Thèmes les plus exaucés</span><div class="muted">${top.length?top.map(([k,v])=>`${esc(k)} : ${v}`).join(' · '):'Aucun pour l’instant'}</div></div></div>
  <div class="card"><b class="ctitle">${ic('heart')}Ajouter un témoignage d'exaucement</b><div class="row mt"><label class="f" style="flex:3 1 260px">Ce que Dieu a fait<input type="text" id="libTx" placeholder="ex. Guérison obtenue"></label><label class="f">Date<input type="text" inputmode="numeric" autocomplete="off" placeholder="jj/mm/aa" maxlength="8" data-date id="libD" value="${fmt(iso(today))}"></label></div>
   <label class="f mt">Détails (facultatif)<textarea id="libTem"></textarea></label><div class="mt"><button class="btn primary" id="libAdd">${ic('star')}Enregistrer le témoignage</button></div></div>
  ${all.length?`<div class="row" style="margin-bottom:10px"><label class="f">Année<select id="exYear"><option value="">Toutes</option>${years.map(v=>`<option ${v===st.exYear?'selected':''}>${v}</option>`).join('')}</select></label><label class="f" style="flex:2 1 240px">Rechercher<input type="text" id="exQ" value="${esc(st.exQ)}" placeholder="ex. guérison, examen…"></label></div>`:''}
  ${ex.length?`<div class="theme">${ex.map(s=>`<div class="ex"><div><span class="okbadge">${ic('check')}</span>${esc(s.text)}</div>${s.note?`<div class="tem">${esc(s.note)}</div>`:''}${s.remplace?`<div class="muted">Remplacé par : ${esc(s.remplace)}</div>`:''}<div class="meta"><span>${fmt(s.date)}</span><span>${esc(s.theme||'Témoignage libre')}</span>${String(s.id).startsWith('LIBRE')?`<button class="btn small" data-delex="${esc(s.id)}">${ic('trash')}Supprimer</button>`:`<button class="btn small" data-restore="${esc(s.id)}">${ic('undo')}Remettre en prière</button>`}</div></div>`).join('')}</div>`
   :`<div class="empty">${all.length?'Aucun exaucement ne correspond à ce filtre.':'Aucun sujet exaucé pour l’instant. Touchez « Exaucé » à côté d’un sujet, ou ajoutez un témoignage ci-dessus.'}</div>`}`;
}

/* ================= Église ================= */
function dayData(i){const v=D.week[i]||{};const items=(v.items||[]).slice();while(items.length&&!items[items.length-1])items.pop();return{titre:v.titre||'',cond:v.cond||'',items}}
async function saveDayLocal(i,patch){const v={...dayData(i),...patch};D.week[i]=v;render();await act('saveDay',[st.week,i,v])}
function genSubjects(i,count,exclude){const src=SET().sourceEglise||'SAMEDI';const th=TH().filter(t=>t.d===src&&subjects(t.c).length);if(!th.length)return null;
  const seen=new Set(exclude.map(norm));const out=[];const off=(weekIndex()*7+i)*7;const lists=th.map(t=>subjects(t.c));const total=lists.reduce((a,b)=>a+b.length,0);
  for(let r=0;out.length<count&&r<total*2;r++){const a=lists[r%lists.length];const s=a[(off+Math.floor(r/lists.length))%a.length].text;const k=norm(s);if(!seen.has(k)){seen.add(k);out.push(s)}}return out}
function egliseWeek(){
  const mon=new Date(st.week+'T00:00');const i=st.ceDay;const d0=new Date(mon);d0.setDate(d0.getDate()+i);
  const v=dayData(i);const filled=v.items.filter(Boolean).length;const pk='apg_ce_'+st.week+'_'+i;const done=ls.get(pk,{});const nd=v.items.filter((x,k)=>x&&done[k]).length;
  const chips=JOURS7.map((j,k)=>{const dd=new Date(mon);dd.setDate(dd.getDate()+k);const n=dayData(k).items.filter(Boolean).length;return `<button data-ceday="${k}" class="${k===i?'sel':''} ${iso(dd)===iso(today)?'today':''}">${j.slice(0,3)} ${jm(dd)}${n?' · '+n:''}</button>`}).join('');
  const shown=v.items.concat(Array(10).fill(''));
  const li=shown.map((x,k)=>{const ed=st.ceEdit===k;return `<li class="${x&&done[k]?'done':''}">${x?`<input type="checkbox" data-cedone="${k}" ${done[k]?'checked':''} aria-label="Prié">`:'<span></span>'}
     <div class="tx">${ed?`<textarea id="ceTx" rows="3">${esc(x)}</textarea>`:`<span class="n">${k+1}.</span>${x?esc(x):'<span class="muted" style="font-style:italic">Sujet à rédiger</span>'}`}</div>
     <div class="acts">${ed?`<button class="btn small primary" data-cesave="${k}">Enregistrer</button><button class="btn small" data-cecancel>Annuler</button>`:`<button class="btn small" data-ceedit="${k}">${ic('pencil')}${x?'Modifier':'Rédiger'}</button><button class="btn small icon" data-cegen1="${k}" aria-label="Générer" title="Générer">${ic('wand')}</button>${x?`<button class="btn small icon" data-ceclear="${k}" aria-label="Effacer" title="Effacer">${ic('trash')}</button>`:''}`}</div></li>`}).join('');
  return `<div class="row" style="margin-bottom:10px"><div class="acts left" style="flex:0 0 auto"><button class="btn" data-wkmove="-1">${ic('left')}Semaine précédente</button><button class="btn" data-wkmove="1">Semaine suivante${ic('right')}</button></div><p class="muted" style="margin:0">Semaine du ${fmt(st.week)}</p></div>
  <div class="days">${chips}</div>
  <div class="card"><div class="row"><label class="f" style="flex:2 1 220px">Thème ou activité du ${JOURS7[i].toLowerCase()} ${jma(d0)}<input type="text" id="ceTitre" value="${esc(v.titre)}" placeholder="ex. Prière de midi à l'assemblée"></label><label class="f">Conducteur<input type="text" id="ceCond" value="${esc(v.cond)}" placeholder="ex. Paul"></label></div></div>
  <div class="summary s3"><div><b>${filled}</b><span>Sujets rédigés</span></div><div><b>${hm(filled*num('secondes',30)/60)}</b><span>Durée de la séance</span></div><div><b>${nd}/${filled}</b><span>Priés</span><div class="bar"><i style="width:${filled?nd/filled*100:0}%"></i></div></div></div>
  <div class="acts left" style="margin-bottom:10px">${filled?`<button class="btn primary" id="runCe">${ic('play')}Commencer la séance</button>${nd<filled?`<button class="btn ok" id="allCe">${ic('check')}Valider toute la séance</button>`:''}${nd?`<button class="btn" id="noneCe">${ic('undo')}Tout décocher</button>`:''}`:''}<span class="inl"><button class="btn" id="ceFill">${ic('wand')}Générer</button><input type="number" id="ceN" min="1" max="500" value="${ls.get('apg_cen',20)}" style="width:76px" aria-label="Nombre de sujets à générer"><span class="muted">sujets de plus</span></span>
   ${st.ceConfirm==='regen'?`<span class="muted">Remplacer les ${filled} sujets écrits ?</span><button class="btn" id="ceRegenOk">Oui, tout régénérer</button><button class="btn" id="ceNo">Non</button>`
   :st.ceConfirm==='clear'?`<span class="muted">Effacer les ${filled} sujets de ce jour ?</span><button class="btn" id="ceClearOk">Oui, tout effacer</button><button class="btn" id="ceNo">Non</button>`
   :`<button class="btn" id="ceRegen" ${filled?'':'disabled'}>Tout régénérer</button><button class="btn" id="ceClearAll" ${filled?'':'disabled'}>Tout effacer</button><button class="btn" id="ceCopyPrev">${ic('copy')}Reprendre la semaine précédente</button>`}</div>
  <p class="muted note">Les sujets générés viennent des thèmes du ${(SET().sourceEglise||'SAMEDI').toLowerCase()} (modifiable dans les Réglages) et changent chaque semaine. Chaque sujet reste modifiable.</p>
  <section class="theme" style="--cat:#D33F49"><ol class="subj">${li}</ol></section>`;
}
function vEglise(){
  const seg=`<div class="days" style="margin-bottom:14px"><button data-ceseg="sem" class="${st.ceSeg==='sem'?'sel':''}">${ic('flame')}Prières de la semaine</button><button data-ceseg="prog" class="${st.ceSeg==='prog'?'sel':''}">${ic('calendar')}Programme des activités</button></div>`;
  if(st.ceSeg==='sem')return seg+egliseWeek();
  const ev=D.prog.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''));const td=iso(today);
  const fut=ev.filter(e=>e.date>=td),pas=ev.filter(e=>e.date<td).reverse().slice(0,15);
  const row=e=>{const d=new Date(e.date+'T00:00');return `<div class="ev ${e.fait?'fait':''}"><div class="date">${isNaN(d)?'?':jm(d)}<small>${isNaN(d)?'':'/'+mm2(d)}</small></div>
    <div style="min-width:0"><div class="t"><b>${esc(e.titre)}</b> <span class="chip">${esc(e.type)}</span></div><div class="muted">${e.resp?'Responsable : '+esc(e.resp):''}</div>${e.sujets?`<div class="pre">${esc(e.sujets)}</div>`:''}</div>
    <div class="col"><button class="btn small ${e.fait?'':'ok'}" data-fait="${esc(e.id)}">${ic(e.fait?'undo':'check')}${e.fait?'Rouvrir':'Fait'}</button><button class="btn small icon" data-evedit="${esc(e.id)}" aria-label="Modifier" title="Modifier">${ic('pencil')}</button><button class="btn small icon" data-delev="${esc(e.id)}" aria-label="Supprimer" title="Supprimer">${ic('trash')}</button></div></div>`};
  const E=st.evEdit?D.prog.find(e=>e.id===st.evEdit):null;const types=[...new Set([...list_('evTypes'),E&&E.type].filter(Boolean))];
  return seg+`<div class="card">${E?`<b>Modifier « ${esc(E.titre)} »</b>`:''}<div class="row mt"><label class="f">Date<input type="text" inputmode="numeric" autocomplete="off" placeholder="jj/mm/aa" maxlength="8" data-date id="evD" value="${fmt(E?esc(E.date):td)}"></label>
   <label class="f">Type<select id="evT">${types.map(x=>`<option ${E&&E.type===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label class="f">ou nouveau type<input type="text" id="evTn" placeholder="ex. Conférence"></label>
   <label class="f" style="flex:2 1 220px">Titre<input type="text" id="evTi" value="${E?esc(E.titre):''}" placeholder="ex. Veillée de combat du vendredi"></label><label class="f">Responsable<input type="text" id="evR" value="${E?esc(E.resp):''}"></label></div>
   <label class="f mt">Sujets (un par ligne)<textarea id="evS">${E?esc(E.sujets):''}</textarea></label><div class="acts left mt"><button class="btn primary" id="evAdd">${ic(E?'check':'plus')}${E?'Enregistrer les modifications':'Ajouter au programme'}</button>${E?'<button class="btn" id="evCancel">Annuler</button>':''}</div></div>
  ${fut.length?`<div class="theme">${fut.map(row).join('')}</div>`:'<div class="empty">Aucune activité à venir. Ajoutez la prochaine veillée, le prochain jeûne ou le culte ci-dessus.</div>'}
  ${pas.length?`<h2>Activités passées</h2><div class="theme">${pas.map(row).join('')}</div>`:''}`;
}

/* ================= Nuit de prière personnelle ================= */
const NIGHT={};               // nuits chargées : id -> {id,date,titre,duree,sec,items,par,modif}
const NCAP=2000;const nCount=n=>NCAP;   // plus de limite fixe : la durée suit le nombre de sujets
const nDur=n=>nFilled(n)*(+n.sec||30)/60;
const nFilled=n=>(n.items||[]).filter(Boolean).length;
const hm=min=>{min=Math.round(min);const h=Math.floor(min/60),m=min%60;return (h?h+' h':'')+(h&&m?' ':'')+(m||!h?m+' min':'')};
const nPrie=id=>ls.get('apg_nprie_'+id,{});
function nightMeta(n){return {id:n.id,date:n.date,titre:n.titre,duree:Math.round(nDur(n)),sec:n.sec,par:n.par||'',modif:n.modif||'',nb:nFilled(n)}}
function upsertMeta(n){const m=nightMeta(n);const i=(D.nights||[]).findIndex(x=>x.id===n.id);if(i<0)(D.nights=D.nights||[]).push(m);else D.nights[i]=Object.assign(D.nights[i],m)}
function cacheNight(n){NIGHT[n.id]=n;ls.set('apg_nuit_'+n.id,n)}
async function openNight(id){
  st.nightId=id;st.nEdit=null;st.nPaste=false;st.nAll=false;
  const c=NIGHT[id]||ls.get('apg_nuit_'+id,null);if(c)NIGHT[id]=c;render(true);
  if(outbox.some(x=>x.fn==='saveNight'&&x.a[0].id===id))return;      // modifications locales pas encore envoyées : on garde la copie de l'appareil
  try{const n=await call('getNight',id);if(n&&st.nightId===id&&!nSave.t){cacheNight(n);render(true)}}
  catch(e){if(!c){toast(e instanceof NetErr?'Hors ligne : cette nuit n’a pas encore été ouverte sur cet appareil.':e.message);st.nightId=null;render(true)}}
}
const nSave={t:0};
function saveNightSoon(n,now){upsertMeta(n);cacheNight(n);clearTimeout(nSave.t);nSave.t=setTimeout(async()=>{nSave.t=0;
  const payload={id:n.id,date:n.date,titre:n.titre,duree:Math.round(nDur(n)),sec:n.sec,items:n.items};
  outbox=outbox.filter(x=>!(x.fn==='saveNight'&&x.a[0].id===n.id));saveOutbox();
  try{const r=await act('saveNight',[payload]);if(r){n.modif=r.modif;n.par=r.par;upsertMeta(n);cacheNight(n);if(st.tab==='nuit')paintNightStats()}}catch(e){}
},now?0:1200)}
function curNight(){return st.nightId?NIGHT[st.nightId]:null}

/* ----- Vues ----- */
function vNuit(){return st.nightId&&curNight()?nightView(curNight()):nightsList()}
function nightsList(){
  const all=(D.nights||[]).slice();const td=iso(today);
  const fut=all.filter(n=>n.date>=td).sort((a,b)=>a.date.localeCompare(b.date)),pas=all.filter(n=>n.date<td).sort((a,b)=>b.date.localeCompare(a.date));
  const card=n=>{const d=new Date(n.date+'T00:00');const N=nCount(n);const p=Object.values(nPrie(n.id)).filter(Boolean).length;
    return `<button class="ncard" data-nopen="${esc(n.id)}"><span class="date">${isNaN(d)?'?':jm(d)}<small>${isNaN(d)?'':'/'+mm2(d)}</small></span>
      <span class="nbody"><b>${esc(n.titre||'Nuit de prière')}</b><span class="muted">${isNaN(d)?'':wjma(d)}</span>
      <span class="nbar"><i style="width:${n.nb?Math.min(100,p/n.nb*100):0}%"></i></span><span class="muted">${n.nb} sujet${n.nb>1?'s':''} · ${hm(n.nb*n.sec/60)} (${n.sec} s par sujet)${p?` · ${p} priés`:''}${n.par?` · ${esc(n.par)}`:''}</span></span>${ic('right')}</button>`};
  return `<div class="card"><b class="ctitle">${ic('moon')}Nouvelle nuit de prière</b>
   <div class="row mt"><label class="f">Date de la nuit<input type="text" inputmode="numeric" autocomplete="off" placeholder="jj/mm/aa" maxlength="8" data-date id="nDate" value="${fmt(td)}"></label>
   <label class="f" style="flex:2 1 220px">Intention (facultatif)<input type="text" id="nTitre" placeholder="ex. Nuit pour la famille"></label></div>
   <div class="row mt"><label class="f">Secondes par sujet<select id="nSec">${[15,20,30,45,60,90,120].map(v=>`<option ${v===30?'selected':''}>${v}</option>`).join('')}</select></label>
   <button class="btn primary" id="nCreate" style="flex:0 0 auto">${ic('plus')}Créer la nuit</button></div>
   <p class="muted mt">Pas de durée à choisir : elle se calcule toute seule avec le nombre de sujets que vous écrivez (ex. 360 sujets × 30 s = 3 h).</p></div>
  ${fut.length?`<h2>Nuits à venir</h2><div class="nlist">${fut.map(card).join('')}</div>`:''}
  ${pas.length?`<h2>Nuits passées</h2><div class="nlist">${pas.map(card).join('')}</div>`:''}
  ${!all.length?`<div class="empty">Aucune nuit pour l’instant. Choisissez une date ci-dessus et créez votre première nuit de prière.</div>`:''}`;
}
function nightView(n){
  const items=n.items||[];const filled=nFilled(n);const lastI=items.reduce((m,x,i)=>x?i:m,-1);const N=Math.min(NCAP,lastI+11);const pr=nPrie(n.id);const np=Object.keys(pr).filter(k=>pr[k]&&items[k]).length;
  const d=new Date(n.date+'T00:00');const nextEmpty=firstEmpty(n);
  let rows='';let shownEmpty=0;
  for(let i=0;i<N;i++){const x=items[i]||'';
    if(!x&&st.nEdit!==i){if(shownEmpty>=10)continue;shownEmpty++}
    const ed=st.nEdit===i;const live=dict.on&&dict.row===i;
    rows+=`<li class="${x&&pr[i]?'done':''}${live?' live':''}" id="nrow${i}"><span class="nnum">${i+1}</span>
     <div class="tx">${ed?`<textarea id="nEdTx" rows="3" placeholder="Disons au Seigneur : …">${esc(x)}</textarea>`:x?esc(x):`<span class="muted" style="font-style:italic">Sujet à écrire ou à dicter</span>`}</div>
     <div class="acts">${ed?`<button class="btn small primary" data-nsave="${i}">${ic('check')}Enregistrer</button><button class="btn small" data-ncancel>Annuler</button>${x?`<button class="btn small" data-ndel="${i}">${ic('trash')}Effacer</button>`:''}`
       :`<button class="btn small icon" data-nedit="${i}" aria-label="Écrire le sujet ${i+1}" title="Écrire">${ic('pencil')}</button><button class="btn small icon mic" data-nmic="${i}" aria-label="Dicter le sujet ${i+1}" title="Dicter">${ic('mic')}</button>`}</div></li>`}
  const hidden=N-filled-shownEmpty-(st.nEdit!=null&&!items[st.nEdit]&&shownEmpty<10?0:0);
  return `<div class="acts left" style="margin-bottom:12px"><button class="btn" data-nback>${ic('left')}Toutes les nuits</button></div>
  <section class="nhero"><div class="nh-top"><div><div class="nh-date">${isNaN(d)?'':wjma(d)}</div>
   <input type="text" id="nTitreEd" class="nh-title" value="${esc(n.titre)}" placeholder="Intention de la nuit" aria-label="Intention de la nuit"></div>
   <button class="btn primary nplay" data-nrun ${filled?'':'disabled'}>${ic('play')}Commencer la nuit</button>${filled?`<span class="acts left nall">${np<filled?`<button class="btn ok" id="allNuit">${ic('check')}Valider toute la nuit</button>`:''}${np?`<button class="btn" id="noneNuit">${ic('undo')}Tout décocher</button>`:''}</span>`:''}</div>
   <div class="hero-stats" id="nStats">${nStatsHTML(n)}</div>
   <div class="row" style="margin-top:12px"><label class="f">Date<input type="text" inputmode="numeric" autocomplete="off" placeholder="jj/mm/aa" maxlength="8" data-date id="nDateEd" value="${fmt(esc(n.date))}"></label>   <label class="f">Secondes par sujet<select id="nSecEd">${[15,20,30,45,60,90,120].map(v=>`<option ${v===+n.sec?'selected':''}>${v}</option>`).join('')}</select></label></div></section>
  <div class="card dict${dict.on&&dict.row==null?' on':''}" id="dictCard"><div class="dict-top"><button class="micbig" id="dictBtn" aria-pressed="${dict.on&&dict.row==null}" aria-label="${dict.on?'Arrêter la dictée':'Dicter les sujets'}">${ic('mic')}</button>
   <div style="min-width:0;flex:1"><b>${dict.on&&dict.row==null?'Je vous écoute…':'Dicter les sujets'}</b><div class="muted" id="dictHint">${dict.on&&dict.row==null?`Sujet n° ${dictTarget(n)+1}. Dites « suivant » pour passer au sujet suivant.`:`Touchez le micro et parlez : chaque sujet se place au n° ${nextEmpty+1} puis à la suite.`}</div></div></div>
   <div class="dict-live" id="dictLive" ${dict.on?'':'hidden'}>${esc(dict.buf)} <i>${esc(dict.interim)}</i></div>
   <div class="acts left mt">${dict.on?`<button class="btn primary small" id="dictOk">${ic('check')}Valider ce sujet</button><button class="btn small" id="dictUndo">${ic('undo')}Effacer la phrase</button>`:''}
   <label class="inl muted"><input type="checkbox" id="dictAuto" ${dict.auto?'checked':''}> Un sujet à chaque pause</label></div></div>
  <div class="acts left" style="margin-bottom:12px"><button class="btn" id="nGenBtn">${ic('wand')}Générer depuis un thème</button><button class="btn" id="nPasteBtn">${ic('list')}Coller plusieurs sujets</button><button class="btn" id="nCopy">${ic('copy')}Copier la liste</button><button class="btn" id="nDelNight">${ic('trash')}Supprimer la nuit</button></div>
  ${st.nGen?nGenCard(n):''}
  ${st.nPaste?`<div class="card imp"><label class="f">Un sujet par ligne. Ils se placent à partir du n° ${nextEmpty+1}.<textarea id="nPaste" rows="6" placeholder="Disons au Seigneur : …\nBrisons …"></textarea></label><div class="acts left mt"><button class="btn primary" id="nPasteGo">${ic('plus')}Ajouter à la suite</button><button class="btn" id="nPasteNo">Annuler</button></div></div>`:''}
  ${st.nDelAsk?`<div class="card panel warm"><b>Supprimer « ${esc(n.titre||'cette nuit')} » et ses ${filled} sujets ?</b><div class="acts left"><button class="btn primary" id="nDelOk">Oui, supprimer</button><button class="btn" id="nDelNo">Non</button></div></div>`:''}
  <section class="theme" style="--cat:#4B2E91"><div class="thead"><span class="ticon">${ic('moon')}</span><div class="tmeta"><div class="code"><span class="chip">NUIT</span>${filled} sujet${filled>1?'s':''} · ${hm(filled*n.sec/60)}</div><h3>Sujets de la nuit</h3></div></div>
   <ol class="subj nsubj">${rows}</ol>
</section>`;
}
function nGenCard(n){const ord=['TOUS LES JOURS',...DAYS];
  const opts=ord.map(d=>{const L=TH().filter(t=>t.d===d);return L.length?`<optgroup label="${esc(d.charAt(0)+d.slice(1).toLowerCase())}">${L.map(t=>`<option value="${esc(t.c)}" ${st.ngTheme===t.c?'selected':''}>${esc(t.t)} (${subjects(t.c).length})</option>`).join('')}</optgroup>`:''}).join('');
  return `<div class="card ngen"><b class="ctitle">${ic('wand')}Générer des sujets pour cette nuit</b>
   <div class="row mt"><label class="f" style="flex:2 1 240px">Thème<select id="ngTheme"><option value="">— Choisir un thème —</option>${opts}</select></label>
   <label class="f" style="flex:1 1 160px">ou un mot-clé<input type="text" id="ngKey" value="${esc(st.ngKey||'')}" placeholder="ex. santé, mariage"></label>
   <label class="f" style="flex:0 1 110px">Combien<select id="ngN">${[[10,'10'],[20,'20'],[50,'50'],[100,'100'],[0,'Tous']].map(([v,l])=>`<option value="${v}" ${(st.ngN??20)==v?'selected':''}>${l}</option>`).join('')}</select></label></div>
   <p class="muted note">Les sujets actifs du thème (ou contenant le mot-clé dans tous vos thèmes) se placent à la suite, sans doublon avec ceux déjà dans la nuit. La durée se recalcule toute seule.</p>
   <div class="acts left"><button class="btn primary" id="ngGo">${ic('plus')}Ajouter à la nuit</button><button class="btn" id="ngNo">Fermer</button></div></div>`}
function nGenerate(n){const code=$('#ngTheme').value,kw=norm($('#ngKey').value||''),N=+$('#ngN').value;st.ngTheme=code;st.ngKey=$('#ngKey').value;st.ngN=N;
  let pool=[];if(code)pool=subjects(code).slice();else if(kw.length>=3)pool=Object.values(D.subj).filter(x=>x.statut==='Actif'&&norm(x.text).includes(kw)&&TH().some(t=>t.c===x.code));
  else{toast('Choisissez un thème, ou écrivez un mot-clé d’au moins 3 lettres.');return}
  const have=new Set((n.items||[]).filter(Boolean).map(norm));pool=pool.filter(x=>!have.has(norm(x.text)));
  if(!pool.length){toast(code?'Tous les sujets de ce thème sont déjà dans la nuit.':'Aucun sujet ne contient ce mot-clé.');return}
  const take=N?pool.slice(0,N):pool;n.items=(n.items||[]).slice();let i=0;
  take.forEach(x=>{while(n.items[i])i++;n.items[i]=x.text;i++});
  saveNightSoon(n);render(true);toast(`${take.length} sujet${take.length>1?'s':''} ajouté${take.length>1?'s':''} · durée ${hm(nDur(n))}.`)}
function nStatsHTML(n){const f=nFilled(n);const pr=nPrie(n.id);const p=Object.keys(pr).filter(k=>pr[k]&&(n.items||[])[k]).length;
  return `<span>${ic('list')}${f} sujet${f>1?'s':''}</span><span>${ic('clock')}Durée ${hm(f*n.sec/60)}</span><span>${ic('check')}${p} priés</span>${n.par?`<span>${ic('user')}${esc(n.par)}${n.modif?' · '+esc(stamp24(n.modif)):''}</span>`:''}`}
function paintNightStats(){const n=curNight(),el=$('#nStats');if(n&&el)el.innerHTML=nStatsHTML(n)}
function firstEmpty(n){const N=nCount(n);for(let i=0;i<N;i++)if(!(n.items||[])[i])return i;return N}

/* ----- Dictée ----- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const dict={on:false,row:null,buf:'',interim:'',auto:ls.get('apg_dict_auto',false),rec:null,target:0};
function dictTarget(n){return dict.row!=null?dict.row:firstEmpty(n)}
const capFirst=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t;
function dictStart(row){
  if(!SR){toast(isIOS?"Pour dicter sur iPhone : touchez le crayon d'un sujet, puis le micro du clavier.":"La dictée n'est pas disponible dans ce navigateur. Utilisez Chrome, ou le micro du clavier.");return}
  dictStop(true);const n=curNight();if(!n)return;
  if(row==null&&firstEmpty(n)>=nCount(n)){toast('Limite de '+NCAP+' sujets atteinte.');return}
  const r=new SR();r.lang='fr-FR';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
  r.onresult=e=>{let fin='',int='';for(let i=e.resultIndex;i<e.results.length;i++){const x=e.results[i];if(x.isFinal)fin+=x[0].transcript;else int+=x[0].transcript}
    dict.interim=int;if(fin)dictFinal(fin);paintDict()};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){toast("Autorisez l'accès au micro pour cette application, puis réessayez.");dictStop()}
    else if(e.error==='network'){toast('La dictée a besoin d’internet.');dictStop()}};
  r.onend=()=>{if(dict.on&&dict.rec===r){try{r.start()}catch(_){}}};   // Chrome s'arrête après un silence : on relance
  Object.assign(dict,{on:true,row:row??null,buf:'',interim:'',rec:r});
  try{r.start()}catch(e){toast('Impossible de démarrer la dictée.');dict.on=false}
  render(true);
}
function dictStop(silent){const r=dict.rec;dict.rec=null;const was=dict.on;dict.on=false;if(r){try{r.stop()}catch(_){}}
  if(dict.buf.trim())dictCommit();dict.row=null;dict.interim='';if(was&&!silent)render(true)}
function dictFinal(t){
  const parts=t.split(/\s*\b(?:sujet suivant|suivant)\b[\s.,!?]*/i);
  parts.forEach((p,i)=>{p=p.trim();if(p)dict.buf=(dict.buf?dict.buf+' ':'')+p;if(i<parts.length-1)dictCommit()});
  if((dict.auto||dict.row!=null)&&dict.buf.trim())dictCommit();
}
function dictCommit(){
  const n=curNight();const tx=capFirst(dict.buf.trim().replace(/\s+/g,' '));dict.buf='';if(!n||!tx)return;
  const i=dictTarget(n);const N=nCount(n);if(i>=N){toast('Tous les numéros sont remplis.');dictStop();return}
  n.items=(n.items||[]).slice();while(n.items.length<i)n.items.push('');n.items[i]=tx;
  saveNightSoon(n);
  if(dict.row!=null){dict.row=null;dictStop();toast(`Sujet n° ${i+1} enregistré.`);return}
  render(true);const el=$('#nrow'+i);if(el)el.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function paintDict(){const el=$('#dictLive');if(el){el.hidden=!dict.on;el.innerHTML=`${esc(dict.buf)} <i>${esc(dict.interim)}</i>`}
  if(dict.on&&dict.row!=null){const r=$('#nrow'+dict.row+' .tx');if(r)r.innerHTML=`${esc(dict.buf)} <i class="muted">${esc(dict.interim)||'…'}</i>`}}

/* ----- Mode « Commencer la nuit » ----- */
const run={on:false,i:0,start:0,paused:0,pauseAt:0,iv:0,lock:null,elapsed:0};
function runList(n){return (n.items||[]).map((x,i)=>[i,x]).filter(([,x])=>x)}
async function wake(){try{if('wakeLock' in navigator&&run.on)run.lock=await navigator.wakeLock.request('screen')}catch(_){}}
function runOpen(){const n=curNight();if(!n)return;const L=runList(n);if(!L.length)return;dictStop(true);
  const pr=nPrie(n.id);let k=L.findIndex(([i])=>!pr[i]);if(k<0)k=0;
  runStart({list:L,k,sec:+n.sec||30,title:n.titre||'Nuit de prière',end:'Nuit accomplie',mark:i=>markPrie(n,i)})}
/* séance générique : list = [[numéro affiché (0 = 1er), texte, clé]] ; mark(clé) note le sujet comme prié */
function runStart(o2){if(!o2.list.length)return;
  Object.assign(run,{on:true,k:o2.k||0,start:Date.now(),paused:false,done:false,elapsed:0,list:o2.list,sec:o2.sec||30,title:o2.title,endTitle:o2.end||'Séance accomplie',mark:o2.mark||(()=>{}),after:o2.after||null});
  let o=$('#runner');if(!o){o=document.createElement('div');o.id='runner';o.setAttribute('role','dialog');o.setAttribute('aria-label','Nuit de prière en cours');document.body.appendChild(o)}
  o.hidden=false;document.body.style.overflow='hidden';wake();clearInterval(run.iv);run.iv=setInterval(runTick,250);runPaint(true)}
function runClose(){run.on=false;if(run.after)try{run.after()}catch(_){}clearInterval(run.iv);const o=$('#runner');if(o)o.hidden=true;document.body.style.overflow='';try{run.lock&&run.lock.release()}catch(_){}run.lock=null;render(true)}
function runTick(){if(!run.on||run.paused)return;const S=run.sec*1000;const t=Date.now()-run.start;
  if(t>=S){run.mark(run.list[run.k][2]??run.list[run.k][0]);if(run.k<run.list.length-1){run.k++;run.start=Date.now();try{navigator.vibrate&&navigator.vibrate(60)}catch(_){}runPaint(true)}else{run.done=true;runPaint(true);clearInterval(run.iv)}return}
  runPaint(false)}
/* séances « Prière du jour » et « Prières de la semaine » : même déroulé que la nuit */
/* valider (ou décocher) toute une séance d'un coup */
function jourIds(){const N=LOT();const out=[];dayThemes(st.day).forEach(t=>{const a=subjects(t.c);const l=lotFor(t.c,a.length);a.slice(l*N,l*N+N).forEach(x=>out.push(x.id))});return out}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='allJour'||b.id==='noneJour'){const ids=jourIds();const all=b.id==='noneJour';ids.forEach(id=>{if(all)delete prie[id];else prie[id]=true});ls.set('apg_prie_'+iso(today),prie);journalNow();render(true);toast(all?'Séance décochée.':`Séance validée : ${ids.length} sujets priés.`)}
  else if(b.id==='allCe'||b.id==='noneCe'){const i=st.ceDay;const v=dayData(i);const pk='apg_ce_'+st.week+'_'+i;const d=ls.get(pk,{});const ks=v.items.map((x,k)=>x?k:-1).filter(k=>k>=0);const all=b.id==='noneCe';
    ks.forEach(k=>{if(all)delete d[k];else d[k]=true});ls.set(pk,d);render(true);toast(all?'Séance décochée.':`Séance validée : ${ks.length} sujets priés.`)}
  else if(b.id==='allNuit'||b.id==='noneNuit'){const n=curNight();if(!n)return;const p=nPrie(n.id);const ks=(n.items||[]).map((x,k)=>x?k:-1).filter(k=>k>=0);const all=b.id==='noneNuit';
    ks.forEach(k=>{if(all)delete p[k];else p[k]=true});ls.set('apg_nprie_'+n.id,p);render(true);toast(all?'Nuit décochée.':`Nuit validée : ${ks.length} sujets priés.`)}
});
function runJour(){const N=LOT();const L=[];dayThemes(st.day).forEach(t=>{const a=subjects(t.c);const l=lotFor(t.c,a.length);a.slice(l*N,l*N+N).forEach(x=>L.push([L.length,x.text,x.id]))});
  if(!L.length)return;let k=L.findIndex(x=>!prie[x[2]]);if(k<0)k=0;
  runStart({list:L,k,sec:num('secondes',30),title:'Prière du jour',end:'Prière du jour accomplie',mark:id=>{prie[id]=true;ls.set('apg_prie_'+iso(today),prie);journalNow()}})}
function runCe(){const i=st.ceDay;const v=dayData(i);const L=v.items.map((x,k)=>[k,x,k]).filter(x=>x[1]);if(!L.length)return;
  const pk='apg_ce_'+st.week+'_'+i;const done=ls.get(pk,{});let k=L.findIndex(x=>!done[x[2]]);if(k<0)k=0;
  runStart({list:L,k,sec:num('secondes',30),title:v.titre||('Prières du '+JOURS7[i].toLowerCase()),end:'Séance accomplie',mark:j=>{const d=ls.get(pk,{});d[j]=true;ls.set(pk,d)}})}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='runJour')runJour();else if(b.id==='runCe')runCe()});
function markPrie(n,i){const p=nPrie(n.id);p[i]=true;ls.set('apg_nprie_'+n.id,p)}
function runPaint(full){const o=$('#runner');if(!o)return;const S=run.sec*1000;const L=run.list;const [idx,tx]=L[run.k];
  const left=run.paused?run.pauseLeft:Math.max(0,S-(Date.now()-run.start));const C=2*Math.PI*54;const p=1-left/S;
  const restMin=((L.length-run.k-1)*S+left)/60000;
  if(run.done){o.innerHTML=`<div class="rn-wrap rn-end">${ic('flame')}<h2>${esc(run.endTitle)}</h2><p>${L.length} sujets priés. Gloire à Dieu !</p><button class="btn primary" id="rnClose">${ic('check')}Terminer</button></div>`;return}
  if(full){o.innerHTML=`<div class="rn-wrap"><div class="rn-top"><span>${esc(run.title)}</span><button class="hbtn" id="rnClose" aria-label="Quitter">${ic('x')}</button></div>
   <div class="rn-num">Sujet <b>${idx+1}</b> <span>· ${run.k+1} / ${L.length}</span></div>
   <p class="rn-tx">${esc(tx)}</p>
   <div class="rn-ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="54"/><circle class="fg" id="rnArc" cx="60" cy="60" r="54" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}"/></svg><b id="rnSec">${Math.ceil(left/1000)}</b></div>
   <div class="rn-ctl"><button class="rbtn" id="rnPrev" aria-label="Sujet précédent">${ic('skipb')}</button><button class="rbtn big" id="rnPause" aria-label="${run.paused?'Reprendre':'Pause'}">${ic(run.paused?'play':'pause')}</button><button class="rbtn" id="rnNext" aria-label="Sujet suivant">${ic('skipf')}</button></div>
   <div class="rn-bar"><i id="rnBar" style="width:${(run.k)/L.length*100}%"></i></div><div class="rn-meta" id="rnMeta">Reste ${hm(restMin)}</div></div>`;return}
  const a=$('#rnArc');if(a)a.setAttribute('stroke-dashoffset',C*(1-p));const s=$('#rnSec');if(s)s.textContent=Math.ceil(left/1000);const m=$('#rnMeta');if(m)m.textContent='Reste '+hm(restMin);
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.closest('#runner'))return;
  if(b.id==='rnClose')runClose();
  else if(b.id==='rnPause'){if(run.paused){run.start=Date.now()-(run.sec*1000-run.pauseLeft);run.paused=false}else{run.pauseLeft=Math.max(0,run.sec*1000-(Date.now()-run.start));run.paused=true}runPaint(true)}
  else if(b.id==='rnNext'){run.mark(run.list[run.k][2]??run.list[run.k][0]);if(run.k<run.list.length-1){run.k++;run.start=Date.now();run.paused=false;runPaint(true)}else{run.done=true;runPaint(true)}}
  else if(b.id==='rnPrev'){if(run.k>0)run.k--;run.start=Date.now();run.paused=false;runPaint(true)}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&run.on)wake()});

/* ----- Événements de la page ----- */
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.closest('#runner'))return;const d=b.dataset;const n=curNight();
  try{
  if(d.nopen)openNight(d.nopen);
  else if(d.nback!==undefined){dictStop(true);st.nightId=null;st.nDelAsk=false;render(true)}
  else if(b.id==='nCreate'){const date=dv('nDate')||iso(today);const nn={id:'NUIT-'+Date.now().toString(36).toUpperCase(),date,titre:$('#nTitre').value.trim(),duree:0,sec:+$('#nSec').value||30,items:[],par:D.me};
    cacheNight(nn);upsertMeta(nn);st.nightId=nn.id;render(true);saveNightSoon(nn,true);toast('Nuit créée : écrivez ou dictez vos sujets, la durée se calcule toute seule.')}
  else if(d.nedit!==undefined){dictStop(true);st.nEdit=+d.nedit;render(true);setTimeout(()=>{const t=$('#nEdTx');if(t){t.focus();t.setSelectionRange(t.value.length,t.value.length)}},0)}
  else if(d.ncancel!==undefined){st.nEdit=null;render(true)}
  else if(d.nsave!==undefined&&n){const i=+d.nsave;const v=capFirst($('#nEdTx').value.replace(/\s+/g,' ').trim());n.items=(n.items||[]).slice();while(n.items.length<i)n.items.push('');n.items[i]=v;st.nEdit=null;saveNightSoon(n);render(true)}
  else if(d.ndel!==undefined&&n){const i=+d.ndel;st.nEdit=null;n.items=(n.items||[]).slice();n.items[i]='';const p=nPrie(n.id);delete p[i];ls.set('apg_nprie_'+n.id,p);saveNightSoon(n);render(true)}
  else if(d.nmic!==undefined){const i=+d.nmic;if(dict.on&&dict.row===i){dictStop()}else dictStart(i)}
  else if(b.id==='dictBtn'){if(dict.on&&dict.row==null)dictStop();else dictStart(null)}
  else if(b.id==='dictOk'){dictCommit();paintDict()}
  else if(b.id==='dictUndo'){dict.buf='';dict.interim='';paintDict()}
  else if(d.nall!==undefined){st.nAll=!st.nAll;render(true)}
  else if(b.id==='nGenBtn'){st.nGen=!st.nGen;st.nPaste=false;render(true)}
  else if(b.id==='ngNo'){st.nGen=false;render(true)}
  else if(b.id==='ngGo'&&n){nGenerate(n)}
  else if(b.id==='nPasteBtn'){st.nPaste=!st.nPaste;render(true);setTimeout(()=>$('#nPaste')?.focus(),0)}
  else if(b.id==='nPasteNo'){st.nPaste=false;render(true)}
  else if(b.id==='nPasteGo'&&n){const lines=$('#nPaste').value.split(/\r?\n/).map(x=>x.replace(/^\s*\d+\s*[.)\-–:]\s*/,'').trim()).filter(Boolean);const N=nCount(n);n.items=(n.items||[]).slice();let k=0,i=0;
    for(const l of lines){while(i<N&&n.items[i])i++;if(i>=N)break;while(n.items.length<i)n.items.push('');n.items[i]=capFirst(l);k++}
    st.nPaste=false;saveNightSoon(n);render(true);toast(k<lines.length?`${k} sujets ajoutés ; ${lines.length-k} n’ont pas de place (limite atteinte).`:`${k} sujets ajoutés.`)}
  else if(b.id==='nCopy'&&n){const t=(n.titre?n.titre+'\n':'')+(n.items||[]).map((x,i)=>x?`${i+1}. ${x}`:'').filter(Boolean).join('\n');try{await navigator.clipboard.writeText(t);toast('Liste copiée.')}catch(_){prompt('Copiez la liste :',t)}}
  else if(b.id==='nDelNight'){st.nDelAsk=true;render(true)}
  else if(b.id==='nDelNo'){st.nDelAsk=false;render(true)}
  else if(b.id==='nDelOk'&&n){const id=n.id;st.nDelAsk=false;st.nightId=null;D.nights=(D.nights||[]).filter(x=>x.id!==id);delete NIGHT[id];try{localStorage.removeItem('apg_nuit_'+id)}catch(_){}
    outbox=outbox.filter(x=>!(x.fn==='saveNight'&&x.a[0].id===id));saveOutbox();render(true);await act('deleteNight',[id],'Nuit supprimée.')}
  else if(d.nrun!==undefined)runOpen();
  }catch(err){}
});
document.addEventListener('change',e=>{const t=e.target;const n=curNight();
  if(t.id==='dictAuto'){dict.auto=t.checked;ls.set('apg_dict_auto',dict.auto)}
  else if(!n)return;
  else if(t.id==='nTitreEd'){n.titre=t.value.trim();saveNightSoon(n)}
  else if(t.id==='nDateEd'&&dv('nDateEd')){n.date=dv('nDateEd');saveNightSoon(n);render(true)}
  else if(t.id==='nSecEd'){n.sec=+t.value||30;saveNightSoon(n);render(true)}
});

/* ================= Chants : simple liste de titres ================= */
const CH_TYPES={Louange:{icon:'sun',col:'#D9861A'},Adoration:{icon:'crown',col:'#6C3FC2'}};
const chOf=t=>(D.songs||[]).filter(c=>c.type===t).sort((a,b)=>a.o-b.o);
function chNewId(){return 'CH-'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*100)}
function vChants(){
  const sec=T=>{const L=chOf(T);const m=CH_TYPES[T];
    return `<section class="chsec" style="--cat:${m.col}"><h3 class="chh">${ic(m.icon)}${T}<span>${L.length}</span></h3>
     <ol class="chsimple">${L.map((c,i)=>st.chEdit===c.id
       ?`<li><span class="nnum">${i+1}</span><input type="text" id="chEdT" value="${esc(c.titre)}" aria-label="Titre"><button class="btn small icon" data-chsave="${esc(c.id)}" aria-label="Enregistrer" title="Enregistrer">${ic('check')}</button><button class="btn small icon" data-chdel="${esc(c.id)}" aria-label="Supprimer" title="Supprimer">${ic('trash')}</button></li>`
       :`<li><span class="nnum">${i+1}</span><span class="cht">${esc(c.titre)}</span><button class="btn small icon" data-ched="${esc(c.id)}" aria-label="Modifier ${esc(c.titre)}" title="Modifier">${ic('pencil')}</button></li>`).join('')}</ol>
     <form class="chadd" data-chform="${T}"><input type="text" id="chNew${T}" placeholder="Ajouter un titre ${T==='Adoration'?'d’adoration':'de louange'}" autocomplete="off" aria-label="Nouveau titre ${T==='Adoration'?'d’adoration':'de louange'}"><button class="btn primary small" type="submit">${ic('plus')}Ajouter</button></form></section>`};
  return `<div class="chgrid">${sec('Louange')}${sec('Adoration')}</div>
  <div class="acts left mt"><button class="btn small" id="chCopy">${ic('copy')}Copier les deux listes</button></div>`;
}
document.addEventListener('submit',e=>{const f=e.target;if(!f.dataset||!f.dataset.chform)return;e.preventDefault();const T=f.dataset.chform;const inp=f.querySelector('input');
  const lines=inp.value.split(/\r?\n/).map(x=>x.replace(/^\s*\d+\s*[.)\-–:]\s*/,'').trim()).filter(Boolean);if(!lines.length)return;
  const L=chOf(T);let o=L.length?L[L.length-1].o:0;const added=lines.map(t=>{o+=10;return {id:chNewId(),type:T,o,titre:capFirst(t),auteur:'',ton:'',lien:'',note:'',par:D.me}});
  (D.songs=D.songs||[]).push(...added);render(true);setTimeout(()=>{const x=$('#chNew'+T);if(x)x.focus()},0);added.forEach(c=>act('saveSong',[c]).catch(()=>{}))});
document.addEventListener('paste',e=>{const t=e.target;if(!t.id||!/^chNew(Louange|Adoration)$/.test(t.id))return;const txt=(e.clipboardData||window.clipboardData).getData('text');
  if(/\n/.test(txt.trim())){e.preventDefault();t.value=txt;t.form.requestSubmit()}});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.closest('#runner'))return;const d=b.dataset;
  try{
  if(d.ched){st.chEdit=d.ched;render(true);setTimeout(()=>{const x=$('#chEdT');if(x){x.focus();x.select()}},0)}
  else if(d.chsave){const c=(D.songs||[]).find(x=>x.id===d.chsave);const t=($('#chEdT')?.value||'').trim();st.chEdit=null;if(!c||!t){render(true);return}c.titre=t;render(true);await act('saveSong',[c],'Titre modifié.')}
  else if(d.chdel){const c=(D.songs||[]).find(x=>x.id===d.chdel);D.songs=(D.songs||[]).filter(x=>x.id!==d.chdel);st.chEdit=null;render(true);await act('deleteSong',[d.chdel],c?`« ${c.titre} » supprimé.`:'')}
  else if(b.id==='chCopy'){const t=['Louange','Adoration'].map(x=>{const L=chOf(x);return L.length?x.toUpperCase()+'\n'+L.map((c,i)=>`${i+1}. ${c.titre}`).join('\n'):''}).filter(Boolean).join('\n\n');
    if(!t){toast('Aucun titre à copier.');return}try{await navigator.clipboard.writeText(t);toast('Listes copiées.')}catch(_){prompt('Copiez les listes :',t)}}
  }catch(err){}
});
document.addEventListener('keydown',e=>{if(e.target.id==='chEdT'){if(e.key==='Enter'){e.preventDefault();document.querySelector('[data-chsave]')?.click()}else if(e.key==='Escape'){st.chEdit=null;render(true)}}});

/* ================= Verrou : mot de passe d'ouverture ================= */
let unlocked=false,hiddenAt=0;
const LOCK_OPTS=[[0,'Immédiatement'],[1,'Après 1 min'],[5,'Après 5 min'],[15,'Après 15 min'],[60,'Après 1 h']];
const lockDelay=()=>{const v=ls.get('apg_lockmin',5);return LOCK_OPTS.some(o=>o[0]===v)?v:5};
async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function rememberPwd(pwd){try{const s=crypto.getRandomValues(new Uint32Array(4)).join('-');ls.set('apg_pv',{s,h:await sha(s+'|'+pwd)})}catch(_){}}
async function localCheck(pwd){const v=ls.get('apg_pv',null);if(!v)return null;try{return (await sha(v.s+'|'+pwd))===v.h}catch(_){return null}}
function lockEl(){let o=$('#lock');if(!o){o=document.createElement('div');o.id='lock';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Ouverture de l’Autel de Prière');document.body.appendChild(o)}return o}
function showLock(mode,msg){
  unlocked=false;dictStop&&dict.on&&dictStop(true);if(run.on)runClose();
  const o=lockEl();o.hidden=false;document.body.classList.add('locked');o.dataset.mode=mode;
  const create=mode==='create';
  o.innerHTML=`<form class="lk-box" id="lkForm" autocomplete="off">
    <div class="lk-logo">${$('.logo')?$('.logo').innerHTML:''}</div>
    <h2>${create?'Créez le mot de passe':'Autel de Prière'}</h2>
    <p class="lk-sub">${create?'Il protégera l’ouverture de l’outil sur tous vos appareils. Donnez-le seulement à la famille.':`Bonjour${CFG&&CFG.me?' '+esc(CFG.me):''}. Entrez le mot de passe pour ouvrir.`}</p>
    ${msg?`<p class="lk-msg">${esc(msg)}</p>`:''}
    <label class="lk-field"><span>Mot de passe</span><span class="lk-in"><input type="password" id="lkPwd" autocomplete="${create?'new-password':'current-password'}" required minlength="${create?4:1}"><button type="button" class="lk-eye" id="lkEye" aria-label="Afficher le mot de passe">${ic('eye')}</button></span></label>
    ${create?`<label class="lk-field"><span>Confirmez le mot de passe</span><span class="lk-in"><input type="password" id="lkPwd2" autocomplete="new-password" required minlength="4"></span></label>`:''}
    <button class="btn primary lk-go" id="lkGo" type="submit">${ic(create?'check':'flame')}${create?'Enregistrer et ouvrir':'Ouvrir'}</button>
    ${create?'':`<p class="lk-help">Mot de passe oublié : dans Apps Script, exécutez « reinitialiserMotDePasse », puis rouvrez l’outil pour en créer un nouveau.</p>`}
    <button type="button" class="lk-link" id="lkConn">Changer la connexion au serveur</button>
  </form>`;
  setTimeout(()=>$('#lkPwd')?.focus(),50);
}
function hideLock(){const o=$('#lock');if(o)o.hidden=true;document.body.classList.remove('locked');unlocked=true}
async function submitLock(){
  const o=$('#lock');const mode=o.dataset.mode;const pwd=$('#lkPwd').value;const btn=$('#lkGo');
  if(!pwd){toast('Entrez le mot de passe.');return}
  if(mode==='create'){if(pwd.length<4){toast('Au moins 4 caractères.');return}if(pwd!==$('#lkPwd2').value){toast('Les deux mots de passe ne sont pas identiques.');return}}
  btn.disabled=true;
  try{
    const r=await call(mode==='create'?'setPassword':'login',...(mode==='create'?['',pwd]:[pwd]));
    CFG.jeton=r.jeton;ls.set('apg_cfg',CFG);await rememberPwd(pwd);hideLock();
    if(mode==='create')toast('Mot de passe créé. Il sera demandé à chaque ouverture.');
    load();
  }catch(e){
    btn.disabled=false;
    if(e instanceof NetErr){const ok=await localCheck(pwd);
      if(ok){hideLock();load();toast('Hors ligne : ouverture avec le mot de passe enregistré sur cet appareil.');return}
      showLock(mode,ok===false?'Mot de passe incorrect.':'Pas de connexion : la première ouverture sur cet appareil demande internet.');return}
    if(e.code==='AUCUN'){showLock('create','Aucun mot de passe n’est encore défini : créez-le.');return}
    showLock(mode,e.message);
  }
}
async function start(){
  if(!CFG){showSetup();return}
  if(!CFG.jeton){try{const s=await call('authStatus');showLock(s.hasPwd?'enter':'create');}catch(e){showLock('enter',e instanceof NetErr?'Hors ligne.':e.message)}return}
  showLock('enter');
}
document.addEventListener('submit',e=>{if(e.target.id==='lkForm'){e.preventDefault();submitLock()}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.closest('#lock'))return;
  if(b.id==='lkEye'){const i=$('#lkPwd');i.type=i.type==='password'?'text':'password';b.setAttribute('aria-label',i.type==='password'?'Afficher le mot de passe':'Masquer le mot de passe')}
  else if(b.id==='lkConn'){hideLock();unlocked=false;D.loaded=false;showSetup()}});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){hiddenAt=Date.now();return}
  if(unlocked&&CFG&&CFG.jeton!==undefined&&hiddenAt&&Date.now()-hiddenAt>=lockDelay()*60000)showLock('enter');
});
/* Changement du mot de passe (Réglages) */
function pwdCard(){return `<div class="card"><b class="ctitle">${ic('lock')}Mot de passe d’ouverture</b>
  <p class="muted mt">Demandé à chaque ouverture, sur tous les appareils. Le changer ici le change pour toute la famille : chacun devra saisir le nouveau.</p>
  <div class="row mt"><label class="f">Mot de passe actuel<input type="password" id="pwOld" autocomplete="current-password"></label>
  <label class="f">Nouveau mot de passe<input type="password" id="pwNew" autocomplete="new-password" minlength="4"></label>
  <label class="f">Confirmez le nouveau<input type="password" id="pwNew2" autocomplete="new-password"></label></div>
  <div class="row mt"><button class="btn primary" id="pwSave" style="flex:0 0 auto">${ic('check')}Changer le mot de passe</button>
  <label class="f" style="flex:0 1 200px">Verrouiller quand l’appli est quittée<select id="lockMin">${LOCK_OPTS.map(([v,l])=>`<option value="${v}" ${v===lockDelay()?'selected':''}>${l}</option>`).join('')}</select></label>
  <button class="btn" id="lockNow" style="flex:0 0 auto">${ic('lock')}Verrouiller maintenant</button></div></div>`}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='lockNow')showLock('enter');
  else if(b.id==='pwSave'){const o=$('#pwOld').value,n=$('#pwNew').value,n2=$('#pwNew2').value;
    if(!o||!n){toast('Remplissez l’ancien et le nouveau mot de passe.');return}if(n.length<4){toast('Le nouveau mot de passe doit avoir au moins 4 caractères.');return}if(n!==n2){toast('La confirmation ne correspond pas.');return}
    b.disabled=true;try{const r=await call('setPassword',o,n);CFG.jeton=r.jeton;ls.set('apg_cfg',CFG);await rememberPwd(n);['pwOld','pwNew','pwNew2'].forEach(i=>{const x=$('#'+i);if(x)x.value=''});toast('Mot de passe changé. Les autres appareils demanderont le nouveau.')}
    catch(err){toast(err instanceof NetErr?'Changer le mot de passe demande internet.':err.message)}finally{b.disabled=false}}});
document.addEventListener('change',e=>{if(e.target.id==='lockMin'){ls.set('apg_lockmin',+e.target.value);toast('Réglage enregistré sur cet appareil.')}});

/* ================= Reformuler comme moi : apprendre de mes retouches ================= */
const toks=t=>String(t||'').trim().split(/\s+/).filter(Boolean);
const escRe=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const REF_RX=/\(\s*[^()]*\d+\s*[:.,]\s*\d+[^()]*\)/;
function hunks(a,b){const n=a.length,m=b.length;if(!n||!m||n*m>60000)return null;
  const L=Array.from({length:n+1},()=>new Uint16Array(m+1));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=a[i]===b[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const H=[];let i=0,j=0,c=null;
  while(i<n||j<m){if(i<n&&j<m&&a[i]===b[j]){if(c){H.push(c);c=null}i++;j++}
    else{if(!c)c={i,from:[],to:[]};if(j<m&&(i===n||L[i][j+1]>=L[i+1][j])){c.to.push(b[j]);j++}else{c.from.push(a[i]);i++}}}
  if(c)H.push(c);return H}
/* Règles apprises à partir des paires (texte d'origine → texte retouché) */
function learnRules(){
  const R={};const add=(k,r,id)=>{if(!R[k])R[k]={...r,ids:new Set()};R[k].ids.add(id)};
  (D.pairs||[]).forEach(([id,orig])=>{const x=D.subj[id];if(!x)return;const a=toks(orig),b=toks(x.text);const H=hunks(a,b);if(!H)return;
    const changed=H.reduce((s,h)=>s+h.from.length,0);if(changed>Math.max(6,a.length*0.6))return;      // réécriture complète : rien de général à apprendre
    H.forEach(h=>{const F=h.from.join(' '),T=h.to.join(' ');
      if(REF_RX.test(F)&&!/\(/.test(T)){add('ref',{kind:'ref'},id);return}
      if(h.i===0){add('s|'+F+'|'+T,{kind:'start',from:F,to:T},id);return}
      if(h.i+h.from.length===a.length&&!F){add('e||'+T,{kind:'end',from:'',to:T},id);return}
      if(!F){const p=a[h.i-1];add('w|'+p+'|'+p+' '+T,{kind:'word',from:p,to:p+' '+T},id);return}
      if(h.from.length<=6)add('w|'+F+'|'+T,{kind:'word',from:F,to:T},id)})});
  return Object.values(R).map(r=>({...r,support:r.ids.size})).sort((x,y)=>y.support-x.support||(x.kind==='start'?-1:1)).slice(0,30)}
function applyRule(t,r){
  if(r.kind==='ref')return t.replace(new RegExp('\\s*'+REF_RX.source,'g'),'').replace(/\s+([.,;:!?])/g,'$1').replace(/\s{2,}/g,' ').trim();
  if(r.kind==='start'){if(!r.from)return t.startsWith(r.to)?t:r.to+' '+t;
    const lo=t.toLowerCase(),f=r.from.toLowerCase();if(lo===f)return r.to;if(lo.startsWith(f+' '))return (r.to?r.to+' ':'')+t.slice(r.from.length).trimStart();return t}
  if(r.kind==='end'){return t.endsWith(r.to)?t:t.replace(/\s+$/,'')+' '+r.to}
  const re=new RegExp('(^|\\s)'+escRe(r.from)+'(?=\\s|$)','g');return t.replace(re,(m,p)=>p+r.to).replace(/\s{2,}/g,' ').trim()}
function ruleLabel(r){if(r.kind==='ref')return 'Retirer les références bibliques entre parenthèses';
  if(r.kind==='start')return r.from?`Au début : « ${r.from} » → « ${r.to||'(rien)'} »`:`Ajouter au début : « ${r.to} »`;
  if(r.kind==='end')return `Ajouter à la fin : « ${r.to} »`;return `Remplacer « ${r.from} » par « ${r.to||'(rien)'} »`}
function rwTargets(){const sc=st.rwScope||'all';return Object.values(D.subj).filter(x=>x.statut==='Actif'&&!x.aj&&(sc==='all'||(sc==='theme'?x.code===st.thCode:(byCode(x.code)||{}).d===st.thDay)))}
function rwPlan(rules){const out=[];rwTargets().forEach(x=>{let t=x.text;rules.forEach(r=>{t=applyRule(t,r)});t=capFirst(t);if(t!==x.text)out.push({id:x.id,old:x.text,text:t})});return out}
let RW=null;   // règles apprises, recalculées à l'ouverture du panneau
function rwCard(){
  const nP=(D.pairs||[]).length;
  if(!st.rw)return `<div class="card rwc"><div class="row" style="align-items:center"><div style="flex:3 1 220px"><b class="ctitle">${ic('wand')}Reformuler comme moi</b><p class="muted" style="margin:4px 0 0">${nP?`${nP} sujet${nP>1?'s':''} retouché${nP>1?'s':''} par vous : l’application peut refaire la même chose sur les autres.`:'Retouchez quelques sujets avec le crayon : l’application apprendra votre façon de formuler.'}</p></div><button class="btn primary" id="rwOpen" style="flex:0 0 auto" ${nP?'':'disabled'}>${ic('wand')}Analyser mes retouches</button></div>
   ${D.rewrite?`<p class="muted mt" style="margin-bottom:0">Dernière reformulation : ${esc(stamp24(D.rewrite.date))}, ${D.rewrite.n} sujet(s). <button class="btn small" id="rwUndo">${ic('undo')}Annuler</button></p>`:''}</div>`;
  if(!RW)RW=learnRules().map(r=>({...r,on:r.support>=2||r.kind==='start'||r.kind==='ref'}));
  const on=RW.filter(r=>r.on);const plan=rwPlan(on);const ex=plan.slice(0,3);
  return `<div class="card rwc open"><b class="ctitle">${ic('wand')}Reformuler comme moi</b>
   <p class="muted mt">J’ai comparé vos ${nP} retouche${nP>1?'s':''} avec les textes d’origine. Voici ce que vous changez. Cochez ce qu’il faut refaire sur les sujets que vous n’avez pas encore ajustés (vos sujets retouchés ne sont jamais modifiés).</p>
   ${RW.length?`<div class="rwlist">${RW.map((r,k)=>{const n=rwTargets().filter(x=>applyRule(x.text,r)!==x.text).length;
     return `<label class="rwr"><input type="checkbox" data-rw="${k}" ${r.on?'checked':''}><span><b>${esc(ruleLabel(r))}</b><small class="muted">vu dans ${r.support} retouche${r.support>1?'s':''} · concerne ${n.toLocaleString('fr-FR')} sujet${n>1?'s':''}</small></span></label>`}).join('')}</div>`
     :`<p class="muted note">Vos retouches sont des réécritures complètes : aucune règle générale n’en ressort. Retouchez de la même façon 2 ou 3 sujets (par ex. le même début de phrase) pour que l’application la reconnaisse.</p>`}
   <div class="row mt"><label class="f">Où appliquer<select id="rwScope"><option value="all" ${st.rwScope==='all'||!st.rwScope?'selected':''}>Tous les thèmes</option><option value="day" ${st.rwScope==='day'?'selected':''}>Thèmes du ${esc(String(st.thDay).toLowerCase())}</option><option value="theme" ${st.rwScope==='theme'?'selected':''}>Ce thème seulement</option></select></label></div>
   ${ex.length?`<div class="rwex"><b class="muted note">Aperçu (${plan.length.toLocaleString('fr-FR')} sujet${plan.length>1?'s':''} changeront)</b>${ex.map(c=>`<div class="rwpair"><s>${esc(c.old)}</s><span>${esc(c.text)}</span></div>`).join('')}</div>`:''}
   <div class="acts left mt"><button class="btn primary" id="rwGo" ${plan.length?'':'disabled'}>${ic('check')}Appliquer à ${plan.length.toLocaleString('fr-FR')} sujet${plan.length>1?'s':''}</button><button class="btn" id="rwClose">Fermer</button>
   ${D.rewrite?`<button class="btn" id="rwUndo">${ic('undo')}Annuler la dernière (${D.rewrite.n})</button>`:''}</div>
   <p class="muted note">Chaque reformulation est gardée dans la feuille REFORMULATIONS (ancien et nouveau texte) et peut être annulée.</p></div>`;
}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.id==='rwOpen'){st.rw=true;RW=null;render(true)}
  else if(b.id==='rwClose'){st.rw=false;render(true)}
  else if(b.id==='rwGo'){const rules=(RW||[]).filter(r=>r.on);const plan=rwPlan(rules);if(!plan.length)return;b.disabled=true;
    try{const r=await act('applyRewrite',[plan.map(c=>({id:c.id,text:c.text,code:(D.subj[c.id]||{}).code})),rules.map(ruleLabel).join(' ; ')]);
      if(r&&r.n){plan.forEach(c=>{const x=D.subj[c.id];if(x)x.text=c.text});D.rewrite={lot:r.lot,date:r.date,n:r.n};reindex();st.rw=false;render(true);toast(`${r.n} sujet${r.n>1?'s':''} reformulé${r.n>1?'s':''}. Vous pouvez annuler.`)}}
    catch(err){b.disabled=false;if(err instanceof NetErr)toast('La reformulation demande internet.')}}
  else if(b.id==='rwUndo'){b.disabled=true;try{const r=await act('undoRewrite',[]);toast(`${r&&r.n||0} sujet(s) remis comme avant.`);D.rewrite=null;await load()}catch(err){b.disabled=false}}
});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.rw!==undefined&&RW){RW[+t.dataset.rw].on=t.checked;render(true)}else if(t.id==='rwScope'){st.rwScope=t.value;render(true)}});

/* ================= Affichage : taille et type de police (réglage de chaque appareil) ================= */
const FONTS={lexend:['Lexend (par défaut)',"'Lexend',system-ui,sans-serif"],sansation:['Sansation (si installée sur l’appareil)',"'Sansation','Lexend',system-ui,sans-serif"],
 atkinson:['Atkinson (très lisible)',"'Atkinson Hyperlegible','Lexend',sans-serif"],nunito:['Nunito (arrondie)',"'Nunito','Lexend',sans-serif"],
 georgia:['Georgia (classique, avec empattements)',"Georgia,'Times New Roman',serif"],arial:['Arial',"Arial,Helvetica,sans-serif"],verdana:['Verdana (large)',"Verdana,Geneva,sans-serif"]};
const fontCfg=()=>{const f=ls.get('apg_font',{s:15,f:'sansation'});return {s:Math.max(12,Math.min(24,+f.s||15)),f:FONTS[f.f]?f.f:'sansation',w:f.w==='centre'?'centre':'plein'}};
function applyFont(){const f=fontCfg();document.body&&document.body.classList.toggle('centre',f.w==='centre');document.documentElement.style.setProperty('--font',FONTS[f.f][1]);document.documentElement.style.fontSize=(16*f.s/15).toFixed(2)+'px'}
applyFont();
function fontCard(){const f=fontCfg();return `<div class="card"><b class="ctitle">${ic('pencil')}Affichage du texte</b>
  <div class="row mt"><label class="f" style="flex:2 1 220px"><span>Taille du texte : <b id="fsVal">${f.s}</b> px</span><input type="range" id="fsSize" min="12" max="24" step="1" value="${f.s}"></label>
  <label class="f" style="flex:2 1 220px">Type de police<select id="fsFam">${Object.entries(FONTS).map(([k,v])=>`<option value="${k}" ${k===f.f?'selected':''}>${esc(v[0])}</option>`).join('')}</select></label></div>
  <div class="row mt"><label class="f" style="flex:2 1 220px">Largeur de l’affichage<select id="fsWidth"><option value="plein" ${f.w==='plein'?'selected':''}>Tout l’écran (conseillé)</option><option value="centre" ${f.w==='centre'?'selected':''}>Colonne centrée</option></select></label></div>
  <div class="fontprev">1. Disons au Seigneur : fais que le feu de l’Esprit brûle sans s’éteindre sur notre maison.</div>
  <div class="acts left mt"><button class="btn small" id="fsReset">${ic('undo')}Taille normale</button></div>
  <p class="muted note">Réglage propre à cet appareil (téléphone et PC peuvent être différents).</p></div>`}
document.addEventListener('input',e=>{if(e.target.id==='fsSize'){const f=fontCfg();f.s=+e.target.value;ls.set('apg_font',f);applyFont();const v=$('#fsVal');if(v)v.textContent=f.s}});
document.addEventListener('change',e=>{if(e.target.id==='fsWidth'){const f=fontCfg();f.w=e.target.value;ls.set('apg_font',f);applyFont();toast('Largeur appliquée sur cet appareil.')}else if(e.target.id==='fsFam'){const f=fontCfg();f.f=e.target.value;ls.set('apg_font',f);applyFont();toast('Police appliquée sur cet appareil.')}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.id==='fsReset'){const f=fontCfg();f.s=15;ls.set('apg_font',f);applyFont();render(true)}});

/* ================= Réglages ================= */
function vReglages(){
  const s=SET();const nb=Object.keys(D.subj).length;
  return `${fontCard()}<div class="card"><b class="ctitle">${ic('home')}Foyer</b><div class="row mt"><label class="f" style="flex:2 1 260px">Nom affiché en haut<input type="text" id="setFoyer" value="${esc(s.foyer||'')}"></label></div></div>
  <div class="card"><b class="ctitle">${ic('clock')}Rythme de prière</b><div class="row mt"><label class="f">Début de la rotation (lundi du lot 1)<input type="text" inputmode="numeric" autocomplete="off" placeholder="jj/mm/aa" maxlength="8" data-date id="setDeb" value="${fmt(esc(s.debut||''))}"></label><label class="f">Secondes par sujet<input type="number" id="setSec" min="10" max="120" value="${num('secondes',30)}"></label><label class="f">Sujets par lot<input type="number" id="setLot" min="3" max="30" value="${LOT()}"></label></div>
   <p class="muted mt">Chaque semaine, chaque thème passe au lot suivant, puis revient au lot 1. Les flèches ‹ › d'un thème décalent son lot sur cet appareil seulement.</p><button class="btn" id="resetOff">Remettre tous les lots à la rotation normale</button></div>
  <div class="card"><b class="ctitle">${ic('flame')}Intention de chaque jour</b><p class="muted">Décochez « communs » pour les jours sans les thèmes communs.</p>
   <div class="weekgrid">${DAYS.map(d=>`<label class="f">${d.charAt(0)+d.slice(1).toLowerCase()} <span style="font-weight:400"><input type="checkbox" data-comm="${d}" ${sansCommuns().includes(d)?'':'checked'}> communs</span><input type="text" data-note="${d}" value="${esc(s['note_'+d]||'')}" placeholder="ex. Combats pour le culte"></label>`).join('')}</div></div>
  <div class="card"><b class="ctitle">${ic('tag')}Catégories de thèmes</b><div class="chips mt">${catsList().map(c=>{const used=D.themes.filter(x=>x.k===c&&x.statut!=='Retiré').length;return `<span class="chip${c==='COMBATS'?' c':''}">${esc(c)} · ${used}${!used?` <button class="btn small" data-delcat="${esc(c)}" aria-label="Supprimer ${esc(c)}">×</button>`:''}</span>`}).join('')}</div>
   <div class="row mt"><label class="f" style="flex:2 1 220px">Nouvelle catégorie<input type="text" id="catNew" placeholder="ex. MALADES, VOYAGES"></label><button class="btn primary" id="catAdd" style="flex:0 0 auto">Ajouter</button></div></div>
  <div class="card"><b class="ctitle">${ic('church')}Programme de l'église</b><div class="row mt"><label class="f">Jour d'où viennent les sujets générés<select id="setSrc">${DAYS.map(d=>`<option ${d===(s.sourceEglise||'SAMEDI')?'selected':''}>${d}</option>`).join('')}</select></label></div>
   <p class="muted mt">Types d'activités : ${list_('evTypes').map(x=>`<span class="chip">${esc(x)} <button class="btn small" data-deltype="${esc(x)}" aria-label="Supprimer ${esc(x)}">×</button></span>`).join(' ')}</p></div>
  ${pwdCard()}
  <div class="card"><b class="ctitle">${ic('link')}Application et connexion</b>
   <div class="row mt"><label class="f" style="flex:2 1 220px">Prénom sur cet appareil (journal de prière)<input type="text" id="setMe" value="${esc((CFG&&CFG.me)||'')}"></label></div>
   <p class="mt"><b>Connexion au serveur :</b> ${hb.at?(hb.ok?`<span style="color:var(--ok);font-weight:700">connecté</span>, vérifié à ${hm24(new Date(hb.at))}`:`<span style="color:#D33F49;font-weight:700">injoignable</span> depuis ${hm24(new Date(hb.at))}`):'pas encore vérifiée'} <button class="btn small" id="testConn">${ic('refresh')}Tester maintenant</button></p>
   <p><b>Dernière synchronisation :</b> ${lastWrite()&&lastWrite().ts?`${esc(lastWrite().par||'quelqu’un')}, ${esc(syncLong(lastWrite().ts))}`:'aucune modification envoyée pour l’instant'}</p>
   <p class="muted">Cet appareil a vérifié la feuille ${esc(syncLong(lastSync()))}.</p>
   <p class="muted">Serveur : …${esc(String(CFG&&CFG.url||'').slice(-18))} · ${outbox.length?outbox.length+' action(s) en attente d\'envoi':'aucune action en attente'} · ${standalone()?'application installée':'ouverte dans le navigateur'}.</p>
   <div class="acts left mt">${standalone()?'':'<button class="btn primary" id="instBtn">'+ic('download')+'Installer sur cet appareil</button>'}<button class="btn" id="invCopy">${ic('link')}Copier le lien d'invitation</button>${navigator.share?'<button class="btn" id="invShare">'+ic('share')+'Partager le lien</button>':''}<button class="btn" id="cfChange">${ic('refresh')}Changer la connexion</button></div>
   <p class="muted note mt">Le lien d'invitation contient l'adresse et la clé : envoyez-le seulement aux membres de la famille (par ex. votre conjoint). Sur iPhone : ouvrez le lien dans Safari, puis Partager > « Sur l'écran d'accueil ».</p></div>
  <div class="card"><b class="ctitle">${ic('layers')}Données</b><p class="muted">${TH().length} thèmes actifs · ${nb.toLocaleString('fr-FR')} sujets dans la feuille · ${D.exauces.length} exaucements. Connecté en tant que ${esc(D.me)}.</p>
   <p class="muted">Tout est enregistré dans la feuille Google Sheets de votre Drive ; une copie est gardée sur l'appareil pour prier sans réseau. Pour une sauvegarde : dans la feuille, Fichier > Télécharger > Microsoft Excel.</p></div>`;
}

/* ================= Rendu ================= */
const TABS={jour:['Prière du jour','flame'],nuit:['Nuit de prière','moon'],chants:['Louange et adoration','music'],themes:['Thèmes et sujets','book'],exauces:['Sujets exaucés','star'],eglise:["Programme de l'église",'church'],reglages:['Réglages','sliders']};
const KEEP=['ngKey','chNewLouange','chNewAdoration','pwOld','pwNew','pwNew2','chNew','chNewA','chBulkTx','chEdT','chEdA','chEdK','chEdL','chEdN','nTitre','nPaste','nEdTx','nTitreEd','setMe','cfUrl','cfKey','cfMe','edTx','tem','remp','temd','ceTx','ceTitre','ceCond','evTi','evS','evR','evTn','gName','gCatNew','libTx','libTem','catNew','setFoyer'];
function hdr(){$('#hdrSub').textContent=SET().foyer||'Notre foyer'}
function render(force){
  if(!D.loaded)return;hdr();
  const ae=document.activeElement;if(!force&&ae&&(KEEP.includes(ae.id)||(ae.dataset&&ae.dataset.note!==undefined)))return;
  const keep=ae&&['q','newTx','exQ'].includes(ae.id)?[ae.id,ae.selectionStart]:null;
  document.querySelectorAll('nav.tabs button').forEach(x=>x.setAttribute('aria-selected',x.dataset.tab===st.tab));
  const g=$('#gear');if(g)g.classList.toggle('on',st.tab==='reglages');
  $('#pagehead').innerHTML=st.tab==='jour'?vHero():`<div class="pagehead">${ic(TABS[st.tab][1])}<h2>${TABS[st.tab][0]}</h2></div>`;
  $('#view').innerHTML=({jour:vJour,nuit:vNuit,chants:vChants,themes:vThemes,exauces:vExauces,eglise:vEglise,reglages:vReglages}[st.tab]||vJour)();
  if(keep){const e=document.getElementById(keep[0]);if(e){e.focus();try{e.setSelectionRange(keep[1],keep[1])}catch(_){}}}
}
function findSubj(id){const s=D.subj[id];return s?[byCode(s.code)||{t:'',c:s.code},s]:[null,null]}
function journalNow(){if(st.day!==todayDay())return;const N=LOT();let tot=0,f=0;dayThemes(st.day).forEach(x=>{const a=subjects(x.c);const l=lotFor(x.c,a.length);a.slice(l*N,l*N+N).forEach(s=>{tot++;if(prie[s.id])f++})});
  D.journal[String(today.getDate())]={f,t:tot};clearTimeout(journalNow.h);journalNow.h=setTimeout(()=>quiet('logJournal',[iso(today),f,tot]),2000)}
function saveSet(o){Object.assign(D.settings,o);render(true);return act('saveSettings',[o])}

/* ================= Événements ================= */
document.querySelector('nav.tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(!b)return;const fa=document.activeElement;if(fa&&fa.matches&&fa.matches('input,textarea'))fa.blur();st.tab=b.dataset.tab;ls.set('apg_tab',st.tab);render(true)});
$('#refresh').addEventListener('click',()=>load());
$('#gear').addEventListener('click',()=>{const fa=document.activeElement;if(fa&&fa.blur)fa.blur();st.tab=st.tab==='reglages'?'jour':'reglages';ls.set('apg_tab',st.tab);window.scrollTo(0,0);render(true)});
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||b.closest('nav.tabs')||b.id==='refresh')return;const d=b.dataset;
  const fa=document.activeElement;if(fa&&fa!==b&&fa.matches&&fa.matches('input,textarea'))fa.blur();
  try{
  if(d.day){st.day=d.day;render(true)}
  else if(d.lot){lotOff[d.lot]=(lotOff[d.lot]||0)+(+d.d);ls.set('apg_lotoff',lotOff);render(true)}
  else if(d.exa){st.open=st.open===d.exa?null:d.exa;st.edit=null;render(true);setTimeout(()=>$('#tem')?.focus(),0)}
  else if(d.cancel!==undefined){st.open=null;st.edit=null;render(true)}
  else if(d.conf){const[t,x]=findSubj(d.conf);if(!x)return;const rp=$('#remp').value.trim(),dt=dv('temd')||iso(today),nt=$('#tem').value.trim();st.open=null;
    x.statut='Exaucé';x.dstatut=dt;D.exauces.push({date:dt,id:x.id,code:x.code,theme:t.t,text:x.text,note:nt,remplace:rp,par:D.me});reindex();render(true);
    const created=await act('setStatut',[x.id,'Exaucé',{date:dt,note:nt,remplacement:rp,theme:t.t,code:x.code}],rp?'Gloire à Dieu ! Sujet exaucé et remplacé.':'Gloire à Dieu ! Sujet noté comme exaucé.');
    if(created){D.subj[created[0]]={id:created[0],code:created[1],text:created[2],prio:created[3],statut:created[4],ordre:created[5],dstatut:''};reindex();render(true)}}
  else if(d.edit){st.edit=st.edit===d.edit?null:d.edit;st.open=null;render(true);setTimeout(()=>$('#edTx')?.focus(),0)}
  else if(d.edsave){const x=D.subj[d.edsave];if(!x)return;const nx=$('#edTx').value.trim(),np=$('#edPrio').checked?1:0;if(!nx){toast('Le sujet ne peut pas être vide.');return}st.edit=null;if(nx!==x.text&&!x.aj){if(!(D.pairs||[]).some(p=>p[0]===x.id))(D.pairs=D.pairs||[]).push([x.id,x.text]);x.aj=1;RW=null}x.text=nx;x.prio=np;reindex();render(true);await act('editSubject',[x.id,nx,np,x.code],'Sujet modifié.')}
  else if(d.ret){const x=D.subj[d.ret];if(!x)return;x.statut='Retiré';x.dstatut=iso(today);reindex();render(true);await act('setStatut',[x.id,'Retiré',{code:x.code}],'Sujet retiré de la prière.')}
  else if(d.restore){const x=D.subj[d.restore];if(x){x.statut='Actif';x.dstatut=''}D.exauces=D.exauces.filter(s=>s.id!==d.restore);reindex();render(true);await act('setStatut',[d.restore,'Actif',{code:(D.subj[d.restore]||{}).code||((D.exauces||[]).find(e=>e.id===d.restore)||{}).code}],'Sujet remis en prière.')}
  else if(d.delex){D.exauces=D.exauces.filter(s=>s.id!==d.delex);render(true);await act('deleteExauce',[d.delex])}
  else if(b.id==='addBtn'){const tx=$('#newTx').value.trim();if(!tx){toast('Écrivez le sujet avant de l’ajouter.');return}const pr=$('#newPrio').checked?1:0;$('#newTx').value='';
    const r=await act('addSubjects',[[{code:st.thCode,text:tx,prio:pr}]],'Sujet ajouté.');(r||[]).forEach(s=>D.subj[s[0]]={id:s[0],code:s[1],text:s[2],prio:s[3],statut:s[4],ordre:s[5],dstatut:''});reindex();render(true)}
  else if(b.id==='libAdd'){const tx=$('#libTx').value.trim();if(!tx){toast('Décrivez l’exaucement.');return}const dt=dv('libD')||iso(today),nt=$('#libTem').value.trim();
    const id=await act('addTemoignage',[tx,dt,nt],'Témoignage enregistré.');D.exauces.push({date:dt,id,code:'',theme:'',text:tx,note:nt,remplace:'',par:D.me});render(true)}
  else if(b.id==='gNew'){st.gest='new';render(true);setTimeout(()=>$('#gName')?.focus(),0)}
  else if(b.id==='gEdit'){st.gest='edit';render(true)}
  else if(b.id==='gClose'){st.gest=null;render(true)}
  else if(b.id==='gDel'){st.gest='del';render(true)}
  else if(b.id==='gCreate'){const n=$('#gName').value.trim();if(!n){toast('Donnez un nom au thème.');return}const d0=$('#gDay').value;const k0=await pickCat();
    const code=await act('saveTheme',[{jour:d0,cat:k0,titre:n,statut:'Actif',ordre:(DAYS.indexOf(d0)+2)*1000+900}],'Thème créé. Ajoutez-y des sujets.');D.themes.push({c:code,d:d0,o:(DAYS.indexOf(d0)+2)*1000+900,k:k0,t:n,statut:'Actif'});st.gest=null;st.thDay=d0;st.thCode=code;render(true)}
  else if(b.id==='gSave'){const t0=byCode(st.thCode);if(!t0)return;const n=$('#gName').value.trim()||t0.t,d0=$('#gDay').value,k0=await pickCat();const moved=d0!==t0.d;Object.assign(t0,{t:n,d:d0,k:k0});st.gest=null;st.thDay=d0;render(true);
    await act('saveTheme',[{code:t0.c,jour:d0,cat:k0,titre:n}],moved?'Thème déplacé au '+d0.toLowerCase()+'.':'Thème enregistré.')}
  else if(b.id==='gDelOk'){const t0=byCode(st.thCode);if(!t0)return;t0.statut='Retiré';st.gest=null;st.thCode=null;render(true);await act('saveTheme',[{code:t0.c,statut:'Retiré'}],'Thème retiré.')}
  else if(d.unhide){const t0=byCode(d.unhide);if(!t0)return;t0.statut='Actif';render(true);await act('saveTheme',[{code:t0.c,statut:'Actif'}],'Thème rétabli.')}
  else if(d.move){const t0=byCode(st.thCode);if(!t0)return;const list=TH().filter(x=>x.d===t0.d);const i=list.findIndex(x=>x.c===t0.c),j=i+(+d.move);if(j<0||j>=list.length)return;
    [list[i],list[j]]=[list[j],list[i]];const base=(DAYS.indexOf(t0.d)+2)*1000;list.forEach((x,k)=>x.o=base+k*10);render(true);await act('saveTheme',[{code:list[i].c,ordre:list[i].o}]);await act('saveTheme',[{code:list[j].c,ordre:list[j].o}]);
    for(const x of list)if(x!==list[i]&&x!==list[j])await call('saveTheme',{code:x.c,ordre:x.o})}
  else if(b.id==='impCancel'){st.imp=null;render(true)}
  else if(b.id==='impGo'){const I=st.imp;const ok=I.rows.filter(r=>!r.dup);I.busy=true;render(true);
    const items=ok.map(r=>({code:impTarget(r),text:r.text,prio:r.prio==null?(I.prio?1:0):(r.prio?1:0)}));let n=0;
    for(let k=0;k<items.length;k+=200){const r=await act('addSubjects',[items.slice(k,k+200)]);(r||[]).forEach(s=>{D.subj[s[0]]={id:s[0],code:s[1],text:s[2],prio:s[3],statut:s[4],ordre:s[5],dstatut:''};n++})}
    st.imp=null;reindex();toast(n+' sujets importés.');render(true)}
  else if(b.id==='catAdd'){const nw=$('#catNew').value.trim().toUpperCase();if(!nw){toast('Écrivez le nom de la catégorie.');return}if(catsList().includes(nw)){toast('Cette catégorie existe déjà.');return}await saveSet({categories:[...catsList(),nw].join(',')});toast('Catégorie ajoutée.')}
  else if(d.delcat){await saveSet({categories:catsList().filter(c=>c!==d.delcat).join(',')})}
  else if(d.deltype){await saveSet({evTypes:list_('evTypes').filter(x=>x!==d.deltype).join(',')})}
  else if(b.id==='resetOff'){Object.keys(lotOff).forEach(k=>delete lotOff[k]);ls.set('apg_lotoff',lotOff);toast('Rotation normale rétablie.');render(true)}
  /* église */
  else if(d.ceseg){st.ceSeg=d.ceseg;render(true)}
  else if(d.ceday!==undefined){st.ceDay=+d.ceday;st.ceEdit=null;st.ceConfirm=null;render(true)}
  else if(d.wkmove){const m=new Date(st.week+'T00:00');m.setDate(m.getDate()+7*(+d.wkmove));st.week=iso(m);st.ceEdit=null;st.ceConfirm=null;D.week={};render(true);await loadWeek();render(true)}
  else if(d.ceedit!==undefined){st.ceEdit=+d.ceedit;render(true);setTimeout(()=>{const x=$('#ceTx');if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length)}},0)}
  else if(d.cecancel!==undefined){st.ceEdit=null;render(true)}
  else if(d.cesave!==undefined){const k=+d.cesave;const v=dayData(st.ceDay);v.items[k]=$('#ceTx').value.trim();st.ceEdit=null;await saveDayLocal(st.ceDay,{items:v.items})}
  else if(d.ceclear!==undefined){const v=dayData(st.ceDay);v.items[+d.ceclear]='';await saveDayLocal(st.ceDay,{items:v.items})}
  else if(d.cegen1!==undefined){const k=+d.cegen1;const v=dayData(st.ceDay);const g=genSubjects(st.ceDay+k*13,1,v.items.filter(Boolean));if(!g||!g.length){toast('Aucun sujet disponible pour la génération.');return}v.items[k]=g[0];await saveDayLocal(st.ceDay,{items:v.items})}
  else if(b.id==='ceFill'||b.id==='ceRegenOk'){const v=dayData(st.ceDay);const want=Math.max(1,Math.min(500,+($('#ceN')?.value)||20));ls.set('apg_cen',want);
    if(b.id==='ceRegenOk'){const c=v.items.filter(Boolean).length;v.items=Array(c||want).fill('')}else{const holes=v.items.map((x,k)=>x?-1:k).filter(k=>k>=0).length;for(let q=holes;q<want;q++)v.items.push('')}
    st.ceConfirm=null;const empt=v.items.map((x,k)=>x?-1:k).filter(k=>k>=0);
    const g=genSubjects(st.ceDay,empt.length,v.items.filter(Boolean));if(!g){toast('Aucun thème pour le jour choisi comme source (Réglages).');render(true);return}empt.forEach((k,j)=>{if(g[j])v.items[k]=g[j]});await saveDayLocal(st.ceDay,{items:v.items});toast(Math.min(g.length,empt.length)+' sujets générés.')}
  else if(b.id==='ceRegen'){st.ceConfirm='regen';render(true)}
  else if(b.id==='ceClearAll'){st.ceConfirm='clear';render(true)}
  else if(b.id==='ceNo'){st.ceConfirm=null;render(true)}
  else if(b.id==='ceClearOk'){st.ceConfirm=null;ls.set('apg_ce_'+st.week+'_'+st.ceDay,{});await saveDayLocal(st.ceDay,{items:[]});toast('Sujets effacés.')}
  else if(b.id==='ceCopyPrev'){const m=new Date(st.week+'T00:00');m.setDate(m.getDate()-7);const pw=await call('getWeek',iso(m));const pv=pw[st.ceDay];if(!pv||!(pv.items||[]).some(Boolean)){toast('Rien à reprendre la semaine précédente pour ce jour.');return}
    await saveDayLocal(st.ceDay,{titre:pv.titre||'',cond:pv.cond||'',items:pv.items});toast('Sujets repris de la semaine précédente.')}
  else if(b.id==='evAdd'){const ti=$('#evTi').value.trim();if(!ti){toast('Donnez un titre à l’activité.');return}let ty=$('#evTn').value.trim();if(ty){if(!list_('evTypes').includes(ty))saveSet({evTypes:[...list_('evTypes'),ty].join(',')})}else ty=$('#evT').value;
    const prev=st.evEdit?D.prog.find(e=>e.id===st.evEdit):null;const ev={id:prev?prev.id:'',date:dv('evD')||iso(today),type:ty,titre:ti,resp:$('#evR').value.trim(),sujets:$('#evS').value.trim(),fait:prev?prev.fait:false};
    const id=await act('saveEvent',[ev],prev?'Activité modifiée.':'Activité ajoutée au programme.');ev.id=id;D.prog=D.prog.filter(e=>e.id!==id).concat([ev]);st.evEdit=null;render(true)}
  else if(d.evedit){st.evEdit=d.evedit;render(true);setTimeout(()=>$('#evTi')?.scrollIntoView({block:'center'}),0)}
  else if(b.id==='evCancel'){st.evEdit=null;render(true)}
  else if(d.fait){const e0=D.prog.find(e=>e.id===d.fait);if(!e0)return;e0.fait=!e0.fait;render(true);await act('saveEvent',[e0])}
  else if(d.delev){D.prog=D.prog.filter(e=>e.id!==d.delev);render(true);await act('deleteEvent',[d.delev],'Activité supprimée.')}
  }catch(err){/* déjà signalé */}
});
document.addEventListener('change',async e=>{
  const t=e.target;
  try{
  if(t.dataset.prie){prie[t.dataset.prie]=t.checked;ls.set('apg_prie_'+iso(today),prie);journalNow();render(true)}
  else if(t.id==='impFile'&&t.files[0]){const f=t.files[0];st.imp={name:f.name,loading:true,rows:[],def:st.thCode,prio:true};render(true);
    try{const rows=await parseFile(f);st.imp={name:f.name,rows,def:st.thCode,prio:true};markDups();if(!rows.length)toast('Aucun sujet trouvé dans ce fichier.')}
    catch(err){st.imp=null;toast(err.message==='format'?'Utilisez un fichier Word (.docx) ou Excel (.xlsx).':'Lecture du fichier impossible.')}render(true)}
  else if(t.id==='impDef'){st.imp.def=t.value;markDups();render(true)}
  else if(t.id==='impPrio'){st.imp.prio=t.checked}
  else if(t.id==='commDay'||t.dataset.comm){const day=t.dataset.comm||st.day;const cur=sansCommuns().filter(x=>x!==day);await saveSet({sansCommuns:(t.checked?cur:[...cur,day]).join(',')})}
  else if(t.dataset.note!==undefined){await saveSet({['note_'+t.dataset.note]:t.value.trim()})}
  else if(t.id==='thDay'){st.thDay=t.value;st.thCode=null;st.gest=null;render(true)}
  else if(t.id==='thCode'){st.thCode=t.value;st.gest=null;render(true)}
  else if(t.id==='exYear'){st.exYear=t.value;render(true)}
  else if(t.id==='setFoyer'){await saveSet({foyer:t.value.trim()})}
  else if(t.id==='setDeb'&&dv('setDeb')){await saveSet({debut:dv('setDeb')})}
  else if(t.id==='setSec'){await saveSet({secondes:Math.max(10,Math.min(120,+t.value||30))})}
  else if(t.id==='setLot'){await saveSet({lot:Math.max(3,Math.min(30,+t.value||10))})}
  else if(t.id==='setCible'){await saveSet({cible:Math.max(0,Math.min(300,+t.value||0))})}
  else if(t.id==='setNbE'){await saveSet({nbEglise:Math.max(10,Math.min(300,+t.value||100))})}
  else if(t.id==='setSrc'){await saveSet({sourceEglise:t.value})}
  else if(t.id==='ceTitre'||t.id==='ceCond'){await saveDayLocal(st.ceDay,{[t.id==='ceTitre'?'titre':'cond']:t.value.trim()})}
  else if(t.dataset.cedone!==undefined){const pk='apg_ce_'+st.week+'_'+st.ceDay;const dn=ls.get(pk,{});dn[t.dataset.cedone]=t.checked;ls.set(pk,dn);render(true)}
  }catch(err){}
});
let qh;document.addEventListener('input',e=>{const id=e.target.id;if(id==='q'||id==='exQ'){clearTimeout(qh);qh=setTimeout(()=>{st[id==='q'?'q':'exQ']=e.target.value;render(true)},280)}});
function refreshDay(){if(!CFG||$('#cfGo'))return;const n=new Date();n.setHours(0,0,0,0);if(n.getTime()!==today.getTime()&&n>today){today=n;prie=ls.get('apg_prie_'+iso(today),{});st.day=todayDay();st.week=iso(monday(today));load();return}
  if(Date.now()-lastLoad>5*60e3)load()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay()});setInterval(refreshDay,60000);
start();
})();
