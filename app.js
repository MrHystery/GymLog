'use strict';
/* ================= Utilitaires ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const KEY = 'gymlog_v1';
const DEF = () => ({routines: [], workouts: [], custom: [], photos: {}, active: null, settings: {rest: 90}});
let DB = (() => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d) return Object.assign(DEF(), d); } catch (e) {} return DEF(); })();
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { toast('Stockage plein : exportez vos données'); } }
function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2200); }
const ALL = () => EX.concat(DB.custom);
const exById = id => ALL().find(e => e.id === id) || {id, name: '(exercice supprimé)', group: '', equip: '', tpl: null, tips: [], time: false};
const fmtDate = ts => new Date(ts).toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
const fmtShort = ts => new Date(ts).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'});
const pad = n => String(n).padStart(2, '0');
const fmtClock = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' + pad(m) : m) + ':' + pad(s % 60); };
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; };
const kgTxt = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
const firstNum = s => { const m = String(s ?? '').match(/\d+/); return m ? m[0] : ''; };
const volume = w => w.exs.reduce((t, x) => t + x.sets.reduce((u, s) => u + (s.done ? num(s.kg) * num(s.reps) : 0), 0), 0);
const e1rm = (kg, reps) => reps > 0 ? kg * (1 + reps / 30) : 0;
const estMin = exs => Math.round((exs.reduce((t, x) => t + x.sets * (45 + (x.rest ?? DB.settings.rest)) / 60, 0) + 5) / 5) * 5;

function pictoPair(ex) {
  const t = T[ex.tpl];
  if (!t) return '';
  const one = t.static;
  return `<div class="pair ${one ? 'one' : ''}">` +
    `<figure>${figure(t.a, t.props)}<figcaption>${one ? 'Position à tenir' : 'Départ'}</figcaption></figure>` +
    (one ? '' : `<figure>${figure(t.b, t.props)}<figcaption>Fin du mouvement</figcaption></figure>`) + '</div>';
}
function thumb(ex) {
  const p = DB.photos[ex.id], t = T[ex.tpl];
  return `<div class="thumb">${p ? `<img src="${p}" alt="">` : t ? figure(t.a, t.props) : '🏋️'}</div>`;
}

/* ================= Navigation ================= */
let view = {n: 'routines'};
const TAB = {routines: 'routines', edit: 'routines', wo: 'routines', lib: 'lib', ex: 'lib', journal: 'journal', wk: 'journal', set: 'set'};
function nav(v, replace) { view = v; replace ? history.replaceState(v, '') : history.pushState(v, ''); render(); window.scrollTo(0, 0); }
window.addEventListener('popstate', e => { view = e.state || {n: 'routines'}; render(); });
history.replaceState(view, '');
if (DB.active) { view = {n: 'wo'}; history.replaceState(view, ''); }

function render(keep) {
  const y = window.scrollY;
  const fn = {routines: vRoutines, edit: vEdit, wo: vWorkout, lib: vLib, ex: vEx, journal: vJournal, wk: vWk, set: vSet}[view.n] || vRoutines;
  $('#view').innerHTML = fn();
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === TAB[view.n]));
  if (keep) window.scrollTo(0, y);
  tick();
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => nav({n: b.dataset.tab}));

