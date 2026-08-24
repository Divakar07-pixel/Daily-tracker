/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
═══════════════════════════════════════════════════════════════════════════ */
const ACT_CATS = ['Work','Learning','Exercise','Personal','Health','Social','Creative','Other'];
const EXP_CATS = ['Food','Transport','Bills','Shopping','Health','Entertainment','Stock','Aura Silver','Petrol','Parking','Other'];

const CAT_COLORS = {
  Work:'#0369a1',Learning:'#7e22ce',Exercise:'#2d6a4f',Personal:'#b45309',
  Health:'#be123c',Social:'#d97706',Creative:'#dc2626',Other:'#64748b',
  Food:'#b45309',Transport:'#0369a1',Bills:'#7e22ce',Shopping:'#be123c',
  Entertainment:'#2d6a4f','Aura Silver':'#64748b',Stock:'#059669',Petrol:'#dc2626',
  Parking:'#f59e0b'
};

const SK_ACAT = 'mdt_acat_recent';
const SK_ECAT = 'mdt_ecat_recent';

/* ═══════════════════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════════════════ */
let acts = [], exps = [];
let unsubscribeActs, unsubscribeExps;

async function load(){
  if (typeof onSnapshot !== 'function' || typeof collection !== 'function' || !window.db) {
    console.error('Firebase Firestore is not initialized.');
    showToast('❌ Firebase is not ready');
    return;
  }

  if (unsubscribeActs) unsubscribeActs();
  if (unsubscribeExps) unsubscribeExps();

  unsubscribeActs = onSnapshot(collection(db, 'activities'), (snapshot) => {
    acts = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderAll();
  }, (error) => {
    console.error('Activities listener failed:', error);
    showToast('❌ Unable to load activities');
  });

  unsubscribeExps = onSnapshot(collection(db, 'expenses'), (snapshot) => {
    exps = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    renderAll();
  }, (error) => {
    console.error('Expenses listener failed:', error);
    showToast('❌ Unable to load expenses');
  });
}

function persist(){ /* Firestore is the source of truth. */ }

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function today(){ return new Date().toISOString().slice(0,10); }
function nowTime(){ return new Date().toTimeString().slice(0,5); }
function thisMonth(){ return today().slice(0,7); }
function fmtDate(s){ if(!s)return''; const d=new Date(s+'T00:00'); return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }
function fmtAmt(n){ return '₹'+Number(n || 0).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2}); }

function recentCats(sk, fallback){
  try{
    const r=JSON.parse(localStorage.getItem(sk)||'[]');
    return [...new Set([...r,...fallback])];
  }catch(e){
    return fallback;
  }
}
function pushRecentCat(sk, cat, all){
  let r = recentCats(sk, all);
  r = [cat, ...r.filter(c=>c!==cat)].slice(0, all.length);
  localStorage.setItem(sk, JSON.stringify(r));
}

function showToast(msg, ms=2200){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), ms);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════════════════════════════════════ */
function tick(){
  const el = document.getElementById('live-time');
  if(el) el.textContent = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY PILLS
═══════════════════════════════════════════════════════════════════════════ */
function buildPills(containerId, hiddenId, cats, selected, onSelect){
  const wrap = document.getElementById(containerId);
  const hidden = document.getElementById(hiddenId);
  if(!wrap || !hidden) return;
  wrap.innerHTML = '';

  cats.forEach(c=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cat-pill' + (c===selected?' sel':'');
    b.textContent = c;
    b.addEventListener('click', ()=>{
      wrap.querySelectorAll('.cat-pill').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
      hidden.value = c;
      if(onSelect) onSelect(c);
    });
    wrap.appendChild(b);
  });
}

