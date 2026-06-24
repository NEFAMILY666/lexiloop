import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { icon } from './icons.js';
import { systemWords } from './systemWords.js';
import './style.css';

const app = document.querySelector('#app');
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const configured = Object.values(config).every(Boolean) && !config.projectId?.includes('YOUR_PROJECT');
const demoMode = !configured && ['localhost', '127.0.0.1'].includes(location.hostname);
const firebaseApp = configured ? initializeApp(config) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

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
  view:'home', quiz:[], practicePool:[], quizSource:'personal', quizMode:'standard', quizDate:'', quizStopped:false, question:0, attempts:0, answered:false, score:0,
  authMessage:'',
};

const escapeHTML = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const toast = (message, error=false) => { const el=document.createElement('div'); el.className=`toast${error?' error':''}`; el.textContent=message; document.body.append(el); setTimeout(()=>el.remove(),3200); };
const shuffle = arr => [...arr].sort(()=>Math.random()-.5);
const wordDateKey = word => {
  const value=word?.createdAt;
  const date=value?.toDate?.() || (value ? new Date(value) : null);
  if(!date || Number.isNaN(date.getTime()))return '';
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};
const googleLogo = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.91A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.51l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6C7.18 7.72 9.39 5.96 12 5.96Z"/></svg>`;

function speak(text) {
  if (!('speechSynthesis' in window)) return toast('這個瀏覽器目前不支援語音播放', true);
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang='en-US'; utterance.rate=.86;
  speechSynthesis.speak(utterance);
}

async function bootstrap() {
  if (demoMode) return renderApp();
  if (!configured) return renderSetup();
  onAuthStateChanged(auth, async user => {
    if (user) {
      state.session={user:{email:user.email,id:user.uid}};
      await verifyAndLoad(user);
    } else {
      state.session=null;
      const message=state.authMessage; state.authMessage='';
      renderLogin(message);
    }
  });
}

async function verifyAndLoad(user) {
  try {
    const wordsRef=collection(db,'users',user.uid,'words');
    const progressRef=collection(db,'users',user.uid,'progress');
    const profileRef=doc(db,'users',user.uid,'profile','stats');
    const [wordsSnap,progressSnap,profileSnap]=await Promise.all([
      getDocs(query(wordsRef,orderBy('createdAt','desc'))), getDocs(progressRef), getDoc(profileRef)
    ]);
    state.allowed=true;
    state.words=wordsSnap.docs.map(item=>({id:item.id,...item.data()}));
    state.progress=progressSnap.docs.map(item=>({id:item.id,...item.data()}));
    state.profile=profileSnap.exists()?profileSnap.data():{xp:0,streak:0,last_practice_date:null};
    if (!state.words.length) state.view='add';
    renderApp();
  } catch (error) {
    console.error(error);
    state.allowed=false;
    state.authMessage=error?.code==='permission-denied'?'這個 Google 帳號不在使用白名單中。':'目前無法讀取題庫，請稍後再試。';
    await firebaseSignOut(auth);
  }
}

function renderSetup() {
  app.innerHTML=`<div class="login"><section class="login-art"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><h1>WORDS<br><span>IN PLAY.</span></h1><div class="orbit"></div></section><section class="login-panel"><div class="eyebrow">One-time setup</div><h2>差最後一步，<br>就能開始。</h2><p>網站已完成，但尚未連接 Firebase。請依 README 建立 Firebase 專案，並在 GitHub 設定四個部署密鑰。</p><div class="notice">你的白名單信箱與單字資料只會存在 Firebase 後端，不會寫入公開前端。</div></section></div><div class="grain"></div>`;
}

function renderLogin(message='') {
  app.innerHTML=`<div class="login"><section class="login-art"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><h1>WORDS<br><span>IN PLAY.</span></h1><div class="orbit"></div></section><section class="login-panel"><div class="eyebrow">Private vocabulary space</div><h2>登入，開始<br>建立你的題庫。</h2><p>使用已加入白名單的 Google 帳戶繼續。登入後即可新增單字、匯入題庫並開始練習。</p>${message?`<div class="notice">${escapeHTML(message)}</div>`:''}<button class="btn google-login" id="google-login">${googleLogo}<span>使用 Google 帳戶繼續</span></button><div class="privacy-note">登入資格由伺服器端白名單驗證，核准信箱不會出現在公開前端。</div></section></div><div class="grain"></div>`;
  document.querySelector('#google-login').onclick=async e=>{const btn=e.currentTarget;btn.disabled=true;btn.querySelector('span').textContent='正在開啟 Google…';try{const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await signInWithPopup(auth,provider);}catch(error){if(error?.code!=='auth/popup-closed-by-user')toast('Google 登入失敗，請稍後再試。',true);btn.disabled=false;btn.querySelector('span').textContent='使用 Google 帳戶繼續';}};
}

