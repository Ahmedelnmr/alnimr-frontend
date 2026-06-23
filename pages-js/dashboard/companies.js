import { renderDashboardLayout } from '../../components/dashboard-layout.js';
import { api } from '../../services/api.js';
import { uploadToCloudinary } from '../../services/cloudinary.js';
import { toastSuccess, toastError } from '../../services/toast.js';

renderDashboardLayout('المطورين');

let companies = [];
const modal = document.getElementById('companyModal');

async function loadCompanies() {
  const tbody = document.querySelector('#companiesTable tbody');
  try {
    companies = await api.get('/companies');
    
    if (!companies.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:40px">لم يتم العثور على شركات.</td></tr>';
      return;
    }

    tbody.innerHTML = companies.map(c => `
      <tr>
        <td>
          <img src="${c.logo || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" />
        </td>
        <td class="fw-medium">${c.name}</td>
        <td>${c.website ? `<a href="${c.website}" target="_blank" style="color:var(--color-info); direction:ltr; display:inline-block;">رابط ↗</a>` : '-'}</td>
        <td><span class="badge badge-navy">${c.projects_count || 0}</span></td>
        <td style="text-align:left">
          <button class="btn btn-ghost btn-sm edit-btn" data-id="${c.id}">تعديل</button>
          <button class="btn btn-ghost btn-sm text-danger delete-btn" data-id="${c.id}">حذف</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
    tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteCompany(btn.dataset.id)));

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger" style="padding:40px">فشل في تحميل الشركات.</td></tr>';
  }
}

function openModal(title = 'إضافة شركة') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('companyForm').reset();
  document.getElementById('companyId').value = '';
  
  document.getElementById('logoPreview').style.display = 'none';
  document.getElementById('logoUrl').value = '';
  document.getElementById('coverPreview').style.display = 'none';
  document.getElementById('coverUrl').value = '';

  modal.classList.add('active');
}

function openEditModal(id) {
  const c = companies.find(x => x.id == id);
  if (!c) return;

  openModal('تعديل بيانات الشركة');
  document.getElementById('companyId').value = c.id;
  document.getElementById('name').value = c.name || '';
  document.getElementById('description').value = c.description || '';
  document.getElementById('website').value = c.website || '';
  document.getElementById('video_url').value = c.video_url || '';

  if (c.logo) setPreview('logo', c.logo);
  if (c.cover_image) setPreview('cover', c.cover_image);
}

function closeModal() {
  modal.classList.remove('active');
}

function setupUpload(type) {
  const zone = document.getElementById(`${type}UploadZone`);
  const fileInput = document.getElementById(`${type}File`);
  const removeBtn = document.getElementById(`remove${type.charAt(0).toUpperCase() + type.slice(1)}`);

  zone.addEventListener('click', (e) => {
    if (e.target.closest('.upload-thumb-remove')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    zone.querySelector('p').textContent = 'جاري الرفع...';
    try {
      const url = await uploadToCloudinary(file, 'companies');
      setPreview(type, url);
      toastSuccess('تم رفع الصورة بنجاح');
    } catch (err) {
      toastError('فشل الرفع');
    } finally {
      zone.querySelector('p').textContent = `اضغط أو اسحب الصورة هنا`;
      fileInput.value = '';
    }
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById(`${type}Preview`).style.display = 'none';
    document.getElementById(`${type}Url`).value = '';
  });
}

function setPreview(type, url) {
  document.getElementById(`${type}Url`).value = url;
  document.getElementById(`${type}Img`).src = url;
  document.getElementById(`${type}Preview`).style.display = 'block';
}

document.getElementById('saveCompany').addEventListener('click', async () => {
  const id = document.getElementById('companyId').value;
  const btn = document.getElementById('saveCompany');
  
  const payload = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    website: document.getElementById('website').value,
    video_url: document.getElementById('video_url').value,
    logo: document.getElementById('logoUrl').value,
    cover_image: document.getElementById('coverUrl').value,
  };

  if (!payload.name) { toastError('اسم الشركة مطلوب'); return; }

  btn.disabled = true;
  btn.textContent = 'جاري الحفظ...';

  try {
    if (id) {
      await api.put(`/companies/${id}`, payload);
      toastSuccess('تم تحديث الشركة');
    } else {
      await api.post('/companies', payload);
      toastSuccess('تم إضافة الشركة بنجاح');
    }
    closeModal();
    loadCompanies();
  } catch (err) {
    toastError(err.message || 'فشل الحفظ');
  } finally {
    btn.disabled = false;
    btn.textContent = 'حفظ الشركة';
  }
});

async function deleteCompany(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الشركة؟ سيتم حذف جميع المشاريع المرتبطة بها.')) return;
  
  try {
    await api.delete(`/companies/${id}`);
    toastSuccess('تم حذف الشركة');
    loadCompanies();
  } catch (err) {
    toastError('فشل في الحذف');
  }
}

document.getElementById('openCreateModal').addEventListener('click', () => openModal());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

setupUpload('logo');
setupUpload('cover');

loadCompanies();
