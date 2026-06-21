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
  { id:'1', term:'serendipity', definition:'意外發現美好事物的機緣', example:'Finding this quiet café was pure serendipity.', part_of_speech:'noun', level:'B2' },
  { id:'2', term:'resilient', definition:'有韌性的；能迅速恢復的', example:'She remained resilient through every setback.', part_of_speech:'adjective', level:'B2' },
  { id:'3', term:'meticulous', definition:'一絲不苟的；極其仔細的', example:'He keeps meticulous notes.', part_of_speech:'adjective', level:'C1' },
  { id:'4', term:'ubiquitous', definition:'無所不在的', example:'Smartphones have become ubiquitous.', part_of_speech:'adjective', level:'C1' },
  { id:'5', term:'eloquent', definition:'雄辯的；表達流暢的', example:'Her speech was brief but eloquent.', part_of_speech:'adjective', level:'B2' },
  { id:'6', term:'candid', definition:'坦率的；直言不諱的', example:'Thank you for your candid feedback.', part_of_speech:'adjective', level:'B2' },
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

function speak(text) {
  if (!('speechSynthesis' in window)) return toast('這個瀏覽器目前不支援語音播放', true);
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
    state.allowed=false; await supabase.auth.signOut(); renderLogin('這個帳號不在使用白名單中。'); return;
  }
  state.allowed=true;
  const [{ data:words }, { data:progress }, { data:profile }] = await Promise.all([
    supabase.from('words').select('*').order('created_at',{ascending:false}),
    supabase.from('word_progress').select('*'),
    supabase.from('profiles').select('*').maybeSingle(),
  ]);
  state.words=words || []; state.progress=progress || []; state.profile=profile || {xp:0,streak:0}; renderApp();
}

function renderSetup() {
  app.innerHTML=`<div class="login"><section class="login-art"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><h1>WORDS<br><span>IN PLAY.</span></h1><div class="orbit"></div></section><section class="login-panel"><div class="eyebrow">One-time setup</div><h2>差最後一步，<br>就能開始。</h2><p>網站已完成，但尚未連接私人題庫。請依 README 建立 Supabase，並在 GitHub 設定兩個部署密鑰。</p><div class="notice">你的白名單信箱與單字資料只會存在後端，不會寫入公開前端。</div></section></div><div class="grain"></div>`;
}

function renderLogin(message='') {
  app.innerHTML=`<div class="login"><section class="login-art"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><h1>WORDS<br><span>IN PLAY.</span></h1><div class="orbit"></div></section><section class="login-panel"><div class="eyebrow">Private vocabulary space</div><h2>每天一點，<br>把字彙變成直覺。</h2><p>使用獲准的信箱登入。系統會寄送一封安全連結，不需要設定密碼。</p>${message?`<div class="notice">${escapeHTML(message)}</div>`:''}<form id="login-form"><div class="field"><label for="email">電子信箱</label><input class="input" id="email" type="email" autocomplete="email" required placeholder="name@example.com"></div><button class="btn btn-primary" type="submit">寄送登入連結 ${icon('arrow')}</button></form><div class="privacy-note">登入資格由伺服器端白名單驗證，前端不保存核准信箱。</div></section></div><div class="grain"></div>`;
  document.querySelector('#login-form').onsubmit=async e=>{e.preventDefault();const email=e.currentTarget.email.value;const btn=e.currentTarget.querySelector('button');btn.disabled=true;btn.textContent='寄送中…';const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});if(error){toast(error.message,true);btn.disabled=false;btn.innerHTML=`寄送登入連結 ${icon('arrow')}`;}else renderLogin('登入連結已寄出，請到信箱查收。');};
}