function initPills(){
  const aCatEl = document.getElementById('a-cat');
  const eCatEl = document.getElementById('e-cat');
  if(!aCatEl || !eCatEl) return;
  buildPills('act-cat-pills','a-cat',recentCats(SK_ACAT,ACT_CATS),aCatEl.value);
  buildPills('exp-cat-pills','e-cat',recentCats(SK_ECAT,EXP_CATS),eCatEl.value);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAVE ACTIVITY / EXPENSE
═══════════════════════════════════════════════════════════════════════════ */
async function saveActivity(){
  const nameEl = document.getElementById('a-name');
  const name = nameEl.value.trim();
  if(!name){ nameEl.focus(); showToast('⚠️ Enter activity name'); return; }

  const cat = document.getElementById('a-cat').value;
  const activity = {
    date: document.getElementById('a-date').value || today(),
    time: document.getElementById('a-time').value || nowTime(),
    name,
    category: cat,
    duration: parseFloat(document.getElementById('a-dur').value)||0,
    status: document.getElementById('a-status').value,
    notes: document.getElementById('a-notes').value.trim()
  };

  try {
    await addDoc(collection(db,'activities'),activity);
    pushRecentCat(SK_ACAT,cat,ACT_CATS);
    showToast('✅ Activity saved!');
    document.getElementById('a-name').value='';
    document.getElementById('a-dur').value='';
    document.getElementById('a-notes').value='';
    document.getElementById('a-date').value=today();
    document.getElementById('a-time').value=nowTime();
    document.getElementById('a-status').value='Completed';
    initPills();
  } catch(e) {
    console.error(e);
    showToast('❌ Error saving activity');
  }
}

async function saveExpense(){
  const nameEl = document.getElementById('e-name');
  const amtEl = document.getElementById('e-amt');
  const name = nameEl.value.trim();
  const amt = parseFloat(amtEl.value);
  if(!name){ nameEl.focus(); showToast('⚠️ Enter expense name'); return; }
  if(!Number.isFinite(amt) || amt <= 0){ amtEl.focus(); showToast('⚠️ Enter a valid amount'); return; }

  const cat = document.getElementById('e-cat').value;
  const expense = {
    date: document.getElementById('e-date').value || today(),
    name,
    category: cat,
    amount: amt,
    mode: document.getElementById('e-mode').value,
    notes: document.getElementById('e-notes').value.trim()
  };

  try {
    await addDoc(collection(db,'expenses'),expense);
    pushRecentCat(SK_ECAT,cat,EXP_CATS);
    showToast('💰 Expense saved!');
    document.getElementById('e-name').value='';
    document.getElementById('e-amt').value='';
    document.getElementById('e-notes').value='';
    document.getElementById('e-date').value=today();
    initPills();
  } catch(e) {
    console.error(e);
    showToast('❌ Error saving expense');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE
═══════════════════════════════════════════════════════════════════════════ */
async function delAct(id){
  if(!id) return;
  if(!confirm('Delete this activity?')) return;
  try {
    await deleteDoc(doc(db,'activities',String(id)));
    showToast('Deleted');
  } catch(e) {
    console.error(e);
    showToast('❌ Error deleting activity');
  }
}

async function delExp(id){
  if(!id) return;
  if(!confirm('Delete this expense?')) return;
  try {
    await deleteDoc(doc(db,'expenses',String(id)));
    showToast('Deleted');
  } catch(e) {
    console.error(e);
    showToast('❌ Error deleting expense');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function actionButton(label, handlerName, id, className='log-del'){
  const button = document.createElement('button');
  button.type='button';
  button.className=className;
  button.textContent=label;
  button.dataset.action=handlerName;
  button.dataset.id=id;
  return button.outerHTML;
}

function actHTML(a, showDel=true){
  const col = CAT_COLORS[a.category]||'#64748b';
  const badge = a.status==='Completed'?'badge-done':'badge-pend';
  const delBtn = showDel ? `<button type="button" class="log-del" data-action="delete-activity" data-id="${escAttr(a.id)}">✕</button>` : '';
  return `<div class="log-item">
    <div class="log-dot" style="background:${col}"></div>
    <div class="log-main">
      <div class="log-name">${esc(a.name)}</div>
      <div class="log-meta">${esc(a.category)} · ${fmtDate(a.date)} ${esc(a.time||'')}${a.notes?' · '+esc(String(a.notes).slice(0,40)):''}</div>
    </div>
    <div class="log-right">
      ${a.duration>0?`<div class="log-val">${a.duration}h</div>`:''}
      <span class="log-badge ${badge}">${esc(a.status||'')}</span>
    </div>
    ${delBtn}
  </div>`;
}

function expHTML(e, showDel=true){
  const col = CAT_COLORS[e.category]||'#64748b';
  const delBtn = showDel ? `<button type="button" class="log-del" data-action="delete-expense" data-id="${escAttr(e.id)}">✕</button>` : '';
  return `<div class="log-item">
    <div class="log-dot" style="background:${col}"></div>
    <div class="log-main">
      <div class="log-name">${esc(e.name)}</div>
      <div class="log-meta">${esc(e.category)} · ${esc(e.mode||'')} · ${fmtDate(e.date)}${e.notes?' · '+esc(String(e.notes).slice(0,40)):''}</div>
    </div>
    <div class="log-right"><div class="log-val">${fmtAmt(e.amount)}</div></div>
    ${delBtn}
  </div>`;
}

function esc(s){
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(s){ return esc(s); }
function emptyHTML(icon,msg){ return `<div class="empty"><div class="empty-icon">${icon}</div><div class="empty-txt">${esc(msg)}</div></div>`; }

/* ═══════════════════════════════════════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════════════════════════════════════ */
const _charts = {};
function destroyChart(id){ if(_charts[id]){ _charts[id].destroy(); delete _charts[id]; } }
const CHART_FONT = "'DM Sans', sans-serif";
const CHART_TICK = { color:'#8a7a6e', font:{ family:CHART_FONT, size:10 } };
const CHART_GRID = { color:'rgba(221,212,196,.5)' };

function renderExpDonut(monthExps){
  destroyChart('expDonut');
  const catTotals={};
  monthExps.forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+Number(e.amount||0);});
  const entries=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const el=document.getElementById('chart-exp-donut');
  const legEl=document.getElementById('legend-donut');
  if(!el || !legEl) return;
  if(!entries.length){el.parentElement.style.opacity='.4';legEl.innerHTML='<span style="font-size:.72rem;color:var(--ink3)">No expense data yet</span>';return;}
  el.parentElement.style.opacity='1';
  const labels=entries.map(([c])=>c), data=entries.map(([,v])=>v), colors=entries.map(([c])=>CAT_COLORS[c]||'#64748b');
  _charts.expDonut=new Chart(el,{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors.map(c=>c+'cc'),borderColor:colors,borderWidth:2,hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.label+': ₹'+Number(ctx.raw).toLocaleString('en-IN')}}}}});
  legEl.innerHTML=entries.map(([c])=>`<div class="legend-item"><div class="legend-dot" style="background:${CAT_COLORS[c]||'#64748b'}"></div><span>${esc(c)}</span></div>`).join('');
}

