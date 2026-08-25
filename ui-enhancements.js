(()=>{
  const key='dailyTracker_sidebar_collapsed';
  const css=`
    .sidebar-toggle,.desktop-sidebar-toggle{display:grid!important;place-items:center;border:0;cursor:pointer}
    .sidebar-toggle{width:30px;height:30px;border-radius:8px;background:transparent;color:#94a3b8;font-size:20px;margin-left:auto}
    .sidebar-toggle:hover{background:#1d2939;color:#fff}
    .desktop-sidebar-toggle{width:38px;height:38px;border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:10px;font-size:17px;margin-right:10px}
    .desktop-sidebar-toggle:hover{background:var(--surface2)}
    @media(min-width:761px){
      body.sidebar-collapsed .sidebar{width:76px;padding-left:10px;padding-right:10px}
      body.sidebar-collapsed .main{margin-left:76px;width:calc(100% - 76px)}
      body.sidebar-collapsed .brand{justify-content:center;padding-left:0;padding-right:0}
      body.sidebar-collapsed .brand-copy{display:none}
      body.sidebar-collapsed .nav-item{justify-content:center;padding-left:8px;padding-right:8px}
      body.sidebar-collapsed .nav-item b{display:none}
      body.sidebar-collapsed .sync{justify-content:center;padding:9px 5px}
      body.sidebar-collapsed .sync-copy{display:none}
      body.sidebar-collapsed .sidebar-toggle{margin-left:0}
    }
    @media(max-width:760px){
      .sidebar-toggle,.desktop-sidebar-toggle{display:none!important}
      .mobile-menu{display:grid!important;width:36px;height:36px;border:1px solid var(--line);background:var(--surface);border-radius:10px;place-items:center;color:var(--text);margin-right:10px}
      .sidebar.open{box-shadow:18px 0 45px rgba(0,0,0,.25)}
      .sidebar-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.38);backdrop-filter:blur(2px);z-index:90;display:none}
      .sidebar-backdrop.open{display:block}
    }
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  const init=()=>{
    const sidebar=document.getElementById('sidebar');
    const mobileToggle=document.getElementById('mobileMenu');
    const sidebarToggle=document.getElementById('sidebarToggle');
    const desktopToggle=document.getElementById('desktopSidebarToggle');
    if(!sidebar)return;

    let backdrop=document.querySelector('.sidebar-backdrop');
    if(!backdrop){backdrop=document.createElement('div');backdrop.className='sidebar-backdrop';document.body.appendChild(backdrop)}

    const isMobile=()=>window.matchMedia('(max-width:760px)').matches;
    const updateDesktopButtons=(collapsed)=>{
      document.body.classList.toggle('sidebar-collapsed',collapsed);
      const label=collapsed?'Expand sidebar':'Collapse sidebar';
      if(sidebarToggle){sidebarToggle.textContent=collapsed?'›':'‹';sidebarToggle.title=label;sidebarToggle.setAttribute('aria-label',label)}
      if(desktopToggle){desktopToggle.textContent=collapsed?'☰':'‹';desktopToggle.title=label;desktopToggle.setAttribute('aria-label',label)}
    };
    const closeMobile=()=>{
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      if(mobileToggle){mobileToggle.textContent='☰';mobileToggle.title='Open menu';mobileToggle.setAttribute('aria-label','Open menu')}
    };
    const openMobile=()=>{
      sidebar.classList.add('open');
      backdrop.classList.add('open');
      if(mobileToggle){mobileToggle.textContent='×';mobileToggle.title='Close menu';mobileToggle.setAttribute('aria-label','Close menu')}
    };
    const toggleSidebar=()=>{
      if(isMobile()){
        sidebar.classList.contains('open')?closeMobile():openMobile();
        return;
      }
      const collapsed=!document.body.classList.contains('sidebar-collapsed');
      updateDesktopButtons(collapsed);
      localStorage.setItem(key,collapsed?'1':'0');
    };

    updateDesktopButtons(localStorage.getItem(key)==='1');
    [sidebarToggle,desktopToggle].filter(Boolean).forEach(btn=>btn.addEventListener('click',toggleSidebar));
    if(mobileToggle)mobileToggle.addEventListener('click',toggleSidebar);
    backdrop.addEventListener('click',closeMobile);
    document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{if(isMobile())closeMobile()}));

    window.addEventListener('resize',()=>{
      if(isMobile()){
        document.body.classList.remove('sidebar-collapsed');
        if(mobileToggle){mobileToggle.textContent=sidebar.classList.contains('open')?'×':'☰'}
      }else{
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
        updateDesktopButtons(localStorage.getItem(key)==='1');
      }
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
