(() => {
  'use strict';
  let userKey;
  try{userKey=window.parent.RemillysAuth?.locationKey();}catch{}
  const positionKey=(userKey||'remillys-location')+':'+location.pathname+':'+(new URLSearchParams(location.search).get('form')||'0619E');
  let saved={};
  try{saved=JSON.parse(sessionStorage.getItem(positionKey)||'{}');}catch{}
  const positions={...saved};
  const store=()=>{try{sessionStorage.setItem(positionKey,JSON.stringify(positions));}catch{}};
  let restoring=true;
  window.addEventListener('scroll',()=>{if(!restoring){positions.pageY=window.scrollY;store();}},{passive:true});
  const restorePage=()=>{
    if(!restoring)return;
    window.scrollTo(0,saved.pageY||0);
  };
  window.addEventListener('load',()=>{restorePage();restoring=false;});
  document.querySelectorAll('.table-wrapper,.tablewrap').forEach(wrapper => {
    const table = wrapper.querySelector('table');
    if (!table) return;
    let tableRestored=false;
    const update = () => {
      if(!tableRestored && wrapper.scrollWidth>0 && table.rows.length>1){
        wrapper.scrollLeft=saved.tableX||0;wrapper.scrollTop=saved.tableY||0;tableRestored=true;restorePage();
      }
    };
    wrapper.addEventListener('scroll',()=>{update();if(tableRestored){positions.tableX=wrapper.scrollLeft;positions.tableY=wrapper.scrollTop;store();}}, {passive:true});
    new ResizeObserver(update).observe(wrapper);
    new ResizeObserver(update).observe(table);
    new MutationObserver(update).observe(table, {childList:true,subtree:true,characterData:true});
    update();
  });
})();