function renderCompletionRing(todayActs){
  destroyChart('compRing');
  const done=todayActs.filter(a=>a.status==='Completed').length;
  const pend=todayActs.filter(a=>a.status==='Pending').length;
  const prog=todayActs.filter(a=>a.status==='In Progress').length;
  const canc=todayActs.filter(a=>a.status==='Cancelled').length;
  const total=todayActs.length;
  const pct=total?Math.round(done/total*100):0;
  const pctEl=document.getElementById('completion-pct'); if(pctEl) pctEl.textContent=total?pct+'%':'—';
  const el=document.getElementById('chart-completion-ring'); if(!el) return;
  if(!total){el.parentElement.style.opacity='.4';return;}
  el.parentElement.style.opacity='1';
  _charts.compRing=new Chart(el,{type:'doughnut',data:{labels:['Completed','Pending','In Progress','Cancelled'],datasets:[{data:[done,pend,prog,canc],backgroundColor:['#2d6a4fcc','#b45309cc','#0369a1cc','#be123ccc'],borderColor:['#2d6a4f','#b45309','#0369a1','#be123c'],borderWidth:2,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.label+': '+ctx.raw}}}}});
}

function renderSpendingLine(){
  destroyChart('spendLine');
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toISOString().slice(0,10);});
  const labels=days.map(d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}));
  const data=days.map(d=>exps.filter(e=>e.date===d).reduce((s,e)=>s+Number(e.amount||0),0));
  const el=document.getElementById('chart-spending-line'); if(!el) return;
  _charts.spendLine=new Chart(el,{type:'line',data:{labels,datasets:[{label:'Spent (₹)',data,borderColor:'#b45309',backgroundColor:'rgba(180,83,9,.08)',tension:.4,fill:true,pointBackgroundColor:'#b45309',pointRadius:4,pointHoverRadius:6,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' ₹'+Number(ctx.raw).toLocaleString('en-IN')}}},scales:{x:{ticks:CHART_TICK,grid:{display:false}},y:{ticks:{...CHART_TICK,callback:v=>'₹'+v},grid:CHART_GRID,beginAtZero:true}}}});
}

