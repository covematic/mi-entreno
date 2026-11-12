import { EXERCISES, GROUPS, IMG_BASE, TEMPLATES, GOALS, NUTRITION } from './data.js';

/* ───────── Estado y utilidades ───────── */
const KEY = 'mi_entreno_v1';
const view = document.getElementById('view');
const modalEl = document.getElementById('modal');
const toastEl = document.getElementById('toast');

let S = load();
const ui = { exG: 'Todos', exQ: '', pickG: 'Todos', pickQ: '', pick: null, progTab: 'ejercicios', progEx: null, progMetric: 'max', nutGoal: null, confirm: null };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.profiles)) return s;
  } catch { /* datos corruptos: se empieza de cero */ }
  return { profiles: [], active: null, data: {} };
}
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const P = () => S.profiles.find(p => p.id === S.active);
const D = () => S.data[S.active];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const fmt = n => (Math.round(n * 10) / 10).toLocaleString('es');
const fdate = (iso, year) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}) });
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const orm = (w, r) => (r <= 1 ? w : w * (1 + r / 30)); // 1RM estimado (Epley)
let skipHash = false; // go() ya renderiza: evita que el hashchange posterior cierre modales recién abiertos
const go = h => {
  if (location.hash !== '#' + h) { skipHash = true; location.hash = h; }
  render(); window.scrollTo(0, 0);
};

const EX = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
const exName = id => EX[id]?.n ?? 'Ejercicio eliminado';
const imgUrl = (id, i = 0) => `${IMG_BASE}/${EX[id]?.img}/${i}.jpg`;
const thumb = id => `<span class="thumb"><img loading="lazy" src="${imgUrl(id)}" alt=""></span>`;

// Si una imagen no carga, se muestra un icono en su lugar
document.addEventListener('error', e => {
  if (e.target.tagName === 'IMG') { e.target.parentElement?.classList.add('noimg'); e.target.remove(); }
}, true);

function toast(msg) {
  toastEl.textContent = msg; toastEl.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (toastEl.hidden = true), 2400);
}
function openModal(html) { modalEl.innerHTML = `<div class="sheet">${html}</div>`; modalEl.hidden = false; }
function closeModal() { modalEl.hidden = true; modalEl.innerHTML = ''; ui.confirm = null; }
function ask(msg, yesLabel, fn, danger = true) {
  openModal(`<h3>${esc(msg)}</h3><div class="row" style="margin-top:16px">
    ${ib('x', 'Cancelar', 'data-a="close"', 'wide big')}${ib(danger ? 'trash' : 'check', esc(yesLabel), 'data-a="confirm-yes"', (danger ? 'danger' : 'primary') + ' wide big')}</div>`);
  ui.confirm = fn;
}

/* ───────── Perfiles ───────── */
function newProfile({ nombre, edad, altura, peso, objetivo }) {
  const p = { id: uid(), nombre, edad, altura, objetivo, creado: new Date().toISOString() };
  S.profiles.push(p);
  S.data[p.id] = {
    routines: TEMPLATES.map(t => ({ id: uid(), nombre: t.nombre, items: t.items.map(([exId, series, reps]) => ({ exId, series, reps })) })),
    workouts: [], pesos: peso ? [{ fecha: today(), kg: peso }] : [], active: null,
  };
  S.active = p.id;
  save();
  return p;
}

function createDemo() {
  const p = newProfile({ nombre: 'Demo', edad: 25, altura: 175, peso: 0, objetivo: 'musculo' });
  const d = S.data[p.id];
  const order = [0, 1, 2];
  const start = new Date(); start.setDate(start.getDate() - 56); start.setHours(18, 30, 0, 0);
  for (let wk = 0; wk < 8; wk++) {
    order.forEach((ri, k) => {
      const r = d.routines[ri];
      const date = new Date(start); date.setDate(start.getDate() + wk * 7 + k * 2);
      d.workouts.push({
        id: uid(), fecha: date.toISOString(), nombre: r.nombre, routineId: r.id, min: 50 + Math.round(Math.random() * 25),
        items: r.items.map(it => {
          const base = EX[it.exId].b * (1 + wk * 0.025);
          const w = Math.round((base * (0.97 + Math.random() * 0.06)) / 2.5) * 2.5;
          const reps = parseInt(it.reps) || 8;
          return { exId: it.exId, sets: Array.from({ length: it.series }, (_, i) => ({ peso: w, reps: Math.max(3, reps + (i === 0 ? 1 : 0) - (i === it.series - 1 ? 1 : 0)) })) };
        }),
      });
    });
    const wd = new Date(start); wd.setDate(start.getDate() + wk * 7);
    d.pesos.push({ fecha: wd.toISOString().slice(0, 10), kg: Math.round((72 + wk * 0.35 + Math.random() * 0.4) * 10) / 10 });
  }
  save();
}

/* ───────── Cálculos ───────── */
const volOf = w => w.items.reduce((t, it) => t + it.sets.reduce((a, s) => a + s.peso * s.reps, 0), 0);
const setsOf = w => w.items.reduce((t, it) => t + it.sets.length, 0);
const weekStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };

