import { api } from '../services/api.js';
import { formatCurrency, getStatusBadge, getTypeBadge, translateStatus, translateType, getParam } from '../utils/helpers.js';

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

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navMenu').classList.toggle('open');
});

async function loadProject() {
  const slug = getParam('slug');
  const container = document.getElementById('projectContainer');

  if (!slug) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>المشروع غير موجود</h3></div>';
    return;
  }

  try {
    const project = await api.get(`/projects/${slug}`);
    document.title = `${project.name} — النمر للعقارات`;
    renderProject(project);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>فشل في تحميل المشروع</h3><p>${err.message}</p></div>`;
  }
}

function renderProject(p) {
  const container = document.getElementById('projectContainer');
  const cover = p.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80';
  const price = p.price_start ? formatCurrency(p.price_start) : 'السعر عند الطلب';
  const companyLogo = p.company?.logo || 'https://via.placeholder.com/100';

  let featuresHtml = '';
  if (p.features && p.features.length) {
    featuresHtml = `
      <div class="content-section">
        <h2>المميزات والمرافق</h2>
        <ul class="features-list">
          ${p.features.map(f => `<li>${f.feature}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let galleryHtml = '';
  if (p.media && p.media.length) {
    const images = p.media.filter(m => m.type === 'image');
    if (images.length) {
      galleryHtml = `
        <div class="content-section">
          <h2>معرض الصور</h2>
          <div class="gallery-grid">
            ${images.map(img => `
              <div class="gallery-item" onclick="openLightbox('${img.url}')">
                <img src="${img.url}" loading="lazy" />
                <div class="gallery-item-overlay">🔍</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  let unitsHtml = '';
  if (p.units && p.units.length) {
    unitsHtml = `
      <div class="content-section">
        <h2>الوحدات المتاحة</h2>
        <div class="table-container">
          <table class="table">
            <thead><tr><th>النوع</th><th>المساحة</th><th>الغرف</th><th>السعر</th><th>الحالة</th></tr></thead>
            <tbody>
              ${p.units.map(u => `
                <tr>
                  <td class="fw-medium">${translateType(u.unit_type)}</td>
                  <td>${u.area ? u.area + ' م²' : '-'}</td>
                  <td>${u.rooms || '-'}</td>
                  <td class="fw-bold">${u.price ? formatCurrency(u.price) : '-'}</td>
                  <td><span class="badge ${getStatusBadge(u.status)}">${translateStatus(u.status)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <header class="project-hero">
      <img src="${cover}" class="project-hero-bg" alt="${p.name}" />
      <div class="project-hero-overlay"></div>
      <div class="container project-hero-content">
        <div class="project-hero-badges">
          <span class="badge ${getStatusBadge(p.status)}">${translateStatus(p.status)}</span>
          <span class="badge ${getTypeBadge(p.type)}">${translateType(p.type)}</span>
        </div>
        <h1>${p.name}</h1>
        <div class="project-hero-meta">
          <div class="d-flex align-center gap-8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${p.location}
          </div>
          <div class="project-developer" onclick="window.location.href='company-detail.html?id=${p.company?.id}'">
            <img src="${companyLogo}" alt="${p.company?.name}" />
            <span>${p.company?.name}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="container">
      <div class="key-info-bar">
        <div class="key-info-item">
          <div class="key-info-label">يبدأ من</div>
          <div class="key-info-val">${price}</div>
        </div>
        <div class="key-info-item">
          <div class="key-info-label">نوع العقار</div>
          <div class="key-info-val">${translateType(p.type)}</div>
        </div>
        <div class="key-info-item">
          <div class="key-info-label">الحالة</div>
          <div class="key-info-val">${translateStatus(p.status)}</div>
        </div>
      </div>

      <div class="project-content content-grid">
        <div class="main-content">
          <div class="content-section">
            <h2>نظرة عامة</h2>
            <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); white-space: pre-wrap;">${p.description || 'لا يوجد وصف متاح.'}</div>
          </div>

          ${featuresHtml}
          ${galleryHtml}
          ${unitsHtml}

          ${p.payment_plan ? `
            <div class="payment-plan">
              <h3>خطة الدفع</h3>
              <p style="white-space: pre-wrap; font-size: 1.1rem; line-height: 1.6;">${p.payment_plan}</p>
            </div>
          ` : ''}

          ${p.map_url ? `
            <div class="content-section">
              <h2>الموقع على الخريطة</h2>
              <div class="map-container">
                <iframe src="${p.map_url}"></iframe>
              </div>
            </div>
          ` : ''}
        </div>

        <aside class="sidebar" style="position:static; width:100%; background:transparent; padding:0; height:auto;">
          <div class="contact-card">
            <h3>مهتم بهذا المشروع؟</h3>
            <form id="interestForm" onsubmit="event.preventDefault(); alert('تم إرسال طلبك! سيتواصل معك فريقنا قريباً.');">
              <div class="form-group">
                <label class="form-label">الاسم الكامل <span>*</span></label>
                <input type="text" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">رقم الهاتف <span>*</span></label>
                <input type="tel" class="form-control" required style="direction:ltr; text-align:left;"/>
              </div>
              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" class="form-control" style="direction:ltr; text-align:left;"/>
              </div>
              <div class="form-group">
                <label class="form-label">رسالتك</label>
                <textarea class="form-control" placeholder="أرغب في معرفة المزيد من التفاصيل حول ${p.name}..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-full" style="justify-content:center;padding:16px">طلب تفاصيل</button>
            </form>
          </div>
        </aside>
      </div>
    </div>

    <!-- Lightbox -->
    <div id="lightbox" class="lightbox" onclick="closeLightbox(event)">
      <div class="lightbox-close" onclick="closeLightbox(event)">×</div>
      <img id="lightboxImg" src="" alt="Gallery Preview" />
    </div>
  `;
}

window.openLightbox = function(url) {
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightbox').classList.add('active');
};
window.closeLightbox = function(e) {
  if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) {
    document.getElementById('lightbox').classList.remove('active');
  }
};

loadProject();