function renderApp() {
  const email=state.session?.user?.email || '';
  app.innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">LL</span>LEXILOOP</div><div class="userbox"><span class="user-email mono" style="font-size:11px;color:var(--muted)">${demoMode?'PREVIEW MODE':escapeHTML(email)}</span><span class="avatar">${escapeHTML(email[0]?.toUpperCase()||'U')}</span><button class="btn btn-quiet icon-btn" id="logout" aria-label="登出">${icon('logout')}</button></div></header><section class="hero"><div><div class="eyebrow">Your vocabulary playground · 2026</div><h1>MAKE WORDS<br><span>STICK.</span></h1></div><p class="hero-note">不是死背，是反覆相遇。建立自己的題庫，用短回合練習，把每個陌生單字慢慢變成熟悉的朋友。</p></section><nav class="nav-tabs"><button class="tab" data-view="home">總覽</button><button class="tab" data-view="practice">開始練習</button><button class="tab" data-view="library">我的題庫</button><button class="tab" data-view="add">新增單字</button></nav><main id="view"></main></div><div class="grain"></div>`;
  document.querySelector('#logout').onclick=()=>demoMode?toast('預覽模式不需登出'):firebaseSignOut(auth);
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{state.view=t.dataset.view;renderView();});
  renderView();
}

function renderView() {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===state.view));
  const root=document.querySelector('#view'); if(!root)return;
  if(state.view==='home') renderHome(root);
  if(state.view==='practice') renderPracticeSelector(root);
  if(state.view==='library') renderLibrary(root);
  if(state.view==='add') renderAdd(root);
}

function renderHome(root) {
  const mastered=state.progress.filter(p=>p.mastery>=4).length;
  const percent=state.words.length?Math.round(mastered/state.words.length*100):0;
  root.innerHTML=`<section class="view dashboard-grid"><article class="card stat stat-acid"><div class="eyebrow" style="color:#111">Total words</div><div class="stat-value">${state.words.length}</div><div class="mono" style="font-size:11px">你的私人題庫</div></article><article class="card stat"><div class="eyebrow">Current streak</div><div class="stat-value">${state.profile.streak||0}<small style="font-size:20px">天</small></div><div class="mono" style="font-size:11px;color:var(--orange)">Keep it alive</div></article><article class="card stat stat-orange"><div class="eyebrow" style="color:#111">Total XP</div><div class="stat-value">${state.profile.xp||0}</div><div class="mono" style="font-size:11px">Level ${Math.floor((state.profile.xp||0)/200)+1}</div></article><article class="card stat"><div class="eyebrow">Mastered</div><div class="stat-value">${mastered}</div><div class="mono" style="font-size:11px;color:var(--violet)">${percent}% complete</div></article><article class="card practice-cta"><div><div class="eyebrow">Quick session · 10 words</div><h2>今天也讓大腦<br>熱身一下。</h2></div><div><button class="btn btn-primary" id="home-practice">開始這一回合 ${icon('arrow')}</button></div></article><article class="card progress-card"><div class="eyebrow">Collection mastery</div><div style="position:relative"><div class="ring" style="--p:${percent}"></div><div class="ring-label">${percent}%</div></div><p style="text-align:center;color:var(--muted);font-size:13px">精熟 ${mastered} / ${state.words.length} 個單字</p></article></section>`;
  document.querySelector('#home-practice').onclick=()=>{state.view='practice';renderView();};
}