function exHistory(exId) {
  return D().workouts.flatMap(w => {
    const sets = w.items.filter(i => i.exId === exId).flatMap(i => i.sets);
    if (!sets.length) return [];
    return [{
      fecha: w.fecha,
      max: Math.max(...sets.map(s => s.peso)),
      e1: Math.max(...sets.map(s => orm(s.peso, s.reps))),
      vol: sets.reduce((t, s) => t + s.peso * s.reps, 0),
      reps: sets.reduce((t, s) => t + s.reps, 0),
      best: sets.reduce((b, s) => (orm(s.peso, s.reps) > orm(b.peso, b.reps) || (s.peso === b.peso && s.reps > b.reps) ? s : b)),
      sets,
    }];
  });
}
const lastSets = exId => exHistory(exId).at(-1)?.sets;
const lastWeight = () => D().pesos.at(-1)?.kg || 0;

/* ───────── Gráfica de líneas (SVG) ───────── */
function lineChart(pts, unit = '') {
  if (!pts.length) return '<p class="empty">Aún no hay datos para graficar.</p>';
  const W = 360, H = 200, L = 40, R = 12, T = 12, B = 26;
  const ys = pts.map(p => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.15;
  min = Math.min(...ys) >= 0 ? Math.max(0, min - pad) : min - pad; max += pad;
  const x = i => (pts.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (pts.length - 1));
  const y = v => T + (1 - (v - min) / (max - min)) * (H - T - B);
  const grid = [0, 1, 2, 3].map(k => {
    const v = min + (k * (max - min)) / 3;
    return `<line class="gl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`;
  }).join('');
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.y).toFixed(1)}`).join(' ');
  const area = `${path} L${x(pts.length - 1).toFixed(1)} ${H - B} L${x(0).toFixed(1)} ${H - B} Z`;
  const xl = [...new Set([0, Math.floor((pts.length - 1) / 2), pts.length - 1])];
  const labels = xl.map(i => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 && pts.length > 1 ? 'start' : i === pts.length - 1 && pts.length > 1 ? 'end' : 'middle'}">${esc(pts[i].x)}</text>`).join('');
  const dots = pts.map((p, i) => `<g><circle class="hit" cx="${x(i)}" cy="${y(p.y)}" r="12"><title>${esc(p.x)}: ${fmt(p.y)} ${unit}</title></circle><circle class="pt" cx="${x(i)}" cy="${y(p.y)}" r="${pts.length > 30 ? 2.5 : 4}" pointer-events="none"/></g>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de evolución">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c6f432" stop-opacity=".28"/><stop offset="1" stop-color="#c6f432" stop-opacity="0"/></linearGradient></defs>
    ${grid}${pts.length > 1 ? `<path d="${area}" fill="url(#ga)"/><path class="ln" d="${path}"/>` : ''}${dots}${labels}</svg>`;
}
const delta = (cur, prev, unit = '') => {
  if (prev == null) return '<span class="muted">—</span>';
  const d = Math.round((cur - prev) * 10) / 10;
  if (!d) return '<span class="muted">=</span>';
  return `<span class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲ +' : '▼ '}${fmt(d)}${unit}</span>`;
};

/* ───────── Iconos (SVG de trazo, 24×24) ───────── */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
  dumbbell: '<path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>',
  food: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2 2-3 5-3 9h3"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  userplus: '<circle cx="10" cy="8" r="4"/><path d="M2 21a8 8 0 0 1 16 0M19 8v6M16 11h6"/>',
  swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  scale: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9.5a5.5 5.5 0 0 1 8 0L13.5 12h-3z"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.5-5.8L4 8.5M4 4v4.5h4.5M12 8v4.5l3 2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
  flag: '<path d="M5 21V4h12l-2.5 4 2.5 4H5"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16v4M17 18h4"/>',
};
const ic = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
// Botón solo-icono: siempre con nombre accesible
const ib = (icon, label, attrs = '', cls = '') => `<button type="button" class="ib ${cls}" aria-label="${label}" title="${label}" ${attrs}>${ic(icon)}</button>`;
const empty = (icon, text) => `<div class="card empty">${ic(icon, 30)}<span>${text}</span></div>`;

/* ───────── Vistas ───────── */
const NAV = [['inicio', 'home', 'Inicio'], ['rutinas', 'list', 'Rutinas'], ['ejercicios', 'dumbbell', 'Ejercicios'], ['progreso', 'chart', 'Progreso'], ['nutricion', 'food', 'Nutrición']];

function profileForm(p, btn) {
  return `<form data-form="perfil" data-id="${p?.id ?? ''}">
    <label>Nombre<input name="nombre" required maxlength="30" value="${esc(p?.nombre)}" autocomplete="given-name"></label>
    <div class="grid g3">
      <label>Edad<input name="edad" type="number" inputmode="numeric" min="10" max="99" value="${esc(p?.edad || '')}"></label>
      <label>Altura cm<input name="altura" type="number" inputmode="numeric" min="100" max="230" value="${esc(p?.altura || '')}"></label>
      ${p ? '' : '<label>Peso kg<input name="peso" type="number" inputmode="decimal" min="30" max="250" step="0.1"></label>'}
    </div>
    <label>Objetivo<select name="objetivo">${Object.entries(GOALS).map(([k, g]) => `<option value="${k}" ${p?.objetivo === k ? 'selected' : ''}>${g.label}</option>`).join('')}</select></label>
    <button class="ib txt primary wide big" style="width:100%">${ic('check')}${btn}</button>
  </form>`;
}

function vOnboarding() {
  return `<h1>Crea tu perfil</h1>
    <div class="card" style="margin-top:16px">${profileForm(null, 'Crear')}</div>
    <div style="text-align:center"><button class="chip" data-a="demo">${ic('spark', 18)}Ver demo</button></div>`;
}

