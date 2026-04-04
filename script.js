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
  Parking:'#f59e0b',
};

const SK_ACT = 'mdt_acts_v1';
const SK_EXP = 'mdt_exps_v1';
const SK_ACAT = 'mdt_acat_recent';
const SK_ECAT = 'mdt_ecat_recent';

/* ═══════════════════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════════════════ */
let acts = [], exps = [];

function load(){
  try{ acts = JSON.parse(localStorage.getItem(SK_ACT)||'[]'); }catch(e){ acts=[]; }
  try{ exps = JSON.parse(localStorage.getItem(SK_EXP)||'[]'); }catch(e){ exps=[]; }
}
function persist(){
  localStorage.setItem(SK_ACT, JSON.stringify(acts));
  localStorage.setItem(SK_EXP, JSON.stringify(exps));
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function today(){ return new Date().toISOString().slice(0,10); }
function nowTime(){ return new Date().toTimeString().slice(0,5); }
function thisMonth(){ return today().slice(0,7); }
function fmtDate(s){ if(!s)return''; const d=new Date(s+'T00:00'); return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }
function fmtAmt(n){ return '₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2}); }

function recentCats(sk, fallback){
  try{ const r=JSON.parse(localStorage.getItem(sk)||'[]'); return [...new Set([...r,...fallback])]; }
  catch(e){ return fallback; }
}
function pushRecentCat(sk, cat, all){
  let r = recentCats(sk, all);
  r = [cat, ...r.filter(c=>c!==cat)].slice(0, all.length);
  localStorage.setItem(sk, JSON.stringify(r));
}

function showToast(msg, ms=2200){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), ms);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLOCK
═══════════════════════════════════════════════════════════════════════════ */
function tick(){
  document.getElementById('live-time').textContent =
    new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY PILLS
═══════════════════════════════════════════════════════════════════════════ */
function buildPills(containerId, hiddenId, cats, selected, onSelect){
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  cats.forEach(c=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cat-pill' + (c===selected?' sel':'');
    b.textContent = c;
    b.onclick = ()=>{
      document.querySelectorAll('#'+containerId+' .cat-pill').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel');
      document.getElementById(hiddenId).value = c;
      if(onSelect) onSelect(c);
      if(containerId === 'exp-cat-pills' && c === 'Parking') {
        document.getElementById('e-name').value = 'Parking';
        document.getElementById('e-amt').value = '20';
        document.getElementById('e-mode').value = 'Cash';
        document.getElementById('e-date').value = today();
        document.getElementById('e-notes').value = '';
        saveExpense();
      }
    };
    wrap.appendChild(b);
  });
}

function initPills(){
  const aCats = recentCats(SK_ACAT, ACT_CATS);
  buildPills('act-cat-pills','a-cat', aCats, document.getElementById('a-cat').value);

  const eCats = recentCats(SK_ECAT, EXP_CATS);
  buildPills('exp-cat-pills','e-cat', eCats, document.getElementById('e-cat').value);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAVE ACTIVITY
═══════════════════════════════════════════════════════════════════════════ */
function saveActivity(){
  const name = document.getElementById('a-name').value.trim();
  if(!name){ document.getElementById('a-name').focus(); showToast('⚠️ Enter activity name'); return; }

  const cat = document.getElementById('a-cat').value;
  pushRecentCat(SK_ACAT, cat, ACT_CATS);

  acts.unshift({
    id: Date.now(),
    date: document.getElementById('a-date').value || today(),
    time: document.getElementById('a-time').value || nowTime(),
    name,
    category: cat,
    duration: parseFloat(document.getElementById('a-dur').value)||0,
    status: document.getElementById('a-status').value,
    notes: document.getElementById('a-notes').value.trim(),
  });
  persist();

  // reset
  document.getElementById('a-name').value='';
  document.getElementById('a-dur').value='';
  document.getElementById('a-notes').value='';
  document.getElementById('a-date').value = today();
  document.getElementById('a-time').value = nowTime();
  document.getElementById('a-status').value = 'Completed';

  initPills();
  renderAll();
  showToast('✅ Activity saved!');
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAVE EXPENSE
═══════════════════════════════════════════════════════════════════════════ */
function saveExpense(){
  const name = document.getElementById('e-name').value.trim();
  const amt  = parseFloat(document.getElementById('e-amt').value);
  if(!name){ document.getElementById('e-name').focus(); showToast('⚠️ Enter expense name'); return; }
  if(!amt||amt<=0){ document.getElementById('e-amt').focus(); showToast('⚠️ Enter a valid amount'); return; }

  const cat = document.getElementById('e-cat').value;
  pushRecentCat(SK_ECAT, cat, EXP_CATS);

  exps.unshift({
    id: Date.now(),
    date: document.getElementById('e-date').value || today(),
    name,
    category: cat,
    amount: amt,
    mode: document.getElementById('e-mode').value,
    notes: document.getElementById('e-notes').value.trim(),
  });
  persist();

  document.getElementById('e-name').value='';
  document.getElementById('e-amt').value='';
  document.getElementById('e-notes').value='';
  document.getElementById('e-date').value = today();

  initPills();
  renderAll();
  showToast('💰 Expense saved!');
}

/* ═══════════════════════════════════════════════════════════════════════════
   DELETE
═══════════════════════════════════════════════════════════════════════════ */
function delAct(id){ acts=acts.filter(a=>a.id!==id); persist(); renderAll(); showToast('Deleted'); }
function delExp(id){ exps=exps.filter(e=>e.id!==id); persist(); renderAll(); showToast('Deleted'); }

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function actHTML(a, showDel=true){
  const col = CAT_COLORS[a.category]||'#64748b';
  const badge = a.status==='Completed'?'badge-done':'badge-pend';
  const delBtn = showDel?`<button class="log-del" onclick="delAct(${a.id})">✕</button>`:'';
  return `<div class="log-item">
    <div class="log-dot" style="background:${col}"></div>
    <div class="log-main">
      <div class="log-name">${esc(a.name)}</div>
      <div class="log-meta">${a.category} · ${fmtDate(a.date)} ${a.time}${a.notes?' · '+esc(a.notes.slice(0,40)):''}</div>
    </div>
    <div class="log-right">
      ${a.duration>0?`<div class="log-val">${a.duration}h</div>`:''}
      <span class="log-badge ${badge}">${a.status}</span>
    </div>
    ${delBtn}
  </div>`;
}

function expHTML(e, showDel=true){
  const col = CAT_COLORS[e.category]||'#64748b';
  const delBtn = showDel?`<button class="log-del" onclick="delExp(${e.id})">✕</button>`:'';
  return `<div class="log-item">
    <div class="log-dot" style="background:${col}"></div>
    <div class="log-main">
      <div class="log-name">${esc(e.name)}</div>
      <div class="log-meta">${e.category} · ${e.mode} · ${fmtDate(e.date)}${e.notes?' · '+esc(e.notes.slice(0,40)):''}</div>
    </div>
    <div class="log-right">
      <div class="log-val">${fmtAmt(e.amount)}</div>
    </div>
    ${delBtn}
  </div>`;
}

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'<').replace(/>/g,'>'); }

function emptyHTML(icon,msg){
  return `<div class="empty"><div class="empty-icon">${icon}</div><div class="empty-txt">${msg}</div></div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════════════════════════════════════ */
const _charts = {};

function destroyChart(id){
  if(_charts[id]){ _charts[id].destroy(); delete _charts[id]; }
}

const CHART_FONT = "'DM Sans', sans-serif";
const CHART_TICK = { color:'#8a7a6e', font:{ family:CHART_FONT, size:10 } };
const CHART_GRID = { color:'rgba(221,212,196,.5)' };

// Expense donut — category breakdown (this month)
function renderExpDonut(monthExps){
  destroyChart('expDonut');
  const catTotals = {};
  monthExps.forEach(e=>{ catTotals[e.category]=(catTotals[e.category]||0)+e.amount; });
  const entries = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const el = document.getElementById('chart-exp-donut');
  const legEl = document.getElementById('legend-donut');
  if(!entries.length){
    el.parentElement.style.opacity='.4';
    legEl.innerHTML='<span style="font-size:.72rem;color:var(--ink3)">No expense data yet</span>';
    return;
  }
  el.parentElement.style.opacity='1';
  const labels = entries.map(([c])=>c);
  const data   = entries.map(([,v])=>v);
  const colors = entries.map(([c])=>CAT_COLORS[c]||'#64748b');
  _charts.expDonut = new Chart(el,{
    type:'doughnut',
    data:{ labels, datasets:[{ data, backgroundColor:colors.map(c=>c+'cc'), borderColor:colors, borderWidth:2, hoverOffset:6 }] },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins:{ legend:{display:false}, tooltip:{
        callbacks:{ label: ctx=>' '+ctx.label+': ₹'+Number(ctx.raw).toLocaleString('en-IN') }
      }}
    }
  });
  legEl.innerHTML = entries.map(([c,v])=>`
    <div class="legend-item">
      <div class="legend-dot" style="background:${CAT_COLORS[c]||'#64748b'}"></div>
      <span>${c}</span>
    </div>`).join('');
}

// Completion ring — today's task status
function renderCompletionRing(todayActs){
  destroyChart('compRing');
  const done = todayActs.filter(a=>a.status==='Completed').length;
  const pend = todayActs.filter(a=>a.status==='Pending').length;
  const prog = todayActs.filter(a=>a.status==='In Progress').length;
  const canc = todayActs.filter(a=>a.status==='Cancelled').length;
  const total = todayActs.length;
  const pct = total ? Math.round(done/total*100) : 0;
  document.getElementById('completion-pct').textContent = total ? pct+'%' : '—';
  const el = document.getElementById('chart-completion-ring');
  if(!total){
    el.parentElement.style.opacity='.4'; return;
  }
  el.parentElement.style.opacity='1';
  _charts.compRing = new Chart(el,{
    type:'doughnut',
    data:{
      labels:['Completed','Pending','In Progress','Cancelled'],
      datasets:[{
        data:[done,pend,prog,canc],
        backgroundColor:['#2d6a4fcc','#b45309cc','#0369a1cc','#be123ccc'],
        borderColor:['#2d6a4f','#b45309','#0369a1','#be123c'],
        borderWidth:2, hoverOffset:4
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'70%',
      plugins:{ legend:{display:false}, tooltip:{
        callbacks:{ label: ctx=>' '+ctx.label+': '+ctx.raw }
      }}
    }
  });
}

// 7-day spending line chart
function renderSpendingLine(){
  destroyChart('spendLine');
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    return d.toISOString().slice(0,10);
  });
  const labels = days.map(d=>{
    const dt = new Date(d+'T00:00');
    return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  });
  const data = days.map(d=>exps.filter(e=>e.date===d).reduce((s,e)=>s+e.amount,0));
  const el = document.getElementById('chart-spending-line');
  _charts.spendLine = new Chart(el,{
    type:'line',
    data:{
      labels,
      datasets:[{
        label:'Spent (₹)',
        data,
        borderColor:'#b45309',
        backgroundColor:'rgba(180,83,9,.08)',
        tension:.4, fill:true,
        pointBackgroundColor:'#b45309',
        pointRadius:4, pointHoverRadius:6,
        borderWidth:2,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{
        callbacks:{ label: ctx=>' ₹'+Number(ctx.raw).toLocaleString('en-IN') }
      }},
      scales:{
        x:{ ticks:CHART_TICK, grid:{display:false} },
        y:{ ticks:{...CHART_TICK, callback:v=>'₹'+v}, grid:CHART_GRID, beginAtZero:true }
      }
    }
  });
}

// Activity hours by category (horizontal bar)
function renderActBar(){
  destroyChart('actBar');
  const catTotals = {};
  acts.forEach(a=>{ catTotals[a.category]=(catTotals[a.category]||0)+a.duration; });
  const entries = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const el = document.getElementById('chart-act-bar');
  if(!entries.length){ el.parentElement.style.opacity='.4'; return; }
  el.parentElement.style.opacity='1';
  _charts.actBar = new Chart(el,{
    type:'bar',
    data:{
      labels: entries.map(([c])=>c),
      datasets:[{
        data: entries.map(([,v])=>v),
        backgroundColor: entries.map(([c])=>(CAT_COLORS[c]||'#64748b')+'bb'),
        borderColor:     entries.map(([c])=>CAT_COLORS[c]||'#64748b'),
        borderWidth:1.5, borderRadius:6,
      }]
    },
    options:{
      indexAxis:'y',
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{
        callbacks:{ label: ctx=>' '+ctx.raw+'h' }
      }},
      scales:{
        x:{ ticks:{...CHART_TICK, callback:v=>v+'h'}, grid:CHART_GRID, beginAtZero:true },
        y:{ ticks:CHART_TICK, grid:{display:false} }
      }
    }
  });
}

// Payment mode pie
function renderPaymentPie(monthExps){
  destroyChart('payPie');
  const modeTotals = {};
  monthExps.forEach(e=>{ modeTotals[e.mode]=(modeTotals[e.mode]||0)+e.amount; });
  const entries = Object.entries(modeTotals).sort((a,b)=>b[1]-a[1]);
  const el = document.getElementById('chart-payment-pie');
  const legEl = document.getElementById('legend-payment');
  if(!entries.length){
    el.parentElement.style.opacity='.4';
    legEl.innerHTML='<span style="font-size:.72rem;color:var(--ink3)">No data yet</span>';
    return;
  }
  el.parentElement.style.opacity='1';
  const MODE_COLORS = {UPI:'#0369a1',Cash:'#2d6a4f',Card:'#7e22ce','Net Banking':'#b45309',Other:'#64748b'};
  const colors = entries.map(([m])=>MODE_COLORS[m]||'#64748b');
  _charts.payPie = new Chart(el,{
    type:'pie',
    data:{
      labels: entries.map(([m])=>m),
      datasets:[{
        data: entries.map(([,v])=>v),
        backgroundColor: colors.map(c=>c+'cc'),
        borderColor: colors, borderWidth:2, hoverOffset:5
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{
        callbacks:{ label: ctx=>' '+ctx.label+': ₹'+Number(ctx.raw).toLocaleString('en-IN') }
      }}
    }
  });
  legEl.innerHTML = entries.map(([m,v])=>`
    <div class="legend-item">
      <div class="legend-dot" style="background:${MODE_COLORS[m]||'#64748b'}"></div>
      <span>${m} — ₹${Number(v).toLocaleString('en-IN')}</span>
    </div>`).join('');
}

function renderAllCharts(todayActs, monthExps){
  // slight delay so canvas is visible in DOM
  setTimeout(()=>{
    renderExpDonut(monthExps);
    renderCompletionRing(todayActs);
    renderSpendingLine();
    renderActBar();
    renderPaymentPie(monthExps);
  }, 30);
}


function renderDash(){
  const td = today(), tm = thisMonth();
  const todayActs = acts.filter(a=>a.date===td);
  const todayExps = exps.filter(e=>e.date===td);
  const monthExps = exps.filter(e=>e.date.startsWith(tm));

  // date label
  document.getElementById('dash-date').textContent =
    new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  // KPIs
  document.getElementById('kpi-acts').textContent = todayActs.length;
  const totalH = todayActs.reduce((s,a)=>s+a.duration,0);
  document.getElementById('kpi-hours').textContent = totalH>0 ? totalH.toFixed(1)+'h' : '0h';
  const todaySpend = todayExps.reduce((s,e)=>s+e.amount,0);
  document.getElementById('kpi-exp-today').textContent = fmtAmt(todaySpend);
  const monthSpend = monthExps.reduce((s,e)=>s+e.amount,0);
  document.getElementById('kpi-exp-month').textContent = fmtAmt(monthSpend);

  // recent acts
  const daEl = document.getElementById('dash-acts');
  daEl.innerHTML = todayActs.length
    ? todayActs.slice(0,5).map(a=>actHTML(a,false)).join('')
    : emptyHTML('🌱','No activities logged today.');

  // recent exps
  const deEl = document.getElementById('dash-exps');
  deEl.innerHTML = todayExps.length
    ? todayExps.slice(0,5).map(e=>expHTML(e,false)).join('')
    : emptyHTML('💸','No expenses logged today.');

  // category spending summary (this month)
  const catTotals = {};
  monthExps.forEach(e=>{ catTotals[e.category]=(catTotals[e.category]||0)+e.amount; });
  const sortedCats = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const maxAmt = sortedCats[0]?.[1] || 1;
  const catEl = document.getElementById('dash-cat-summary');
  if(!sortedCats.length){
    catEl.innerHTML = emptyHTML('📊','No expense data this month.');
  } else {
    catEl.innerHTML = sortedCats.map(([c,v])=>{
      const pct = (v/maxAmt*100).toFixed(1);
      const col = CAT_COLORS[c]||'#64748b';
      return `<div class="cat-row">
        <div class="cat-row-name">${c}</div>
        <div class="cat-bar-wrap"><div class="cat-bar-fill" style="width:${pct}%;background:${col}"></div></div>
        <div class="cat-row-amt">${fmtAmt(v)}</div>
      </div>`;
    }).join('');
  }

  renderAllCharts(todayActs, monthExps);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER HISTORY
═══════════════════════════════════════════════════════════════════════════ */
function renderHistory(){
  const aq = (document.getElementById('h-search-act').value||'').toLowerCase();
  const ac = document.getElementById('h-filter-act').value;
  let filtActs = acts;
  if(aq) filtActs = filtActs.filter(a=>a.name.toLowerCase().includes(aq)||a.category.toLowerCase().includes(aq));
  if(ac) filtActs = filtActs.filter(a=>a.category===ac);

  const aEl = document.getElementById('hist-act-list');
  aEl.innerHTML = filtActs.length
    ? filtActs.slice(0,30).map(a=>actHTML(a,true)).join('')
    : emptyHTML('📋','No activities found.');

  const eq = (document.getElementById('h-search-exp').value||'').toLowerCase();
  const ec = document.getElementById('h-filter-exp').value;
  let filtExps = exps;
  if(eq) filtExps = filtExps.filter(e=>e.name.toLowerCase().includes(eq)||e.category.toLowerCase().includes(eq));
  if(ec) filtExps = filtExps.filter(e=>e.category===ec);

  const eEl = document.getElementById('hist-exp-list');
  eEl.innerHTML = filtExps.length
    ? filtExps.slice(0,30).map(e=>expHTML(e,true)).join('')
    : emptyHTML('💰','No expenses found.');

  // monthly table
  const monthly = {};
  exps.forEach(e=>{
    const m = e.date.slice(0,7);
    if(!monthly[m]) monthly[m]={count:0,total:0};
    monthly[m].count++; monthly[m].total+=e.amount;
  });
months = Object.keys(monthly).sort().reverse();
  const tbody = document.getElementById('monthly-tbody');
  if(!months.length){
    tbody.innerHTML='<tr><td colspan="3" style="color:var(--ink3);text-align:center;padding:14px">No data yet</td></tr>';
  } else {
    tbody.innerHTML = months.map(m=>{
      const [y,mo] = m.split('-');
      const label = new Date(+y,+mo-1,1).toLocaleDateString('en-IN',{month:'short',year:'numeric'});
      return `<tr>
        <td>${label}</td>
        <td class="mono">${monthly[m].count}</td>
        <td class="mono bold">${fmtAmt(monthly[m].total)}</td>
      </tr>`;
    }).join('');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER EXPORT STATS
═══════════════════════════════════════════════════════════════════════════ */
function renderExportStats(){
  const el = document.getElementById('stats-card');
  const totalSpend = exps.reduce((s,e)=>s+e.amount,0);
  const totalH = acts.reduce((s,a)=>s+a.duration,0);
  const done = acts.filter(a=>a.status==='Completed').length;
  const days = [...new Set(acts.map(a=>a.date))].length;
  el.innerHTML = `
    📋 Total activities: <strong>${acts.length}</strong><br>
    ⏱ Total hours: <strong>${totalH.toFixed(1)}h</strong><br>
    ✅ Completed: <strong>${done}</strong>${acts.length?` (${Math.round(done/acts.length*100)}%)`:''}<br>
    💰 Total expenses: <strong>${exps.length}</strong><br>
    💵 Total spent: <strong>${fmtAmt(totalSpend)}</strong><br>
    📅 Active days: <strong>${days}</strong>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════════════════════════════════════ */
function renderAll(){
  renderDash();
  renderHistory();
  renderExportStats();
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════════════════ */
const PANELS = {dash:'p-dash',act:'p-act',exp:'p-exp',history:'p-history',export:'p-export'};
function tab(id){
  document.querySelectorAll('.nav-btn').forEach((b,i)=>{
    b.classList.toggle('active',['dash','act','exp','history','export'][i]===id);
  });
  Object.values(PANELS).forEach(p=>{
    const el=document.getElementById(p);
    if(el) el.classList.toggle('active',p===PANELS[id]);
  });
  window.scrollTo(0,0);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSV EXPORT
═══════════════════════════════════════════════════════════════════════════ */
function csvRow(arr){ return arr.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(','); }

function exportActivities(){
  if(!acts.length){ showToast('⚠️ No activities to export'); return; }
  const hdr = csvRow(['Date','Time','Activity Name','Category','Duration (hrs)','Status','Notes']);
  const rows = acts.map(a=>csvRow([a.date,a.time,a.name,a.category,a.duration,a.status,a.notes||'']));
  downloadCSV([hdr,...rows].join('\n'), `activities_${today()}.csv`);
  showToast('📥 Activities exported!');
}

function exportExpenses(){
  if(!exps.length){ showToast('⚠️ No expenses to export'); return; }
  const hdr = csvRow(['Date','Expense Name','Category','Amount (INR)','Payment Mode','Notes']);
  const rows = exps.map(e=>csvRow([e.date,e.name,e.category,e.amount,e.mode,e.notes||'']));
  downloadCSV([hdr,...rows].join('\n'), `expenses_${today()}.csv`);
  showToast('📥 Expenses exported!');
}

function downloadCSV(csv, filename){
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename; document.body.appendChild(a);
  a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLEAR ALL
═══════════════════════════════════════════════════════════════════════════ */
function clearAll(){
  if(!confirm('⚠️ Delete ALL activities and expenses? This cannot be undone.\n\nDownload your CSV first!')) return;
  acts=[]; exps=[];
  persist(); renderAll(); showToast('🗑 All data cleared');
}

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
function init(){
  load();

  // set defaults
  document.getElementById('a-date').value = today();
  document.getElementById('a-time').value = nowTime();
  document.getElementById('e-date').value = today();

  initPills();
  renderAll();
  tick();
  setInterval(tick, 15000);

  // update time field every minute
  setInterval(()=>{
    if(!document.getElementById('a-time').value)
      document.getElementById('a-time').value = nowTime();
  }, 60000);
}

// DOM ready
document.addEventListener('DOMContentLoaded', init);
