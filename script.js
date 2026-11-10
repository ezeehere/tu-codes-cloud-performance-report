/* ---------- Loader ---------- */
(function(){const ld=document.getElementById("ld"),arc=document.getElementById("arc"),pc=document.getElementById("pc"),qt=document.getElementById("qt");
const Q=["Convincing the cloud to wake up…","Counting badges twice, just to be sure…","Asking Gemini to hurry up (it said no)…","Closing 47 browser tabs…","Brewing chai for the servers…","Redeeming access codes… yours too 👀","Teaching the spreadsheet to behave…","Almost there, pinky promise 🤞"];
for(let i=Q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[Q[i],Q[j]]=[Q[j],Q[i]]}
let qi=0;qt.textContent=Q[0];setInterval(()=>{qt.classList.add("f");setTimeout(()=>{qi=(qi+1)%Q.length;qt.textContent=Q[qi];qt.classList.remove("f")},350)},1300);
const C=2*Math.PI*78,MIN=4000,MAX=9000,t0=performance.now();arc.style.strokeDasharray=C;let shown=0,done=false;
function tick(t){const el=t-t0,ready=window.__ready===true;const target=(ready&&el>=MIN)?100:Math.min(el/MIN,1)*96;shown+=(target-shown)*.12;if(target===100&&shown>99.4)shown=100;
arc.style.strokeDashoffset=C*(1-shown/100);pc.textContent=Math.round(shown)+"%";
if(shown>=100||el>MAX){if(!done){done=true;setTimeout(()=>{ld.classList.add("out");document.body.classList.remove("loading");setTimeout(()=>ld.remove(),800)},250)}return}
requestAnimationFrame(tick)}requestAnimationFrame(tick)})();

/* ---------- App ---------- */
const API_URL="https://script.google.com/macros/s/AKfycbx4mPoVFCLahR6pi6PkOuDYu-opOf04kjMU4L0Zk8USuQF1_qIR69FnqEsL61fKGTPa/exec";/* Apps Script JSON endpoint returning {status:"success",updated:"…",data:[…]} */
const TIMEOUT_MS=8000;
let D=[],q="",fg="all",fc="all",so="name";
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const IC={home:'<path d="M3 11 12 4l9 7v9H3z"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6M16 5.5a3.2 3.2 0 0 1 0 6M18 14.5c2 .7 3.2 2.5 3.5 5.5"/>',list:'<path d="M4 6h16M4 12h16M4 18h10"/>',up:'<path d="M12 19V5M5 12l7-7 7 7"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'};
document.querySelectorAll("[data-i]").forEach(e=>e.innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[e.dataset.i]}</svg>`);
const ini=n=>n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase(),pct=(a,b)=>b?Math.round(a/b*100):0;
const cls=x=>x.r?"w":x.gear?"l":"o";
function stats(){const t=D.length,g=D.filter(x=>x.gear).length,r=D.filter(x=>x.r).length,sd=D.filter(x=>x.c>0).length,ms=D.filter(x=>!/^no milestone/i.test(x.m)).length;
const two=(a,al,b,bl)=>`<div class="two"><div><i class="tri"></i><b>${a}</b><small>${al}</small></div><div><i class="tri dn"></i><b>${b}</b><small>${bl}</small></div></div>`;
$("#k1").innerHTML="<h3>Learners</h3>"+two(g,"GEAR badge",t-g,"Not yet");
$("#k2").innerHTML="<h3>Access codes</h3>"+two(r,"Redeemed",t-r,"Pending");
$("#dm").innerHTML=`<h3>Learner map · ${t} confirmed</h3><div class="dots">${D.map(x=>`<i class="d ${cls(x)}" data-n="${esc(x.n)}" title="${esc(x.n)}"></i>`).join("")}</div><div class="lg2"><span><i class="d w"></i>Code redeemed</span><span><i class="d l"></i>GEAR badge</span><span><i class="d o"></i>No badge yet</span></div>`;
const st=[["Confirmed",t,"l"],["GEAR badge earned",g,"o"],["Code redeemed",r,"w"],["Skill badges started",sd,"l"],["Milestone reached",ms,"o"]];
$("#tl").innerHTML="<h3>Progress</h3>"+st.map(([l,v,c])=>`<div class="tr"><span>${l}</span><div class="trk"><div class="bp ${c}" data-w="${pct(v,t)}"><em style="font-style:normal">${v}</em></div></div></div>`).join("")+`<div class="tot">Total: ${t}</div>`;
setTimeout(()=>document.querySelectorAll("[data-w]").forEach(e=>e.style.width=e.dataset.w+"%"),200)}
function list(){let L=D.filter(x=>x.n.toLowerCase().includes(q)&&(fg=="all"||(fg=="gear")==x.gear)&&(fc=="all"||(fc=="red")==x.r));
L.sort((a,b)=>so=="badges"?b.c-a.c||a.n.localeCompare(b.n):so=="gear"?(b.gear-a.gear)||a.n.localeCompare(b.n):a.n.localeCompare(b.n));
$("#cnt").textContent=`Showing ${L.length} of ${D.length}`;
$("#grid").innerHTML=L.length?L.map(x=>`<article class="cd"><div class="hd"><div class="av ${cls(x)}">${esc(ini(x.n))}</div><div><div class="nm">${esc(x.n)}</div><div class="ix">#${String(D.indexOf(x)+1).padStart(2,"0")}</div></div></div>
<div class="pls"><span class="p2 ${x.gear?"l":"o"}">${x.gear?"GEAR badge earned":"No GEAR badge"}</span><span class="p2 ${x.r?"w":""}">${x.r?"Code redeemed":"Code pending"}</span></div>
<div class="mt"><div><small>Milestone</small><b>${esc(x.m)}</b></div><div><small>Skill badges</small><b>${x.c}</b></div><div><small>Skills profile</small><b>${esc(x.sp)}</b></div><div><small>Developer profile</small><b>${esc(x.dp)}</b></div></div>
<div class="seg">${Array.from({length:8},(_,i)=>`<i class="${i<x.c?"on":""}"></i>`).join("")}</div>
${x.b.length?`<details><summary>${x.c} skill badge${x.c>1?"s":""}</summary><ul>${x.b.map(b=>`<li>${esc(b)}</li>`).join("")}</ul></details>`:""}
<div class="lk">${x.su?`<a href="${esc(x.su)}" target="_blank" rel="noopener">Skills profile ↗</a>`:""}${x.du?`<a href="${esc(x.du)}" target="_blank" rel="noopener">Developer ↗</a>`:""}</div></article>`).join(""):`<div class="empty">No learners match that search.</div>`}
function init(){stats();list()}

/* ---------- Data loading (no fallback: shows an error if the API fails) ---------- */
function showError(msg){
 console.error("Study Jam data failed to load:",msg);
 const dash='<h3>Unavailable</h3><div class="tot" style="text-align:left">—</div>';
 ["#k1","#k2","#dm","#tl"].forEach(s=>$(s).innerHTML=dash);
 $("#cnt").textContent="";
 $("#asof").textContent="unavailable";
 $("#grid").innerHTML=`<div class="err"><b>Couldn't load learner data</b><p>${esc(msg)}</p><button class="pill on" id="retry" type="button">Try again</button></div>`}