const thumbs = (items, n = 6) => `<div class="thumbs">${items.slice(0, n).map(i => `<span class="thumb sm"><img loading="lazy" src="${imgUrl(i.exId)}" alt="${esc(exName(i.exId))}"></span>`).join('')}${items.length > n ? `<span class="small muted" style="align-self:center">+${items.length - n}</span>` : ''}</div>`;

function workoutCard(w, withDelete) {
  return `<details class="card">
    <summary class="row"><div class="grow"><b class="ellip" style="display:block">${esc(w.nombre)}</b>
      <span class="small muted">${fdate(w.fecha)} · ${w.min} min · ${fmt(volOf(w))} kg</span></div>${ic('chev')}</summary>
    <div style="margin-top:6px">${w.items.map(it => `<div class="small" style="padding:5px 0"><b>${esc(exName(it.exId))}</b><br><span class="muted">${it.sets.map(s => `${fmt(s.peso)}×${s.reps}`).join(' · ')}</span></div>`).join('')}
    ${withDelete ? `<div style="text-align:right">${ib('trash', 'Eliminar entreno', `data-a="del-workout" data-id="${w.id}"`, 'danger')}</div>` : ''}</div>
  </details>`;
}

const routineRow = r => `<div class="card row"><div class="grow"><b class="ellip" style="display:block">${esc(r.nombre)}</b>${thumbs(r.items, 5).replace('class="thumbs"', 'class="thumbs" style="margin:6px 0 0"')}</div>
  ${ib('play', 'Empezar ' + esc(r.nombre), `data-a="start" data-id="${r.id}"`, 'primary round')}</div>`;

function vInicio() {
  const d = D(), p = P(), ws = weekStart();
  const week = d.workouts.filter(w => new Date(w.fecha) >= ws);
  return `<h1>Hola, ${esc(p.nombre)}</h1>
    <a class="card hero row" href="#entrenar" style="margin-top:14px" aria-label="${d.active ? 'Continuar entreno' : 'Empezar entreno'}">
      <div class="grow"><b style="font-size:20px">${d.active ? esc(d.active.nombre) : 'Entrenar'}</b>${d.active ? `<br><span class="timer" id="timer" style="font-size:16px"></span>` : ''}</div>
      <span class="ib primary fab">${ic('play', 30)}</span></a>
    <div class="grid g3">
      <div class="stat">${ic('calendar', 18)}<b>${week.length}</b><span>semana</span></div>
      <div class="stat">${ic('dumbbell', 18)}<b>${fmt(week.reduce((t, w) => t + volOf(w), 0))}</b><span>kg semana</span></div>
      <div class="stat">${ic('trophy', 18)}<b>${d.workouts.length}</b><span>total</span></div>
    </div>
    <h2>Rutinas</h2>
    ${d.routines.slice(0, 4).map(routineRow).join('') || empty('list', 'Sin rutinas')}
    <h2>Últimos</h2>
    ${d.workouts.slice(-3).reverse().map(w => workoutCard(w)).join('') || empty('history', 'Sin entrenos aún')}`;
}

function vRutinas() {
  return `<div class="between"><h1>Rutinas</h1>${ib('plus', 'Nueva rutina', 'data-a="new-routine"', 'primary round')}</div>
    <div style="margin-top:14px">${D().routines.map(r => `<div class="card">
      <b>${esc(r.nombre)}</b>${r.items.length ? thumbs(r.items) : '<div style="height:12px"></div>'}
      <div class="row">
        ${ib('play', 'Empezar', `data-a="start" data-id="${r.id}"`, 'primary wide')}
        <a class="ib" href="#rutina/${r.id}" aria-label="Editar" title="Editar">${ic('edit')}</a>
        ${ib('copy', 'Duplicar', `data-a="dup-routine" data-id="${r.id}"`)}
        ${ib('trash', 'Eliminar', `data-a="del-routine" data-id="${r.id}"`, 'danger')}
      </div></div>`).join('') || empty('list', 'Sin rutinas')}</div>`;
}

function vRutina(id) {
  const r = D().routines.find(x => x.id === id);
  if (!r) return `<a class="ib" href="#rutinas" aria-label="Volver">${ic('back')}</a>${empty('list', 'No encontrada')}`;
  return `<div class="row"><a class="ib ghost" href="#rutinas" aria-label="Volver" title="Volver">${ic('back')}</a>
      <input class="grow" data-i="rt-name" value="${esc(r.nombre)}" maxlength="50" aria-label="Nombre de la rutina" style="font-weight:700"></div>
    <div style="margin-top:14px">${r.items.map((it, i) => `<div class="card">
      <div class="row">${thumb(it.exId)}<b class="grow">${esc(exName(it.exId))}</b>${ib('trash', 'Quitar', `data-a="rt-del" data-x="${i}"`, 'ghost')}</div>
      <div class="rt-fields">
        <label>Series<input type="number" inputmode="numeric" min="1" max="12" value="${it.series}" data-i="rt-item" data-f="series" data-x="${i}"></label>
        <label>Reps<input value="${esc(it.reps)}" maxlength="8" placeholder="8-12" data-i="rt-item" data-f="reps" data-x="${i}"></label>
        ${ib('up', 'Subir', `data-a="rt-move" data-x="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''}`)}
        ${ib('down', 'Bajar', `data-a="rt-move" data-x="${i}" data-d="1" ${i === r.items.length - 1 ? 'disabled' : ''}`)}
      </div></div>`).join('') || empty('dumbbell', 'Añade ejercicios con +')}</div>
    <div class="actions">${ib('plus', 'Añadir ejercicio', 'data-a="pick" data-target="routine"', 'wide big')}${ib('play', 'Empezar entreno', `data-a="start" data-id="${r.id}"`, 'primary wide big')}</div>`;
}

