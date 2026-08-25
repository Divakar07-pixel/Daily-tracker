/* Expanded expense categories. Keeps the existing Firestore schema unchanged. */
(()=>{
  const CATEGORIES=[
    'Food','Dining Out','Coffee & Snacks','Groceries','Transport','Fuel / Petrol','Parking','Vehicle Maintenance','Public Transport','Taxi / Cab','Travel','Flights / Hotels',
    'Bills & Utilities','Electricity','Water','Gas','Internet','Mobile Recharge','Rent','EMI / Loan','Insurance','Bank Fees / Charges','Taxes',
    'Shopping','Clothing','Electronics','Home & Furniture','Personal Care','Beauty','Subscriptions','Entertainment','Movies / Events','Games',
    'Health','Medical','Pharmacy','Fitness','Education','Books / Courses','Family','Gifts','Donations','Pets',
    'Investments','Stocks','Mutual Funds / SIP','Digital Gold','Digital Silver','Business','ATM Withdrawal','Cash Transfer','Other'
  ];
  function apply(){
    ['eCategory','expenseFilter','historyCategory'].forEach(id=>{
      const el=document.getElementById(id); if(!el)return;
      const current=el.value;
      const isFilter=id!=='eCategory';
      el.innerHTML=(isFilter?'<option value="">All categories</option>':'')+CATEGORIES.map(c=>`<option>${c.replace(/&/g,'&amp;')}</option>`).join('');
      if(CATEGORIES.includes(current))el.value=current;
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  window.addEventListener('firebase-ready',apply);
})();