function renderActBar(){
  destroyChart('actBar');
  const catTotals={}; acts.forEach(a=>{catTotals[a.category]=(catTotals[a.category]||0)+Number(a.duration||0);});
  const entries=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const el=document.getElementById('chart-act-bar'); if(!el) return;
  if(!entries.length){el.parentElement.style.opacity='.4';return;}
  el.parentElement.style.opacity='1';
  _charts.actBar=new Chart(el,{type:'bar',data:{labels:entries.map(([c])=>c),datasets:[{data:entries.map(([,v])=>v),backgroundColor:entries.map(([c])=>(CAT_COLORS[c]||'#64748b')+'bb'),borderColor:entries.map(([c])=>CAT_COLORS[c]||'#64748b'),borderWidth:1.5,borderRadius:6}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.raw+'h'}}},scales:{x:{ticks:{...CHART_TICK,callback:v=>v+'h'},grid:CHART_GRID,beginAtZero:true},y:{ticks:CHART_TICK,grid:{display:false}}}}});
}

function renderPaymentPie(monthExps){
  destroyChart('payPie');
  const modeTotals={}; monthExps.forEach(e=>{modeTotals[e.mode]=(modeTotals[e.mode]||0)+Number(e.amount||0);});
  const entries=Object.entries(modeTotals).sort((a,b)=>b[1]-a[1]);
  const el=document.getElementById('chart-payment-pie'), legEl=document.getElementById('legend-payment'); if(!el||!legEl) return;
  if(!entries.length){el.parentElement.style.opacity='.4';legEl.innerHTML='<span style="font-size:.72rem;color:var(--ink3)">No data yet</span>';return;}
  el.parentElement.style.opacity='1';
  const MODE_COLORS={UPI:'#0369a1',Cash:'#2d6a4f',Card:'#7e22ce','Net Banking':'#b45309',Other:'#64748b'};
  const colors=entries.map(([m])=>MODE_COLORS[m]||'#64748b');
  _charts.payPie=new Chart(el,{type:'pie',data:{labels:entries.map(([m])=>m),datasets:[{data:entries.map(([,v])=>v),backgroundColor:colors.map(c=>c+'cc'),borderColor:colors,borderWidth:2,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.label+': ₹'+Number(ctx.raw).toLocaleString('en-IN')}}}}});
  legEl.innerHTML=entries.map(([m,v])=>`<div class="legend-item"><div class="legend-dot" style="background:${MODE_COLORS[m]||'#64748b'}"></div><span>${esc(m)} — ₹${Number(v).toLocaleString('en-IN')}</span></div>`).join('');
}

function renderAllCharts(todayActs,monthExps){
  clearTimeout(window.__chartTimer);
  window.__chartTimer=setTimeout(()=>{renderExpDonut(monthExps);renderCompletionRing(todayActs);renderSpendingLine();renderActBar();renderPaymentPie(monthExps);},30);
}