/* ================= Séances (modèles) ================= */
function routineCard(r, prog) {
  const names = r.ex.slice(0, 4).map(x => exById(x[0] ?? x.id).name).join(' · ');
  return `<div class="card"><b>${esc(r.name)}</b>
  <div class="sub">${r.ex.length} exercices · ~${estMin(r.ex.map(x => Array.isArray(x) ? {sets: x[1], rest: x[3]} : x))} min</div>
  ${r.desc ? `<div class="sub">${esc(r.desc)}</div>` : ''}
  <div class="sub">${esc(names)}${r.ex.length > 4 ? '…' : ''}</div>
  <div class="btns"><button class="btn pri" data-act="${prog ? 'startP' : 'startR'}" data-id="${r.id}">Démarrer</button>
  ${prog ? `<button class="btn" data-act="addP" data-id="${r.id}">+ Mes séances</button>` : `<button class="btn" data-act="editR" data-id="${r.id}">Modifier</button>`}</div></div>`;
}
const normR = r => ({...r, ex: r.exs.map(x => ({id: x.id, sets: x.sets, reps: x.reps, rest: x.rest}))});
function vRoutines() {
  let h = '<h1>Séances</h1>';
  if (DB.active) h += `<div class="card" style="border-color:var(--ok)"><b>Séance en cours</b><div class="sub">${esc(DB.active.name)}</div><div class="btns"><button class="btn ok" data-act="resume">Reprendre</button><button class="btn dng" data-act="discard">Abandonner</button></div></div>`;
  h += '<div class="btns" style="margin-top:0"><button class="btn pri" data-act="startEmpty">+ Séance vide</button><button class="btn" data-act="newR">+ Nouvelle séance type</button></div>';
  h += '<h2>Mes séances</h2>';
  h += DB.routines.length ? DB.routines.map(r => routineCard(normR(r))).join('') : '<div class="empty">Aucune séance enregistrée.<br>Crée-en une ou ajoute une séance type ci-dessous.</div>';
  h += '<h2>Séances types · 45 à 60 min</h2><p class="sub">Programmes pour un physique fit et athlétique (pas bodybuilding) : 3 séances Full body A/B/C par semaine, ou 4 jours Haut/Bas. Tu pourras tout modifier après les avoir ajoutées.</p>';
  h += PROGRAMS.map(p => routineCard({id: p.id, name: p.name, desc: p.desc, ex: p.ex}, true)).join('');
  return h;
}
function startWorkout(name, items) {
  if (DB.active && !confirm('Une séance est déjà en cours. La remplacer ?')) return;
  DB.active = {id: uid(), name, start: Date.now(), note: '',
    exs: items.map(x => ({id: x.id, rest: x.rest, target: x.reps, sets: Array.from({length: x.sets || 3}, () => ({kg: '', reps: '', done: false}))}))};
  save(); nav({n: 'wo'});
}

/* ---- Éditeur de séance ---- */
let draft = null;
function vEdit() {
  if (!draft) return vRoutines();
  let h = `<button class="back" data-act="back">‹ Retour</button><h1>${view.id ? 'Modifier la séance' : 'Nouvelle séance'}</h1>
  <label class="lbl">Nom</label><input data-d="name" value="${esc(draft.name)}" placeholder="Ex. Full body lundi">
  <h2>Exercices</h2>`;
  h += draft.exs.length ? `<div class="erow sub"><span></span><span>Séries</span><span>Reps</span><span>Repos s</span></div>` : '<div class="empty">Ajoute des exercices.</div>';
  draft.exs.forEach((x, i) => {
    h += `<div class="card"><div class="row sb"><b class="grow">${esc(exById(x.id).name)}</b>
    <button class="x" data-act="eUp" data-i="${i}">↑</button><button class="x" data-act="eDn" data-i="${i}">↓</button><button class="x" data-act="eDel" data-i="${i}">🗑</button></div>
    <div class="erow" style="margin:8px 0 0"><span class="sub">${exById(x.id).time ? 'Secondes' : ''}</span>
    <input inputmode="numeric" data-d="sets" data-i="${i}" value="${esc(x.sets)}">
    <input data-d="reps" data-i="${i}" value="${esc(x.reps)}" placeholder="8-12">
    <input inputmode="numeric" data-d="rest" data-i="${i}" value="${esc(x.rest)}"></div></div>`;
  });
  h += `<div class="btns"><button class="btn" data-act="eAdd">+ Ajouter des exercices</button></div>
  <div class="btns"><button class="btn pri" data-act="eSave">Enregistrer</button>${view.id ? '<button class="btn dng" data-act="eRm">Supprimer la séance</button>' : ''}</div>`;
  return h;
}

