import { renderDashboardLayout } from '../../components/dashboard-layout.js';
import { api } from '../../services/api.js';
import { uploadToCloudinary } from '../../services/cloudinary.js';
import { toastSuccess, toastError } from '../../services/toast.js';
import { getStatusBadge, getTypeBadge, translateStatus, translateType } from '../../utils/helpers.js';

renderDashboardLayout('المشاريع');

let projects = [];
let companies = [];
let currentPage = 1;
let currentFeatures = [];
const modal = document.getElementById('projectModal');

async function init() {
  await loadCompanies();
  await loadProjects();
  setupTagsInput();
  setupUpload();
}

async function loadCompanies() {
  try {
    companies = await api.get('/companies');
    const filterSel = document.getElementById('filterCompany');
    const formSel = document.getElementById('company_id');
    
    const options = companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    filterSel.innerHTML = `<option value="">جميع المطورين</option>${options}`;
    formSel.innerHTML = `<option value="">اختر المطور...</option>${options}`;
    
    filterSel.addEventListener('change', () => { currentPage = 1; loadProjects(); });
  } catch (err) {
    toastError('فشل تحميل المطورين');
  }
}

async function loadProjects() {
  const tbody = document.querySelector('#projectsTable tbody');
  const company_id = document.getElementById('filterCompany').value;
  
  try {
    const filters = { page: currentPage };
    if (company_id) filters.company_id = company_id;

    const data = await api.get('/projects', filters);
    projects = data.data || [];
    const meta = data.meta || {};

    if (!projects.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:40px">لم يتم العثور على مشاريع.</td></tr>';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = projects.map(p => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:12px">
            <img src="${p.cover_image || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" />
            <span class="fw-medium">${p.name}</span>
          </div>
        </td>
        <td>${p.company?.name || '-'}</td>
        <td>
          <span class="badge ${getTypeBadge(p.type)} mb-4" style="display:block;width:fit-content">${translateType(p.type)}</span>
          <span class="badge ${getStatusBadge(p.status)}">${translateStatus(p.status)}</span>
        </td>
        <td>${p.location}</td>
        <td style="text-align:left">
          <button class="btn btn-ghost btn-sm edit-btn" data-id="${p.id}">تعديل</button>
          <button class="btn btn-ghost btn-sm text-danger delete-btn" data-id="${p.id}">حذف</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
    tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteProject(btn.dataset.id)));

    renderPagination(meta);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger" style="padding:40px">فشل تحميل المشاريع.</td></tr>';
  }
}

function renderPagination(meta) {
  const div = document.getElementById('pagination');
  if (meta.last_page <= 1) { div.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= meta.last_page; i++) {
    html += `<button class="page-btn ${i === meta.current_page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  div.innerHTML = html;

  div.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = +btn.dataset.page;
      loadProjects();
    });
  });
}

function openModal(title = 'إضافة مشروع') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  
  document.getElementById('coverPreview').style.display = 'none';
  document.getElementById('coverUrl').value = '';

  currentFeatures = [];
  renderTags();

  modal.classList.add('active');
}

function openEditModal(id) {
  const p = projects.find(x => x.id == id);
  if (!p) return;

  openModal('تعديل المشروع');
  document.getElementById('projectId').value = p.id;
  document.getElementById('name').value = p.name || '';
  document.getElementById('company_id').value = p.company_id || '';
  document.getElementById('type').value = p.type || 'Residential';
  document.getElementById('status').value = p.status || 'Launch';
  document.getElementById('location').value = p.location || '';
  document.getElementById('description').value = p.description || '';
  document.getElementById('price_start').value = p.price_start || '';
  document.getElementById('payment_plan').value = p.payment_plan || '';
  document.getElementById('map_url').value = p.map_url || '';

  if (p.cover_image) {
    document.getElementById('coverUrl').value = p.cover_image;
    document.getElementById('coverImg').src = p.cover_image;
    document.getElementById('coverPreview').style.display = 'block';
  }

  currentFeatures = (p.features || []).map(f => f.feature);
  renderTags();
}

function closeModal() {
  modal.classList.remove('active');
}

function setupTagsInput() {
  const input = document.querySelector('.tags-input-field');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      if (val && !currentFeatures.includes(val)) {
        currentFeatures.push(val);
        renderTags();
        input.value = '';
      }
    }
  });
}

function renderTags() {
  const container = document.getElementById('featuresInput');
  container.querySelectorAll('.tag-item').forEach(el => el.remove());
  
  const input = container.querySelector('.tags-input-field');
  currentFeatures.forEach((f, index) => {
    const tag = document.createElement('div');
    tag.className = 'tag-item';
    tag.innerHTML = `<span class="tag-item-remove" data-index="${index}">✕</span><span>${f}</span>`;
    container.insertBefore(tag, input);
  });

  container.querySelectorAll('.tag-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentFeatures.splice(e.target.dataset.index, 1);
      renderTags();
    });
  });
}

function setupUpload() {
  const zone = document.getElementById('coverUploadZone');
  const fileInput = document.getElementById('coverFile');
  const removeBtn = document.getElementById('removeCover');

  zone.addEventListener('click', (e) => {
    if (e.target.closest('.upload-thumb-remove')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    zone.querySelector('p').textContent = 'جاري الرفع...';
    try {
      const url = await uploadToCloudinary(file, 'projects');
      document.getElementById('coverUrl').value = url;
      document.getElementById('coverImg').src = url;
      document.getElementById('coverPreview').style.display = 'block';
      toastSuccess('تم رفع الغلاف بنجاح');
    } catch (err) {
      toastError('فشل الرفع');
    } finally {
      zone.querySelector('p').textContent = 'اضغط أو اسحب الغلاف هنا';
      fileInput.value = '';
    }
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('coverPreview').style.display = 'none';
    document.getElementById('coverUrl').value = '';
  });
}

document.getElementById('saveProject').addEventListener('click', async () => {
  const id = document.getElementById('projectId').value;
  const btn = document.getElementById('saveProject');
  
  const payload = {
    name: document.getElementById('name').value,
    company_id: document.getElementById('company_id').value,
    type: document.getElementById('type').value,
    status: document.getElementById('status').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    price_start: document.getElementById('price_start').value || null,
    payment_plan: document.getElementById('payment_plan').value,
    map_url: document.getElementById('map_url').value,
    cover_image: document.getElementById('coverUrl').value,
    features: currentFeatures
  };

  if (!payload.name || !payload.company_id || !payload.location) { 
    toastError('اسم المشروع، المطور والموقع مطلوبة'); 
    return; 
  }

  btn.disabled = true;
  btn.textContent = 'جاري الحفظ...';

  try {
    if (id) {
      await api.put(`/projects/${id}`, payload);
      toastSuccess('تم تحديث المشروع');
    } else {
      await api.post('/projects', payload);
      toastSuccess('تم إضافة المشروع بنجاح');
    }
    closeModal();
    loadProjects();
  } catch (err) {
    toastError(err.message || 'فشل الحفظ');
  } finally {
    btn.disabled = false;
    btn.textContent = 'حفظ المشروع';
  }
});

async function deleteProject(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع الوحدات والصور المرتبطة به.')) return;
  
  try {
    await api.delete(`/projects/${id}`);
    toastSuccess('تم حذف المشروع');
    loadProjects();
  } catch (err) {
    toastError('فشل الحذف');
  }
}

document.getElementById('openCreateModal').addEventListener('click', () => openModal());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

init();