function renderDash(){
  const td=today(),tm=thisMonth();
  const todayActs=acts.filter(a=>a.date===td),todayExps=exps.filter(e=>e.date===td),monthExps=exps.filter(e=>String(e.date||'').startsWith(tm));
  const dateEl=document.getElementById('dash-date'); if(dateEl) dateEl.textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const kpiActs=document.getElementById('kpi-acts'); if(kpiActs) kpiActs.textContent=todayActs.length;
  const kpiHours=document.getElementById('kpi-hours'); if(kpiHours){const totalH=todayActs.reduce((s,a)=>s+Number(a.duration||0),0);kpiHours.textContent=totalH>0?totalH.toFixed(1)+'h':'0h';}
  const todaySpend=todayExps.reduce((s,e)=>s+Number(e.amount||0),0),monthSpend=monthExps.reduce((s,e)=>s+Number(e.amount||0),0);
  const kToday=document.getElementById('kpi-exp-today'); if(kToday) kToday.textContent=fmtAmt(todaySpend);
  const kMonth=document.getElementById('kpi-exp-month'); if(kMonth) kMonth.textContent=fmtAmt(monthSpend);
  const daEl=document.getElementById('dash-acts'); if(daEl) daEl.innerHTML=todayActs.length?todayActs.slice(0,5).map(a=>actHTML(a,false)).join(''):emptyHTML('🌱','No activities logged today.');
  const deEl=document.getElementById('dash-exps'); if(deEl) deEl.innerHTML=todayExps.length?todayExps.slice(0,5).map(e=>expHTML(e,false)).join(''):emptyHTML('💸','No expenses logged today.');

  const catTotals={}; monthExps.forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+Number(e.amount||0);});
  const sortedCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]),maxAmt=sortedCats[0]?.[1]||1;
  const catEl=document.getElementById('dash-cat-summary');
  if(catEl) catEl.innerHTML=!sortedCats.length?emptyHTML('📊','No expense data this month.'):sortedCats.map(([c,v])=>{const pct=(v/maxAmt*100).toFixed(1),col=CAT_COLORS[c]||'#64748b';return `<div class="cat-row"><div class="cat-row-name">${esc(c)}</div><div class="cat-bar-wrap"><div class="cat-bar-fill" style="width:${pct}%;background:${col}"></div></div><div class="cat-row-amt">${fmtAmt(v)}</div></div>`;}).join('');
  loadDailySummary();
  renderAllCharts(todayActs,monthExps);
}

function renderHistory(){
  const aq=(document.getElementById('h-search-act')?.value||'').toLowerCase(),ac=document.getElementById('h-filter-act')?.value||'';
  let filtActs=acts;
  if(aq) filtActs=filtActs.filter(a=>String(a.name||'').toLowerCase().includes(aq)||String(a.category||'').toLowerCase().includes(aq));
  if(ac) filtActs=filtActs.filter(a=>a.category===ac);
  const aEl=document.getElementById('hist-act-list'); if(aEl) aEl.innerHTML=filtActs.slice(0,30).map(a=>actHTML(a,true)).join('')||emptyHTML('📋','No activities found.');

  const eq=(document.getElementById('h-search-exp')?.value||'').toLowerCase(),ec=document.getElementById('h-filter-exp')?.value||'';
  let filtExps=exps;
  if(eq) filtExps=filtExps.filter(e=>String(e.name||'').toLowerCase().includes(eq)||String(e.category||'').toLowerCase().includes(eq));
  if(ec) filtExps=filtExps.filter(e=>e.category===ec);
  const eEl=document.getElementById('hist-exp-list'); if(eEl) eEl.innerHTML=filtExps.slice(0,30).map(e=>expHTML(e,true)).join('')||emptyHTML('💰','No expenses found.');

  const monthly={};
  exps.forEach(e=>{const m=String(e.date||'').slice(0,7);if(!m)return;if(!monthly[m])monthly[m]={count:0,total:0};monthly[m].count++;monthly[m].total+=Number(e.amount||0);});
  const months=Object.keys(monthly).sort().reverse(),tbody=document.getElementById('monthly-tbody');
  if(tbody){if(!months.length)tbody.innerHTML='<tr><td colspan="3" style="color:var(--ink3);text-align:center;padding:14px">No data yet</td></tr>';else tbody.innerHTML=months.map(m=>{const[y,mo]=m.split('-'),label=new Date(+y,+mo-1,1).toLocaleDateString('en-IN',{month:'short',year:'numeric'});return `<tr><td>${label}</td><td class="mono">${monthly[m].count}</td><td class="mono bold">${fmtAmt(monthly[m].total)}</td></tr>`;}).join('');}
}

