'use strict';

// ── Formato pesos colombianos ──────────────────────────────────────────────
function formatCOP(value) {
  if (!value && value !== 0) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(Number(value));
}

function parseCOP(str) {
  if (!str) return 0;
  return parseInt(str.toString().replace(/[^0-9]/g, '')) || 0;
}

// ── Manejo de meses ───────────────────────────────────────────────────────
function getCurrentMonth() {
  const corte = parseInt(localStorage.getItem('finanz_corte') || '1');
  const now   = new Date();
  const day   = now.getDate();
  // If today >= cutoff day, we're already in the "next" billing period
  if (corte > 1 && day >= corte) {
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getSelectedMonth() {
  return localStorage.getItem('finanz_month') || getCurrentMonth();
}

function setSelectedMonth(month) {
  localStorage.setItem('finanz_month', month);
}

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const str = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function prevMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getLast6Months(fromMonth) {
  const months = [];
  let cur = fromMonth;
  for (let i = 0; i < 6; i++) {
    months.unshift(cur);
    cur = prevMonth(cur);
  }
  return months;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// ── Categorías (dinámicas desde Firebase) ────────────────────────────────
function getActiveCats() { return window._CATS || []; }

function getCategoryName(id) {
  const c = getActiveCats().find(c => c.id === id);
  return c ? c.nombre : id;
}

function getCategoryIcon(id, size = 16) {
  const c = getActiveCats().find(c => c.id === id);
  if (!c || typeof SVG === 'undefined' || !SVG[c.icono]) return '';
  return SVG[c.icono].replace('<svg ', `<svg width="${size}" height="${size}" `);
}

function getCategoryColor(id) {
  const c = getActiveCats().find(c => c.id === id);
  return c ? c.color : '#6B7280';
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2,5);
}

// ── UI Helpers ────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const iconMap = { success:'checkCircle', error:'xCircle', warning:'alertTri' };
  const iconSvg = (typeof SVG !== 'undefined' && SVG[iconMap[type]]) ? `<span class="toast-icon">${SVG[iconMap[type]]}</span>` : '';
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `${iconSvg}<span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 50);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
