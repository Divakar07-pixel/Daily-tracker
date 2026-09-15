(()=>{
  const key='dailyTracker_sidebar_collapsed';
  const isMobile=()=>window.matchMedia('(max-width:760px)').matches;
  const get=id=>document.getElementById(id);

  const init=()=>{
    const sidebar=get('sidebar');
    if(!sidebar)return;
    const mobileToggle=get('mobileMenu');
    const insideToggle=get('sidebarToggle');
    const desktopToggle=get('desktopSidebarToggle');

    let backdrop=document.querySelector('.sidebar-backdrop');
    if(!backdrop){
      backdrop=document.createElement('div');
      backdrop.className='sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    const setDesktopState=(collapsed,save=true)=>{
      document.body.classList.toggle('sidebar-collapsed',collapsed);
      if(save)localStorage.setItem(key,collapsed?'1':'0');
      const icon=collapsed?'☰':'‹';
      const label=collapsed?'Expand sidebar':'Collapse sidebar';
      [insideToggle,desktopToggle].forEach(btn=>{
        if(!btn)return;
        btn.textContent=icon;
        btn.setAttribute('aria-label',label);
        btn.setAttribute('title',label);
      });
    };

    const closeMobile=()=>{
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      if(mobileToggle){
        mobileToggle.textContent='☰';
        mobileToggle.setAttribute('aria-label','Open menu');
        mobileToggle.setAttribute('title','Open menu');
      }
    };
    const openMobile=()=>{
      sidebar.classList.add('open');
      backdrop.classList.add('open');
      if(mobileToggle){
        mobileToggle.textContent='×';
        mobileToggle.setAttribute('aria-label','Close menu');
        mobileToggle.setAttribute('title','Close menu');
      }
    };

    const toggle=()=>{
      if(isMobile()){
        sidebar.classList.contains('open')?closeMobile():openMobile();
      }else{
        setDesktopState(!document.body.classList.contains('sidebar-collapsed'));
      }
    };

    [insideToggle,desktopToggle,mobileToggle].filter(Boolean).forEach(btn=>{
      const clone=btn.cloneNode(true);
      btn.replaceWith(clone);
      if(clone.id==='sidebarToggle'||clone.id==='desktopSidebarToggle'||clone.id==='mobileMenu')clone.addEventListener('click',toggle);
    });

    const style=document.createElement('style');
    style.id='sidebar-controller-styles';
    style.textContent=`
      @media(min-width:761px){
        .sidebar-toggle{display:grid!important;place-items:center;width:30px;height:30px;border:0;background:transparent;color:#94a3b8;border-radius:8px;font-size:20px;cursor:pointer;margin-left:auto}
        .sidebar-toggle:hover{background:#1d2939;color:#fff}
        .desktop-sidebar-toggle{display:grid!important;place-items:center;width:38px;height:38px;border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:10px;font-size:17px;cursor:pointer;margin-right:10px;flex:none}
        .desktop-sidebar-toggle:hover{background:var(--surface2)}
        body.sidebar-collapsed .sidebar{width:76px!important;padding-left:10px!important;padding-right:10px!important}
        body.sidebar-collapsed .main{margin-left:76px!important;width:calc(100% - 76px)!important}
        body.sidebar-collapsed .brand{justify-content:center;padding-left:0;padding-right:0}
        body.sidebar-collapsed .brand-copy{display:none!important}
        body.sidebar-collapsed .nav-item{justify-content:center;padding-left:8px!important;padding-right:8px!important}
        body.sidebar-collapsed .nav-item b{display:none!important}
        body.sidebar-collapsed .sync{justify-content:center;padding-left:5px;padding-right:5px}
        body.sidebar-collapsed .sync-copy{display:none!important}
        body.sidebar-collapsed .sidebar-toggle{margin-left:0;transform:rotate(180deg)}
      }
      @media(max-width:760px){
        .mobile-menu,.sidebar-toggle,.desktop-sidebar-toggle{display:none!important}
        .sidebar-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.38);backdrop-filter:blur(2px);z-index:90;display:none}
        .sidebar-backdrop.open{display:block}
        .sidebar.open{box-shadow:18px 0 45px rgba(0,0,0,.25)}
      }
      .income-actions{display:flex;gap:8px;flex-wrap:wrap}
      .income-btn{border:0;border-radius:10px;padding:10px 15px;font-size:11px;font-weight:800;cursor:pointer}
      .income-btn.add{background:#16a34a;color:#fff}
      .income-btn.add:hover{filter:brightness(.95)}
      .income-btn.expense{display:none}
      .income-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 18px}
      .income-flow-card{padding:15px 17px;border:1px solid var(--line,#e5e7eb);border-radius:15px;background:var(--surface,#fff)}
      .income-flow-card span{display:block;font-size:10px;color:var(--muted,#64748b);margin-bottom:6px}
      .income-flow-card strong{font-size:20px;font-family:'Plus Jakarta Sans',sans-serif}
      .income-flow-card.income strong{color:#16a34a}
      .income-flow-card.expense strong{color:#dc2626}
      .income-flow-card.balance strong{color:#2563eb}
      .income-flow-card small{display:block;font-size:9px;color:var(--muted,#64748b);margin-top:4px}
      .income-transaction .tx-amount{color:#16a34a}
      .income-transaction .tx-icon{color:#16a34a!important}
      .income-transaction .tx-meta{color:#16a34a}
      .income-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:18px;z-index:650}
      .income-modal-backdrop.open{display:flex}
      .income-modal{width:min(520px,100%);max-height:90vh;overflow:auto;background:var(--surface,#fff);color:var(--text,#111827);border-radius:22px;padding:24px;box-shadow:0 30px 90px rgba(0,0,0,.25)}
      .income-modal-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
      .income-modal-head h3{font-family:'Plus Jakarta Sans';font-size:20px;margin-top:5px}
      .income-modal-close{border:1px solid var(--line,#e5e7eb);background:var(--surface2,#f8fafc);color:var(--text,#111827);width:36px;height:36px;border-radius:10px;cursor:pointer}
      .income-form label{display:block;font-size:11px;font-weight:700;margin-bottom:13px}
      .income-form input,.income-form select,.income-form textarea{width:100%;margin-top:7px;border:1px solid var(--line,#e5e7eb);border-radius:10px;padding:11px;background:var(--surface,#fff);color:var(--text,#111827);font:inherit;box-sizing:border-box}
      .income-form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}
      .income-cancel{border:1px solid var(--line,#e5e7eb);background:var(--surface2,#f8fafc);color:var(--text,#111827);border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}
      .income-save{border:0;background:#16a34a;color:#fff;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}
      @media(max-width:760px){
        .income-flow{grid-template-columns:1fr}
        .income-modal{padding:18px}
        .income-actions{width:100%}
        .income-btn{flex:1}
      }
    `;
    document.getElementById('sidebar-controller-styles')?.remove();
    document.head.appendChild(style);

    if(isMobile()){
      document.body.classList.remove('sidebar-collapsed');
      closeMobile();
    }else{
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      setDesktopState(localStorage.getItem(key)==='1',false);
    }

    backdrop.onclick=closeMobile;
    window.addEventListener('resize',()=>{
      if(isMobile()){
        document.body.classList.remove('sidebar-collapsed');
        closeMobile();
      }else{
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
        setDesktopState(localStorage.getItem(key)==='1',false);
      }
    });
  };

  const incomeState={rows:[],editId:null,ready:false};
  const incomeCategories=['Salary','Freelance','Business','Interest','Gift','Refund','Other'];
  const fmtMoney=n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
  const escIncome=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shortIncome=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'';
  const incomeToday=()=>new Date().toISOString().slice(0,10);
  const incomeRangeStart=()=>{const d=new Date();d.setDate(1);return d.toISOString().slice(0,10)};
  const injectButtons=()=>{
    document.querySelectorAll('[data-open-expense]').forEach(btn=>{
      if(btn.parentElement?.querySelector('[data-open-income]'))return;
      const b=document.createElement('button');
      b.className='income-btn add';b.dataset.openIncome='';b.textContent='+ Add income';
      btn.insertAdjacentElement('afterend',b);
    });
  };
  const makeModal=()=>{
    if(get('incomeModalBackdrop'))return;
    const d=document.createElement('div');d.id='incomeModalBackdrop';d.className='income-modal-backdrop';
    d.innerHTML=`<div class="income-modal"><div class="income-modal-head"><div><span class="eyebrow">MONEY IN</span><h3 id="incomeModalTitle">Add income</h3></div><button class="income-modal-close" id="incomeModalClose">×</button></div><form class="income-form" id="incomeForm"><label>Income name<input id="iName" maxlength="100" placeholder="e.g. Monthly salary"></label><label>Category<select id="iCategory">${incomeCategories.map(c=>`<option>${c}</option>`).join('')}</select></label><label>Amount (₹)<input id="iAmount" type="number" min="0.01" step="0.01" required placeholder="9800"></label><label>Date<input id="iDate" type="date" required></label><label>Notes<textarea id="iNotes" rows="3" placeholder="Optional note..."></textarea></label><div class="income-form-actions"><button type="button" class="income-cancel" id="incomeCancel">Cancel</button><button class="income-save" type="submit">Save income</button></div></form></div>`;
    document.body.appendChild(d);
    get('incomeModalClose').onclick=closeIncome;
    get('incomeCancel').onclick=closeIncome;
    d.addEventListener('click',e=>{if(e.target===d)closeIncome()});
    get('incomeForm').addEventListener('submit',saveIncome);
  };
  const openIncome=(id=null)=>{
    makeModal();incomeState.editId=id;
    const row=id?incomeState.rows.find(x=>x.id===id):null;
    get('incomeModalTitle').textContent=id?'Edit income':'Add income';
    get('iName').value=row?.name||'';get('iCategory').value=row?.category||'Salary';get('iAmount').value=row?.amount??'';get('iDate').value=row?.date||incomeToday();get('iNotes').value=row?.notes||'';
    get('incomeModalBackdrop').classList.add('open');setTimeout(()=>get('iName').focus(),50);
  };
  const closeIncome=()=>{const d=get('incomeModalBackdrop');if(d)d.classList.remove('open');incomeState.editId=null};
  const saveIncome=async e=>{
    e.preventDefault();
    const data={name:get('iName').value.trim()||'Untitled income',category:get('iCategory').value,amount:Number(get('iAmount').value),date:get('iDate').value,notes:get('iNotes').value.trim(),createdAt:new Date().toISOString()};
    if(!data.amount||!data.date)return;
    try{
      if(incomeState.editId){await window.updateDoc(window.doc(window.db,'income',incomeState.editId),data);if(window.toast)window.toast('Income updated')}
      else{await window.addDoc(window.collection(window.db,'income'),data);if(window.toast)window.toast('Income saved')}
      closeIncome();
    }catch(err){console.error(err);if(window.toast)window.toast('Could not save income')}
  };
  const incomeHTML=e=>`<div class="transaction income-transaction"><div class="tx-icon">＋</div><div class="tx-main"><div class="tx-name">${escIncome(e.name||'Untitled income')}</div><div class="tx-meta">Income · ${escIncome(e.category||'Other')} · ${shortIncome(e.date)}${e.notes?' · '+escIncome(e.notes):''}</div></div><div class="tx-amount">+${fmtMoney(e.amount)}</div><div class="tx-actions"><button data-income-edit="${escIncome(e.id)}" title="Edit">✎</button><button data-income-delete="${escIncome(e.id)}" title="Delete">×</button></div></div>`;
  const getExpenseSnapshot=async()=>{try{return (await window.getDocs(window.collection(window.db,'expenses'))).docs.map(d=>({id:d.id,...d.data()}))}catch{return[]}};
  const renderFlow=async()=>{
    const host=document.querySelector('#view-dashboard .stats');if(!host)return;
    const expenses=await getExpenseSnapshot();
    const totalIncome=incomeState.rows.reduce((s,e)=>s+Number(e.amount||0),0);
    const totalExpense=expenses.reduce((s,e)=>s+Number(e.amount||0),0);
    const balance=totalIncome-totalExpense;
    let box=get('incomeFlow');
    if(!box){box=document.createElement('div');box.id='incomeFlow';box.className='income-flow';host.insertAdjacentElement('beforebegin',box)}
    box.innerHTML=`<div class="income-flow-card income"><span>Total income</span><strong>+${fmtMoney(totalIncome)}</strong><small>All recorded income</small></div><div class="income-flow-card expense"><span>Total expenses</span><strong>−${fmtMoney(totalExpense)}</strong><small>All recorded expenses</small></div><div class="income-flow-card balance"><span>Balance</span><strong>${balance<0?'−':'+'}${fmtMoney(Math.abs(balance))}</strong><small>Income minus expenses</small></div>`;
    const labels=host.querySelectorAll('.stat');
    if(labels.length>=4){labels[0].querySelector('span').textContent='Total income';labels[0].querySelector('strong').textContent='+'+fmtMoney(totalIncome);labels[0].querySelector('small').textContent='All recorded income';labels[1].querySelector('span').textContent='Total expenses';labels[1].querySelector('strong').textContent='−'+fmtMoney(totalExpense);labels[1].querySelector('small').textContent='All recorded expenses';labels[2].querySelector('span').textContent='Balance';labels[2].querySelector('strong').textContent=(balance<0?'−':'+')+fmtMoney(Math.abs(balance));labels[2].querySelector('small').textContent='Income minus expenses';labels[3].querySelector('span').textContent='Transactions';labels[3].querySelector('strong').textContent=String(incomeState.rows.length+expenses.length);labels[3].querySelector('small').textContent='Income + expenses'}
    const recent=get('recentList');if(recent){const all=[...expenses.map(e=>({...e,__type:'expense'})),...incomeState.rows.map(e=>({...e,__type:'income'}))].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0,7);recent.innerHTML=all.length?all.map(e=>e.__type==='income'?incomeHTML(e):`<div class="transaction"><div class="tx-icon">−</div><div class="tx-main"><div class="tx-name">${escIncome(e.name||'Untitled expense')}</div><div class="tx-meta">${escIncome(e.category||'Other')} · ${escIncome(e.mode||'UPI')} · ${shortIncome(e.date)}${e.notes?' · '+escIncome(e.notes):''}</div></div><div class="tx-amount">−${fmtMoney(e.amount)}</div></div>`).join(''):'No transactions yet.'}
  };
  const startIncome=()=>{
    injectButtons();makeModal();
    const begin=()=>{
      if(!window.db||!window.onSnapshot)return setTimeout(begin,250);
      window.onSnapshot(window.collection(window.db,'income'),snap=>{incomeState.rows=snap.docs.map(d=>({id:d.id,...d.data()}));incomeState.ready=true;renderFlow()});
      renderFlow();
    };
    begin();
    document.addEventListener('click',async e=>{
      const add=e.target.closest('[data-open-income]');if(add){e.preventDefault();openIncome();return}
      const edit=e.target.closest('[data-income-edit]');if(edit){openIncome(edit.dataset.incomeEdit);return}
      const del=e.target.closest('[data-income-delete]');if(del){const row=incomeState.rows.find(x=>x.id===del.dataset.incomeDelete);if(row&&confirm(`Delete “${row.name||'income'}” for ${fmtMoney(row.amount)}?`)){await window.deleteDoc(window.doc(window.db,'income',row.id));if(window.toast)window.toast('Income deleted')}return}
    });
    const observer=new MutationObserver(()=>injectButtons());observer.observe(document.body,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{init();startIncome()},{once:true});
  else{init();startIncome()}
})();