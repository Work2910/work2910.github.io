// Owner side: email/password login, then a live editor that saves to Firebase.
import { renderSite, esc, safeImg } from './render.js';
import DEFAULT from './content-default.js';
import { firebaseConfig, OWNER_UID, isConfigured } from './firebase-config.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const $ = id => document.getElementById(id);
const loginView = $('login-view'), adminView = $('admin-view');
const loginForm = $('login-form'), loginMsg = $('login-msg'), loginBtn = $('login-btn');
const app = $('app');

let auth, db, F = {};
let state = null, images = {}, original = '', dirty = false;

/* ---------- small helpers ---------- */
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function el(tag, attrs, html) { const e = document.createElement(tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
function resolve(ref) { ref = String(ref || ''); return ref.startsWith('img:') ? (images[ref.slice(4)] || '') : ref; }
function showMsg(text, kind) { loginMsg.textContent = text; loginMsg.className = 'auth-msg ' + (kind || ''); loginMsg.hidden = !text; }
const toastEl = $('toast'); let toastT;
function toast(msg, ms) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, ms || 2200); }
function walk(node, fn) {
  if (Array.isArray(node)) node.forEach((_, i) => { fn(node, i); walk(node[i], fn); });
  else if (node && typeof node === 'object') Object.keys(node).forEach(k => { fn(node, k); walk(node[k], fn); });
}
function newId() { return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/[^a-z0-9]/gi, '').slice(0, 24); }

/* ---------- auth ---------- */
async function boot() {
  if (!isConfigured) {
    showMsg('This site is not connected to Firebase yet. Fill in js/firebase-config.js (see README.md), then reload this page.', 'warn');
    loginBtn.disabled = true; return;
  }
  try {
    const { initializeApp } = await import(FB + 'firebase-app.js');
    const A = await import(FB + 'firebase-auth.js');
    const S = await import(FB + 'firebase-firestore.js');
    F = Object.assign({}, A, S);
    const fbApp = initializeApp(firebaseConfig);
    auth = A.getAuth(fbApp); db = S.getFirestore(fbApp);
    await A.setPersistence(auth, A.browserLocalPersistence);
  } catch (e) {
    showMsg('Could not reach the login service. Check your internet connection and reload.', 'warn');
    loginBtn.disabled = true; return;
  }
  F.onAuthStateChanged(auth, user => {
    if (!user) { showLogin(); return; }
    if (OWNER_UID && !OWNER_UID.includes('PASTE_') && user.uid !== OWNER_UID) {
      F.signOut(auth); showLogin(); showMsg('That account is not the owner of this site.', 'warn'); return;
    }
    showAdmin(user);
  });
}

function showLogin() {
  adminView.hidden = true; loginView.hidden = false; document.body.classList.remove('editing', 'is-admin');
  document.title = 'Owner login';
  loginBtn.disabled = false; loginBtn.textContent = 'Log in';
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!auth) return;
  const email = $('login-email').value.trim(), pw = $('login-pass').value;
  if (!email || !pw) { showMsg('Enter your email and password.', 'warn'); return; }
  loginBtn.disabled = true; loginBtn.textContent = 'Logging in…'; showMsg('');
  try {
    await F.signInWithEmailAndPassword(auth, email, pw);
    $('login-pass').value = '';
  } catch (err) {
    const c = err && err.code || '';
    let m = 'Login failed. Try again.';
    if (/invalid-credential|wrong-password|user-not-found|invalid-email|invalid-login/.test(c)) m = 'Email or password is incorrect.';
    else if (/too-many-requests/.test(c)) m = 'Too many attempts. Wait a few minutes, or reset your password.';
    else if (/network-request-failed/.test(c)) m = 'Cannot reach the login service. Check your internet connection.';
    else if (/user-disabled/.test(c)) m = 'This account has been disabled in Firebase.';
    showMsg(m, 'warn'); loginBtn.disabled = false; loginBtn.textContent = 'Log in';
  }
});

