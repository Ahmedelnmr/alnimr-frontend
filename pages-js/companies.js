import { api } from '../services/api.js';

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navMenu').classList.toggle('open');
});

async function loadCompanies() {
  const container = document.getElementById('companiesGrid');

  try {
    const companies = await api.get('/companies');

    if (!companies.length) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🏢</div><h3>لا يوجد مطورين حالياً</h3></div>';
      return;
    }

    container.innerHTML = companies.map(c => {
      const cover = c.cover_image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80';
      const logoHtml = c.logo
        ? `<img src="${c.logo}" alt="${c.name}" class="company-logo" />`
        : `<div class="company-logo" style="display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;color:var(--color-navy)">${c.name.charAt(0)}</div>`;

      return `
        <div class="company-card" onclick="window.location.href='company-detail.html?id=${c.id}'">
          <div class="company-card-cover"><img src="${cover}" loading="lazy" /></div>
          <div class="company-card-body">
            ${logoHtml}
            <div class="company-name">${c.name}</div>
            <div class="company-desc">${c.description || 'شركة تطوير عقاري رائدة في مصر.'}</div>
            <div class="company-meta">
              <span><strong>${c.projects_count || 0}</strong> مشاريع</span>
              <span style="color:var(--color-gold)">عرض التفاصيل ←</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">⚠️</div><h3>فشل التحميل</h3><p>${err.message}</p></div>`;
  }
}

loadCompanies();
