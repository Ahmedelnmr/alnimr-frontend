/**
 * helpers.js — Shared utility functions (Arabic)
 */

export function formatCurrency(value, currency = 'EGP') {
  if (!value) return 'السعر عند الطلب';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr));
}

export function truncate(text, maxLength = 120) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function getStatusBadge(status) {
  const map = {
    'Launch':            'badge-gold',
    'Under Construction':'badge-warning',
    'Ready':             'badge-success',
    'Available':         'badge-success',
    'Reserved':          'badge-warning',
    'Sold':              'badge-danger',
  };
  return map[status] || 'badge-info';
}

export function translateStatus(status) {
  const map = {
    'Launch':            'إطلاق جديد',
    'Under Construction':'تحت الإنشاء',
    'Ready':             'جاهز للاستلام',
    'Available':         'متاح',
    'Reserved':          'محجوز',
    'Sold':              'مباع',
  };
  return map[status] || status;
}

export function getTypeBadge(type) {
  const map = {
    'Residential':    'badge-success',
    'Commercial':     'badge-info',
    'Administrative': 'badge-navy',
    'Medical':        'badge-gold',
  };
  return map[type] || 'badge-info';
}

export function translateType(type) {
  const map = {
    'Residential':    'سكني',
    'Commercial':     'تجاري',
    'Administrative': 'إداري',
    'Medical':        'طبي',
  };
  return map[type] || type;
}

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function buildUrl(base, params) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
  ).toString();
  return qs ? `${base}?${qs}` : base;
}