$('forgot-btn').addEventListener('click', async () => {
  if (!auth) return;
  const email = $('login-email').value.trim();
  if (!email) { showMsg('Type your email above first, then click "Forgot password?".', 'warn'); $('login-email').focus(); return; }
  try { await F.sendPasswordResetEmail(auth, email); } catch (e) { /* same message either way */ }
  showMsg('If that email belongs to the owner account, a password reset link is on its way. Check your inbox and spam folder.', 'ok');
});

$('pw-toggle').addEventListener('click', () => {
  const p = $('login-pass'), show = p.type === 'password';
  p.type = show ? 'text' : 'password'; $('pw-toggle').textContent = show ? 'Hide' : 'Show';
  $('pw-toggle').setAttribute('aria-pressed', show ? 'true' : 'false');
});

$('logout-btn').addEventListener('click', async () => {
  if (dirty && !window.confirm('You have unsaved changes. Log out and lose them?')) return;
  dirty = false; await F.signOut(auth); showMsg('You have logged out.', 'ok');
});

/* ---------- admin ---------- */
async function showAdmin(user) {
  loginView.hidden = true; adminView.hidden = false; document.body.classList.add('editing', 'is-admin');
  document.title = 'Owner dashboard';
  $('who').textContent = user.email || 'Owner';
  setStatus('Loading your site…');
  try {
    const [snap, imgs] = await Promise.all([F.getDoc(F.doc(db, 'site', 'content')), F.getDocs(F.collection(db, 'images'))]);
    images = {}; imgs.forEach(d => { const s = d.data().src; if (safeImg(s)) images[d.id] = s; });
    state = snap.exists() ? JSON.parse(snap.data().json) : clone(DEFAULT);
    original = JSON.stringify(state); dirty = false;
    setStatus(snap.exists() ? 'All changes saved. Edits preview live; press Save to publish.' : 'First visit: this is your starting content. Press Save once to publish it to Firebase.', snap.exists() ? '' : 'warn');
    if (!snap.exists()) { dirty = true; saveBtn.disabled = false; }
  } catch (e) {
    state = clone(DEFAULT); original = JSON.stringify(state);
    setStatus('Could not load saved content (' + (e.code || 'error') + '). Showing the starting content.', 'warn');
  }
  rebuildForm(); draw();
}

function draw() { app.innerHTML = renderSite(state, { editor: true, resolve }); }

const statusEl = $('ed-status'), saveBtn = $('ed-save'), formEl = $('ed-form');
function setStatus(t, kind) { statusEl.textContent = t; statusEl.className = 'ed-status ' + (kind || ''); }
function markDirty() {
  dirty = true; saveBtn.disabled = false; setStatus('Unsaved changes', 'warn');
  clearTimeout(markDirty.t); markDirty.t = setTimeout(draw, 120);
}

async function save() {
  if (!dirty) return;
  saveBtn.disabled = true; setStatus('Saving…');
  try {
    // 1. Upload new images as their own documents (Firestore documents max out at 1 MB).
    const pending = [];
    walk(state, (o, k) => { if (typeof o[k] === 'string' && o[k].startsWith('data:image/')) pending.push([o, k]); });
    for (const [o, k] of pending) {
      const id = newId();
      await F.setDoc(F.doc(db, 'images', id), { src: o[k], createdAt: F.serverTimestamp() });
      images[id] = o[k]; o[k] = 'img:' + id;
    }
    // 2. Save the content.
    const json = JSON.stringify(state);
    if (json.length > 900000) throw { code: 'too-large' };
    await F.setDoc(F.doc(db, 'site', 'content'), { json, updatedAt: F.serverTimestamp() });
    // 3. Remove images nothing uses any more.
    const used = new Set();
    walk(state, (o, k) => { if (typeof o[k] === 'string' && o[k].startsWith('img:')) used.add(o[k].slice(4)); });
    for (const id of Object.keys(images)) {
      if (!used.has(id)) { try { await F.deleteDoc(F.doc(db, 'images', id)); delete images[id]; } catch (e) { /* retried next save */ } }
    }
    original = json; dirty = false;
    setStatus('Saved. Visitors see these changes now.', 'ok'); toast('Saved and published');
  } catch (e) {
    const c = e && e.code || '';
    let m = 'Save failed (' + (c || 'unknown error') + '). Press Save to try again.';
    if (/permission-denied/.test(c)) m = 'Firebase refused the save: this account is not set as the owner in the security rules. Check your UID in firestore.rules.';
    else if (/unavailable|network/.test(c)) m = 'You seem to be offline. Reconnect and press Save again.';
    else if (/resource-exhausted/.test(c)) m = 'The free Firebase daily limit was reached. Try again tomorrow.';
    else if (c === 'too-large') m = 'The text content is too large to save. Shorten some sections.';
    setStatus(m, 'warn'); saveBtn.disabled = false;
  }
}
saveBtn.addEventListener('click', save);
$('ed-discard').addEventListener('click', () => {
  if (!dirty) return;
  state = JSON.parse(original); dirty = false; saveBtn.disabled = true;
  setStatus('Changes discarded.'); rebuildForm(); draw();
});
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