function renderApp() {
  const email=state.session?.user?.email || '';
  app.innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><div class="userbox"><span class="user-email mono" style="font-size:11px;color:var(--muted)">${demoMode?'PREVIEW MODE':escapeHTML(email)}</span><span class="avatar">${escapeHTML(email[0]?.toUpperCase()||'U')}</span><button class="btn btn-quiet icon-btn" id="logout" aria-label="登出">${icon('logout')}</button></div></header><section class="hero"><div><div class="eyebrow">Your vocabulary playground · 2026</div><h1>MAKE WORDS<br><span>STICK.</span></h1></div><p class="hero-note">不是死背，是反覆相遇。建立自己的題庫，用短回合練習，把每個陌生單字慢慢變成熟悉的朋友。</p></section><nav class="nav-tabs"><button class="tab" data-view="home">總覽</button><button class="tab" data-view="practice">開始練習</button><button class="tab" data-view="library">我的題庫</button><button class="tab" data-view="add">新增單字</button></nav><main id="view"></main></div><div class="grain"></div>`;
  document.querySelector('#logout').onclick=()=>demoMode?toast('預覽模式不需登出'):supabase.auth.signOut();
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
  root.innerHTML=`<section class="view dashboard-grid"><article class="card stat stat-acid"><div class="eyebrow" style="color:#111">Total words</div><div class="stat-value">${state.words.length}</div><div class="mono" style="font-size:11px">你的私人題庫</div></article><article class="card stat"><div class="eyebrow">Current streak</div><div class="stat-value">${state.profile.streak||0}<small style="font-size:20px">天</small></div><div class="mono" style="font-size:11px;color:var(--orange)">Keep it alive</div></article><article class="card stat stat-orange"><div class="eyebrow" style="color:#111">Total XP</div><div class="stat-value">${state.profile.xp||0}</div><div class="mono" style="font-size:11px">Level ${Math.floor((state.profile.xp||0)/200)+1}</div></article><article class="card stat"><div class="eyebrow">Mastered</div><div class="stat-value">${mastered}</div><div class="mono" style="font-size:11px;color:var(--violet)">${percent}% complete</div></article><article class="card practice-cta"><div><div class="eyebrow">Quick session · 10 words</div><h2>今天也讓大腦<br>熱身一下。</h2></div><div><button class="btn btn-primary" id="home-practice">開始這一回合 ${icon('arrow')}</button></div></article><article class="card progress-card"><div class="eyebrow">Collection mastery</div><div style="position:relative"><div class="ring" style="--p:${percent}"></div><div class="ring-label">${percent}%</div></div><p style="text-align:center;color:var(--muted);font-size:13px">精熟 ${mastered} / ${state.words.length} 個單字</p></article></section>`;
  document.querySelector('#home-practice').onclick=()=>{state.view='practice';startQuiz();};
}

function renderLibrary(root) {
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Personal collection</div><h2>我的題庫</h2></div><div class="library-tools"><input id="search" class="input" placeholder="搜尋單字…"><button id="go-add" class="btn btn-primary">${icon('plus')} 新增</button></div></div><div id="word-list" class="word-list"></div></section>`;
  const draw=(query='')=>{const words=state.words.filter(w=>(w.term+' '+w.definition).toLowerCase().includes(query.toLowerCase()));document.querySelector('#word-list').innerHTML=words.length?words.map(w=>`<div class="word-row"><div><div class="word-term">${escapeHTML(w.term)}</div><div class="word-meta">${escapeHTML(w.part_of_speech||'')} · ${escapeHTML(w.level||'')}</div></div><div class="word-definition">${escapeHTML(w.definition)}</div><div class="word-meta">${escapeHTML(w.example||'—')}</div><div style="display:flex;gap:6px"><button class="btn btn-quiet icon-btn speak" data-term="${escapeHTML(w.term)}" aria-label="播放 ${escapeHTML(w.term)} 發音">${icon('volume')}</button><button class="btn btn-quiet icon-btn btn-danger delete" data-id="${w.id}" aria-label="刪除 ${escapeHTML(w.term)}">${icon('trash')}</button></div></div>`).join(''):`<div class="empty">目前找不到單字。新增第一個，讓題庫開始長大。</div>`;document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.term));document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>deleteWord(b.dataset.id));};
  draw(); document.querySelector('#search').oninput=e=>draw(e.target.value); document.querySelector('#go-add').onclick=()=>{state.view='add';renderView();};
}

