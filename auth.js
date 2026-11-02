(()=>{
'use strict';
const $=(id)=>document.getElementById(id);
const allCodes=['0619E','1601E','2550M','2550Q','1601C','Sales Declaration'];
let client=null,profile=null,session=null,registerMode=false,recoveryMode=false;
const conf=window.REMILLYS_SUPABASE||{};
// Preserve the deployment path (including a GitHub Pages repository path).
const authRedirectUrl=location.origin+location.pathname;
const configured= /^https:\/\//.test(conf.url||'') && conf.anonKey && !conf.anonKey.includes('PASTE_');
function message(text,error=false){$('authStatus').textContent=text||'';$('authStatus').style.color=error?'#e37e7e':'#386c54';}
function setRegister(on){registerMode=on;$('authTitle').textContent=on?'Request a staff account':'Welcome back';$('authHelp').textContent=on?'Register first; the Owner must approve your access.':'Sign in with your approved account.';$('authName').classList.toggle('hidden',!on);$('authNameLabel').classList.toggle('hidden',!on);$('authName').required=on;$('authSubmit').textContent=on?'Create account':'Log in';$('authSwitch').textContent=on?'Already registered? Log in':'Create staff account';$('authPassword').autocomplete=on?'new-password':'current-password';message('');}
function canView(view,code){if(!profile||profile.status!=='approved')return false;if(profile.role==='owner')return true;const p=profile.permissions||{};if(view==='dashboard')return !!p.dashboard;if(view==='reports')return !!p.reports;if(view==='documents')return !!p.documents;if(view==='report')return !!p.reports && Array.isArray(p.report_codes)&&p.report_codes.includes(code);return false;}
function setNav(){for(const b of document.querySelectorAll('.nav[data-view]')){b.classList.toggle('hidden',!canView(b.dataset.view));} $('usersNav').classList.toggle('hidden',profile?.role!=='owner');$('currentUserLabel').textContent=profile?.full_name||session?.user?.email||'Signed in';}
function showLogin(reason=''){$('authScreen').hidden=false;$('appShell').hidden=true;profile=null;message(reason,!!reason);}
async function refresh(){const r=await client.auth.getSession();if(recoveryMode)return;session=r.data.session;if(!session)return showLogin();const {data,error}=await client.from('profiles').select('*').eq('id',session.user.id).single();if(error||!data)return showLogin('Unable to load your user profile. Ask the Owner to check your account.');profile=data;if(profile.status!=='approved')return showLogin(profile.status==='pending'?'Your account is pending Owner approval.':'Your account is disabled. Contact the Owner.');$('authScreen').hidden=true;$('appShell').hidden=false;setNav();restorePortalLocation(canView('dashboard')?'dashboard':canView('reports')?'reports':canView('documents')?'documents':'dashboard');if(!canView('dashboard')&&!canView('reports')&&!canView('documents')){document.getElementById('view').innerHTML='<section class="panel">Your account is approved, but no pages are assigned. Ask the Owner to grant permissions.</section>';}}
async function handleForm(e){e.preventDefault();if(!client)return message('Configure Supabase first.',true);const email=$('authEmail').value.trim(), password=$('authPassword').value;const btn=$('authSubmit');btn.disabled=true;try{if(registerMode){const name=$('authName').value.trim();if(!name)throw new Error('Enter your full name.');const {error}=await client.auth.signUp({email,password,options:{emailRedirectTo:authRedirectUrl,data:{full_name:name}}});if(error)throw error;await client.auth.signOut();setRegister(false);message('Registration submitted. Confirm your email if prompted, then wait for Owner approval.');}else{const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await refresh();}}catch(err){message(err.message||'Authentication failed',true)}finally{btn.disabled=false;}}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function renderUsers(main){if(profile?.role!=='owner')return;main.innerHTML='<p class="eyebrow">OWNER CONTROL</p><h1 class="page-title">User Management</h1><p class="subtitle">Review staff requests, approve users, and select the pages and forms they can access.</p><div id="usersMsg" role="status"></div><section class="panel"><h2>Staff accounts</h2><div id="usersList">Loading...</div></section>';const {data,error}=await client.from('profiles').select('id,email,full_name,role,status,permissions,created_at').order('created_at',{ascending:false});const list=$('usersList');if(error){list.textContent='Could not load users: '+error.message;return;}const staff=(data||[]).filter(u=>u.role!=='owner');if(!staff.length){list.textContent='No staff registrations yet.';return;}list.replaceChildren();for(const u of staff){const box=document.createElement('article');box.className='user-card';box.innerHTML=`<div class="user-card-head"><div><b>${esc(u.full_name||u.email)}</b><small>${esc(u.email)} · ${esc(u.status)}</small></div><span class="pill">${esc(u.role)}</span></div><label>Status</label><select data-field="status"><option value="pending">Pending</option><option value="approved">Approved</option><option value="disabled">Disabled</option></select><p class="auth-help">Allowed pages</p><div class="permission-grid">${[['dashboard','Dashboard'],['reports','Reports'],['documents','Documents']].map(([key,label])=>`<label><input type="checkbox" data-permission="${key}"> ${label}</label>`).join('')}</div><p class="auth-help">Allowed report forms</p><div class="permission-grid">${allCodes.map(code=>`<label><input type="checkbox" data-code="${esc(code)}"> ${esc(code)}</label>`).join('')}</div><button class="primary" data-save="${esc(u.id)}">Save permissions</button>`;const p=u.permissions||{};box.querySelector('[data-field="status"]').value=u.status;box.querySelectorAll('[data-permission]').forEach(el=>el.checked=!!p[el.dataset.permission]);box.querySelectorAll('[data-code]').forEach(el=>el.checked=Array.isArray(p.report_codes)&&p.report_codes.includes(el.dataset.code));box.querySelector('[data-save]').onclick=async()=>{const btn=box.querySelector('[data-save]');btn.disabled=true;try{const permissions={dashboard:box.querySelector('[data-permission="dashboard"]').checked,reports:box.querySelector('[data-permission="reports"]').checked,documents:box.querySelector('[data-permission="documents"]').checked,report_codes:[...box.querySelectorAll('[data-code]:checked')].map(el=>el.dataset.code)};const status=box.querySelector('[data-field="status"]').value;const {error}=await client.from('profiles').update({permissions,status}).eq('id',u.id);if(error)throw error;$('usersMsg').textContent='Saved access for '+(u.email||u.full_name)+'. Changes take effect when the staff session refreshes.';}catch(err){$('usersMsg').textContent='Save failed: '+err.message;}finally{btn.disabled=false;}};list.appendChild(box);}}
function setRecovery(on){
 recoveryMode=on;
 $('authRecoveryForm').hidden=!on;
 $('authForm').hidden=on;
 $('authLinks').hidden=on;
 if(on){showLogin();$('authNewPassword').focus();}
}
async function saveRecoveredPassword(e){
 e.preventDefault();
 if(!client||!recoveryMode)return;
 const password=$('authNewPassword').value;
 if(password.length<8)return message('Use at least 8 characters.',true);
 if(password!==$('authConfirmPassword').value)return message('Passwords do not match.',true);
 const btn=$('authRecoverySubmit');btn.disabled=true;
 try{
  const {error}=await client.auth.updateUser({password});
  if(error)throw error;
  // Return to normal login so profile approval and permissions are checked as usual.
  const {error:signOutError}=await client.auth.signOut();
  if(signOutError)throw signOutError;
  session=null;profile=null;
  $('authRecoveryForm').reset();$('authPassword').value='';
  setRecovery(false);setRegister(false);showLogin();
  message('Password updated. Log in with your new password.');
 }catch(err){message(err.message||'Could not update your password. Request a new recovery link.',true);}
 finally{btn.disabled=false;}
}
$('authRecoveryForm').addEventListener('submit',saveRecoveredPassword);
$('authForm').addEventListener('submit',handleForm);$('authSwitch').onclick=()=>setRegister(!registerMode);$('authForgot').onclick=async()=>{if(!client)return message('Configure Supabase first.',true);const email=$('authEmail').value.trim();if(!email)return message('Enter your email first.',true);const btn=$('authForgot');btn.disabled=true;try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:authRedirectUrl});if(error)throw error;message('If an account exists, a recovery email will be sent. Open its link in this browser to set a new password.');}catch(err){message(err.message||'Could not send the recovery email.',true);}finally{btn.disabled=false;}};$('logoutBtn').onclick=async()=>{await client?.auth.signOut();session=null;showLogin();};
window.RemillysAuth={canView,renderUsers,locationKey:()=> 'remillys-location:'+session?.user?.id};
if(!configured||!window.supabase){$('authSetup').hidden=false;message('Authentication requires Supabase configuration.',true);}else{client=window.supabase.createClient(conf.url,conf.anonKey);client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')setRecovery(true);if(event==='SIGNED_OUT')showLogin();});refresh().catch(e=>showLogin(e.message));}
})();
