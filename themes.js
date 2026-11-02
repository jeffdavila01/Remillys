
const THEME_PRESETS = [
 {id:'gold',name:'Black & Gold Elegance',bg:'#f8f6f2',surface:'rgba(255,255,255,.18)',surfaceStrong:'rgba(255,255,255,.24)',alt:'rgba(255,255,255,.12)',text:'#35281c',muted:'#8a7a68',sidebar:'rgba(36,25,15,.78)',sideText:'#e8d8bf',sideBorder:'rgba(255,255,255,.14)',sideActive:'rgba(255,255,255,.12)',gold:'#f3d397',accent:'#ad7a36',border:'rgba(255,255,255,.22)',button:'rgba(57,39,25,.78)',buttonText:'#fff7ea',swatches:['#fff','#d9d9df','#f1b333','#14213a']},
 {id:'slate',name:'Slate & Rose',bg:'#ece9ee',surface:'rgba(255,255,255,.22)',surfaceStrong:'rgba(255,255,255,.28)',alt:'rgba(255,255,255,.13)',text:'#25222a',muted:'#6c6470',sidebar:'rgba(36,43,50,.76)',sideText:'#edf1f4',sideBorder:'rgba(255,255,255,.14)',sideActive:'rgba(255,255,255,.12)',gold:'#d5b4cc',accent:'#806a84',border:'rgba(255,255,255,.22)',button:'rgba(72,88,104,.76)',buttonText:'#fff',swatches:['#526c7b','#8896a6','#b4a8bb','#d6d3d7']},
 {id:'ocean',name:'Ocean Deep',bg:'#ecf3f7',surface:'rgba(255,255,255,.2)',surfaceStrong:'rgba(255,255,255,.26)',alt:'rgba(255,255,255,.12)',text:'#162b3a',muted:'#587384',sidebar:'rgba(7,30,45,.78)',sideText:'#d9eaf1',sideBorder:'rgba(255,255,255,.14)',sideActive:'rgba(255,255,255,.12)',gold:'#a5cbd8',accent:'#316783',border:'rgba(255,255,255,.22)',button:'rgba(20,68,95,.78)',buttonText:'#fff',swatches:['#081824','#183349','#3b6079','#b7d0dd']},
 {id:'purple',name:'Purple Cream',bg:'#f5eff0',surface:'rgba(255,255,255,.2)',surfaceStrong:'rgba(255,255,255,.26)',alt:'rgba(255,255,255,.12)',text:'#392c40',muted:'#827282',sidebar:'rgba(49,35,56,.8)',sideText:'#f0e5ec',sideBorder:'rgba(255,255,255,.14)',sideActive:'rgba(255,255,255,.12)',gold:'#e5cdb0',accent:'#87699c',border:'rgba(255,255,255,.22)',button:'rgba(88,67,104,.8)',buttonText:'#fff',swatches:['#34293c','#9b8297','#ddc3aa','#f3f2ec']},
 {id:'forest',name:'Forest Calm',bg:'#f4f1e8',surface:'rgba(255,255,255,.2)',surfaceStrong:'rgba(255,255,255,.26)',alt:'rgba(255,255,255,.12)',text:'#28382f',muted:'#6d796d',sidebar:'rgba(24,43,43,.8)',sideText:'#e2e8db',sideBorder:'rgba(255,255,255,.14)',sideActive:'rgba(255,255,255,.12)',gold:'#e3ce9c',accent:'#587563',border:'rgba(255,255,255,.22)',button:'rgba(52,84,72,.82)',buttonText:'#fff',swatches:['#142337','#3b5b63','#9caa89','#e2d0ad']},
 {id:'pastel',name:'Pastel Breeze',bg:'#f2f8f6',surface:'rgba(255,255,255,.2)',surfaceStrong:'rgba(255,255,255,.26)',alt:'rgba(255,255,255,.12)',text:'#34464a',muted:'#728b88',sidebar:'rgba(77,103,98,.8)',sideText:'#f5f9f7',sideBorder:'rgba(255,255,255,.14)',sideActive:'rgba(255,255,255,.12)',gold:'#ffe1ca',accent:'#548e8b',border:'rgba(255,255,255,.22)',button:'rgba(82,123,118,.82)',buttonText:'#fff',swatches:['#a4d7e0','#f8f2dd','#f3c7b6','#647b72']}
];
const cssThemeKeys={bg:'--bg',surface:'--surface',surfaceStrong:'--surface-strong',alt:'--surface-alt',text:'--text',muted:'--muted',sidebar:'--sidebar',sideText:'--side-text',sideBorder:'--side-border',sideActive:'--side-active',gold:'--gold',accent:'--accent',border:'--border',button:'--button',buttonText:'--button-text'};
let chosenTheme=localStorage.getItem('remillys-theme')||'gold';
function saveThemeVars(theme){
  const stored={};
  for(const [key,cssName] of Object.entries(cssThemeKeys)) stored[cssName]=theme[key];
  localStorage.setItem('remillys-theme-vars',JSON.stringify(stored));
}
function applyTheme(id,save=true){
  const theme=THEME_PRESETS.find(t=>t.id===id)||THEME_PRESETS[0];
  chosenTheme=theme.id;
  Object.entries(cssThemeKeys).forEach(([key,cssName])=>document.documentElement.style.setProperty(cssName,theme[key]));
  saveThemeVars(theme);
  if(save)localStorage.setItem('remillys-theme',theme.id);
  document.querySelectorAll('.palette').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme.id));
  syncUploaderTheme();
}
function showThemeDrawer(show){
  document.getElementById('themePanel').classList.toggle('open',show);
  document.getElementById('themePanel').setAttribute('aria-hidden',String(!show));
  document.getElementById('themeOverlay').hidden=!show;
}
function renderPalettes(){
  let grid=document.getElementById('themeGrid');
  THEME_PRESETS.forEach(t=>{
    const b=document.createElement('button');b.className='palette';b.type='button';b.dataset.theme=t.id;
    let preview=document.createElement('div');preview.className='preview';preview.style.setProperty('--swatch-bg',t.sidebar);
    t.swatches.forEach(color=>{let sw=document.createElement('div');sw.className='swatch';sw.style.backgroundColor=color;preview.appendChild(sw)});
    const tick=document.createElement('span');tick.className='selected-icon';tick.textContent='✓';
    const label=document.createElement('span');label.className='palette-name';label.textContent=t.name;
    b.append(preview,tick,label);b.onclick=()=>applyTheme(t.id);grid.appendChild(b)
  });
}
function customTheme(){
  const color=document.getElementById('customAccent').value;
  const current=THEME_PRESETS.find(t=>t.id===chosenTheme)||THEME_PRESETS[0];
  const newPreset={...current,id:'custom',name:'Custom Accent',accent:color,gold:color,button:color,buttonText:'#ffffff',swatches:[color,'#ffffff',current.sidebar,'#f5f5f5']};
  const found=THEME_PRESETS.findIndex(t=>t.id==='custom');if(found>=0)THEME_PRESETS.splice(found,1);THEME_PRESETS.push(newPreset);
  localStorage.setItem('remillys-custom-theme',JSON.stringify(newPreset));
  const old=document.querySelector('.palette[data-theme="custom"]'); if(old) old.remove();
  const grid=document.getElementById('themeGrid');
  const b=document.createElement('button');b.className='palette';b.type='button';b.dataset.theme='custom';
  let preview=document.createElement('div');preview.className='preview';preview.style.setProperty('--swatch-bg',newPreset.sidebar);
  newPreset.swatches.forEach(color=>{let sw=document.createElement('div');sw.className='swatch';sw.style.backgroundColor=color;preview.appendChild(sw)});
  const tick=document.createElement('span');tick.className='selected-icon';tick.textContent='✓';
  const label=document.createElement('span');label.className='palette-name';label.textContent='Custom Accent';
  b.append(preview,tick,label);b.onclick=()=>applyTheme('custom');grid.appendChild(b);
  applyTheme('custom');
}
try{const custom=JSON.parse(localStorage.getItem('remillys-custom-theme')||'null');if(custom&&custom.id==='custom')THEME_PRESETS.push(custom);}catch(e){}
renderPalettes();applyTheme(chosenTheme,false);
['themeTopBtn','themeSideBtn'].forEach(id=>document.getElementById(id).onclick=()=>showThemeDrawer(true));
['themeClose','themeApply','themeOverlay'].forEach(id=>document.getElementById(id).onclick=()=>showThemeDrawer(false));
document.getElementById('applyCustom').onclick=customTheme;
document.addEventListener('keydown',e=>{if(e.key==='Escape')showThemeDrawer(false)});
function syncUploaderTheme(){
  const frame=document.querySelector('iframe.report-frame'); if(!frame) return;
  try {
    const doc=frame.contentDocument; if(!doc||!doc.documentElement) return;
    const t=JSON.parse(localStorage.getItem('remillys-theme-vars')||'{}');
    Object.entries(t).forEach(([name,val])=>doc.documentElement.style.setProperty(name,val));
    frame.contentWindow?.postMessage?.({type:'remillys-theme'}, location.origin);
  } catch(err) { console.warn('Theme sync unavailable for uploader', err); }
}
document.addEventListener('load',event=>{ if(event.target&&event.target.matches&&event.target.matches('iframe.report-frame')) setTimeout(syncUploaderTheme,120); },true);