function vEntrenar() {
  const d = D(), a = d.active;
  if (!a) {
    return `<h1>Entrenar</h1><div style="margin-top:14px">${d.routines.map(routineRow).join('')}
      <div class="card row"><b class="grow">Libre</b>${ib('play', 'Entreno libre', 'data-a="start" data-id=""', 'round')}</div></div>`;
  }
  return `<div class="between"><h1 class="ellip" style="font-size:20px">${esc(a.nombre)}</h1><span class="timer">${ic('clock', 18)}<span id="timer"></span></span></div>
    <div style="margin-top:14px">${a.items.map((it, xi) => {
      const last = lastSets(it.exId);
      return `<div class="card">
        <div class="row"><button class="thumb" data-a="ex-info" data-id="${it.exId}" aria-label="Ver ejercicio"><img loading="lazy" src="${imgUrl(it.exId)}" alt=""></button>
          <div class="grow"><b>${esc(exName(it.exId))}</b>
            <div class="small muted ellip">${last ? ic('history', 13) + ' ' + last.map(s => `${fmt(s.peso)}×${s.reps}`).join(' · ') : it.target ? esc(it.target) + ' reps' : ''}</div></div>
          ${ib('trash', 'Quitar ejercicio', `data-a="wo-del-ex" data-x="${xi}"`, 'ghost')}</div>
        <div class="setrow head"><span>#</span><span>kg</span><span>reps</span><span></span><span></span></div>
        ${it.sets.map((s, si) => {
          const prev = last?.[si] ?? last?.at(-1);
          return `<div class="setrow ${s.done ? 'done' : ''}"><span class="sn">${si + 1}</span>
            <input type="number" inputmode="decimal" step="0.5" min="0" placeholder="${prev ? fmt(prev.peso) : '0'}" value="${esc(s.peso)}" data-i="set" data-f="peso" data-x="${xi}" data-s="${si}" aria-label="Peso serie ${si + 1}">
            <input type="number" inputmode="numeric" min="0" placeholder="${prev ? prev.reps : parseInt(it.target) || ''}" value="${esc(s.reps)}" data-i="set" data-f="reps" data-x="${xi}" data-s="${si}" aria-label="Repeticiones serie ${si + 1}">
            ${ib('check', 'Serie hecha', `data-a="set-done" data-x="${xi}" data-s="${si}" aria-pressed="${!!s.done}"`, 'chk')}
            ${ib('x', 'Quitar serie', `data-a="set-del" data-x="${xi}" data-s="${si}"`, 'ghost')}</div>`;
        }).join('')}
        <div style="margin-top:8px">${ib('plus', 'Añadir serie', `data-a="set-add" data-x="${xi}"`, 'ghost wide')}</div>
      </div>`;
    }).join('') || empty('dumbbell', 'Añade ejercicios con +')}</div>
    <div class="actions">${ib('trash', 'Descartar entreno', 'data-a="wo-cancel"', 'danger big')}${ib('plus', 'Añadir ejercicio', 'data-a="pick" data-target="workout"', 'big')}
      <button type="button" class="ib txt primary wide big" data-a="wo-finish">${ic('flag')}Terminar</button></div>`;
}

const chips = (list, cur, action) => `<div class="chips">${['Todos', ...list].map(g => `<button class="chip ${g === cur ? 'on' : ''}" data-a="${action}" data-g="${g}">${g}</button>`).join('')}</div>`;
const filterEx = (g, q) => EXERCISES.filter(e => (g === 'Todos' || e.g === g) && e.n.toLowerCase().includes(q.trim().toLowerCase()));
const exTiles = (g, q) => filterEx(g, q).map(e => `<button class="tile" data-a="ex-info" data-id="${e.id}"><span class="pic"><img loading="lazy" src="${imgUrl(e.id)}" alt=""></span><b>${esc(e.n)}</b><span>${e.g}</span></button>`).join('') || '<p class="muted" style="grid-column:1/-1;text-align:center">Sin resultados</p>';
const pickList = (g, q) => filterEx(g, q).map(e => `<button class="pickrow" data-a="pick-ex" data-id="${e.id}">${thumb(e.id)}<span class="grow"><b>${esc(e.n)}</b><br><span class="small muted">${e.g}</span></span>${ic('plus')}</button>`).join('') || '<p class="muted" style="text-align:center">Sin resultados</p>';
const searchBox = (key, val = '') => `<div class="search">${ic('search')}<input type="search" enterkeyhint="search" autocapitalize="none" autocorrect="off" data-i="${key}" value="${esc(val)}" placeholder="Buscar" aria-label="Buscar ejercicio"></div>`;

function vEjercicios() {
  return `<h1>Ejercicios</h1>${searchBox('exq', ui.exQ)}${chips(GROUPS, ui.exG, 'ex-group')}
    <div class="tiles" id="exgrid">${exTiles(ui.exG, ui.exQ)}</div>`;
}

