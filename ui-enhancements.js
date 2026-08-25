(()=>{
  const key='dailyTracker_sidebar_collapsed';
  const apply=collapsed=>{document.body.classList.toggle('sidebar-collapsed',collapsed);const b=document.getElementById('sidebarToggle');const d=document.getElementById('desktopSidebarToggle');if(b)b.textContent=collapsed?'›':'‹';if(d)d.setAttribute('title',collapsed?'Show sidebar':'Hide sidebar')};
  const init=()=>{const saved=localStorage.getItem(key)==='1';apply(saved);const toggle=()=>{const collapsed=!document.body.classList.contains('sidebar-collapsed');apply(collapsed);localStorage.setItem(key,collapsed?'1':'0')};document.getElementById('sidebarToggle')?.addEventListener('click',toggle);document.getElementById('desktopSidebarToggle')?.addEventListener('click',toggle)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();