/* ================= Séance en cours ================= */
function prevSets(id) {
  const ws = DB.workouts.slice().sort((a, b) => b.start - a.start);
  for (const w of ws) { const x = w.exs.find(e => e.id === id); if (x && x.sets.length) return x.sets; }
  return [];
}
function vWorkout() {
  const a = DB.active;
  if (!a) return vRoutines();
  let h = `<div class="hdr"><div class="row sb"><input data-w="name" value="${esc(a.name)}" style="font-weight:700">
  <span class="timer" id="elapsed">0:00</span></div>
  <div class="btns" style="margin-top:8px"><button class="btn ok grow" data-act="finish">Terminer</button><button class="btn dng" data-act="discard">Annuler</button></div></div>`;
  a.exs.forEach((x, i) => {
    const e = exById(x.id), pv = prevSets(x.id);
    h += `<div class="card"><div class="row sb"><a class="lnk grow" data-act="openEx" data-id="${x.id}"><b>${esc(e.name)}</b></a>
    <button class="x" data-act="rmEx" data-i="${i}" title="Retirer">🗑</button></div>
    <div class="row sub" style="margin:4px 0 8px"><span>Repos</span><input type="number" inputmode="numeric" style="width:70px;padding:4px" data-f="rest" data-i="${i}" value="${x.rest ?? DB.settings.rest}"><span>s ${x.target ? '· objectif ' + esc(x.target) + (e.time ? ' s' : ' reps') : ''}</span></div>
    <div class="shead"><span>#</span><span>Précédent</span><span>Kg</span><span>${e.time ? 'Sec' : 'Reps'}</span><span>✓</span><span></span></div>`;
    x.sets.forEach((s, si) => {
      const p = pv[si] || pv[pv.length - 1];
      const ptxt = pv[si] ? (e.time ? `${esc(pv[si].reps)} s` : `${kgTxt(num(pv[si].kg))}×${esc(pv[si].reps)}`) : '–';
      h += `<div class="srow ${s.done ? 'done' : ''}"><span class="sn">${si + 1}</span><span class="prev">${ptxt}</span>
      <input inputmode="decimal" data-f="kg" data-i="${i}" data-s="${si}" value="${esc(s.kg)}" placeholder="${p ? esc(p.kg) : '0'}">
      <input inputmode="numeric" data-f="reps" data-i="${i}" data-s="${si}" value="${esc(s.reps)}" placeholder="${p ? esc(p.reps) : esc(firstNum(x.target))}">
      <button class="chk" data-act="tick" data-i="${i}" data-s="${si}">✓</button>
      <button class="x" data-act="rmSet" data-i="${i}" data-s="${si}">×</button></div>`;
    });
    h += `<button class="btn sm full" data-act="addSet" data-i="${i}">+ Ajouter une série</button></div>`;
  });
  h += `<button class="btn full" data-act="addEx">+ Ajouter des exercices</button>
  <label class="lbl">Notes</label><textarea rows="2" data-w="note" placeholder="Sensations, énergie, remarques…">${esc(a.note)}</textarea>`;
  return h;
}
let restEnd = 0;
function doTick(i, si) {
  const A = DB.active, x = A.exs[i], s = x.sets[si], e = exById(x.id);
  if (s.done) { s.done = false; save(); return render(true); }
  const pv = prevSets(x.id), before = x.sets.slice(0, si).reverse().find(t => t.done);
  const p = pv[si] || (before ? before : pv[pv.length - 1]);
  if (s.kg === '') s.kg = p ? p.kg : '0';
  if (s.reps === '') s.reps = p ? p.reps : firstNum(x.target);
  if (s.reps === '' || s.reps === undefined) return toast(e.time ? 'Saisis les secondes' : 'Saisis les répétitions');
  s.done = true;
  const last = i === A.exs.length - 1 && si === x.sets.length - 1;
  if (!last) restEnd = Date.now() + (num(x.rest) || DB.settings.rest) * 1000;
  save(); render(true);
}
function finishWorkout() {
  const A = DB.active;
  const exs = A.exs.map(x => ({id: x.id, sets: x.sets.filter(s => s.done).map(s => ({kg: num(s.kg), reps: num(s.reps)}))})).filter(x => x.sets.length);
  if (!exs.length) { if (confirm('Aucune série validée. Abandonner la séance ?')) { DB.active = null; save(); nav({n: 'routines'}, true); } return; }
  const w = {id: A.id, name: A.name || 'Séance', start: A.start, end: Date.now(), note: A.note, exs};
  DB.workouts.push(w); DB.active = null; restEnd = 0; save();
  toast('Séance enregistrée 💪'); nav({n: 'wk', id: w.id}, true);
}