async function deleteWord(id) {
  if(!confirm('確定要刪除這個單字嗎？'))return;
  if(!demoMode){const {error}=await supabase.from('words').delete().eq('id',id);if(error)return toast(error.message,true);}
  state.words=state.words.filter(w=>String(w.id)!==String(id));renderLibrary(document.querySelector('#view'));toast('單字已刪除');
}

function renderAdd(root) {
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Grow your collection</div><h2>新增單字</h2></div></div><div class="dashboard-grid"><article class="card" style="grid-column:span 7"><form id="word-form"><div class="form-grid"><div class="field"><label>英文單字 *</label><input name="term" class="input" required placeholder="e.g. serendipity"></div><div class="field"><label>中文解釋 *</label><input name="definition" class="input" required placeholder="e.g. 意外發現美好事物的機緣"></div><div class="field"><label>詞性</label><select name="part_of_speech" class="input"><option value="">未分類</option><option>noun</option><option>verb</option><option>adjective</option><option>adverb</option><option>phrase</option></select></div><div class="field"><label>程度</label><select name="level" class="input"><option>A1</option><option>A2</option><option selected>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div><div class="field full"><label>例句</label><textarea name="example" class="input" placeholder="Write an example sentence..."></textarea></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">${icon('plus')} 加入題庫</button></div></form></article><article class="card" style="grid-column:span 5"><div class="eyebrow">Batch import</div><h3 style="font-size:30px;letter-spacing:-.04em;margin:14px 0 8px">一次匯入多個單字</h3><p style="color:var(--muted);line-height:1.7;font-size:14px">支援 CSV 檔，欄位依序為：<br><span class="mono" style="color:var(--ink)">term, definition, example, part_of_speech, level</span></p><input id="csv" type="file" accept=".csv,text/csv" hidden><button class="btn" id="csv-button" style="margin-top:16px">${icon('upload')} 選擇 CSV 檔案</button><div id="import-status" style="margin-top:16px;color:var(--muted);font-size:13px"></div></article></div></section>`;
  const cards=root.querySelectorAll('.card'); if(innerWidth<=600) cards.forEach(c=>c.style.gridColumn='1/-1');
  document.querySelector('#word-form').onsubmit=addWord;
  document.querySelector('#csv-button').onclick=()=>document.querySelector('#csv').click(); document.querySelector('#csv').onchange=importCSV;
}

async function addWord(e) {
  e.preventDefault(); const data=Object.fromEntries(new FormData(e.currentTarget));
  if(demoMode){data.id=crypto.randomUUID();state.words.unshift(data);} else {const {data:row,error}=await supabase.from('words').insert(data).select().single();if(error)return toast(error.message,true);state.words.unshift(row);}
  e.currentTarget.reset(); toast(`已加入 ${data.term}`);
}

function parseCSV(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){field+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;} row.push(field.trim());if(row.some(Boolean))rows.push(row);
  const start=rows[0]?.[0]?.toLowerCase()==='term'?1:0; return rows.slice(start).filter(r=>r[0]&&r[1]).map(r=>({term:r[0],definition:r[1],example:r[2]||'',part_of_speech:r[3]||'',level:r[4]||'B1'}));
}

async function importCSV(e) {
  const file=e.target.files[0]; if(!file)return; const words=parseCSV(await file.text()); const status=document.querySelector('#import-status');
  if(!words.length)return status.textContent='沒有找到可匯入的資料，請檢查 CSV 格式。';
  if(demoMode){words.forEach(w=>w.id=crypto.randomUUID());state.words.unshift(...words);} else {const {data,error}=await supabase.from('words').insert(words).select();if(error)return toast(error.message,true);state.words.unshift(...data);}
  status.textContent=`完成！已匯入 ${words.length} 個單字。`; toast(`成功匯入 ${words.length} 個單字`);
}

function startQuiz() {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view==='practice'));
  if(state.words.length<4){document.querySelector('#view').innerHTML=`<section class="view empty">至少需要 4 個單字才能開始選擇題練習。<br><button class="btn btn-primary" id="need-add" style="margin-top:18px">新增單字</button></section>`;document.querySelector('#need-add').onclick=()=>{state.view='add';renderView();};return;}
  state.quiz=shuffle(state.words).slice(0,Math.min(10,state.words.length));state.question=0;state.score=0;state.answered=false;renderQuestion();
}