function renderExportStats(){
  const el=document.getElementById('stats-card'); if(!el) return;
  const totalSpend=exps.reduce((s,e)=>s+Number(e.amount||0),0),totalH=acts.reduce((s,a)=>s+Number(a.duration||0),0),done=acts.filter(a=>a.status==='Completed').length,days=[...new Set(acts.map(a=>a.date))].length;
  el.innerHTML=`📋 Total activities: <strong>${acts.length}</strong><br>⏱ Total hours: <strong>${totalH.toFixed(1)}h</strong><br>✅ Completed: <strong>${done}</strong>${acts.length?` (${Math.round(done/acts.length*100)}%)`:''}<br>💰 Total expenses: <strong>${exps.length}</strong><br>💵 Total spent: <strong>${fmtAmt(totalSpend)}</strong><br>📅 Active days: <strong>${days}</strong>`;
}

/* Optional legacy daily-summary endpoint: disable it on GitHub Pages. */
async function loadDailySummary(date=null){
  const content=document.getElementById('daily-summary-content');
  if(!content) return;
  const summaryDate=date||today();
  const todayActs=acts.filter(a=>a.date===summaryDate),todayExps=exps.filter(e=>e.date===summaryDate);
  const totalActivities=todayActs.length,totalExpenses=todayExps.reduce((s,e)=>s+Number(e.amount||0),0),completedActivities=todayActs.filter(a=>a.status==='Completed').length,totalHours=todayActs.reduce((s,a)=>s+Number(a.duration||0),0),completionRate=totalActivities?Math.round(completedActivities/totalActivities*100):0;
  if(totalActivities===0&&totalExpenses===0){content.innerHTML='<div class="empty"><div class="empty-icon">📅</div><div class="empty-txt">No data for today yet</div></div>';return;}
  const activityCategories={},expenseCategories={};
  todayActs.forEach(a=>activityCategories[a.category]=(activityCategories[a.category]||0)+Number(a.duration||0));
  todayExps.forEach(e=>expenseCategories[e.category]=(expenseCategories[e.category]||0)+Number(e.amount||0));
  let html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
  html+=`<div class="kpi pine" style="margin:0"><div class="kpi-val">${totalActivities}</div><div class="kpi-lbl">Activities</div></div>`;
  html+=`<div class="kpi sky" style="margin:0"><div class="kpi-val">${completedActivities}</div><div class="kpi-lbl">Completed</div></div>`;
  html+=`<div class="kpi amber" style="margin:0"><div class="kpi-val">${totalHours.toFixed(1)}h</div><div class="kpi-lbl">Hours</div></div>`;
  html+=`<div class="kpi rose" style="margin:0"><div class="kpi-val">${fmtAmt(totalExpenses)}</div><div class="kpi-lbl">Spent</div></div></div>`;
  if(completionRate>0) html+=`<div style="text-align:center;margin:12px 0;font-size:.9rem;color:var(--ink2)"><strong>${completionRate}%</strong> of activities completed today</div>`;
  if(Object.keys(activityCategories).length){html+='<div style="margin-top:16px"><strong style="font-size:.85rem;color:var(--ink2)">Activity Time by Category:</strong><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">';Object.entries(activityCategories).forEach(([cat,hours])=>{const color=CAT_COLORS[cat]||'#64748b';html+=`<span style="background:${color}20;color:${color};padding:4px 8px;border-radius:12px;font-size:.75rem;font-weight:500">${esc(cat)}: ${hours}h</span>`;});html+='</div></div>';}
  if(Object.keys(expenseCategories).length){html+='<div style="margin-top:12px"><strong style="font-size:.85rem;color:var(--ink2)">Spending by Category:</strong><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">';Object.entries(expenseCategories).forEach(([cat,amount])=>{const color=CAT_COLORS[cat]||'#64748b';html+=`<span style="background:${color}20;color:${color};padding:4px 8px;border-radius:12px;font-size:.75rem;font-weight:500">${esc(cat)}: ${fmtAmt(amount)}</span>`;});html+='</div></div>';}
  content.innerHTML=html;
}

