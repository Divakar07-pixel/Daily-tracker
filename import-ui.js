/* Import entry points: visible only on Overview and Expenses. */
(()=>{
  const wire=()=>document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-open-import]');
    if(!btn)return;
    e.preventDefault();
    document.getElementById('importNav')?.click();
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
