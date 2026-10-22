// Public side: shows the site to visitors and updates live whenever the owner saves.
import { renderSite, safeImg, arr } from './render.js';
import DEFAULT from './content-default.js';
import { firebaseConfig, isConfigured } from './firebase-config.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const app = document.getElementById('app');
let state = DEFAULT;
let images = {};
let currentFilter = '';

function resolve(ref) {
  ref = String(ref || '');
  if (ref.startsWith('img:')) return images[ref.slice(4)] || '';
  return ref;
}

function draw() {
  app.innerHTML = renderSite(state, { resolve });
  applyFilter();
}

/* toast + copy */
const toastEl = document.getElementById('toast');
let toastT;
function toast(msg, ms) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, ms || 1800); }
function copyText(v) {
  const fb = () => {
    const ta = document.createElement('textarea'); ta.value = v; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied ' + v); } catch (e) { toast(v); }
    ta.remove();
  };
  try { navigator.clipboard.writeText(v).then(() => toast('Copied ' + v), fb); } catch (e) { fb(); }
}

/* certificate filter */
function applyFilter() {
  const f = currentFilter;
  app.querySelectorAll('.cert-filter button').forEach(b => b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'));
  app.querySelectorAll('.cert-card').forEach(c => { c.hidden = !!f && c.getAttribute('data-cat') !== f; });
  const g = app.querySelector('.certs');
  if (g) { g.classList.toggle('all', !f); g.hidden = !g.querySelector('.cert-card:not([hidden])'); }
  const m = app.querySelector('.certs-mini');
  if (m) m.hidden = !m.querySelector('.cert-card:not([hidden])');
}

/* certificate lightbox */
const dlg = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbT = document.getElementById('lb-title');
let lbIdx = 0;
function viewable() {
  return arr(state.certificates).map((c, i) => ({ c, i }))
    .filter(o => safeImg(resolve(o.c.image)) && (!currentFilter || o.c.category === currentFilter));
}
function showLb() {
  const v = viewable(); if (!v.length) return;
  lbIdx = (lbIdx + v.length) % v.length;
  const c = v[lbIdx].c;
  lbImg.src = safeImg(resolve(c.image)); lbImg.alt = 'Certificate: ' + c.title;
  lbT.textContent = c.title + (c.issuer ? ' · ' + c.issuer : '');
}
function openCert(i) {
  const v = viewable(); const k = v.findIndex(o => o.i === i); lbIdx = k < 0 ? 0 : k; showLb();
  if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
}
document.getElementById('lb-prev').addEventListener('click', () => { lbIdx--; showLb(); });
document.getElementById('lb-next').addEventListener('click', () => { lbIdx++; showLb(); });
document.getElementById('lb-close').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { lbIdx--; showLb(); } if (e.key === 'ArrowRight') { lbIdx++; showLb(); } });

app.addEventListener('click', e => {
  const b = e.target.closest('button[data-copy]'); if (b) { copyText(b.getAttribute('data-copy')); return; }
  const f = e.target.closest('.cert-filter button'); if (f) { currentFilter = f.getAttribute('data-f'); applyFilter(); return; }
  const c = e.target.closest('.cert-card[data-cert]'); if (c) openCert(+c.getAttribute('data-cert'));
});

draw();

/* live content from Firebase: any save on the admin page shows up here within a second or two */
async function connect() {
  if (!isConfigured) return;
  try {
    const { initializeApp } = await import(FB + 'firebase-app.js');
    const { getFirestore, doc, collection, onSnapshot } = await import(FB + 'firebase-firestore.js');
    const db = getFirestore(initializeApp(firebaseConfig));
    onSnapshot(collection(db, 'images'), snap => {
      const next = {};
      snap.forEach(d => { const src = d.data().src; if (safeImg(src)) next[d.id] = src; });
      images = next; draw();
    }, () => {});
    onSnapshot(doc(db, 'site', 'content'), snap => {
      if (!snap.exists()) return;
      try { state = JSON.parse(snap.data().json); draw(); } catch (e) { /* keep the last good content */ }
    }, () => {});
  } catch (e) {
    // Firebase unreachable: the built-in content stays on screen.
  }
}
connect();