function exInfoModal(id) {
  const e = EX[id]; if (!e) return;
  const h = P() ? exHistory(id) : [];
  openModal(`<div class="between"><h3>${esc(e.n)}</h3>${ib('x', 'Cerrar', 'data-a="close"', 'ghost')}</div>
    <span class="tag">${e.g}</span> <span class="tag">${e.eq}</span>
    <div class="eximgs"><div class="eximg"><img src="${imgUrl(id, 0)}" alt="Posición inicial"></div><div class="eximg"><img src="${imgUrl(id, 1)}" alt="Posición final"></div></div>
    <div class="callout">${esc(e.tip)}</div>
    ${h.length ? `<div class="row"><span class="grow row">${ic('trophy')}<b>${fmt(Math.max(...h.map(x => x.max)))} kg</b></span>${ib('chart', 'Ver mi progreso', `data-a="see-progress" data-id="${id}"`, 'primary')}</div>` : ''}`);
}

function vProgreso() {
  const d = D();
  const tabs = [['ejercicios', 'dumbbell', 'Por ejercicio'], ['cuerpo', 'scale', 'Peso corporal'], ['historial', 'history', 'Historial']];
  let body = '';
  if (ui.progTab === 'ejercicios') {
    const done = EXERCISES.filter(e => d.workouts.some(w => w.items.some(i => i.exId === e.id)));
    if (!done.length) body = empty('chart', 'Registra un entreno para ver tu progreso');
    else {
      if (!done.some(e => e.id === ui.progEx)) ui.progEx = done[0].id;
      const h = exHistory(ui.progEx);
      const M = { max: ['Máx.', 'kg'], e1: ['1RM', 'kg'], vol: ['Vol.', 'kg'], reps: ['Reps', 'reps'] };
      if (h.every(x => x.max === 0) && ui.progMetric !== 'reps') ui.progMetric = 'reps';
      const mUnit = M[ui.progMetric][1];
      const first = h[0][ui.progMetric], lastV = h.at(-1)[ui.progMetric];
      const pct = first ? Math.round(((lastV - first) / first) * 100) : 0;
      const prs = done.map(e => { const hh = exHistory(e.id); return { e, max: Math.max(...hh.map(x => x.max)), e1: Math.max(...hh.map(x => x.e1)) }; });
      body = `<div class="card">
          <select data-i="prog-ex" aria-label="Ejercicio">${done.map(e => `<option value="${e.id}" ${e.id === ui.progEx ? 'selected' : ''}>${esc(e.n)}</option>`).join('')}</select>
          <div class="chips fill" style="margin-bottom:4px">${Object.entries(M).map(([k, v]) => `<button class="chip ${k === ui.progMetric ? 'on' : ''}" data-a="metric" data-m="${k}">${v[0]}</button>`).join('')}</div>
          <div class="between" style="margin:8px 0"><b style="font-size:26px">${fmt(lastV)} <span class="small muted">${mUnit}</span></b>
            ${h.length > 1 ? `<b class="${pct >= 0 ? 'up' : 'down'}">${pct >= 0 ? '▲ +' : '▼ '}${pct}%</b>` : ''}</div>
          ${lineChart(h.map(x => ({ x: fdate(x.fecha), y: x[ui.progMetric] })), mUnit)}
        </div>
        <h2>Sesiones</h2>
        <div class="card tablewrap"><table><thead><tr><th>Fecha</th><th>Mejor</th><th class="num">1RM</th><th class="num">Vol.</th><th class="num">Δ</th></tr></thead><tbody>
          ${h.map((x, i) => `<tr><td>${fdate(x.fecha)}</td><td>${fmt(x.best.peso)}×${x.best.reps}</td><td class="num">${fmt(x.e1)}</td><td class="num">${fmt(x.vol)}</td><td class="num">${delta(x[ui.progMetric], h[i - 1]?.[ui.progMetric])}</td></tr>`).reverse().join('')}
        </tbody></table></div>
        <h2>Récords</h2>
        <div class="card tablewrap"><table><thead><tr><th>Ejercicio</th><th class="num">Máx.</th><th class="num">1RM</th></tr></thead><tbody>
          ${prs.map(r => `<tr><td class="wrap">${esc(r.e.n)}</td><td class="num">${fmt(r.max)}</td><td class="num">${fmt(r.e1)}</td></tr>`).join('')}
        </tbody></table></div>`;
    }
  } else if (ui.progTab === 'cuerpo') {
    const ps = d.pesos;
    body = `<div class="card"><form data-form="peso" class="row">
        <input class="grow" type="date" name="fecha" value="${today()}" max="${today()}" required aria-label="Fecha">
        <input class="grow" type="number" inputmode="decimal" name="kg" step="0.1" min="30" max="250" required placeholder="kg" aria-label="Peso en kg">
        <button class="ib primary" aria-label="Guardar peso" title="Guardar">${ic('check')}</button></form></div>
      ${ps.length ? `<div class="card"><div class="between" style="margin-bottom:8px"><b style="font-size:26px">${fmt(ps.at(-1).kg)} <span class="small muted">kg</span></b>
          ${ps.length > 1 ? `<b>${delta(ps.at(-1).kg, ps[0].kg, ' kg')}</b>` : ''}</div>
          ${lineChart(ps.map(x => ({ x: fdate(x.fecha + 'T12:00'), y: x.kg })), 'kg')}</div>
        <div class="card tablewrap"><table><thead><tr><th>Fecha</th><th class="num">kg</th><th class="num">Δ</th><th></th></tr></thead><tbody>
          ${ps.map((x, i) => `<tr><td>${fdate(x.fecha + 'T12:00')}</td><td class="num">${fmt(x.kg)}</td><td class="num">${delta(x.kg, ps[i - 1]?.kg)}</td><td class="num" style="padding:0">${ib('x', 'Eliminar registro', `data-a="del-peso" data-x="${i}"`, 'ghost')}</td></tr>`).reverse().join('')}
        </tbody></table></div>` : empty('scale', 'Anota tu peso')}`;
  } else {
    body = d.workouts.slice().reverse().map(w => workoutCard(w, true)).join('') || empty('history', 'Sin entrenos aún');
  }
  return `<h1>Progreso</h1>
    <div class="grid g3" style="margin-top:12px">
      <div class="stat">${ic('trophy', 18)}<b>${d.workouts.length}</b><span>entrenos</span></div>
      <div class="stat">${ic('dumbbell', 18)}<b>${fmt(d.workouts.reduce((t, w) => t + volOf(w), 0) / 1000)}</b><span>toneladas</span></div>
      <div class="stat">${ic('clock', 18)}<b>${fmt(d.workouts.reduce((t, w) => t + w.min, 0) / 60)}</b><span>horas</span></div>
    </div>
    <div class="chips fill">${tabs.map(([k, icon, l]) => `<button class="chip ${ui.progTab === k ? 'on' : ''}" data-a="tab" data-tab="${k}" aria-label="${l}" title="${l}">${ic(icon, 20)}</button>`).join('')}</div>${body}`;
}

