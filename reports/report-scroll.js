(() => {
  'use strict';
  const style = document.createElement('style');
  style.textContent = `
    .report-scroll-controls{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;gap:12px;padding:10px 12px;margin-top:8px;background:#eee6d9;color:#35281c;border:1px solid #b7a793;border-radius:10px;font:12px system-ui;box-shadow:0 -3px 12px #0002}
    .report-scroll-controls span{white-space:nowrap}
    .report-scroll-controls input{flex:1;min-width:60px;width:auto;accent-color:#806039;cursor:ew-resize;height:24px;padding:0}
    @media print{.report-scroll-controls{display:none!important}}
  `;
  document.head.append(style);
  document.querySelectorAll('.table-wrapper,.tablewrap').forEach(wrapper => {
    const table = wrapper.querySelector('table');
    if (!table) return;
    const controls = document.createElement('label');
    controls.className = 'report-scroll-controls';
    const text = document.createElement('span');
    text.textContent = 'Scroll left / right';
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '0'; slider.value = '0';
    slider.setAttribute('aria-label', 'Scroll report columns left or right');
    controls.append(text, slider);
    wrapper.after(controls);
    const update = () => {
      const maximum = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
      slider.max = String(maximum);
      slider.value = String(wrapper.scrollLeft);
      slider.disabled = maximum === 0;
    };
    slider.addEventListener('input', () => { wrapper.scrollLeft = Number(slider.value); });
    wrapper.addEventListener('scroll', update, {passive:true});
    new ResizeObserver(update).observe(wrapper);
    new ResizeObserver(update).observe(table);
    new MutationObserver(update).observe(table, {childList:true,subtree:true,characterData:true});
    update();
  });
})();
