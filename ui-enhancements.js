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
        /* Mobile uses the fixed bottom navigation; no hamburger/menu button in the topbar. */
        .mobile-menu,.sidebar-toggle,.desktop-sidebar-toggle{display:none!important}
        .sidebar-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.38);backdrop-filter:blur(2px);z-index:90;display:none}
        .sidebar-backdrop.open{display:block}
        .sidebar.open{box-shadow:18px 0 45px rgba(0,0,0,.25)}
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

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();