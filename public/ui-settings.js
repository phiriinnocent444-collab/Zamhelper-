(()=>{
const $=s=>document.querySelector(s),root=document.documentElement;
const get=()=>{try{return JSON.parse(localStorage.getItem('zamPrefs')||'{}')}catch(e){return{}}};
const save=p=>{try{localStorage.setItem('zamPrefs',JSON.stringify(p))}catch(e){}};
function apply(p){const dark=p.theme==='dark'||(p.theme!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);
 root.classList.toggle('zt-dark',dark);root.classList.toggle('zt-one',!!p.one);root.classList.toggle('zt-big',!!p.big);root.classList.toggle('zt-calm',!!p.calm)}
function sync(){const p=get();$('#prefTheme').value=p.theme||'auto';$('#prefOne').checked=!!p.one;$('#prefBig').checked=!!p.big;$('#prefCalm').checked=!!p.calm}
const set=(k,v)=>{const p=get();p[k]=v;save(p);apply(p)};
$('#prefTheme').onchange=e=>set('theme',e.target.value);
$('#prefOne').onchange=e=>set('one',e.target.checked);$('#prefBig').onchange=e=>set('big',e.target.checked);$('#prefCalm').onchange=e=>set('calm',e.target.checked);
$('#prefReset').onclick=()=>{save({});apply({});sync()};
function toggle(btn,panel,other,otherBtn){btn.onclick=e=>{e.stopPropagation();const open=panel.hidden;panel.hidden=!open;btn.setAttribute('aria-expanded',open);if(open){other.hidden=true;otherBtn.setAttribute('aria-expanded','false')}}}
const mb=$('#menuBtn'),sb=$('#setBtn'),md=$('#menuDrawer'),sp=$('#setPanel');
toggle(mb,md,sp,sb);toggle(sb,sp,md,mb);
document.addEventListener('click',e=>{if(!sp.hidden&&!sp.contains(e.target)){sp.hidden=true;sb.setAttribute('aria-expanded','false')}if(!md.hidden&&!md.contains(e.target)){md.hidden=true;mb.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){md.hidden=sp.hidden=true;mb.setAttribute('aria-expanded','false');sb.setAttribute('aria-expanded','false')}});
sync();matchMedia('(prefers-color-scheme:dark)').addEventListener?.('change',()=>apply(get()));

/* ---- installable app (PWA) ---- */
const BASE=window.ZAM_BASE||'';
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 addEventListener('load',()=>navigator.serviceWorker.register(BASE+'sw.js').catch(()=>{}));
}
let installEvt=null;const ib=$('#installBtn');
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;if(ib)ib.hidden=false});
if(ib)ib.onclick=async()=>{if(!installEvt)return;installEvt.prompt();await installEvt.userChoice.catch(()=>{});installEvt=null;ib.hidden=true};
addEventListener('appinstalled',()=>{if(ib)ib.hidden=true});
/* ---- notification bell: refresh the unread count while the page is visible ---- */
const bell=$('#bellCount');
if(bell){const poll=async()=>{if(document.hidden)return;try{const r=await fetch(BASE+'api/notifications.php',{headers:{Accept:'application/json'}});if(!r.ok)return;const j=await r.json();bell.textContent=Math.min(99,j.unread);bell.hidden=!j.unread}catch(e){}};setInterval(poll,60000);document.addEventListener('visibilitychange',poll)}
})();