/* ================= Bibliothèque d'exercices ================= */
let lib = {q: '', g: 'Tous'};
function libList() {
  const q = lib.q.trim().toLowerCase();
  const l = ALL().filter(e => (lib.g === 'Tous' || (lib.g === 'Perso' ? DB.custom.includes(e) : e.group === lib.g)) && (!q || e.name.toLowerCase().includes(q)));
  return l.length ? l.map(e => `<div class="card row" data-act="openEx" data-id="${e.id}" style="cursor:pointer">${thumb(e)}<div class="grow"><b>${esc(e.name)}</b><div class="sub">${esc(e.group)} · ${esc(e.equip)}</div></div>›</div>`).join('') : '<div class="empty">Aucun exercice.</div>';
}
const chips = (list, cur, act) => `<div class="chips">${list.map(g => `<button class="chip ${g === cur ? 'on' : ''}" data-act="${act}" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div>`;
function vLib() {
  return `<h1>Exercices</h1><input data-f="q" placeholder="Rechercher…" value="${esc(lib.q)}" style="margin-bottom:8px">
  ${chips(['Tous'].concat(GROUPS, DB.custom.length ? ['Perso'] : []), lib.g, 'libG')}
  <div id="libList">${libList()}</div>
  <div class="btns"><button class="btn" data-act="newEx">+ Créer un exercice perso</button></div>`;
}
function lineChart(pts) {
  if (pts.length < 2) return '<div class="sub">Il faut au moins 2 séances pour afficher la courbe.</div>';
  const W = 300, H = 120, P = 26, ys = pts.map(p => p.y), mn = Math.min(...ys), mx = Math.max(...ys), r = (mx - mn) || 1;
  const X = i => P + i * (W - P - 8) / (pts.length - 1), Y = v => H - 18 - (v - mn) / r * (H - 38);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${pts.map((p, i) => X(i) + ',' + Y(p.y)).join(' ')}"/>` +
    pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3.5" fill="var(--accent)"/>`).join('') +
    `<text x="4" y="${Y(mx) + 3}">${kgTxt(mx)}</text><text x="4" y="${Y(mn) + 3}">${kgTxt(mn)}</text>` +
    `<text x="${P}" y="${H - 4}">${fmtShort(pts[0].x)}</text><text x="${W - 8}" y="${H - 4}" text-anchor="end">${fmtShort(pts[pts.length - 1].x)}</text></svg>`;
}
function vEx() {
  const e = exById(view.id), custom = DB.custom.some(c => c.id === e.id), photo = DB.photos[e.id];
  const hist = DB.workouts.filter(w => w.exs.some(x => x.id === e.id)).sort((a, b) => a.start - b.start).map(w => {
    const sets = w.exs.filter(x => x.id === e.id).flatMap(x => x.sets);
    return {w, sets, maxKg: Math.max(...sets.map(s => s.kg)), maxRep: Math.max(...sets.map(s => s.reps)), e1: Math.max(...sets.map(s => e1rm(s.kg, s.reps))), vol: sets.reduce((t, s) => t + s.kg * s.reps, 0)};
  });
  let h = `<button class="back" data-act="back">‹ Retour</button><h1>${esc(e.name)}</h1><div class="sub" style="margin:-8px 0 10px">${esc(e.group)} · ${esc(e.equip)}</div>`;
  if (photo) h += `<img class="photo" src="${photo}" alt="">`;
  h += pictoPair(e);
  if (e.tpl) h += '<div class="sub" style="margin:4px 0 8px">Schéma indicatif du mouvement (la boule bleue représente la charge).</div>';
  h += `<div class="btns"><button class="btn sm" data-act="addPhoto" data-id="${e.id}">📷 ${photo ? 'Changer' : 'Ajouter'} ma photo</button>${photo ? `<button class="btn sm dng" data-act="rmPhoto" data-id="${e.id}">Retirer la photo</button>` : ''}${custom ? `<button class="btn sm dng" data-act="delEx" data-id="${e.id}">Supprimer</button>` : ''}</div>`;
  if (e.tips.length) h += `<h2>Conseils d'exécution</h2><div class="card"><ul class="tips">${e.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  h += '<h2>Ma progression</h2>';
  if (!hist.length) h += '<div class="card sub">Pas encore d\'historique pour cet exercice.</div>';
  else {
    const best = Math.max(...hist.map(x => x.maxKg)), b1 = Math.max(...hist.map(x => x.e1)), bv = Math.max(...hist.map(x => x.vol));
    h += `<div class="stats"><div class="stat"><b>${kgTxt(best)} kg</b><span class="sub">Record poids</span></div><div class="stat"><b>${kgTxt(Math.round(b1 * 10) / 10)}</b><span class="sub">1RM estimé</span></div><div class="stat"><b>${Math.round(bv)}</b><span class="sub">Volume max</span></div></div>`;
    h += `<div class="card"><div class="sub" style="margin-bottom:6px">Poids max par séance (kg)</div>${lineChart(hist.map(x => ({x: x.w.start, y: x.maxKg})))}</div>`;
    h += `<div class="card"><table class="t"><tr><th>Date</th><th>Séries</th></tr>${hist.slice(-6).reverse().map(x => `<tr><td>${fmtShort(x.w.start)}</td><td>${x.sets.map(s => e.time ? s.reps + 's' : kgTxt(s.kg) + '×' + s.reps).join(' · ')}</td></tr>`).join('')}</table></div>`;
  }
  return h;
}

/* ================= Journal ================= */
function vJournal() {
  const ws = DB.workouts.slice().sort((a, b) => b.start - a.start), now = Date.now();
  const wk = ws.filter(w => now - w.start < 7 * 864e5).length, mo = ws.filter(w => now - w.start < 30 * 864e5).length;
  let h = `<h1>Journal</h1><div class="stats"><div class="stat"><b>${ws.length}</b><span class="sub">Séances</span></div><div class="stat"><b>${wk}</b><span class="sub">7 derniers jours</span></div><div class="stat"><b>${mo}</b><span class="sub">30 derniers jours</span></div></div>`;
  if (!ws.length) return h + '<div class="empty">Ton journal est vide.<br>Termine ta première séance pour la voir ici.</div>';
  return h + ws.map(w => `<div class="card" data-act="openW" data-id="${w.id}" style="cursor:pointer"><div class="row sb"><b>${esc(w.name)}</b><span class="sub">${fmtDate(w.start)}</span></div>
  <div class="sub">${Math.round((w.end - w.start) / 60000)} min · ${Math.round(volume({exs: w.exs.map(x => ({sets: x.sets.map(s => ({...s, done: true}))}))}))} kg soulevés · ${w.exs.length} exercices</div>
  <div class="sub">${esc(w.exs.slice(0, 3).map(x => exById(x.id).name).join(' · '))}${w.exs.length > 3 ? '…' : ''}</div></div>`).join('');
}
function vWk() {
  const w = DB.workouts.find(x => x.id === view.id);
  if (!w) return vJournal();
  let h = `<button class="back" data-act="back">‹ Retour</button><h1>${esc(w.name)}</h1><div class="sub" style="margin:-8px 0 10px">${fmtDate(w.start)} · ${Math.round((w.end - w.start) / 60000)} min</div>`;
  h += w.exs.map(x => { const e = exById(x.id); return `<div class="card"><a class="lnk" data-act="openEx" data-id="${x.id}"><b>${esc(e.name)}</b></a>
  <table class="t">${x.sets.map((s, i) => `<tr><td>Série ${i + 1}</td><td>${e.time ? s.reps + ' s' : kgTxt(s.kg) + ' kg × ' + s.reps}</td></tr>`).join('')}</table></div>`; }).join('');
  if (w.note) h += `<div class="card"><div class="sub">Notes</div>${esc(w.note)}</div>`;
  return h + `<div class="btns"><button class="btn pri" data-act="redo" data-id="${w.id}">Refaire cette séance</button><button class="btn" data-act="tpl" data-id="${w.id}">Enregistrer comme séance</button><button class="btn dng" data-act="delW" data-id="${w.id}">Supprimer</button></div>`;
}

/* ================= Réglages ================= */
function vSet() {
  return `<h1>Réglages</h1>
  <div class="card"><label class="lbl" style="margin-top:0">Temps de repos par défaut (secondes)</label><input type="number" inputmode="numeric" data-s="rest" value="${DB.settings.rest}"></div>
  <h2>Sauvegarde</h2>
  <div class="card"><div class="sub">Tes données sont stockées uniquement sur ce téléphone. Fais une sauvegarde de temps en temps.</div>
  <div class="btns"><button class="btn pri" data-act="expJ">Exporter (JSON)</button><button class="btn" data-act="expC">Exporter (CSV)</button><button class="btn" data-act="impJ">Importer (JSON)</button></div></div>
  <h2>Données</h2>
  <div class="card"><div class="sub">${DB.workouts.length} séances · ${DB.routines.length} modèles · ${DB.custom.length} exercices perso</div><div class="btns"><button class="btn dng" data-act="reset">Tout effacer</button></div></div>
  <p class="sub">GymLog v1 — application hors-ligne.</p>`;
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type}));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
function csv() {
  const rows = [['Date', 'Séance', 'Exercice', 'Série', 'Poids (kg)', 'Répétitions/Secondes']];
  DB.workouts.slice().sort((a, b) => a.start - b.start).forEach(w => w.exs.forEach(x => x.sets.forEach((s, i) =>
    rows.push([new Date(w.start).toISOString().slice(0, 10), w.name, exById(x.id).name, i + 1, kgTxt(s.kg), s.reps]))));
  return '\ufeff' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
}

/* ================= Sélecteur / création d'exercices ================= */
let pick = null;
function openPicker(cb) { pick = {sel: new Set(), q: '', g: 'Tous', cb}; drawPicker(); }
function pickList() {
  const q = pick.q.trim().toLowerCase();
  return ALL().filter(e => (pick.g === 'Tous' || (pick.g === 'Perso' ? DB.custom.includes(e) : e.group === pick.g)) && (!q || e.name.toLowerCase().includes(q)))
    .map(e => `<label class="pick">${thumb(e)}<span class="grow"><b>${esc(e.name)}</b><br><span class="sub">${esc(e.group)}</span></span><input type="checkbox" data-pk="${e.id}" ${pick.sel.has(e.id) ? 'checked' : ''}></label>`).join('') || '<div class="empty">Aucun résultat.</div>';
}
function drawPicker() {
  const o = $('#overlay'); o.hidden = false;
  o.innerHTML = `<div class="in"><h1>Ajouter des exercices</h1><input data-f="pq" placeholder="Rechercher…" value="${esc(pick.q)}" style="margin-bottom:8px">
  ${chips(['Tous'].concat(GROUPS, DB.custom.length ? ['Perso'] : []), pick.g, 'pkG')}<div id="pkList">${pickList()}</div>
  <button class="btn full" data-act="newEx" style="margin-top:10px">+ Créer un exercice perso</button></div>
  <div class="foot"><button class="btn" data-act="pkClose">Fermer</button><button class="btn pri" data-act="pkOk">Ajouter (<span id="pkN">${pick.sel.size}</span>)</button></div>`;
}
function openNewEx() {
  const o = $('#overlay'); o.hidden = false;
  o.innerHTML = `<div class="in"><h1>Nouvel exercice</h1><label class="lbl">Nom</label><input id="nxName" placeholder="Ex. Tirage menton">
  <label class="lbl">Groupe musculaire</label><select id="nxGroup">${GROUPS.map(g => `<option>${g}</option>`).join('')}</select>
  <label class="lbl">Matériel</label><input id="nxEq" placeholder="Haltères, machine…">
  <label class="lbl"><input type="checkbox" id="nxTime" style="width:auto"> Exercice chronométré (secondes au lieu de répétitions)</label></div>
  <div class="foot"><button class="btn" data-act="nxCancel">Annuler</button><button class="btn pri" data-act="nxSave">Créer</button></div>`;
}
function closeOverlay() { $('#overlay').hidden = true; $('#overlay').innerHTML = ''; }

/* ================= Minuteurs ================= */
function beep() {
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]);
    const c = new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach(t => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + .15); });
  } catch (e) {}
}
function tick() {
  const el = $('#elapsed'); if (el && DB.active) el.textContent = fmtClock((Date.now() - DB.active.start) / 1000);
  const rb = $('#restbar');
  if (restEnd && DB.active && view.n === 'wo') {
    const left = Math.ceil((restEnd - Date.now()) / 1000);
    if (left <= 0) { restEnd = 0; rb.hidden = true; beep(); toast('Repos terminé !'); return; }
    rb.hidden = false;
    rb.innerHTML = `<span>Repos</span><b>${fmtClock(left)}</b><span class="grow"></span><button data-act="rest-15">−15 s</button><button data-act="rest+15">+15 s</button><button data-act="restSkip">Passer</button>`;
  } else { rb.hidden = true; }
}
setInterval(tick, 500);
let wl = null;
async function keepAwake() { try { if (DB.active && navigator.wakeLock && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => wl = null); } } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });

/* ================= Événements ================= */
document.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.f === 'q') { lib.q = t.value; $('#libList').innerHTML = libList(); }
  else if (d.f === 'pq') { pick.q = t.value; $('#pkList').innerHTML = pickList(); }
  else if (d.f && DB.active && d.i !== undefined) {
    const x = DB.active.exs[+d.i];
    if (d.f === 'rest') x.rest = num(t.value); else x.sets[+d.s][d.f] = t.value.replace(',', '.');
    save();
  }
  else if (d.w && DB.active) { DB.active[d.w] = t.value; save(); }
  else if (d.d && draft) { if (d.i === undefined) draft[d.d] = t.value; else draft.exs[+d.i][d.d] = t.value; }
  else if (d.s === 'rest') { DB.settings.rest = Math.max(10, num(t.value) || 90); save(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.pk && pick) { t.checked ? pick.sel.add(t.dataset.pk) : pick.sel.delete(t.dataset.pk); $('#pkN').textContent = pick.sel.size; }
});
$('#fileIn').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const mode = $('#fileIn').dataset.mode, id = $('#fileIn').dataset.id;
  if (mode === 'photo') {
    const img = new Image(), url = URL.createObjectURL(f);
    img.onload = () => {
      const k = Math.min(1, 480 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      DB.photos[id] = c.toDataURL('image/jpeg', .75); save(); URL.revokeObjectURL(url); render(true);
    };
    img.src = url;
  } else if (mode === 'import') {
    try {
      const d = JSON.parse(await f.text());
      if (!Array.isArray(d.workouts) || !Array.isArray(d.routines)) throw 0;
      if (!confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) return;
      DB = Object.assign(DEF(), d); save(); toast('Import réussi'); nav({n: 'journal'}, true);
    } catch (err) { toast('Fichier invalide'); }
  }
});

function startFromRoutine(r) { startWorkout(r.name, r.ex.map(x => Array.isArray(x) ? {id: x[0], sets: x[1], reps: x[2], rest: x[3]} : x)); }
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset, act = d.act, i = +d.i, s = +d.s;
  switch (act) {
    case 'back': history.length > 1 ? history.back() : nav({n: 'routines'}, true); break;
    case 'startEmpty': startWorkout('Séance du ' + fmtShort(Date.now()), []); keepAwake(); break;
    case 'startR': { const r = DB.routines.find(x => x.id === d.id); startFromRoutine(normR(r)); keepAwake(); break; }
    case 'startP': { const p = PROGRAMS.find(x => x.id === d.id); startFromRoutine(p); keepAwake(); break; }
    case 'addP': { const p = PROGRAMS.find(x => x.id === d.id); DB.routines.push({id: uid(), name: p.name, exs: p.ex.map(x => ({id: x[0], sets: x[1], reps: x[2], rest: x[3]}))}); save(); toast('Ajoutée à Mes séances'); render(true); break; }
    case 'resume': nav({n: 'wo'}); keepAwake(); break;
    case 'discard': if (confirm('Abandonner la séance en cours ?')) { DB.active = null; restEnd = 0; save(); nav({n: 'routines'}, true); } break;
    case 'newR': draft = {id: uid(), name: '', exs: []}; nav({n: 'edit'}); break;
    case 'editR': { const r = DB.routines.find(x => x.id === d.id); draft = JSON.parse(JSON.stringify(r)); nav({n: 'edit', id: r.id}); break; }
    case 'eUp': if (i > 0) { [draft.exs[i - 1], draft.exs[i]] = [draft.exs[i], draft.exs[i - 1]]; render(true); } break;
    case 'eDn': if (i < draft.exs.length - 1) { [draft.exs[i + 1], draft.exs[i]] = [draft.exs[i], draft.exs[i + 1]]; render(true); } break;
    case 'eDel': draft.exs.splice(i, 1); render(true); break;
    case 'eAdd': openPicker(ids => { ids.forEach(id => draft.exs.push({id, sets: 3, reps: exById(id).time ? '40' : '8-12', rest: DB.settings.rest})); render(true); }); break;
    case 'eSave': {
      draft.exs.forEach(x => { x.sets = Math.max(1, Math.round(num(x.sets)) || 3); x.rest = Math.max(0, Math.round(num(x.rest)) || DB.settings.rest); });
      draft.name = draft.name.trim() || 'Ma séance';
      const k = DB.routines.findIndex(r => r.id === draft.id);
      k >= 0 ? DB.routines[k] = draft : DB.routines.push(draft);
      save(); draft = null; toast('Séance enregistrée'); history.back(); break;
    }
    case 'eRm': if (confirm('Supprimer cette séance ?')) { DB.routines = DB.routines.filter(r => r.id !== view.id); save(); draft = null; history.back(); } break;
    case 'tick': doTick(i, s); break;
    case 'addSet': DB.active.exs[i].sets.push({kg: '', reps: '', done: false}); save(); render(true); break;
    case 'rmSet': DB.active.exs[i].sets.splice(s, 1); save(); render(true); break;
    case 'rmEx': if (confirm('Retirer cet exercice de la séance ?')) { DB.active.exs.splice(i, 1); save(); render(true); } break;
    case 'addEx': openPicker(ids => { ids.forEach(id => DB.active.exs.push({id, rest: DB.settings.rest, target: '', sets: [{kg: '', reps: '', done: false}, {kg: '', reps: '', done: false}, {kg: '', reps: '', done: false}]})); save(); render(true); }); break;
    case 'finish': finishWorkout(); break;
    case 'rest+15': restEnd += 15000; tick(); break;
    case 'rest-15': restEnd -= 15000; tick(); break;
    case 'restSkip': restEnd = 0; tick(); break;
    case 'libG': lib.g = d.g; render(true); break;
    case 'openEx': nav({n: 'ex', id: d.id}); break;
    case 'newEx': openNewEx(); break;
    case 'nxCancel': pick ? drawPicker() : closeOverlay(); break;
    case 'nxSave': {
      const name = $('#nxName').value.trim(); if (!name) return toast('Donne un nom à l\'exercice');
      const ex = {id: 'c-' + uid(), name, group: $('#nxGroup').value, equip: $('#nxEq').value.trim() || 'Perso', tpl: null, tips: [], time: $('#nxTime').checked};
      DB.custom.push(ex); save();
      if (pick) { pick.sel.add(ex.id); drawPicker(); } else { closeOverlay(); render(true); }
      toast('Exercice créé'); break;
    }
    case 'pkG': pick.g = d.g; drawPicker(); break;
    case 'pkClose': pick = null; closeOverlay(); break;
    case 'pkOk': { const cb = pick.cb, ids = [...pick.sel]; pick = null; closeOverlay(); cb(ids); break; }
    case 'addPhoto': $('#fileIn').dataset.mode = 'photo'; $('#fileIn').dataset.id = d.id; $('#fileIn').accept = 'image/*'; $('#fileIn').click(); break;
    case 'rmPhoto': delete DB.photos[d.id]; save(); render(true); break;
    case 'delEx': if (confirm('Supprimer cet exercice perso ? (l\'historique est conservé)')) { DB.custom = DB.custom.filter(c => c.id !== d.id); delete DB.photos[d.id]; save(); history.back(); } break;
    case 'openW': nav({n: 'wk', id: d.id}); break;
    case 'redo': { const w = DB.workouts.find(x => x.id === d.id); startWorkout(w.name, w.exs.map(x => ({id: x.id, sets: x.sets.length, reps: '', rest: DB.settings.rest}))); keepAwake(); break; }
    case 'tpl': { const w = DB.workouts.find(x => x.id === d.id); DB.routines.push({id: uid(), name: w.name, exs: w.exs.map(x => ({id: x.id, sets: x.sets.length, reps: '8-12', rest: DB.settings.rest}))}); save(); toast('Ajoutée à Mes séances'); break; }
    case 'delW': if (confirm('Supprimer cette séance du journal ?')) { DB.workouts = DB.workouts.filter(w => w.id !== d.id); save(); history.back(); } break;
    case 'expJ': download('gymlog-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(DB), 'application/json'); break;
    case 'expC': download('gymlog-journal.csv', csv(), 'text/csv'); break;
    case 'impJ': $('#fileIn').dataset.mode = 'import'; $('#fileIn').accept = '.json,application/json'; $('#fileIn').click(); break;
    case 'reset': if (confirm('Effacer TOUTES les données ? Cette action est irréversible.') && confirm('Vraiment tout effacer ?')) { DB = DEF(); save(); restEnd = 0; nav({n: 'routines'}, true); } break;
  }
});

/* ================= Démarrage ================= */
render();
keepAwake();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