// phone: switch between editor and preview
$('ed-preview').addEventListener('click', () => { document.body.classList.add('previewing'); });
$('back-to-editor').addEventListener('click', () => { document.body.classList.remove('previewing'); });

/* ---------- form builder ---------- */
const SECTIONS = [
  ['hero', 'Header, photo & contact'], ['stats', 'Highlight numbers'], ['about', 'About'], ['links', 'Profiles (Upwork, Wellfound, GitHub…)'],
  ['experience', 'Experience'], ['projects', 'Projects'], ['skills', 'Skills'], ['certificates', 'Certificates'],
  ['education', 'Education'], ['contact', 'Contact band']
];
const LABELS = {
  eyebrow: 'Tagline above name', firstName: 'First name', lastName: 'Last name (coloured)', lede: 'Intro paragraph', badge: 'Photo badge (blank hides it)',
  paras: 'Paragraphs', focusTitle: 'Side card title', focus: 'Side card items', url: 'Link (https://…)', note: 'Short description',
  org: 'Company', meta: 'Location / details', when: 'Dates', duration: 'Length', kind: 'Type label', points: 'Bullet points',
  desc: 'Description', stack: 'Tools / tags', pipeline: 'Pipeline steps (makes it a featured card)', step: 'Step', state: 'Status',
  completed: 'Completed (green dot)', icon: 'Short icon text (2–4 letters)', group: 'Group name', items: 'Items', issuer: 'Issued by',
  category: 'Category (used for filter buttons)', image: 'Certificate image', photo: 'Photo', details: 'Details', heading: 'Heading', text: 'Text',
  year: 'Footer year', location: 'Location'
};
const LONG = { lede: 1, desc: 1, text: 1, paras: 1, points: 1, details: 1, note: 1 };
const TEMPLATES = {
  stats: { value: '', label: '' }, paras: '', focus: '', links: { name: '', url: '', note: '' },
  experience: { title: '', org: '', meta: '', when: '', duration: '', kind: '', points: [''] }, points: '',
  projects: { title: '', status: 'In progress', completed: false, icon: '', desc: '', points: [], stack: [''], pipeline: [] },
  stack: '', pipeline: { step: '', state: 'next' }, skills: { group: '', items: [''] }, items: '',
  certificates: { title: '', issuer: '', date: '', category: '', image: '' }, education: { when: '', title: '', school: '', details: '' }
};
const ITEM_NAME = { stats: 'number', paras: 'paragraph', focus: 'item', links: 'profile', experience: 'role', points: 'bullet', projects: 'project', stack: 'tag', pipeline: 'step', skills: 'group', items: 'skill', certificates: 'certificate', education: 'entry' };
const label = k => LABELS[k] || (String(k).charAt(0).toUpperCase() + String(k).slice(1).replace(/([A-Z])/g, ' $1'));
let uid = 0;

