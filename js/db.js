'use strict';

// ── Ingresos ──────────────────────────────────────────────────────────────
async function getIngresos(uid, mes) {
  const snap = await db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('ingresos')
    .orderBy('creadoEn', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addIngreso(uid, mes, data) {
  return db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('ingresos')
    .add({ ...data, creadoEn: firebase.firestore.FieldValue.serverTimestamp() });
}

async function updateIngreso(uid, mes, id, data) {
  return db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('ingresos').doc(id).update(data);
}

async function deleteIngreso(uid, mes, id) {
  return db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('ingresos').doc(id).delete();
}

// ── Egresos ───────────────────────────────────────────────────────────────
async function getEgresos(uid, mes, categoria = null) {
  let ref = db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('egresos');
  if (categoria) ref = ref.where('categoria', '==', categoria);
  const snap = await ref.orderBy('creadoEn', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addEgreso(uid, mes, data) {
  return db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('egresos')
    .add({ ...data, creadoEn: firebase.firestore.FieldValue.serverTimestamp() });
}

async function updateEgreso(uid, mes, id, data) {
  return db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('egresos').doc(id).update(data);
}

async function deleteEgreso(uid, mes, id) {
  return db.collection('users').doc(uid)
    .collection('meses').doc(mes).collection('egresos').doc(id).delete();
}

// ── Presupuestos ──────────────────────────────────────────────────────────
async function getPresupuestos(uid) {
  const doc = await db.collection('users').doc(uid)
    .collection('config').doc('presupuestos').get();
  return doc.exists ? doc.data() : {
    casa: 811000, moto: 400000, esposa: 330000, personal: 270000, deudas: 1956000
  };
}

async function savePresupuestos(uid, presupuestos) {
  return db.collection('users').doc(uid)
    .collection('config').doc('presupuestos').set(presupuestos);
}

// ── Metas ─────────────────────────────────────────────────────────────────
async function getMetas(uid) {
  const snap = await db.collection('users').doc(uid)
    .collection('metas').orderBy('creadoEn', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addMeta(uid, data) {
  return db.collection('users').doc(uid).collection('metas')
    .add({ ...data, actual: 0, aportes: [],
      creadoEn: firebase.firestore.FieldValue.serverTimestamp() });
}

async function updateMeta(uid, id, data) {
  return db.collection('users').doc(uid).collection('metas').doc(id).update(data);
}

async function deleteMeta(uid, id) {
  return db.collection('users').doc(uid).collection('metas').doc(id).delete();
}

async function addAporte(uid, metaId, monto, descripcion = '') {
  const ref = db.collection('users').doc(uid).collection('metas').doc(metaId);
  const meta = (await ref.get()).data();
  const nuevoActual = (meta.actual || 0) + monto;
  const aportes = [...(meta.aportes || []),
    { monto, descripcion, fecha: new Date().toISOString() }];
  return ref.update({ actual: nuevoActual, aportes });
}

// ── Resumen mensual ───────────────────────────────────────────────────────
async function getResumenMes(uid, mes) {
  const [ingresos, egresos] = await Promise.all([
    getIngresos(uid, mes), getEgresos(uid, mes)
  ]);
  const totalIngresos = ingresos.reduce((s, i) => s + (i.valor || 0), 0);
  const egresosPorCategoria = {};
  // Init with all known categories
  (window._CATS || []).forEach(c => egresosPorCategoria[c.id] = 0);
  // Sum up all expenses (including any unknown category)
  egresos.forEach(e => {
    if (!egresosPorCategoria.hasOwnProperty(e.categoria)) egresosPorCategoria[e.categoria] = 0;
    egresosPorCategoria[e.categoria] += (e.valor || 0);
  });
  const totalEgresos = Object.values(egresosPorCategoria).reduce((a, b) => a + b, 0);
  return { ingresos, egresos, totalIngresos, totalEgresos, egresosPorCategoria, saldoLibre: totalIngresos - totalEgresos };
}

// ── Seed datos octubre 2026 ───────────────────────────────────────────────
async function seedOctubreData(uid) {
  const mes = '2026-10';
  const existing = await getIngresos(uid, mes);
  if (existing.length > 0) return; // ya hay datos

  const ingresos = [
    { nombre: 'TBJ. Empresa',  valor: 2300000, fecha: '2026-10-01' },
    { nombre: 'TBJ. Totoy',    valor: 1050000, fecha: '2026-10-01' },
    { nombre: 'TBJ. Moto',     valor: 100000,  fecha: '2026-10-01' },
    { nombre: 'Parqueadero',   valor: 160000,  fecha: '2026-10-01' },
  ];

  const egresos = [
    { nombre: 'Mercado',      categoria: 'casa',     valor: 400000,  fecha: '2026-10-01' },
    { nombre: 'Luz',          categoria: 'casa',     valor: 75070,   fecha: '2026-10-01' },
    { nombre: 'Internet',     categoria: 'casa',     valor: 113000,  fecha: '2026-10-01' },
    { nombre: 'Gas',          categoria: 'casa',     valor: 97000,   fecha: '2026-10-01' },
    { nombre: 'Agua',         categoria: 'casa',     valor: 86000,   fecha: '2026-10-01' },
    { nombre: 'Datos',        categoria: 'casa',     valor: 40000,   fecha: '2026-10-01' },
    { nombre: 'Gastos Moto',  categoria: 'moto',     valor: 400000,  fecha: '2026-10-01' },
    { nombre: 'Academia',     categoria: 'esposa',   valor: 230000,  fecha: '2026-10-01' },
    { nombre: 'Uñas',         categoria: 'esposa',   valor: 100000,  fecha: '2026-10-01' },
    { nombre: 'Básquet',      categoria: 'personal', valor: 50000,   fecha: '2026-10-01' },
    { nombre: 'Fútbol',       categoria: 'personal', valor: 70000,   fecha: '2026-10-01' },
    { nombre: 'Onces',        categoria: 'personal', valor: 100000,  fecha: '2026-10-01' },
    { nombre: 'Otros',        categoria: 'personal', valor: 50000,   fecha: '2026-10-01' },
    { nombre: 'Daviplata',    categoria: 'deudas',   valor: 63000,   fecha: '2026-10-01' },
    { nombre: 'Nu',           categoria: 'deudas',   valor: 63000,   fecha: '2026-10-01' },
    { nombre: 'Universidad',  categoria: 'deudas',   valor: 800000,  fecha: '2026-10-01' },
    { nombre: 'Otras deudas', categoria: 'deudas',   valor: 1030000, fecha: '2026-10-01' },
  ];

  for (const i of ingresos) await addIngreso(uid, mes, i);
  for (const e of egresos)  await addEgreso(uid, mes, e);
}

// ── Categorías dinámicas ──────────────────────────────────────────────────
const DEFAULT_CATS = [
  { id:'casa',     nombre:'Casa',     color:'#2563EB', icono:'houseS'   },
  { id:'moto',     nombre:'Moto',     color:'#7C3AED', icono:'bike'     },
  { id:'esposa',   nombre:'Esposa',   color:'#DB2777', icono:'heart'    },
  { id:'personal', nombre:'Personal', color:'#D97706', icono:'user'     },
  { id:'deudas',   nombre:'Deudas',   color:'#DC2626', icono:'landmark' },
];

async function getCategorias(uid) {
  const doc = await db.collection('users').doc(uid)
    .collection('config').doc('categorias').get();
  return doc.exists ? (doc.data().items || []) : null;
}

async function saveCategorias(uid, cats) {
  return db.collection('users').doc(uid)
    .collection('config').doc('categorias').set({ items: cats });
}

async function initCategorias(uid) {
  let cats = await getCategorias(uid);
  if (!cats || cats.length === 0) {
    cats = DEFAULT_CATS;
    await saveCategorias(uid, cats);
  }
  window._CATS = cats;
  return cats;
}

// ── Ajustes de usuario ────────────────────────────────────────────────────
async function getSettings(uid) {
  const doc = await db.collection('users').doc(uid)
    .collection('config').doc('settings').get();
  return doc.exists ? doc.data() : { corte: 1 };
}

async function saveSettings(uid, settings) {
  return db.collection('users').doc(uid)
    .collection('config').doc('settings').set(settings, { merge: true });
}

// ── Eliminar todos los datos del usuario ──────────────────────────────────
async function deleteAllUserData(uid) {
  // 1. Eliminar todos los meses con sus sub-colecciones
  const mesesSnap = await db.collection('users').doc(uid).collection('meses').get();
  for (const mesDoc of mesesSnap.docs) {
    const [ingSnap, egSnap] = await Promise.all([
      mesDoc.ref.collection('ingresos').get(),
      mesDoc.ref.collection('egresos').get()
    ]);
    const batch = db.batch();
    ingSnap.docs.forEach(d => batch.delete(d.ref));
    egSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(mesDoc.ref);
    await batch.commit();
  }
  // 2. Eliminar config (presupuestos, categorias, settings)
  const configSnap = await db.collection('users').doc(uid).collection('config').get();
  if (!configSnap.empty) {
    const b = db.batch();
    configSnap.docs.forEach(d => b.delete(d.ref));
    await b.commit();
  }
  // 3. Eliminar metas
  const metasSnap = await db.collection('users').doc(uid).collection('metas').get();
  if (!metasSnap.empty) {
    const b = db.batch();
    metasSnap.docs.forEach(d => b.delete(d.ref));
    await b.commit();
  }
}

// ── Exportar mes a PDF (ventana de impresión) ─────────────────────────────
async function exportarPDF(uid, mes) {
  const [resumen, presupuestos, cats] = await Promise.all([
    getResumenMes(uid, mes),
    getPresupuestos(uid),
    getCategorias(uid)
  ]);
  const allCats = cats || [];

  const rows_ing = resumen.ingresos.map(i =>
    `<tr><td>${i.nombre}</td><td>${i.fecha||''}</td><td class="r">${fmtPDF(i.valor)}</td></tr>`
  ).join('');

  const rows_egr = allCats.map(cat => {
    const items = resumen.egresos.filter(e => e.categoria === cat.id);
    if (!items.length) return '';
    const header = `<tr class="cat-hdr"><td colspan="3" style="background:${cat.color}20;color:${cat.color};font-weight:700">${cat.nombre}</td></tr>`;
    const detail = items.map(e =>
      `<tr><td>${e.nombre}</td><td>${e.fecha||''}</td><td class="r">${fmtPDF(e.valor)}</td></tr>`
    ).join('');
    const subtot = `<tr class="sub"><td colspan="2">Subtotal ${cat.nombre}</td><td class="r">${fmtPDF(items.reduce((s,e)=>s+(e.valor||0),0))}</td></tr>`;
    return header + detail + subtot;
  }).join('');

  const presRows = allCats.map(cat => {
    const g = resumen.egresosPorCategoria[cat.id]||0, l = presupuestos[cat.id]||0;
    if (!l) return '';
    const pct = l>0?Math.min(Math.round(g/l*100),100):0;
    return `<tr><td>${cat.nombre}</td><td class="r">${fmtPDF(g)}</td><td class="r">${fmtPDF(l)}</td><td class="r">${pct}%</td></tr>`;
  }).join('');

  const fmtMes = mes; // YYYY-MM
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>FinanzApp – ${fmtMes}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#1a1a1a;padding:32px}
    h1{font-size:22px;font-weight:700;margin-bottom:4px}
    .sub{color:#666;font-size:12px;margin-bottom:24px}
    .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
    .s-card{border:1px solid #e2e8f0;border-radius:8px;padding:14px}
    .s-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:6px}
    .s-val{font-size:18px;font-weight:700}
    .green{color:#16a34a}.red{color:#dc2626}.blue{color:#2563eb}
    h2{font-size:14px;font-weight:700;margin:20px 0 10px;border-bottom:2px solid #e2e8f0;padding-bottom:6px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#f1f5f9;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#666}
    td{padding:7px 10px;border-bottom:1px solid #f1f5f9}
    .r{text-align:right}.cat-hdr td{padding:6px 10px!important}.sub td{font-weight:600;background:#f8fafc}
    .footer{margin-top:32px;font-size:11px;color:#999;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}
    @media print{body{padding:16px}.no-print{display:none}}
  </style></head><body>
  <div class="no-print" style="margin-bottom:16px;display:flex;gap:10px">
    <button onclick="window.print()" style="padding:8px 16px;background:#2563EB;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600">Guardar PDF / Imprimir</button>
    <button onclick="window.close()" style="padding:8px 16px;background:#f1f5f9;border:none;border-radius:6px;cursor:pointer">Cerrar</button>
  </div>
  <h1>FinanzApp — Reporte Mensual</h1>
  <p class="sub">Período: ${fmtMes} · Generado: ${new Date().toLocaleDateString('es-CO')}</p>
  <div class="summary">
    <div class="s-card"><div class="s-label">Ingresos</div><div class="s-val green">${fmtPDF(resumen.totalIngresos)}</div></div>
    <div class="s-card"><div class="s-label">Egresos</div><div class="s-val red">${fmtPDF(resumen.totalEgresos)}</div></div>
    <div class="s-card"><div class="s-label">Saldo libre</div><div class="s-val ${resumen.saldoLibre>=0?'green':'red'}">${fmtPDF(resumen.saldoLibre)}</div></div>
  </div>
  <h2>Ingresos</h2>
  <table><thead><tr><th>Fuente</th><th>Fecha</th><th class="r">Valor</th></tr></thead>
  <tbody>${rows_ing||'<tr><td colspan="3" style="color:#999">Sin ingresos</td></tr>'}</tbody>
  <tfoot><tr><td colspan="2" style="font-weight:700">TOTAL</td><td class="r" style="font-weight:700">${fmtPDF(resumen.totalIngresos)}</td></tr></tfoot></table>
  <h2>Egresos por Categoría</h2>
  <table><thead><tr><th>Nombre</th><th>Fecha</th><th class="r">Valor</th></tr></thead>
  <tbody>${rows_egr||'<tr><td colspan="3" style="color:#999">Sin egresos</td></tr>'}</tbody>
  <tfoot><tr><td colspan="2" style="font-weight:700">TOTAL</td><td class="r" style="font-weight:700">${fmtPDF(resumen.totalEgresos)}</td></tr></tfoot></table>
  ${presRows?`<h2>Estado del Presupuesto</h2><table><thead><tr><th>Categoría</th><th class="r">Gastado</th><th class="r">Límite</th><th class="r">Uso</th></tr></thead><tbody>${presRows}</tbody></table>`:''}
  <div class="footer">FinanzApp · finanzapp</div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
}

function fmtPDF(v) {
  return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(v||0);
}