function renderPracticeSelector(root) {
  const mixedCount=new Set([...state.words,...systemWords].map(word=>word.term.toLowerCase())).size;
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Choose your collection</div><h2>選擇練習題庫</h2></div></div><div class="practice-settings"><div><div class="setting-label">練習模式</div><div class="mode-switch"><button class="mode-button active" data-mode="standard" type="button">10 題模式</button><button class="mode-button" data-mode="infinite" type="button">∞ 無限模式</button></div></div><label class="practice-date"><span class="setting-label">優先練習新增日期</span><input id="practice-date" class="input" type="date"><small>當天不足 10 題時，會自動從其他日期補足。</small></label></div><div class="source-grid"><button class="card source-card" data-source="personal"><span class="source-number">${state.words.length}</span><span class="eyebrow">Personal collection</span><strong>我的題庫</strong><span>練習你自行新增與匯入的單字</span></button><button class="card source-card source-system" data-source="system"><span class="source-number">${systemWords.length}</span><span class="eyebrow">Curated collection</span><strong>系統題庫</strong><span>由 Lexiloop 準備的常用英文單字</span></button><button class="card source-card source-mixed" data-source="mixed"><span class="source-number">${mixedCount}</span><span class="eyebrow">All collections</span><strong>混合練習</strong><span>把我的題庫與系統題庫混在一起</span></button></div></section>`;
  let selectedMode='standard';
  root.querySelectorAll('.mode-button').forEach(button=>button.onclick=()=>{selectedMode=button.dataset.mode;root.querySelectorAll('.mode-button').forEach(item=>item.classList.toggle('active',item===button));});
  root.querySelectorAll('.source-card').forEach(button=>button.onclick=()=>startQuiz(button.dataset.source,selectedMode,root.querySelector('#practice-date').value));
}

function renderLibrary(root) {
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Personal collection</div><h2>我的題庫</h2></div><div class="library-tools"><input id="search" class="input" placeholder="搜尋單字…"><button id="go-add" class="btn btn-primary">${icon('plus')} 新增</button></div></div><div id="word-list" class="word-list"></div></section>`;
  const draw=(query='')=>{const words=state.words.filter(w=>(w.term+' '+w.definition).toLowerCase().includes(query.toLowerCase()));document.querySelector('#word-list').innerHTML=words.length?words.map(w=>`<div class="word-row"><div><div class="word-term">${escapeHTML(w.term)}</div><div class="word-meta">${escapeHTML(w.part_of_speech||'')} · ${escapeHTML(w.level||'')}</div></div><div class="word-definition">${escapeHTML(w.definition)}</div><div class="word-meta">${escapeHTML(w.example||'—')}</div><div style="display:flex;gap:6px"><button class="btn btn-quiet icon-btn speak" data-term="${escapeHTML(w.term)}" aria-label="播放 ${escapeHTML(w.term)} 發音">${icon('volume')}</button><button class="btn btn-quiet icon-btn btn-danger delete" data-id="${w.id}" aria-label="刪除 ${escapeHTML(w.term)}">${icon('trash')}</button></div></div>`).join(''):`<div class="empty">目前找不到單字。新增第一個，讓題庫開始長大。</div>`;document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.term));document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>deleteWord(b.dataset.id));};
  draw(); document.querySelector('#search').oninput=e=>draw(e.target.value); document.querySelector('#go-add').onclick=()=>{state.view='add';renderView();};
}

async function deleteWord(id) {
  if(!confirm('確定要刪除這個單字嗎？'))return;
  if(!demoMode){try{await deleteDoc(doc(db,'users',state.session.user.id,'words',id));}catch(error){return toast('刪除失敗，請稍後再試。',true);}}
  state.words=state.words.filter(w=>String(w.id)!==String(id));renderLibrary(document.querySelector('#view'));toast('單字已刪除');
}