function renderQuestion() {
  const root=document.querySelector('#view'); if(state.question>=state.quiz.length)return finishQuiz(); const word=state.quiz[state.question];
  const distractors=shuffle(state.words.filter(w=>w.id!==word.id)).slice(0,3).map(w=>w.definition); const options=shuffle([word.definition,...distractors]);
  root.innerHTML=`<section class="view quiz-wrap"><div class="quiz-top"><span class="mono" style="font-size:11px;color:var(--muted)">${state.question+1} / ${state.quiz.length}</span><div class="quiz-progress"><span style="width:${(state.question/state.quiz.length)*100}%"></span></div><span class="mono" style="font-size:11px;color:var(--acid)">${state.score} XP</span></div><article class="card quiz-card"><div class="eyebrow">Choose the meaning</div><div style="display:flex;align-items:center;gap:14px"><div class="quiz-word">${escapeHTML(word.term)}</div><button class="btn icon-btn" id="quiz-speak" aria-label="播放發音">${icon('volume')}</button></div><div class="quiz-example">${escapeHTML(word.example||'選出最接近的中文解釋')}</div><div class="options">${options.map((o,i)=>`<button class="option" data-value="${escapeHTML(o)}"><span class="mono" style="font-size:10px;color:var(--muted)">0${i+1}</span><br>${escapeHTML(o)}</button>`).join('')}</div><div class="feedback"></div></article></section>`;
  document.querySelector('#quiz-speak').onclick=()=>speak(word.term); document.querySelectorAll('.option').forEach(b=>b.onclick=()=>answer(b,word));
}

async function answer(button,word) {
  if(state.answered)return; state.answered=true; const correct=button.dataset.value===word.definition; if(correct)state.score+=10;
  document.querySelectorAll('.option').forEach(b=>{b.disabled=true;if(b.dataset.value===word.definition)b.classList.add('correct');}); if(!correct)button.classList.add('wrong');
  document.querySelector('.feedback').textContent=correct?'漂亮！+10 XP':'差一點，正確答案已標示。';
  if(!demoMode){const existing=state.progress.find(p=>p.word_id===word.id);const payload={user_id:state.session.user.id,word_id:word.id,mastery:Math.max(0,Math.min(5,(existing?.mastery||0)+(correct?1:-1))),correct_count:(existing?.correct_count||0)+(correct?1:0),wrong_count:(existing?.wrong_count||0)+(correct?0:1),last_practiced_at:new Date().toISOString()};await supabase.from('word_progress').upsert(payload);existing?Object.assign(existing,payload):state.progress.push(payload);}
  setTimeout(()=>{state.question++;state.answered=false;renderQuestion();},1000);
}

async function finishQuiz() {
  state.profile.xp=(state.profile.xp||0)+state.score; const today=new Date().toISOString().slice(0,10),last=state.profile.last_practice_date;
  if(last!==today){const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);state.profile.streak=last===yesterday?(state.profile.streak||0)+1:1;state.profile.last_practice_date=today;}
  if(!demoMode)await supabase.from('profiles').upsert({user_id:state.session.user.id,xp:state.profile.xp,streak:state.profile.streak,last_practice_date:state.profile.last_practice_date});
  document.querySelector('#view').innerHTML=`<section class="view quiz-wrap"><article class="card" style="text-align:center;padding:70px 24px"><div class="eyebrow">Session complete</div><div style="font-size:clamp(75px,16vw,150px);font-weight:900;letter-spacing:-.09em;color:var(--acid);line-height:1;margin:22px 0">+${state.score}</div><h2 style="font-size:34px;margin:0 0 10px">這回合完成了。</h2><p style="color:var(--muted)">答對 ${state.score/10} / ${state.quiz.length} 題，明天再讓這些單字回來一次。</p><button class="btn btn-primary" id="again" style="margin-top:18px">再玩一回合 ${icon('arrow')}</button></article></section>`;document.querySelector('#again').onclick=startQuiz;
}

bootstrap();