function renderAll(){ renderDash(); renderHistory(); renderExportStats(); }

/* ═══════════════════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════════════════ */
const PANELS={dash:'p-dash',act:'p-act',exp:'p-exp',history:'p-history',export:'p-export'};
function tab(id){
  if(!PANELS[id]) return;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  Object.entries(PANELS).forEach(([key,p])=>{const el=document.getElementById(p);if(el)el.classList.toggle('active',key===id);});
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSV EXPORT
═══════════════════════════════════════════════════════════════════════════ */
function csvRow(arr){return arr.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',');}
function exportActivities(){
  if(!acts.length){showToast('⚠️ No activities to export');return;}
  const hdr=csvRow(['Date','Time','Activity Name','Category','Duration (hrs)','Status','Notes']);
  const rows=acts.map(a=>csvRow([a.date,a.time,a.name,a.category,a.duration,a.status,a.notes||'']));
  downloadCSV([hdr,...rows].join('\n'),`activities_${today()}.csv`);showToast('📥 Activities exported!');
}
function exportExpenses(){
  if(!exps.length){showToast('⚠️ No expenses to export');return;}
  const hdr=csvRow(['Date','Expense Name','Category','Amount (INR)','Payment Mode','Notes']);
  const rows=exps.map(e=>csvRow([e.date,e.name,e.category,e.amount,e.mode,e.notes||'']));
  downloadCSV([hdr,...rows].join('\n'),`expenses_${today()}.csv`);showToast('📥 Expenses exported!');
}
function downloadCSV(csv,filename){const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);}

/* ═══════════════════════════════════════════════════════════════════════════
   CLEAR ALL - FIRESTORE ONLY
═══════════════════════════════════════════════════════════════════════════ */
async function clearAll(){
  if(!confirm('⚠️ Delete ALL activities and expenses? This cannot be undone.\n\nDownload your CSV first!')) return;
  try{
    const activityDocs=[...acts],expenseDocs=[...exps];
    await Promise.all([
      ...activityDocs.map(item=>deleteDoc(doc(db,'activities',String(item.id)))),
      ...expenseDocs.map(item=>deleteDoc(doc(db,'expenses',String(item.id))))
    ]);
    showToast('🗑 All data cleared');
  }catch(e){
    console.error(e);
    showToast('❌ Error clearing data');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVENT WIRING
═══════════════════════════════════════════════════════════════════════════ */
function wireEvents(){
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn=>btn.addEventListener('click',()=>tab(btn.dataset.tab)));
  document.getElementById('saveActivityBtn')?.addEventListener('click',saveActivity);
  document.getElementById('saveExpenseBtn')?.addEventListener('click',saveExpense);
  document.getElementById('exportActivitiesBtn')?.addEventListener('click',exportActivities);
  document.getElementById('exportExpensesBtn')?.addEventListener('click',exportExpenses);
  document.getElementById('clearAllBtn')?.addEventListener('click',clearAll);
  document.getElementById('h-search-act')?.addEventListener('input',renderHistory);
  document.getElementById('h-filter-act')?.addEventListener('change',renderHistory);
  document.getElementById('h-search-exp')?.addEventListener('input',renderHistory);
  document.getElementById('h-filter-exp')?.addEventListener('change',renderHistory);

  document.addEventListener('click',(event)=>{
    const button=event.target.closest('[data-action]');
    if(!button) return;
    const action=button.dataset.action,id=button.dataset.id;
    if(action==='delete-activity') delAct(id);
    if(action==='delete-expense') delExp(id);
  });
}

async function init(){
  document.getElementById('a-date').value=today();
  document.getElementById('a-time').value=nowTime();
  document.getElementById('e-date').value=today();
  initPills();
  wireEvents();
  tick();
  setInterval(tick,15000);
  setInterval(()=>{const el=document.getElementById('a-time');if(el&&!el.value)el.value=nowTime();},60000);
  await load();
}

document.addEventListener('DOMContentLoaded',init);