function renderAdd(root) {
  root.innerHTML=`<section class="view"><div class="section-head"><div><div class="eyebrow">Grow your collection</div><h2>新增單字</h2></div></div><div class="dashboard-grid"><article class="card" style="grid-column:span 7"><form id="word-form"><div class="form-grid"><div class="field"><label for="word-term">英文單字 *</label><div class="input-with-action"><input id="word-term" name="term" class="input" required autocomplete="off" placeholder="e.g. serendipity"><button class="btn btn-quiet translate-button" id="auto-translate" type="button">自動翻譯</button></div><div class="field-hint" id="translate-status">只輸入英文後按下自動翻譯，結果仍可自行修改。</div></div><div class="field"><label for="word-definition">中文解釋 *</label><input id="word-definition" name="definition" class="input" required placeholder="e.g. 意外發現美好事物的機緣"></div><div class="field"><label>詞性</label><select name="part_of_speech" class="input"><option value="">未分類</option><option>noun</option><option>verb</option><option>adjective</option><option>adverb</option><option>phrase</option></select></div><div class="field"><label>程度</label><select name="level" class="input"><option>A1</option><option>A2</option><option selected>B1</option><option>B2</option><option>C1</option><option>C2</option></select></div><div class="field full"><label>例句</label><textarea name="example" class="input" placeholder="Write an example sentence..."></textarea></div></div><div id="add-status" class="form-status" role="status" aria-live="polite" hidden></div><div class="form-actions"><button class="btn btn-primary" id="submit-word" type="submit">${icon('plus')} 加入題庫</button></div></form></article><article class="card" style="grid-column:span 5"><div class="eyebrow">Batch import</div><h3 style="font-size:30px;letter-spacing:-.04em;margin:14px 0 8px">一次匯入多個單字</h3><p style="color:var(--muted);line-height:1.7;font-size:14px">支援 CSV 檔，欄位依序為：<br><span class="mono" style="color:var(--ink)">term, definition, example, part_of_speech, level</span></p><input id="csv" type="file" accept=".csv,text/csv" hidden><button class="btn" id="csv-button" style="margin-top:16px">${icon('upload')} 選擇 CSV 檔案</button><div id="import-status" style="margin-top:16px;color:var(--muted);font-size:13px"></div></article></div></section>`;
  const cards=root.querySelectorAll('.card'); if(innerWidth<=600) cards.forEach(c=>c.style.gridColumn='1/-1');
  root.querySelector('#word-form').onsubmit=addWord;
  root.querySelector('#auto-translate').onclick=autoTranslateWord;
  root.querySelector('#csv-button').onclick=()=>root.querySelector('#csv').click(); root.querySelector('#csv').onchange=importCSV;
  root.querySelector('#word-term').focus();
}

function showAddStatus(form,message,type='success') {
  const status=form.querySelector('#add-status');
  status.hidden=false;
  status.className=`form-status ${type}`;
  status.textContent=message;
}

