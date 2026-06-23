import { api } from '../services/api.js';
import { formatCurrency, getStatusBadge, getTypeBadge, translateStatus, translateType, getParam } from '../utils/helpers.js';

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navMenu').classList.toggle('open');
});

async function loadCompany() {
  const id = getParam('id');
  const container = document.getElementById('companyContainer');

  if (!id) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>الشركة غير موجودة</h3></div>';
    return;
  }

  try {
    const company = await api.get(`/companies/${id}`);
    document.title = `${company.name} — النمر للعقارات`;
    renderCompany(company);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>فشل في تحميل بيانات الشركة</h3><p>${err.message}</p></div>`;
  }
}

function renderCompany(c) {
  const container = document.getElementById('companyContainer');
  const cover = c.cover_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80';
  const logoHtml = c.logo
    ? `<img src="${c.logo}" alt="${c.name}" class="company-logo-large" />`
    : `<div class="company-logo-large" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:3rem;color:var(--color-navy)">${c.name.charAt(0)}</div>`;

  let projectsHtml = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🏗️</div><h3>لا توجد مشاريع مضافة بعد</h3></div>';
  
  if (c.projects && c.projects.length) {
    projectsHtml = c.projects.map(p => {
      const pCover = p.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80';
      const price = p.price_start ? formatCurrency(p.price_start) : 'السعر عند الطلب';
      return `
        <div class="project-card" onclick="window.location.href='project-detail.html?slug=${p.slug}'">
          <div class="project-card-image">
            <img src="${pCover}" loading="lazy" />
            <div class="project-card-image-overlay"></div>
            <div class="project-card-badges">
              <span class="badge ${getStatusBadge(p.status)}">${translateStatus(p.status)}</span>
              <span class="badge ${getTypeBadge(p.type)}">${translateType(p.type)}</span>
            </div>
          </div>
          <div class="project-card-body">
            <div class="project-card-title">${p.name}</div>
            <div class="project-card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${p.location}
            </div>
            <div class="project-card-price">${price} <span>يبدأ من</span></div>
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <header class="company-hero">
      <img src="${cover}" class="company-hero-bg" alt="${c.name}" />
      <div class="company-hero-overlay"></div>
      <div class="container company-hero-content">
        ${logoHtml}
        <div>
          <h1>${c.name}</h1>
          <div class="company-hero-meta">
            <span>${c.projects?.length || 0} مشاريع</span>
            ${c.website ? `<a href="${c.website}" target="_blank" style="text-decoration:underline; direction:ltr;">زيارة الموقع الإلكتروني</a>` : ''}
          </div>
        </div>
      </div>
    </header>

    <div class="company-content container">
      ${c.description ? `<div class="company-desc">${c.description}</div>` : ''}

      <div class="section-header" style="text-align:right; margin-bottom:32px">
        <h2>مشاريع ${c.name}</h2>
        <div class="gold-divider" style="margin: 16px 0 0 0; margin-right: 0; margin-left: auto;"></div>
      </div>

      <div class="grid grid-3">
        ${projectsHtml}
      </div>
    </div>
  `;
}

loadCompany();