function vNutricion() {
  const p = P(), kg = lastWeight();
  const goal = ui.nutGoal ?? p.objetivo ?? 'musculo';
  const g = GOALS[goal];
  const foods = s => `<h2>${s.t}</h2><div class="card" style="padding:4px 14px">${s.foods.map(f => `<div class="food"><span class="em" aria-hidden="true">${f[0]}</span><span>${f[1]}</span></div>`).join('')}</div>`;
  const more = (title, list) => `<details class="card"><summary class="row"><b class="grow">${title}</b>${ic('chev')}</summary><ul class="tight">${list.map(t => `<li>${t}</li>`).join('')}</ul></details>`;
  return `<h1>Nutrición</h1>
    <div class="chips fill">${Object.entries(GOALS).map(([k, v]) => `<button class="chip ${k === goal ? 'on' : ''}" data-a="nut-goal" data-g="${k}">${v.short}</button>`).join('')}</div>
    ${kg ? `<div class="grid g3">
        <div class="stat"><b>${Math.round(kg * g.prot[0])}–${Math.round(kg * g.prot[1])}</b><span>g proteína/día</span></div>
        <div class="stat"><b>${Math.round(kg * 0.3)}–${Math.round(kg * 0.4)}</b><span>g tras entrenar</span></div>
        <div class="stat"><b>${fmt((kg * 35) / 1000)}</b><span>L agua/día</span></div></div>`
      : `<a class="card row" href="#progreso" data-a="tab" data-tab="cuerpo">${ic('scale')}<span class="grow">Añade tu peso</span>${ic('next')}</a>`}
    <h2 style="color:var(--accent)">Antes</h2>${NUTRITION.pre.map(foods).join('')}
    <h2 style="color:var(--accent)">Después</h2>${NUTRITION.post.map(foods).join('')}
    <h2>Más</h2>
    ${more('Claves', NUTRITION.goalTips[goal])}${more('Hidratación', NUTRITION.hydration)}${more('Evitar', NUTRITION.avoid)}
    <p class="small muted">Guía general. Consulta a un nutricionista si tienes alguna condición.</p>`;
}

function vPerfil() {
  const p = P();
  return `<h1>Perfil</h1>
    <div class="card" style="margin-top:14px">${profileForm(p, 'Guardar')}</div>
    <h2>Perfiles</h2>
    ${S.profiles.map(x => `<div class="card row"><span class="avatar">${esc(x.nombre[0].toUpperCase())}</span><b class="grow ellip">${esc(x.nombre)}</b>
      ${x.id === S.active ? `<span style="color:var(--accent)">${ic('check')}</span>` : ib('swap', 'Cambiar a ' + esc(x.nombre), `data-a="switch" data-id="${x.id}"`)}</div>`).join('')}
    <div class="grid" style="grid-template-columns:repeat(4,1fr)">
      <button class="tool" data-a="new-profile">${ic('userplus')}Nuevo</button>
      <button class="tool" data-a="export">${ic('download')}Exportar</button>
      <label class="tool">${ic('upload')}Importar<input type="file" accept="application/json,.json" data-i="import" hidden></label>
      <button class="tool danger" data-a="del-profile">${ic('trash')}Borrar</button>
    </div>`;
}

