(()=>{
  const key='dailyTracker_sidebar_collapsed';
  const css=`
    .sidebar-toggle{display:none!important}
    .mobile-menu{display:grid!important;flex:none;position:relative;z-index:80}
    @media(min-width:761px){
      .mobile-menu{width:38px;height:38px;border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:10px;place-items:center;margin-right:10px;font-size:17px}
      body.sidebar-collapsed .sidebar{width:76px;padding-left:10px;padding-right:10px}
      body.sidebar-collapsed .main{margin-left:76px;width:calc(100% - 76px)}
      body.sidebar-collapsed .brand{justify-content:center;padding-left:0;padding-right:0}
      body.sidebar-collapsed .brand>div:not(.brand-mark){display:none}
      body.sidebar-collapsed .nav-item{justify-content:center;padding-left:8px;padding-right:8px}
      body.sidebar-collapsed .nav-item b{display:none}
      body.sidebar-collapsed .sync{justify-content:center;padding:9px 5px}
      body.sidebar-collapsed .sync>div{display:none}
    }
    @media(max-width:760px){
      .mobile-menu{width:36px;height:36px;border:1px solid var(--line);background:var(--surface);border-radius:10px;place-items:center;color:var(--text);margin-right:10px}
      .sidebar.open{box-shadow:18px 0 45px rgba(0,0,0,.25)}
      .sidebar-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.38);backdrop-filter:blur(2px);z-index:90;display:none}
      .sidebar-backdrop.open{display:block}
    }
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const init=()=>{
    const sidebar=document.getElementById('sidebar'),toggle=document.getElementById('mobileMenu');
    if(!sidebar||!toggle)return;
    let backdrop=document.querySelector('.sidebar-backdrop');
    if(!backdrop){backdrop=document.createElement('div');backdrop.className='sidebar-backdrop';document.body.appendChild(backdrop)}
    const isMobile=()=>window.matchMedia('(max-width:760px)').matches;
    const applyDesktop=collapsed=>{document.body.classList.toggle('sidebar-collapsed',collapsed);toggle.textContent=collapsed?'☰':'‹';toggle.title=collapsed?'Expand sidebar':'Collapse sidebar';toggle.setAttribute('aria-label',toggle.title)};
    const closeMobile=()=>{sidebar.classList.remove('open');backdrop.classList.remove('open');toggle.textContent='☰';toggle.title='Open menu'};
    const openMobile=()=>{sidebar.classList.add('open');backdrop.classList.add('open');toggle.textContent='×';toggle.title='Close menu'};
    applyDesktop(localStorage.getItem(key)==='1');
    toggle.addEventListener('click',()=>{if(isMobile()){sidebar.classList.contains('open')?closeMobile():openMobile()}else{const collapsed=!document.body.classList.contains('sidebar-collapsed');applyDesktop(collapsed);localStorage.setItem(key,collapsed?'1':'0')}});
    backdrop.addEventListener('click',closeMobile);
    document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{if(isMobile())closeMobile()}));
    window.addEventListener('resize',()=>{if(isMobile()){document.body.classList.remove('sidebar-collapsed');toggle.textContent=sidebar.classList.contains('open')?'×':'☰'}else{sidebar.classList.remove('open');backdrop.classList.remove('open');applyDesktop(localStorage.getItem(key)==='1')}});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();