function showLoading(){$("#cnt").textContent="Loading…";$("#grid").innerHTML=`<div class="empty">Loading learner data…</div>`}
async function load(){
 const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),TIMEOUT_MS);
 try{
  if(!API_URL)throw new Error("API_URL is not set.");
  const res=await fetch(API_URL,{signal:ctl.signal});
  if(!res.ok)throw new Error("Server responded with HTTP "+res.status+".");
  const r=await res.json();
  if(r.status!=="success"||!Array.isArray(r.data))throw new Error(r.message||"Unexpected response from the server.");
  D=r.data;
  if(r.updated)$("#asof").textContent=r.updated;
  init();
 }catch(e){
  showError(e.name==="AbortError"?"The request timed out.":(e.message||"Network error."));
 }finally{clearTimeout(tm);window.__ready=true}
}

/* ---------- Events ---------- */
const go=id=>$(id).scrollIntoView({behavior:"smooth"});
$("#q").oninput=e=>{q=e.target.value.trim().toLowerCase();if(D.length)list()};
$("#fg").onchange=e=>{fg=e.target.value;if(D.length)list()};$("#fc").onchange=e=>{fc=e.target.value;if(D.length)list()};$("#so").onchange=e=>{so=e.target.value;if(D.length)list()};
$("#sb").onclick=()=>{go("#people");setTimeout(()=>$("#q").focus({preventScroll:true}),500)};
$("#s1").onclick=$("#s4").onclick=()=>scrollTo({top:0,behavior:"smooth"});$("#s2").onclick=()=>go("#people");$("#s3").onclick=()=>$("#people").classList.toggle("cp");
$("#dm").onclick=e=>{const d=e.target.closest(".d[data-n]");if(!d)return;$("#q").value=d.dataset.n;q=d.dataset.n.toLowerCase();list();go("#people")};
$("#grid").onclick=e=>{if(e.target.id==="retry"){showLoading();load()}};

/* ---------- Smooth mouse-wheel scrolling ---------- */
(function(){const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches,touchDevice=matchMedia("(pointer: coarse)").matches;if(reduceMotion||touchDevice)return;
let current=scrollY,target=scrollY,frame=0;const maxScroll=()=>document.documentElement.scrollHeight-innerHeight,jumpTo=y=>scrollTo({top:y,behavior:"instant"});
function animate(){current+=(target-current)*.12;if(Math.abs(target-current)<.5){current=target;jumpTo(current);frame=0;return}jumpTo(current);frame=requestAnimationFrame(animate)}
addEventListener("wheel",e=>{if(e.ctrlKey||document.body.classList.contains("loading"))return;e.preventDefault();if(!frame)current=target=scrollY;const delta=e.deltaY*(e.deltaMode===1?32:1);target=Math.max(0,Math.min(maxScroll(),target+delta));if(!frame)frame=requestAnimationFrame(animate)},{passive:false});
addEventListener("scroll",()=>{if(!frame)current=target=scrollY},{passive:true})})();

load();