/* ───────── Render y rutas ───────── */
function render() {
  const p = P();
  document.getElementById('nav').hidden = !p;
  document.getElementById('avatar').textContent = p ? p.nombre[0].toUpperCase() : '';
  if (!p) { document.getElementById('nav').innerHTML = ''; view.innerHTML = vOnboarding(); return; }
  const [route, arg] = (location.hash.slice(1) || 'inicio').split('/');
  const cur = route === 'rutina' ? 'rutinas' : route === 'entrenar' ? 'inicio' : route;
  document.getElementById('nav').innerHTML = NAV.map(([h, icon, l]) => `<a href="#${h}" class="${cur === h ? 'on' : ''}" aria-label="${l}" title="${l}" ${cur === h ? 'aria-current="page"' : ''}>${ic(icon, 26)}</a>`).join('');
  const views = { inicio: vInicio, rutinas: vRutinas, rutina: () => vRutina(arg), entrenar: vEntrenar, ejercicios: vEjercicios, progreso: vProgreso, nutricion: vNutricion, perfil: vPerfil };
  view.innerHTML = (views[route] ?? vInicio)();
  tick();
}
function tick() {
  const el = document.getElementById('timer'), a = P() && D().active;
  if (!el || !a) return;
  const s = Math.floor((Date.now() - a.inicio) / 1000);
  el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
setInterval(tick, 1000);
window.addEventListener('hashchange', () => {
  if (skipHash) { skipHash = false; return; }
  closeModal(); render(); window.scrollTo(0, 0);
});

/* ───────── Acciones ───────── */
const routeRoutine = () => D().routines.find(r => r.id === location.hash.split('/')[1]);

function startWorkout(id) {
  const d = D(), r = d.routines.find(x => x.id === id);
  const begin = () => {
    d.active = {
      nombre: r ? r.nombre : 'Entreno libre', routineId: r?.id ?? null, inicio: Date.now(),
      items: (r?.items ?? []).filter(it => EX[it.exId]).map(it => ({ exId: it.exId, target: it.reps, sets: Array.from({ length: Math.max(1, it.series) }, () => ({ peso: '', reps: '', done: false })) })),
    };
    save(); closeModal(); go('entrenar');
  };
  if (d.active) ask('¿Reemplazar el entreno en curso?', 'Reemplazar', begin, false); else begin();
}

function finishWorkout() {
  const d = D(), a = d.active;
  const items = a.items.map(it => ({ exId: it.exId, sets: it.sets.filter(s => s.done && num(s.reps) > 0).map(s => ({ peso: num(s.peso), reps: Math.round(num(s.reps)) })) })).filter(it => it.sets.length);
  if (!items.length) return toast('Marca una serie con ✓');
  const prs = items.flatMap(it => {
    const h = exHistory(it.exId); if (!h.length) return [];
    const prev = Math.max(...h.map(x => x.max)), m = Math.max(...it.sets.map(s => s.peso));
    return m > prev ? [`${exName(it.exId)}: ${fmt(m)} kg (antes ${fmt(prev)} kg)`] : [];
  });
  const w = { id: uid(), fecha: new Date().toISOString(), nombre: a.nombre, routineId: a.routineId, min: Math.max(1, Math.round((Date.now() - a.inicio) / 60000)), items };
  d.workouts.push(w); d.active = null; save();
  go('inicio');
  openModal(`<h3>¡Hecho!</h3>
    <div class="grid g3" style="margin-top:12px"><div class="stat">${ic('clock', 18)}<b>${w.min}</b><span>min</span></div><div class="stat">${ic('check', 18)}<b>${setsOf(w)}</b><span>series</span></div><div class="stat">${ic('dumbbell', 18)}<b>${fmt(volOf(w))}</b><span>kg</span></div></div>
    ${prs.length ? `<div class="callout row">${ic('trophy')}<span>${prs.map(esc).join('<br>')}</span></div>` : ''}
    <div class="row" style="margin-top:12px"><a class="ib wide big" href="#nutricion" aria-label="Qué comer ahora" title="Qué comer ahora">${ic('food')}</a>${ib('check', 'Listo', 'data-a="close"', 'primary wide big')}</div>`);
}

function openPicker(target) {
  ui.pick = target; ui.pickQ = ''; ui.pickG = 'Todos';
  openModal(`<div class="between"><h3>Añadir</h3>${ib('x', 'Cerrar', 'data-a="close"', 'ghost')}</div>
    ${searchBox('pickq')}<div id="pickchips">${chips(GROUPS, 'Todos', 'pick-group')}</div>
    <div id="picklist">${pickList('Todos', '')}</div>`);
}

const actions = {
  close: closeModal,
  'confirm-yes': () => { const fn = ui.confirm; closeModal(); fn?.(); },
  demo: (el, ev) => { ev.preventDefault(); createDemo(); go('inicio'); toast('Demo cargada'); },
  tab: el => { ui.progTab = el.dataset.tab; if (location.hash === '#progreso') render(); },
  start: el => startWorkout(el.dataset.id),
  'new-routine': () => { const r = { id: uid(), nombre: 'Nueva rutina', items: [] }; D().routines.push(r); save(); go('rutina/' + r.id); },
  'dup-routine': el => { const r = D().routines.find(x => x.id === el.dataset.id); D().routines.push({ ...structuredClone(r), id: uid(), nombre: r.nombre + ' (copia)' }); save(); render(); toast('Rutina duplicada'); },
  'del-routine': el => ask('¿Eliminar rutina?', 'Eliminar', () => { D().routines = D().routines.filter(x => x.id !== el.dataset.id); save(); render(); }),
  'rt-move': el => { const r = routeRoutine(), i = +el.dataset.x, j = i + +el.dataset.d; [r.items[i], r.items[j]] = [r.items[j], r.items[i]]; save(); render(); },
  'rt-del': el => { routeRoutine().items.splice(+el.dataset.x, 1); save(); render(); },
  pick: el => openPicker(el.dataset.target),
  'pick-group': el => { ui.pickG = el.dataset.g; document.getElementById('pickchips').innerHTML = chips(GROUPS, ui.pickG, 'pick-group'); document.getElementById('picklist').innerHTML = pickList(ui.pickG, ui.pickQ); },
  'pick-ex': el => {
    const id = el.dataset.id;
    if (ui.pick === 'routine') routeRoutine().items.push({ exId: id, series: 3, reps: '8-12' });
    else D().active.items.push({ exId: id, target: '', sets: [{ peso: '', reps: '', done: false }] });
    save(); closeModal(); render(); toast('Añadido');
  },
  metric: el => { ui.progMetric = el.dataset.m; render(); },
  'ex-group': el => { ui.exG = el.dataset.g; render(); },
  'ex-info': el => exInfoModal(el.dataset.id),
  'see-progress': el => { ui.progTab = 'ejercicios'; ui.progEx = el.dataset.id; closeModal(); go('progreso'); },
  'set-done': el => {
    const it = D().active.items[+el.dataset.x], s = it.sets[+el.dataset.s];
    if (!s.done) {
      const last = lastSets(it.exId), prev = last?.[+el.dataset.s] ?? last?.at(-1);
      if (s.peso === '') s.peso = prev ? prev.peso : 0;
      if (s.reps === '') s.reps = prev ? prev.reps : parseInt(it.target) || '';
      if (!(num(s.reps) > 0)) return toast('Faltan las reps');
    }
    s.done = !s.done; save(); render();
  },
  'set-add': el => { const it = D().active.items[+el.dataset.x], l = it.sets.at(-1); it.sets.push({ peso: l?.peso ?? '', reps: '', done: false }); save(); render(); },
  'set-del': el => { D().active.items[+el.dataset.x].sets.splice(+el.dataset.s, 1); save(); render(); },
  'wo-del-ex': el => { D().active.items.splice(+el.dataset.x, 1); save(); render(); },
  'wo-cancel': () => ask('¿Descartar entreno?', 'Descartar', () => { D().active = null; save(); go('inicio'); }),
  'wo-finish': finishWorkout,
  'del-workout': el => ask('¿Eliminar entreno?', 'Eliminar', () => { D().workouts = D().workouts.filter(w => w.id !== el.dataset.id); save(); render(); }),
  'del-peso': el => { D().pesos.splice(+el.dataset.x, 1); save(); render(); },
  'nut-goal': el => { ui.nutGoal = el.dataset.g; render(); },
  switch: el => { S.active = el.dataset.id; ui.progEx = null; ui.nutGoal = null; save(); go('inicio'); toast('Perfil cambiado'); },
  'new-profile': () => openModal(`<div class="between"><h3>Nuevo perfil</h3>${ib('x', 'Cerrar', 'data-a="close"', 'ghost')}</div><div style="margin-top:12px">${profileForm(null, 'Crear')}</div>`),
  'del-profile': () => ask(`¿Borrar el perfil "${P().nombre}" y todos sus datos?`, 'Eliminar perfil', () => {
    delete S.data[S.active]; S.profiles = S.profiles.filter(p => p.id !== S.active); S.active = S.profiles[0]?.id ?? null; save(); go('inicio');
  }),
  export: () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }));
    a.download = `mi-entreno-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
  },
};

document.addEventListener('click', e => {
  if (e.target === modalEl) return closeModal();
  const el = e.target.closest('[data-a]');
  if (el && !el.disabled) actions[el.dataset.a]?.(el, e);
});

document.addEventListener('input', e => {
  const el = e.target, k = el.dataset.i;
  if (k === 'set') { D().active.items[+el.dataset.x].sets[+el.dataset.s][el.dataset.f] = el.value; save(); }
  else if (k === 'rt-name') { routeRoutine().nombre = el.value.trim() || 'Rutina sin nombre'; save(); }
  else if (k === 'rt-item') { const it = routeRoutine().items[+el.dataset.x]; it[el.dataset.f] = el.dataset.f === 'series' ? Math.min(12, Math.max(1, parseInt(el.value) || 1)) : el.value; save(); }
  else if (k === 'exq') { ui.exQ = el.value; document.getElementById('exgrid').innerHTML = exTiles(ui.exG, ui.exQ); }
  else if (k === 'pickq') { ui.pickQ = el.value; document.getElementById('picklist').innerHTML = pickList(ui.pickG, ui.pickQ); }
});

document.addEventListener('change', e => {
  const el = e.target, k = el.dataset.i;
  if (k === 'prog-ex') { ui.progEx = el.value; render(); }
  else if (k === 'prog-metric') { ui.progMetric = el.value; render(); }
  else if (k === 'import' && el.files[0]) {
    el.files[0].text().then(t => {
      const s = JSON.parse(t);
      if (!Array.isArray(s.profiles) || typeof s.data !== 'object') throw new Error('formato');
      ask('¿Reemplazar todos los datos?', 'Importar', () => { S = s; save(); go('inicio'); toast('Datos importados'); }, false);
    }).catch(() => toast('Archivo no válido'));
  }
});

document.addEventListener('submit', e => {
  const f = e.target, kind = f.dataset.form;
  if (!kind) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  if (kind === 'perfil') {
    const nombre = v.nombre.trim(); if (!nombre) return;
    const fields = { nombre, edad: num(v.edad), altura: num(v.altura), objetivo: v.objetivo };
    if (f.dataset.id) { Object.assign(S.profiles.find(p => p.id === f.dataset.id), fields); ui.nutGoal = null; save(); render(); toast('Perfil guardado'); }
    else { newProfile({ ...fields, peso: num(v.peso) }); ui.progEx = null; ui.nutGoal = null; closeModal(); go('inicio'); toast(`¡Hola, ${nombre}!`); }
  } else if (kind === 'peso') {
    const kg = num(v.kg); if (!kg || !v.fecha) return;
    const ps = D().pesos.filter(x => x.fecha !== v.fecha);
    ps.push({ fecha: v.fecha, kg }); ps.sort((a, b) => a.fecha.localeCompare(b.fecha));
    D().pesos = ps; save(); render(); toast('Peso guardado');
  }
});

render();

// Modo sin conexión (solo en la versión publicada con https; en local no se guarda nada en caché)
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
