// Renders the whole site from its content. Shared by the public page and the admin preview.
var TONES = ['t', 'c', 'p', 'g'];
  function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function safeUrl(u) { u = String(u || '').trim(); if (u && !/^https?:\/\//i.test(u) && /^[\w.-]+\.[a-z]{2,}/i.test(u)) u = 'https://' + u; return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
function safeImg(u) {
  u = String(u || '');
  if (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(u)) return u;
  if (/^assets\/[\w./-]+\.(jpe?g|png|webp|gif)$/i.test(u) && u.indexOf('..') < 0) return u;
  return '';
}
var RESOLVE = function (ref) { return safeImg(ref); };
function img(ref) { var u = RESOLVE(ref); return safeImg(u); }
function tone(i) { return TONES[i % 4]; }
function initials(s) {
  var w = String(s || '').trim().split(/\s+/).filter(Boolean);
  return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
}
function arr(a) { return Array.isArray(a) ? a : []; }
function nonEmpty(a) { return arr(a).filter(function (x) { return String(x || '').trim(); }); }
function phoneDigits(p) { return String(p || '').replace(/[^\d+]/g, ''); }
function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

/* ---------- page renderer (pure: state -> markup) ---------- */
function renderSite(d, opts) {
  opts = opts || {};
  var ed = !!opts.editor, h = d.hero || {}, out = [];
  RESOLVE = opts.resolve || function (ref) { return safeImg(ref); };
  var links = arr(d.links).filter(function (l) { return ed || safeUrl(l.url); });
  var certs = arr(d.certificates);
  var showLinks = links.length > 0;

  var nav = [['about', 'About']];
  if (showLinks) nav.push(['profiles', 'Profiles']);
  nav.push(['experience', 'Experience'], ['projects', 'Projects'], ['skills', 'Skills']);
  if (certs.length) nav.push(['certificates', 'Certificates']);
  nav.push(['education', 'Education'], ['contact', 'Contact']);

  out.push('<nav class="top" aria-label="Sections"><div class="wrap"><a class="brand" href="#top">' + esc(h.firstName || 'Home') + '<span>.</span></a><ul>' +
    nav.map(function (n) { return '<li><a class="l" href="#' + n[0] + '">' + n[1] + '</a></li>'; }).join('') + '</ul></div></nav>');

  // hero
  var photo = img(h.photo);
  out.push('<header class="hero" id="top"><div class="wrap hero-grid"><div class="hero-text">' +
    (h.eyebrow ? '<p class="eyebrow">' + esc(h.eyebrow) + '</p>' : '') +
    '<h1>' + esc(h.firstName) + ' <span class="hl">' + esc(h.lastName) + '</span></h1>' +
    (h.lede ? '<p class="lede">' + esc(h.lede) + '</p>' : '') +
    '<div class="contact-row">' +
    (h.email ? '<span class="chip"><span class="k">email</span> <a href="mailto:' + esc(h.email) + '">' + esc(h.email) + '</a> <button type="button" data-copy="' + esc(h.email) + '">Copy</button></span>' : '') +
    (h.phone ? '<span class="chip"><span class="k">phone</span> ' + esc(h.phone) + ' <button type="button" data-copy="' + esc(phoneDigits(h.phone)) + '">Copy</button></span>' : '') +
    '</div></div>' +
    '<div class="hero-side"><div class="portrait-frame">' +
    (photo ? '<img class="portrait" src="' + esc(photo) + '" alt="Portrait of ' + esc(h.firstName + ' ' + h.lastName) + '">' : '<div class="portrait portrait-empty">' + esc(initials(h.firstName + ' ' + h.lastName)) + '</div>') +
    (h.badge ? '<div class="badge-float"><i></i>' + esc(h.badge) + '</div>' : '') +
    '</div></div></div>');
  var stats = arr(d.stats);
  if (stats.length) {
    out.push('<div class="wrap"><div class="stats" role="group" aria-label="At a glance">' + stats.map(function (s, i) {
      return '<div class="stat ' + tone(i) + '"><div class="v">' + esc(s.value) + '</div><div class="n">' + esc(s.label) + '</div></div>';
    }).join('') + '</div></div>');
  }
  out.push('</header><main class="wrap">');

  // about
  var ab = d.about || {}, focus = nonEmpty(ab.focus);
  out.push('<section id="about" class="about"><div class="sec-head"><span class="k">Who I am</span><h2>About</h2></div><div class="about-grid"><div>' +
    nonEmpty(ab.paras).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
    (focus.length ? '<div class="focus"><h4>' + esc(ab.focusTitle || 'Current focus') + '</h4><ul>' + focus.map(function (f, i) {
      return '<li><span class="fx ' + tone(i) + '">' + String(i + 1).padStart(2, '0') + '</span>' + esc(f) + '</li>';
    }).join('') + '</ul></div>' : '') + '</div></section>');

  // profiles
  if (showLinks) {
    out.push('<section id="profiles"><div class="sec-head"><span class="k">Find me online</span><h2>Profiles</h2></div><div class="links">' + links.map(function (l, i) {
      var u = safeUrl(l.url);
      var inner = '<span class="lk-ico ' + tone(i) + '">' + esc(initials(l.name)) + '</span>' +
        '<span class="lk-body"><b>' + esc(l.name || 'Profile') + '</b>' +
        (l.note ? '<span class="lk-note">' + esc(l.note) + '</span>' : '') +
        '<span class="lk-url">' + (u ? esc(u.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')) : 'Link not added yet: open Edit site to add it') + '</span></span>' +
        '<span class="lk-go" aria-hidden="true">' + (u ? '↗' : '+') + '</span>';
      return u ? '<a class="lk ' + tone(i) + '" href="' + esc(u) + '" target="_blank" rel="noopener">' + inner + '</a>'
               : '<div class="lk lk-empty ' + tone(i) + '">' + inner + '</div>';
    }).join('') + '</div></section>');
  }

  // experience
  var exp = arr(d.experience);
  out.push('<section id="experience"><div class="sec-head"><span class="k">Where I\'ve worked</span><h2>Experience</h2><span class="tag">' + exp.length + (exp.length === 1 ? ' role' : ' roles') + '</span></div><div class="roles">' + exp.map(function (e, i) {
    var pts = nonEmpty(e.points);
    return '<article class="role"><div class="when"><b>' + esc(e.when) + '</b>' + esc(e.duration) +
      (e.kind ? ' <span class="pill ' + tone(i) + '">' + esc(e.kind) + '</span>' : '') + '</div>' +
      '<div class="role-body"><h3>' + esc(e.title) + '</h3><p class="org">' + esc(e.org) + (e.meta ? ' <span class="meta">· ' + esc(e.meta) + '</span>' : '') + '</p>' +
      (pts.length ? '<ul class="pts">' + pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') + '</div></article>';
  }).join('') + '</div></section>');

  // projects
  var pr = arr(d.projects);
  out.push('<section id="projects"><div class="sec-head"><span class="k">What I\'ve built</span><h2>Projects</h2><span class="tag">selected work</span></div><div class="projects">' + pr.map(function (p, i) {
    var t = tone(i), pts = nonEmpty(p.points), st = nonEmpty(p.stack), pipe = arr(p.pipeline).filter(function (x) { return x && x.step; });
    var status = '<span class="status' + (p.completed ? ' done' : '') + '">' + esc(p.status) + '</span>';
    var body = '<h3>' + esc(p.title) + '</h3>' + (p.desc ? '<p>' + esc(p.desc) + '</p>' : '') +
      (pts.length ? '<ul class="pts">' + pts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      (st.length ? '<div class="stack">' + st.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '');
    if (pipe.length) {
      var lbl = { done: ['ok', 'done'], building: ['wip', 'building'], next: ['next', 'next'] };
      return '<article class="proj feature tone-' + t + '"><div class="left">' + status + body + '</div><div><p class="pipeline-cap">pipeline</p><ol class="pipeline">' +
        pipe.map(function (s, j) { var L = lbl[s.state] || lbl.next; return '<li><span class="i">' + String(j + 1).padStart(2, '0') + '</span>' + esc(s.step) + '<span class="s ' + L[0] + '">' + L[1] + '</span></li>'; }).join('') +
        '</ol></div></article>';
    }
    return '<article class="proj tone-' + t + '"><div class="proj-top"><span class="proj-ico">' + esc(p.icon || initials(p.title)) + '</span>' + status + '</div>' + body + '</article>';
  }).join('') + '</div></section>');

  // skills
  out.push('<section id="skills"><div class="sec-head"><span class="k">What I use</span><h2>Skills</h2></div><div class="skills">' + arr(d.skills).map(function (g, i) {
    return '<div class="skill-group ' + tone(i) + '"><h4>' + esc(g.group) + '</h4><ul>' + nonEmpty(g.items).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }).join('') + '</div></section>');

  // certificates
  if (certs.length) {
    var cats = [];
    certs.forEach(function (c) { if (c.category && cats.indexOf(c.category) < 0) cats.push(c.category); });
    var withImg = [], noImg = [];
    certs.forEach(function (c, i) { (c.image ? withImg : noImg).push({ c: c, i: i }); });
    var n = withImg.length, spans = n % 3 === 2 ? 1 : (n % 3 === 1 && n > 1 ? 2 : 0);
    out.push('<section id="certificates"><div class="sec-head"><span class="k">What I\'ve learned</span><h2>Certificates</h2><span class="tag">' + certs.length + ' earned</span></div>' +
      (cats.length > 1 ? '<div class="cert-filter" role="group" aria-label="Filter certificates"><button type="button" data-f="" aria-pressed="true">All</button>' +
        cats.map(function (c) { return '<button type="button" data-f="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>'; }).join('') + '</div>' : '') +
      (n ? '<div class="certs all">' + withImg.map(function (o, k) {
        var c = o.c;
        return '<button type="button" class="cert-card' + (k < spans ? ' wide' : '') + '" data-cat="' + esc(c.category) + '" data-cert="' + o.i + '">' +
          '<div class="cert-thumb">' + (img(c.image) ? '<img src="' + esc(img(c.image)) + '" alt="Certificate: ' + esc(c.title) + '">' : '<span class="seal">' + esc(initials(c.title)) + '</span>') + '<span class="view">View certificate</span></div>' +
          '<div class="cert-info"><b>' + esc(c.title) + '</b><span class="iss">' + esc(c.issuer) + '</span>' + (c.date ? '<span class="d">' + esc(c.date) + '</span>' : '') + '</div></button>';
      }).join('') + '</div>' : '') +
      (noImg.length ? '<div class="certs-mini">' + noImg.map(function (o, k) {
        var c = o.c;
        return '<div class="cert-card text-only ' + tone(k) + '" data-cat="' + esc(c.category) + '"><div class="cert-thumb"><span class="seal">' + esc(initials(c.title)) + '</span></div>' +
          '<div class="cert-info"><b>' + esc(c.title) + '</b><span class="iss">' + esc(c.issuer) + '</span>' + (c.date ? '<span class="d">' + esc(c.date) + '</span>' : '') + '</div></div>';
      }).join('') + '</div>' : '') + '</section>');
  }

  // education
  out.push('<section id="education"><div class="sec-head"><span class="k">Where I study</span><h2>Education</h2></div><div class="edu">' + arr(d.education).map(function (e, i) {
    return '<div class="edu-item' + (i === 0 ? ' main' : '') + '"><div class="when">' + esc(e.when) + '</div><h3>' + esc(e.title) + '</h3><p class="school">' + esc(e.school) + '</p>' +
      (e.details ? '<p class="course">' + esc(e.details) + '</p>' : '') + '</div>';
  }).join('') + '</div></section></main>');

  // contact
  var ct = d.contact || {};
  out.push('<section class="contact" id="contact"><div class="wrap"><div><h2>' + esc(ct.heading) + '</h2>' + (ct.text ? '<p>' + esc(ct.text) + '</p>' : '') + '</div><div class="lines">' +
    (h.email ? '<span class="chip"><span><span class="k">email&nbsp;</span> ' + esc(h.email) + '</span> <button type="button" data-copy="' + esc(h.email) + '">Copy</button></span>' : '') +
    (h.phone ? '<span class="chip"><span><span class="k">phone&nbsp;</span> ' + esc(h.phone) + '</span> <button type="button" data-copy="' + esc(phoneDigits(h.phone)) + '">Copy</button></span>' : '') +
    (ct.location ? '<span class="chip"><span><span class="k">based&nbsp;</span> ' + esc(ct.location) + '</span></span>' : '') +
    links.filter(function (l) { return safeUrl(l.url); }).map(function (l) {
      return '<a class="chip chip-link" href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener"><span><span class="k">' + esc(slug(l.name)) + '&nbsp;</span> ' + esc(l.name) + ' profile</span><span aria-hidden="true">↗</span></a>';
    }).join('') +
    '</div></div><footer><div class="wrap"><span>© ' + esc(ct.year || '') + ' ' + esc(h.firstName + ' ' + h.lastName) + '</span><a href="#top">Back to top ↑</a></div></footer></section>');
  return out.join('');
}


export { renderSite, esc, safeUrl, safeImg, initials, arr, tone };