async function autoTranslateWord(e) {
  const button=e.currentTarget;
  const form=button.closest('form');
  const termInput=form.elements.term;
  const definitionInput=form.elements.definition;
  const status=form.querySelector('#translate-status');
  const term=termInput.value.trim();
  if(!term){termInput.focus();status.textContent='請先輸入要翻譯的英文單字。';status.classList.add('error');return;}
  status.classList.remove('error');
  const knownWord=[...state.words,...systemWords].find(word=>word.term.toLowerCase()===term.toLowerCase()&&word.definition);
  if(knownWord){definitionInput.value=knownWord.definition;status.textContent='已從 Lexiloop 題庫帶入中文，儲存前仍可修改。';definitionInput.focus();return;}
  const originalText=button.textContent;
  button.disabled=true;
  button.textContent='翻譯中…';
  status.textContent='正在查詢免費線上翻譯…';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try {
    const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(term)}&langpair=en%7Czh-TW`;
    const response=await fetch(url,{signal:controller.signal});
    if(!response.ok)throw new Error('translation request failed');
    const result=await response.json();
    const translated=String(result?.responseData?.translatedText||'').trim();
    if(!translated||translated.toLowerCase()===term.toLowerCase())throw new Error('empty translation');
    definitionInput.value=translated;
    status.textContent='已填入免費機器翻譯，建議確認語意後再加入題庫。';
    definitionInput.focus();
  } catch(error) {
    console.error(error);
    status.textContent='目前無法取得翻譯，請稍後再試或自行輸入中文。';
    status.classList.add('error');
  } finally {
    clearTimeout(timer);
    button.disabled=false;
    button.textContent=originalText;
  }
}

async function addWord(e) {
  e.preventDefault();
  const form=e.currentTarget;
  const submit=form.querySelector('#submit-word');
  const originalHTML=submit.innerHTML;
  const data=Object.fromEntries(new FormData(form));
  data.term=data.term.trim();
  data.definition=data.definition.trim();
  submit.disabled=true;
  submit.textContent='儲存中…';
  showAddStatus(form,`正在新增 ${data.term}…`,'loading');
  try {
    data.createdAt=new Date().toISOString();
    if(demoMode){data.id=crypto.randomUUID();state.words.unshift(data);}
    else {
      const ref=await addDoc(collection(db,'users',state.session.user.id,'words'),{...data,createdAt:serverTimestamp()});
      data.id=ref.id;
      state.words.unshift(data);
    }
    form.reset();
    form.querySelector('#translate-status').textContent='只輸入英文後按下自動翻譯，結果仍可自行修改。';
    form.querySelector('#translate-status').classList.remove('error');
    showAddStatus(form,`✓「${data.term}」已成功加入題庫，可以繼續輸入下一個單字。`);
    form.elements.term.focus();
    toast(`已加入 ${data.term}`);
  } catch(error) {
    console.error(error);
    showAddStatus(form,'新增失敗，資料尚未儲存，請稍後再試。','error');
    toast('新增失敗，請稍後再試。',true);
  } finally {
    submit.disabled=false;
    submit.innerHTML=originalHTML;
  }
}

function parseCSV(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){field+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;} row.push(field.trim());if(row.some(Boolean))rows.push(row);
  const start=rows[0]?.[0]?.toLowerCase()==='term'?1:0; return rows.slice(start).filter(r=>r[0]&&r[1]).map(r=>({term:r[0],definition:r[1],example:r[2]||'',part_of_speech:r[3]||'',level:r[4]||'B1'}));
}

async function importCSV(e) {
  const file=e.target.files[0]; if(!file)return; const words=parseCSV(await file.text()); const status=document.querySelector('#import-status');
  if(!words.length)return status.textContent='沒有找到可匯入的資料，請檢查 CSV 格式。';
  const createdAt=new Date().toISOString();
  if(demoMode){words.forEach(w=>{w.id=crypto.randomUUID();w.createdAt=createdAt;});state.words.unshift(...words);} else {try{const saved=[];for(let offset=0;offset<words.length;offset+=400){const batch=writeBatch(db);for(const word of words.slice(offset,offset+400)){const ref=doc(collection(db,'users',state.session.user.id,'words'));batch.set(ref,{...word,createdAt:serverTimestamp()});saved.push({...word,id:ref.id,createdAt});}await batch.commit();}state.words.unshift(...saved);}catch(error){return toast('匯入失敗，請稍後再試。',true);}}
  status.textContent=`完成！已匯入 ${words.length} 個單字。`; toast(`成功匯入 ${words.length} 個單字`);
}

function startQuiz(source=state.quizSource,mode=state.quizMode,selectedDate=state.quizDate) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view==='practice'));
  state.quizSource=source;
  state.quizMode=mode;
  state.quizDate=selectedDate;
  state.quizStopped=false;
  const sourceWords=source==='system'?systemWords:source==='mixed'?[...state.words,...systemWords]:state.words;
  state.practicePool=[...new Map(sourceWords.map(word=>[word.term.toLowerCase(),word])).values()];
  if(state.practicePool.length<4){document.querySelector('#view').innerHTML=`<section class="view empty">我的題庫至少需要 4 個單字才能開始練習。<br><button class="btn btn-primary" id="need-add" style="margin-top:18px">新增單字</button></section>`;document.querySelector('#need-add').onclick=()=>{state.view='add';renderView();};return;}
  const preferred=selectedDate?state.practicePool.filter(word=>wordDateKey(word)===selectedDate):[];
  const preferredIds=new Set(preferred.map(word=>word.id));
  const ordered=[...shuffle(preferred),...shuffle(state.practicePool.filter(word=>!preferredIds.has(word.id)))];
  state.quiz=mode==='infinite'?ordered:ordered.slice(0,Math.min(10,ordered.length));
  state.question=0;state.attempts=0;state.score=0;state.answered=false;renderQuestion();
}

function renderQuestion() {
  const root=document.querySelector('#view');
  if(state.question>=state.quiz.length){
    if(state.quizMode!=='infinite')return finishQuiz();
    const nextRound=shuffle(state.practicePool);
    if(nextRound.length>1&&nextRound[0]?.id===state.quiz[state.quiz.length-1]?.id)nextRound.push(nextRound.shift());
    state.quiz.push(...nextRound);
  }
  const word=state.quiz[state.question];
  const distractors=shuffle(state.practicePool.filter(w=>w.id!==word.id&&w.definition!==word.definition)).slice(0,3).map(w=>w.definition); const options=shuffle([word.definition,...distractors]);
  const counter=state.quizMode==='infinite'?`${state.question+1} / ∞`:`${state.question+1} / ${state.quiz.length}`;
  const progress=state.quizMode==='infinite'?(state.question%10)*10:(state.question/state.quiz.length)*100;
  root.innerHTML=`<section class="view quiz-wrap"><div class="quiz-top"><span class="mono" style="font-size:11px;color:var(--muted)">${counter}</span><div class="quiz-progress"><span style="width:${progress}%"></span></div><span class="mono" style="font-size:11px;color:var(--acid)">${state.score} XP</span>${state.quizMode==='infinite'?'<button class="btn btn-quiet" id="stop-infinite" type="button">結束練習</button>':''}</div><article class="card quiz-card"><div class="eyebrow">Choose the meaning</div><div style="display:flex;align-items:center;gap:14px"><div class="quiz-word">${escapeHTML(word.term)}</div><button class="btn icon-btn" id="quiz-speak" aria-label="播放發音">${icon('volume')}</button></div><div class="quiz-example">${escapeHTML(word.example||'選出最接近的中文解釋')}</div><div class="options">${options.map((o,i)=>`<button class="option" data-value="${escapeHTML(o)}"><span class="mono" style="font-size:10px;color:var(--muted)">0${i+1}</span><br>${escapeHTML(o)}</button>`).join('')}</div><div class="feedback"></div></article></section>`;
  document.querySelector('#quiz-speak').onclick=()=>speak(word.term); document.querySelectorAll('.option').forEach(b=>b.onclick=()=>answer(b,word));
  if(state.quizMode==='infinite')document.querySelector('#stop-infinite').onclick=()=>{state.quizStopped=true;state.answered=true;finishQuiz();};
}

async function answer(button,word) {
  if(state.answered)return; state.answered=true; state.attempts++; const correct=button.dataset.value===word.definition; if(correct)state.score+=10;
  document.querySelectorAll('.option').forEach(b=>{b.disabled=true;if(b.dataset.value===word.definition)b.classList.add('correct');}); if(!correct)button.classList.add('wrong');
  document.querySelector('.feedback').textContent=correct?'漂亮！+10 XP':'差一點，正確答案已標示。';
  if(!demoMode){const existing=state.progress.find(p=>p.word_id===word.id);const payload={word_id:word.id,mastery:Math.max(0,Math.min(5,(existing?.mastery||0)+(correct?1:-1))),correct_count:(existing?.correct_count||0)+(correct?1:0),wrong_count:(existing?.wrong_count||0)+(correct?0:1),last_practiced_at:new Date().toISOString()};try{await setDoc(doc(db,'users',state.session.user.id,'progress',word.id),payload,{merge:true});existing?Object.assign(existing,payload):state.progress.push(payload);}catch(error){console.error(error);}}
  setTimeout(()=>{if(state.quizStopped)return;state.question++;state.answered=false;renderQuestion();},1000);
}

async function finishQuiz() {
  state.profile.xp=(state.profile.xp||0)+state.score; const today=new Date().toISOString().slice(0,10),last=state.profile.last_practice_date;
  if(last!==today){const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);state.profile.streak=last===yesterday?(state.profile.streak||0)+1:1;state.profile.last_practice_date=today;}
  if(!demoMode)await setDoc(doc(db,'users',state.session.user.id,'profile','stats'),{xp:state.profile.xp,streak:state.profile.streak,last_practice_date:state.profile.last_practice_date},{merge:true});
  document.querySelector('#view').innerHTML=`<section class="view quiz-wrap"><article class="card" style="text-align:center;padding:70px 24px"><div class="eyebrow">Session complete</div><div style="font-size:clamp(75px,16vw,150px);font-weight:900;letter-spacing:-.09em;color:var(--acid);line-height:1;margin:22px 0">+${state.score}</div><h2 style="font-size:34px;margin:0 0 10px">這回合完成了。</h2><p style="color:var(--muted)">答對 ${state.score/10} / ${state.attempts} 題，明天再讓這些單字回來一次。</p><button class="btn btn-primary" id="again" style="margin-top:18px">再玩一回合 ${icon('arrow')}</button><button class="btn" id="change-source" style="margin:18px 0 0 8px">更換題庫</button></article></section>`;document.querySelector('#again').onclick=()=>startQuiz(state.quizSource,state.quizMode,state.quizDate);document.querySelector('#change-source').onclick=()=>{state.view='practice';renderView();};
}

bootstrap();
