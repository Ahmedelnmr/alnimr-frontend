import { api } from '../services/api.js';
import { formatCurrency, getStatusBadge, getTypeBadge, translateStatus, translateType, truncate } from '../utils/helpers.js';

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.remove('navbar-transparent');
    navbar.classList.add('navbar-scrolled');
  } else {
    navbar.classList.add('navbar-transparent');
    navbar.classList.remove('navbar-scrolled');
  }
});

const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');
hamburger?.addEventListener('click', () => navMenu.classList.toggle('open'));

document.getElementById('heroSearchBtn')?.addEventListener('click', () => {
  const search = document.getElementById('heroSearch').value;
  const type   = document.getElementById('heroType').value;
  const status = document.getElementById('heroStatus').value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (type)   params.set('type', type);
  if (status) params.set('status', status);
  window.location.href = `pages/projects.html?${params.toString()}`;
});

document.getElementById('heroSearch')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('heroSearchBtn').click();
});

async function loadStats() {
  try {
    const [companies, projects] = await Promise.all([
      api.get('/companies'),
      api.get('/projects', { per_page: 1 }),
    ]);

    animateCount('statCompanies', companies.length || 0);
    animateCount('statProjects', projects.meta?.total || 0);
    animateCount('statUnits', (projects.meta?.total || 0) * 3);
  } catch (_) {}
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start.toLocaleString('ar-EG');
    if (start >= target) clearInterval(timer);
  }, 30);
}

async function loadFeaturedProjects() {
  const container = document.getElementById('featuredProjects');
  try {
    const data = await api.get('/projects', { per_page: 6 });
    const projects = data.data || [];

    if (!projects.length) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🏗️</div><h3>قريباً</h3><p>ستظهر المشاريع هنا فور إضافتها.</p></div>';
      return;
    }

    container.innerHTML = projects.map(renderProjectCard).join('');
    container.querySelectorAll('[data-slug]').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `pages/project-detail.html?slug=${card.dataset.slug}`;
      });
    });
  } catch (_) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>فشل التحميل</h3><p>يرجى تحديث الصفحة.</p></div>';
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
        </div>
      </div>
    </div>`;
}

async function loadCompanies() {
  const container = document.getElementById('companiesGrid');
  try {
    const companies = await api.get('/companies');

    if (!companies.length) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🏢</div><h3>لا يوجد مطورين بعد</h3></div>';
      return;
    }

    container.innerHTML = companies.slice(0, 4).map(c => `
      <div class="company-card" onclick="window.location.href='pages/company-detail.html?id=${c.id}'">
        <div class="company-card-cover">
          <img src="${c.cover_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80'}" alt="${c.name}" loading="lazy" />
        </div>
        <div class="company-card-body">
          ${c.logo ? `<img src="${c.logo}" alt="${c.name}" class="company-logo" />` : `<div class="company-logo" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;color:var(--color-navy)">${c.name.charAt(0)}</div>`}
          <div class="company-name">${c.name}</div>
          <div class="company-projects">${c.projects_count || 0} مشاريع</div>
        </div>
      </div>
    `).join('');
  } catch (_) {
    container.innerHTML = '';
  }
}

loadStats();
loadFeaturedProjects();
loadCompanies();