function itemTitle(key, v, i) {
  if (v && typeof v === 'object') return v.title || v.name || v.group || v.value || v.step || (label(ITEM_NAME[key] || 'item') + ' ' + (i + 1));
  return String(v || '').slice(0, 48) || ('Empty ' + (ITEM_NAME[key] || 'item'));
}

function buildValue(container, parent, key, depth) {
  const v = parent[key];
  if (Array.isArray(v)) return buildArray(container, parent, key, depth);
  if (v && typeof v === 'object') { Object.keys(v).forEach(k => buildValue(container, v, k, depth + 1)); return; }
  const id = 'f' + (++uid), wrap = el('div', { class: 'ed-field' });
  if (typeof v === 'boolean') {
    const cb = el('input', { type: 'checkbox', id }); cb.checked = v;
    cb.addEventListener('change', () => { parent[key] = cb.checked; markDirty(); });
    const l = el('label', { for: id, class: 'ed-check' }); l.appendChild(cb); l.appendChild(document.createTextNode(' ' + label(key)));
    wrap.appendChild(l); container.appendChild(wrap); return;
  }
  if (key === 'photo' || key === 'image') {
    wrap.appendChild(el('span', { class: 'ed-label' }, esc(label(key))));
    const row = el('div', { class: 'ed-img' });
    const src = safeImg(resolve(v));
    row.appendChild(src ? el('img', { src, alt: '' }) : el('span', { class: 'ed-noimg' }, 'No image'));
    const fi = el('input', { type: 'file', accept: 'image/*', id });
    const pick = el('label', { for: id, class: 'ed-btn' }, src ? 'Replace image' : 'Upload image');
    fi.addEventListener('change', () => {
      const f = fi.files && fi.files[0]; if (!f) return;
      if (!/^image\//.test(f.type)) { toast('Choose an image file (JPG or PNG). For a PDF certificate, take a screenshot of it first.', 3500); return; }
      shrink(f, key === 'photo' ? 520 : 1400, uri => { parent[key] = uri; markDirty(); rebuildForm(); },
        () => toast('That image could not be read. Try a JPG or PNG.', 3000));
    });
    row.appendChild(fi); row.appendChild(pick);
    if (src) { const rm = el('button', { type: 'button', class: 'ed-btn ghost' }, 'Remove'); rm.addEventListener('click', () => { parent[key] = ''; markDirty(); rebuildForm(); }); row.appendChild(rm); }
    wrap.appendChild(row); container.appendChild(wrap); return;
  }
  if (key === 'state') {
    wrap.appendChild(el('label', { for: id, class: 'ed-label' }, label(key)));
    const sel = el('select', { id });
    ['done', 'building', 'next'].forEach(o => { const op = el('option', { value: o }, o); if (o === v) op.selected = true; sel.appendChild(op); });
    sel.addEventListener('change', () => { parent[key] = sel.value; markDirty(); });
    wrap.appendChild(sel); container.appendChild(wrap); return;
  }
  const isIdx = typeof key === 'number';
  if (!isIdx) wrap.appendChild(el('label', { for: id, class: 'ed-label' }, esc(label(key))));
  const long = LONG[key] || (isIdx && LONG[container.getAttribute('data-arr')]);
  const inp = long ? el('textarea', { id, rows: '3' }) : el('input', { type: key === 'url' ? 'url' : (key === 'email' ? 'email' : 'text'), id });
  if (isIdx) inp.setAttribute('aria-label', label(container.getAttribute('data-arr')) + ' ' + (key + 1));
  if (key === 'url') inp.placeholder = 'https://';
  inp.value = v == null ? '' : v;
  inp.addEventListener('input', () => { parent[key] = inp.value; markDirty(); });
  wrap.appendChild(inp); container.appendChild(wrap);
}

function buildArray(container, parent, key, depth) {
  const list = parent[key], box = el('div', { class: 'ed-arr', 'data-arr': key });
  box.appendChild(el('span', { class: 'ed-label' }, esc(label(key))));
  const simple = !list.some(x => x && typeof x === 'object') && typeof TEMPLATES[key] !== 'object';
  list.forEach((item, i) => {
    const row = el('div', { class: simple ? 'ed-row simple' : 'ed-row' });
    const tools = el('div', { class: 'ed-tools' });
    if (!simple) tools.appendChild(el('span', { class: 'ed-item-t' }, esc(itemTitle(key, item, i))));
    [['↑', 'Move up', -1], ['↓', 'Move down', 1]].forEach(b => {
      const btn = el('button', { type: 'button', class: 'ed-ic', title: b[1], 'aria-label': b[1] }, b[0]);
      btn.disabled = (b[2] < 0 && i === 0) || (b[2] > 0 && i === list.length - 1);
      btn.addEventListener('click', () => { const j = i + b[2]; [list[i], list[j]] = [list[j], list[i]]; markDirty(); rebuildForm(); });
      tools.appendChild(btn);
    });
    const del = el('button', { type: 'button', class: 'ed-ic del', title: 'Delete', 'aria-label': 'Delete ' + (ITEM_NAME[key] || 'item') }, '✕');
    del.addEventListener('click', () => { list.splice(i, 1); markDirty(); rebuildForm(); });
    tools.appendChild(del);
    if (simple) { const f = el('div', { class: 'ed-grow', 'data-arr': key }); buildValue(f, list, i, depth + 1); row.appendChild(f); row.appendChild(tools); }
    else {
      const det = el('details', { class: 'ed-item', 'data-k': key + ':' + i + ':' + depth });
      const sm = el('summary'); sm.appendChild(tools); det.appendChild(sm);
      const body = el('div', { class: 'ed-item-body' }); buildValue(body, list, i, depth + 1); det.appendChild(body); row.appendChild(det);
    }
    box.appendChild(row);
  });
  const add = el('button', { type: 'button', class: 'ed-btn add' }, '+ Add ' + (ITEM_NAME[key] || 'item'));
  add.addEventListener('click', () => {
    const t = TEMPLATES[key] !== undefined ? TEMPLATES[key] : (list.length && typeof list[0] === 'object' ? {} : '');
    list.push(clone(t)); markDirty(); rebuildForm(key + ':' + (list.length - 1) + ':' + (depth + 1));
  });
  box.appendChild(add);
  container.appendChild(box);
}

function rebuildForm(openKey) {
  const openSet = {}, scroll = formEl.scrollTop;
  formEl.querySelectorAll('details[open][data-k]').forEach(d => { openSet[d.getAttribute('data-k')] = 1; });
  if (openKey) openSet[openKey] = 1;
  formEl.innerHTML = '';
  SECTIONS.forEach(([k, title]) => {
    if (state[k] === undefined) return;
    const det = el('details', { class: 'ed-sec', 'data-k': 'sec:' + k });
    det.appendChild(el('summary', null, esc(title)));
    const body = el('div', { class: 'ed-sec-body' });
    if (Array.isArray(state[k])) buildArray(body, state, k, 0); else buildValue(body, state, k, 0);
    det.appendChild(body); formEl.appendChild(det);
  });
  formEl.querySelectorAll('details[data-k]').forEach(d => { if (openSet[d.getAttribute('data-k')]) d.open = true; });
  formEl.scrollTop = scroll;
}
formEl.addEventListener('click', e => { if (e.target.closest('summary button')) e.preventDefault(); });

function shrink(file, maxW, ok, bad) {
  const r = new FileReader();
  r.onerror = bad;
  r.onload = () => {
    const img = new Image();
    img.onerror = bad;
    img.onload = () => {
      let w = maxW, q = 0.82, uri = '';
      for (let tries = 0; tries < 6; tries++) {
        const s = Math.min(1, w / img.width), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        uri = c.toDataURL('image/jpeg', q);
        if (uri.length < 900000) break;
        w = Math.round(w * 0.8); q = Math.max(0.6, q - 0.06);
      }
      ok(uri);
    };
    img.src = r.result;
  };
  r.readAsDataURL(file);
}

boot();
