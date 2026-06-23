import { api } from '../services/api.js';
import { formatCurrency, getStatusBadge, getTypeBadge, translateStatus, translateType, debounce, getParam } from '../utils/helpers.js';

let currentPage  = 1;
let currentFilters = {};
let totalPages   = 1;

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const search  = params.get('search') || '';
  const type    = params.get('type') || '';
  const status  = params.get('status') || '';
  const company = params.get('company_id') || '';
  const location= params.get('location') || '';
  const price   = params.get('price_max') || '';

  if (search)   document.getElementById('filterSearch').value   = search;
  if (type)     document.getElementById('filterType').value     = type;
  if (status)   document.getElementById('filterStatus').value   = status;
  if (location) document.getElementById('filterLocation').value = location;
  if (price)    document.getElementById('filterPrice').value    = price;

  currentFilters = { search, type, status, company_id: company, location, price_max: price };
}

async function loadCompanies() {
  try {
    const companies = await api.get('/companies');
    const sel = document.getElementById('filterCompany');
    companies.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });

    const companyId = getParam('company_id');
    if (companyId) sel.value = companyId;
  } catch (_) {}
}

async function loadProjects(page = 1) {
  const grid    = document.getElementById('projectsGrid');
  const info    = document.getElementById('resultsInfo');
  const pagDiv  = document.getElementById('pagination');

  grid.innerHTML = `
    <div class="skeleton" style="height:380px;border-radius:var(--radius-lg)"></div>
    <div class="skeleton" style="height:380px;border-radius:var(--radius-lg)"></div>
    <div class="skeleton" style="height:380px;border-radius:var(--radius-lg)"></div>`;

  try {
    const filters = { ...currentFilters, page };
    Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });

    const data     = await api.get('/projects', filters);
    const projects = data.data || [];
    const meta     = data.meta || {};

    totalPages  = meta.last_page || 1;
    currentPage = meta.current_page || 1;

    info.innerHTML = `عرض <strong>${projects.length}</strong> من إجمالي <strong>${meta.total || 0}</strong> مشروع`;

    if (!projects.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🔍</div>
        <h3>لم يتم العثور على مشاريع</h3>
        <p>حاول تغيير الفلاتر للحصول على نتائج أكثر.</p>
      </div>`;
      pagDiv.innerHTML = '';
      return;
    }

    grid.innerHTML = projects.map(renderProjectCard).join('');
    grid.querySelectorAll('[data-slug]').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `project-detail.html?slug=${card.dataset.slug}`;
      });
    });

    renderPagination(meta);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">⚠️</div>
      <h3>فشل في تحميل المشاريع</h3>
      <p>${err.message}</p>
    </div>`;
  }
}

function renderProjectCard(p) {
  const image = p.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80';
  const price = p.price_start ? formatCurrency(p.price_start) : 'السعر عند الطلب';

  return `
    <div class="project-card" data-slug="${p.slug}">
      <div class="project-card-image">
        <img src="${image}" alt="${p.name}" loading="lazy" />
        <div class="project-card-image-overlay"></div>
        <div class="project-card-badges">
          <span class="badge ${getStatusBadge(p.status)}">${translateStatus(p.status)}</span>
          <span class="badge ${getTypeBadge(p.type)}">${translateType(p.type)}</span>
        </div>
      </div>
      <div class="project-card-body">
        <div class="project-card-company">${p.company?.name || ''}</div>
        <div class="project-card-title">${p.name}</div>
        <div class="project-card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${p.location}
        </div>
        <div class="d-flex justify-between align-center">
          <div class="project-card-price">${price} <span>يبدأ من</span></div>
          ${p.units_count ? `<span class="badge badge-info">${p.units_count} وحدات</span>` : ''}
        </div>
      </div>
    </div>`;
}

function renderPagination(meta) {
  const div = document.getElementById('pagination');
  if (meta.last_page <= 1) { div.innerHTML = ''; return; }

  let html = '';
  html += `<button class="page-btn" ${meta.current_page === 1 ? 'disabled' : ''} data-page="${meta.current_page - 1}">‹</button>`;

  for (let i = 1; i <= meta.last_page; i++) {
    if (i === meta.current_page) {
      html += `<button class="page-btn active">${i}</button>`;
    } else if (i === 1 || i === meta.last_page || Math.abs(i - meta.current_page) <= 2) {
      html += `<button class="page-btn" data-page="${i}">${i}</button>`;
    } else if (Math.abs(i - meta.current_page) === 3) {
      html += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
    }
  }

  html += `<button class="page-btn" ${meta.current_page === meta.last_page ? 'disabled' : ''} data-page="${meta.current_page + 1}">›</button>`;
  div.innerHTML = html;

  div.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = +btn.dataset.page;
      loadProjects(currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

const collectFilters = () => ({
  search:     document.getElementById('filterSearch').value.trim(),
  type:       document.getElementById('filterType').value,
  status:     document.getElementById('filterStatus').value,
  company_id: document.getElementById('filterCompany').value,
  location:   document.getElementById('filterLocation').value.trim(),
  price_max:  document.getElementById('filterPrice').value,
});

document.getElementById('applyFilters')?.addEventListener('click', () => {
  currentFilters = collectFilters();
  currentPage    = 1;
  loadProjects(1);
});

document.getElementById('clearFilters')?.addEventListener('click', () => {
  document.getElementById('filterSearch').value   = '';
  document.getElementById('filterType').value     = '';
  document.getElementById('filterStatus').value   = '';
  document.getElementById('filterCompany').value  = '';
  document.getElementById('filterLocation').value = '';
  document.getElementById('filterPrice').value    = '';
  currentFilters = {};
  currentPage    = 1;
  loadProjects(1);
});

const debouncedSearch = debounce(() => {
  currentFilters = collectFilters();
  loadProjects(1);
}, 500);
document.getElementById('filterSearch')?.addEventListener('input', debouncedSearch);

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navMenu').classList.toggle('open');
});

initFromUrl();
loadCompanies();
loadProjects(1);
