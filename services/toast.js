/**
 * toast.js — Toast notification service
 */

let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message, type = 'info', duration = 4000) {
  const c     = getContainer();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const el    = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;

  c.appendChild(el);
  el.addEventListener('click', () => el.remove());

  setTimeout(() => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(60px)';
    el.style.transition = 'all 300ms ease';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export const toastSuccess = (msg) => toast(msg, 'success');
export const toastError   = (msg) => toast(msg, 'error');
export const toastInfo    = (msg) => toast(msg, 'info');
