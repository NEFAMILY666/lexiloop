import { createClient } from '@supabase/supabase-js';
import { icon } from './icons.js';
import './style.css';

const app = document.querySelector('#app');
const config = {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
const configured = Boolean(config.url && config.key && !config.url.includes('YOUR_PROJECT'));
const demoMode = !configured && ['localhost', '127.0.0.1'].includes(location.hostname);
const supabase = configured ? createClient(config.url, config.key) : null;

const demoWords = [
  { id:'1', term:'serendipity', definition:'???潛蝢末鈭??蝺?, example:'Finding this quiet caf矇 was pure serendipity.', part_of_speech:'noun', level:'B2' },
  { id:'2', term:'resilient', definition:'???抒?嚗餈敺拍?', example:'She remained resilient through every setback.', part_of_speech:'adjective', level:'B2' },
  { id:'3', term:'meticulous', definition:'銝蝯脖???嚗扔?嗡?蝝啁?', example:'He keeps meticulous notes.', part_of_speech:'adjective', level:'C1' },
  { id:'4', term:'ubiquitous', definition:'?⊥?銝??, example:'Smartphones have become ubiquitous.', part_of_speech:'adjective', level:'C1' },
  { id:'5', term:'eloquent', definition:'?劑??銵券?瘚??, example:'Her speech was brief but eloquent.', part_of_speech:'adjective', level:'B2' },
  { id:'6', term:'candid', definition:'?衣????渲?銝垮??, example:'Thank you for your candid feedback.', part_of_speech:'adjective', level:'B2' },
];

let state = {
  session: demoMode ? { user:{ email:'demo@local', id:'demo' } } : null,
  allowed: demoMode,
  words: demoMode ? [...demoWords] : [],
  progress: [], profile: { xp:340, streak:7, last_practice_date:null },
  view:'home', quiz:[], question:0, answered:false, score:0,
};

const escapeHTML = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const toast = (message, error=false) => { const el=document.createElement('div'); el.className=`toast${error?' error':''}`; el.textContent=message; document.body.append(el); setTimeout(()=>el.remove(),3200); };
const shuffle = arr => [...arr].sort(()=>Math.random()-.5);
const googleLogo = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.91A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.51l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6C7.18 7.72 9.39 5.96 12 5.96Z"/></svg>`;

function speak(text) {
  if (!('speechSynthesis' in window)) return toast('?汗?函???舀隤?剜', true);
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang='en-US'; utterance.rate=.86;
  speechSynthesis.speak(utterance);
}

async function bootstrap() {
  if (demoMode) return renderApp();
  if (!configured) return renderSetup();
  const { data:{ session } } = await supabase.auth.getSession();
  state.session = session;
  supabase.auth.onAuthStateChange((_event, session) => { state.session=session; session ? verifyAndLoad() : renderLogin(); });
  session ? await verifyAndLoad() : renderLogin();
}

async function verifyAndLoad() {
  const { data:allowed, error } = await supabase.rpc('is_allowed');
  if (error || !allowed) {
    state.allowed=false; await supabase.auth.signOut(); renderLogin('?董???其蝙?函?銝准?); return;
  }
  state.allowed=true;
  const [{ data:words }, { data:progress }, { data:profile }] = await Promise.all([
    supabase.from('words').select('*').order('created_at',{ascending:false}),
    supabase.from('word_progress').select('*'),
    supabase.from('profiles').select('*').maybeSingle(),
  ]);
  state.words=words || []; state.progress=progress || []; state.profile=profile || {xp:0,streak:0};
  if (!state.words.length) state.view='add';
  renderApp();
}

function renderSetup() {
  app.innerHTML=`<div class="login"><section class="login-art"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><h1>WORDS<br><span>IN PLAY.</span></h1><div class="orbit"></div></section><section class="login-panel"><div class="eyebrow">One-time setup</div><h2>撌格?敺?甇伐?<br>撠梯????/h2><p>蝬脩?撌脣???雿??芷?蝘犖憿澈??靘?README 撱箇? Supabase嚗蒂??GitHub 閮剖??拙蝵脣??啜?/p><div class="notice">雿??賢??桐縑蝞梯??桀?鞈??芣?摮敺垢嚗??神?亙??蝡胯?/div></section></div><div class="grain"></div>`;
}

function renderLogin(message='') {
  app.innerHTML=`<div class="login"><section class="login-art"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><h1>WORDS<br><span>IN PLAY.</span></h1><div class="orbit"></div></section><section class="login-panel"><div class="eyebrow">Private vocabulary space</div><h2>?餃嚗?憪?br>撱箇?雿?憿澈??/h2><p>雿輻撌脣??亦???Google 撣單蝜潛???亙??喳?啣??桀???仿?摨思蒂??蝺渡???/p>${message?`<div class="notice">${escapeHTML(message)}</div>`:''}<button class="btn google-login" id="google-login">${googleLogo}<span>雿輻 Google 撣單蝜潛?</span></button><div class="privacy-note">?餃鞈?曹撩?蝡舐?撽?嚗?縑蝞曹???曉?祇??垢??/div></section></div><div class="grain"></div>`;
  document.querySelector('#google-login').onclick=async e=>{const btn=e.currentTarget;btn.disabled=true;btn.querySelector('span').textContent='甇??? Google??;const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(error){toast(error.message,true);btn.disabled=false;btn.querySelector('span').textContent='雿輻 Google 撣單蝜潛?';}};
}

function renderApp() {
  const email=state.session?.user?.email || '';
  app.innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><div class="userbox"><span class="user-email mono" style="font-size:11px;color:var(--muted)">${demoMode?'PREVIEW MODE':escapeHTML(email)}</span><span class="avatar">${escapeHTML(email[0]?.toUpperCase()||'U')}</span><button class="btn btn-quiet icon-btn" id="logout" aria-label="?餃">${icon('logout')}</button></div></header><section class="hero"><div><div class="eyebrow">Your vocabulary playground 繚 2026</div><h1>MAKE WORDS<br><span>STICK.</span></h1></div><p class="hero-note">銝甇餉?嚗???賊??遣蝡撌梁?憿澈嚗?剖??毀蝧??????摮?Ｚ?????????/p></section><nav class="nav-tabs"><button class="tab" data-view="home">蝮質汗</button><button class="tab" data-view="practice">??蝺渡?</button><button class="tab" data-view="library">??憿澈</button><button class="tab" data-view="add">?啣??桀?</button></nav><main id="view"></main></div><div class="grain"></div>`;
  document.querySelector('#logout').onclick=()=>demoMode?toast('?汗璅∪?銝??餃'):supabase.auth.signOut();
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{state.view=t.dataset.view; if(state.view==='practice') startQuiz(); else renderView();});
  renderView();
}

function renderView() {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===state.view));
  const root=document.querySelector('#view'); if(!root)return;
  if(state.view==='home') renderHome(root);
  if(state.view==='library') renderLibrary(root);
  if(state.view==='add') renderAdd(root);
}

function renderHome(root) {
  const mastered=state.progress.filter(p=>p.mastery>=4).length;
  const percent=state.words.length?Math.round(mastered/state.words.length*100):0;
  root.innerHTML=`<section class="view dashboard-grid"><article class="card stat stat-acid"><div class="eyebrow" style="color:#111">Total words</div><div class="stat-value">${state.words.length}</div><div class="mono" style="font-size:11px">雿?蝘犖憿澈</div></article><article class="card stat"><div class="eyebrow">Current streak</div><div class="stat-value">${state.profile.streak||0}<small style="font-size:20px">憭?/small></div><div class="mono" style="font-size:11px;color:var(--orange)">Keep it alive</div></article><article class="card stat stat-orange"><div class="eyebrow" style="color:#111">Total XP</div><div class="stat-value">${state.profile.xp||0}</div><div class="mono" style="font-size:11px">Level ${Math.floor((state.profile.xp||0)/200)+1}</div></article><article class="card stat"><div class="eyebrow">Mastered</div><div class="stat-value">${mastered}</div><div class="mono" style="font-size:11px;color:var(--violet)">${percent}% complete</div></article><article class="card practice-cta"><div><div class="eyebrow">Quick session 繚 10 words</div><h2>隞予銋?憭扯<br>?梯澈銝銝?/h2></div><div><button class="btn btn-primary" id="home-practice">?????? ${icon('arrow')}</button></div></article><article class="card progress-card"><div class="eyebrow">Collection mastery</div><div style="position:relative"><div class="ring" style="--p:${percent}"></div><div class="ring-label">${percent}%</div></div><p style="text-align:center;color:var(--muted);font-size:13px">蝎曄? ${mastered} / ${state.words.length} ?摮?/p></article></section>`;
  document.querySelector('#home-practice').onclick=()=>{state.view='practice';startQuiz();};
}

function renderLibrary(root) {
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Personal collection</div><h2>??憿澈</h2></div><div class="library-tools"><input id="search" class="input" placeholder="???桀???><button id="go-add" class="btn btn-primary">${icon('plus')} ?啣?</button></div></div><div id="word-list" class="word-list"></div></section>`;
  const draw=(query='')=>{const words=state.words.filter(w=>(w.term+' '+w.definition).toLowerCase().includes(query.toLowerCase()));document.querySelector('#word-list').innerHTML=words.length?words.map(w=>`<div class="word-row"><div><div class="word-term">${escapeHTML(w.term)}</div><div class="word-meta">${escapeHTML(w.part_of_speech||'')} 繚 ${escapeHTML(w.level||'')}</div></div><div class="word-definition">${escapeHTML(w.definition)}</div><div class="word-meta">${escapeHTML(w.example||'??)}</div><div style="display:flex;gap:6px"><button class="btn btn-quiet icon-btn speak" data-term="${escapeHTML(w.term)}" aria-label="?剜 ${escapeHTML(w.term)} ?潮">${icon('volume')}</button><button class="btn btn-quiet icon-btn btn-danger delete" data-id="${w.id}" aria-label="?芷 ${escapeHTML(w.term)}">${icon('trash')}</button></div></div>`).join(''):`<div class="empty">?桀??曆??啣摮憓洵銝??霈?摨恍?憪憭扼?/div>`;document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.term));document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>deleteWord(b.dataset.id));};
  draw(); document.querySelector('#search').oninput=e=>draw(e.target.value); document.querySelector('#go-add').onclick=()=>{state.view='add';renderView();};
}

async function deleteWord(id) {
  if(!confirm('蝣箏?閬?日摮?嚗?))return;
  if(!demoMode){const {error}=await supabase.from('words').delete().eq('id',id);if(error)return toast(error.message,true);}
  state.words=state.words.filter(w=>String(w.id)!==String(id));renderLibrary(document.querySelector('#view'));toast('?桀?撌脣??);
}

function renderAdd(root) {
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Grow your collection</div><h2>?啣??桀?</h2></div></div><div class="dashboard-grid"><article class="card" style="grid-column:span 7"><form id="word-form"><div class="form-grid"><div class="field"><label>?望??桀? *</label><input name="term" class="input" required placeholder="e.g. serendipity"></div><div class="field"><label>銝剜?閫?? *</label><input name="definition" class="input" required placeholder="e.g. ???潛蝢末鈭??蝺?></div><div class="field"><label>閰?/label><select name="part_of_speech" class="input"><option value="">?芸?憿?/option><option>noun</option><option>verb</option><option>adjective</option><option>adverb</option><option>phrase</option></select></div><div class="field"><label>蝔漲</label><select name="level" class="input"><option>A1</option><option>A2</option><option selected>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div><div class="field full"><label>靘</label><textarea name="example" class="input" placeholder="Write an example sentence..."></textarea></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon('plus')} ?憿澈</button></div></form></article><article class="card" style="grid-column:span 5"><div class="eyebrow">Batch import</div><h3 style="font-size:30px;letter-spacing:-.04em;margin:14px 0 8px">銝甈∪?亙??摮?/h3><p style="color:var(--muted);line-height:1.7;font-size:14px">?舀 CSV 瑼?甈?靘??綽?<br><span class="mono" style="color:var(--ink)">term, definition, example, part_of_speech, level</span></p><input id="csv" type="file" accept=".csv,text/csv" hidden><button class="btn" id="csv-button" style="margin-top:16px">${icon('upload')} ?豢? CSV 瑼?</button><div id="import-status" style="margin-top:16px;color:var(--muted);font-size:13px"></div></article></div></section>`;
  const cards=root.querySelectorAll('.card'); if(innerWidth<=600) cards.forEach(c=>c.style.gridColumn='1/-1');
  document.querySelector('#word-form').onsubmit=addWord;
  document.querySelector('#csv-button').onclick=()=>document.querySelector('#csv').click(); document.querySelector('#csv').onchange=importCSV;
}

async function addWord(e) {
  e.preventDefault(); const data=Object.fromEntries(new FormData(e.currentTarget));
  if(demoMode){data.id=crypto.randomUUID();state.words.unshift(data);} else {const {data:row,error}=await supabase.from('words').insert(data).select().single();if(error)return toast(error.message,true);state.words.unshift(row);}
  e.currentTarget.reset(); toast(`撌脣???${data.term}`);
}

function parseCSV(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){field+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;} row.push(field.trim());if(row.some(Boolean))rows.push(row);
  const start=rows[0]?.[0]?.toLowerCase()==='term'?1:0; return rows.slice(start).filter(r=>r[0]&&r[1]).map(r=>({term:r[0],definition:r[1],example:r[2]||'',part_of_speech:r[3]||'',level:r[4]||'B1'}));
}

async function importCSV(e) {
  const file=e.target.files[0]; if(!file)return; const words=parseCSV(await file.text()); const status=document.querySelector('#import-status');
  if(!words.length)return status.textContent='瘝??曉?臬?亦?鞈?嚗?瑼Ｘ CSV ?澆???;
  if(demoMode){words.forEach(w=>w.id=crypto.randomUUID());state.words.unshift(...words);} else {const {data,error}=await supabase.from('words').insert(words).select();if(error)return toast(error.message,true);state.words.unshift(...data);}
  status.textContent=`摰?嚗歇?臬 ${words.length} ?摮; toast(`???臬 ${words.length} ?摮);
}

function startQuiz() {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view==='practice'));
  if(state.words.length<4){document.querySelector('#view').innerHTML=`<section class="view empty">?喳??閬?4 ?摮??賡?憪??蝺渡???br><button class="btn btn-primary" id="need-add" style="margin-top:18px">?啣??桀?</button></section>`;document.querySelector('#need-add').onclick=()=>{state.view='add';renderView();};return;}
  state.quiz=shuffle(state.words).slice(0,Math.min(10,state.words.length));state.question=0;state.score=0;state.answered=false;renderQuestion();
}

function renderQuestion() {
  const root=document.querySelector('#view'); if(state.question>=state.quiz.length)return finishQuiz(); const word=state.quiz[state.question];
  const distractors=shuffle(state.words.filter(w=>w.id!==word.id)).slice(0,3).map(w=>w.definition); const options=shuffle([word.definition,...distractors]);
  root.innerHTML=`<section class="view quiz-wrap"><div class="quiz-top"><span class="mono" style="font-size:11px;color:var(--muted)">${state.question+1} / ${state.quiz.length}</span><div class="quiz-progress"><span style="width:${(state.question/state.quiz.length)*100}%"></span></div><span class="mono" style="font-size:11px;color:var(--acid)">${state.score} XP</span></div><article class="card quiz-card"><div class="eyebrow">Choose the meaning</div><div style="display:flex;align-items:center;gap:14px"><div class="quiz-word">${escapeHTML(word.term)}</div><button class="btn icon-btn" id="quiz-speak" aria-label="?剜?潮">${icon('volume')}</button></div><div class="quiz-example">${escapeHTML(word.example||'?詨??亥??葉?圾??)}</div><div class="options">${options.map((o,i)=>`<button class="option" data-value="${escapeHTML(o)}"><span class="mono" style="font-size:10px;color:var(--muted)">0${i+1}</span><br>${escapeHTML(o)}</button>`).join('')}</div><div class="feedback"></div></article></section>`;
  document.querySelector('#quiz-speak').onclick=()=>speak(word.term); document.querySelectorAll('.option').forEach(b=>b.onclick=()=>answer(b,word));
}

async function answer(button,word) {
  if(state.answered)return; state.answered=true; const correct=button.dataset.value===word.definition; if(correct)state.score+=10;
  document.querySelectorAll('.option').forEach(b=>{b.disabled=true;if(b.dataset.value===word.definition)b.classList.add('correct');}); if(!correct)button.classList.add('wrong');
  document.querySelector('.feedback').textContent=correct?'瞍漁嚗?10 XP':'撌桐?暺?甇?Ⅱ蝑?撌脫?蝷箝?;
  if(!demoMode){const existing=state.progress.find(p=>p.word_id===word.id);const payload={user_id:state.session.user.id,word_id:word.id,mastery:Math.max(0,Math.min(5,(existing?.mastery||0)+(correct?1:-1))),correct_count:(existing?.correct_count||0)+(correct?1:0),wrong_count:(existing?.wrong_count||0)+(correct?0:1),last_practiced_at:new Date().toISOString()};await supabase.from('word_progress').upsert(payload);existing?Object.assign(existing,payload):state.progress.push(payload);}
  setTimeout(()=>{state.question++;state.answered=false;renderQuestion();},1000);
}

async function finishQuiz() {
  state.profile.xp=(state.profile.xp||0)+state.score; const today=new Date().toISOString().slice(0,10),last=state.profile.last_practice_date;
  if(last!==today){const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);state.profile.streak=last===yesterday?(state.profile.streak||0)+1:1;state.profile.last_practice_date=today;}
  if(!demoMode)await supabase.from('profiles').upsert({user_id:state.session.user.id,xp:state.profile.xp,streak:state.profile.streak,last_practice_date:state.profile.last_practice_date});
  document.querySelector('#view').innerHTML=`<section class="view quiz-wrap"><article class="card" style="text-align:center;padding:70px 24px"><div class="eyebrow">Session complete</div><div style="font-size:clamp(75px,16vw,150px);font-weight:900;letter-spacing:-.09em;color:var(--acid);line-height:1;margin:22px 0">+${state.score}</div><h2 style="font-size:34px;margin:0 0 10px">????????/h2><p style="color:var(--muted)">蝑? ${state.score/10} / ${state.quiz.length} 憿??予?????桀???銝甈～?/p><button class="btn btn-primary" id="again" style="margin-top:18px">?銝?? ${icon('arrow')}</button></article></section>`;document.querySelector('#again').onclick=startQuiz;
}

bootstrap();
