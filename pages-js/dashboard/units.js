import { renderDashboardLayout } from '../../components/dashboard-layout.js';
import { api } from '../../services/api.js';
import { toastSuccess, toastError } from '../../services/toast.js';
import { getStatusBadge, translateStatus, translateType } from '../../utils/helpers.js';

renderDashboardLayout('العقارات والوحدات');

let projects = [];
let units = [];
const modal = document.getElementById('unitModal');

async function init() {
  await loadProjects();
  setupFilter();
  if (projects.length > 0) {
    document.getElementById('filterProject').value = projects[0].id;
    await loadUnits(projects[0].id);
  }
}

async function loadProjects() {
  try {
    const data = await api.get('/projects', { per_page: 100 });
    projects = data.data || [];
    
    const filterSel = document.getElementById('filterProject');
    const formSel = document.getElementById('project_id');
    
    const options = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    filterSel.innerHTML = `<option value="">جميع المشاريع (اختر مشروعاً)</option>${options}`;
    formSel.innerHTML = `<option value="">اختر المشروع...</option>${options}`;
  } catch (err) {
    toastError('فشل تحميل المشاريع');
  }
}

function setupFilter() {
  document.getElementById('filterProject').addEventListener('change', (e) => {
    loadUnits(e.target.value);
  });
}

async function loadUnits(projectId) {
  const tbody = document.querySelector('#unitsTable tbody');
  
  if (!projectId) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:40px">يرجى اختيار مشروع من القائمة بالأعلى لعرض العقارات.</td></tr>';
    units = [];
    return;
  }

  try {
    units = await api.get(`/projects/${projectId}/units`);

    if (!units.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:40px">لا يوجد عقارات / وحدات مضافة في هذا المشروع.</td></tr>';
      return;
    }

    tbody.innerHTML = units.map(u => `
      <tr>
        <td class="fw-medium">${u.project?.name || '-'}</td>
        <td>${translateType(u.unit_type)}</td>
        <td>${u.area ? u.area + ' م²' : '-'}</td>
        <td class="fw-bold">${u.price ? Number(u.price).toLocaleString('ar-EG') + ' ج.م' : '-'}</td>
        <td><span class="badge ${getStatusBadge(u.status)}">${translateStatus(u.status)}</span></td>
        <td style="text-align:left">
          <button class="btn btn-ghost btn-sm edit-btn" data-id="${u.id}">تعديل</button>
          <button class="btn btn-ghost btn-sm text-danger delete-btn" data-id="${u.id}">حذف</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
    tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => deleteUnit(btn.dataset.id)));

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger" style="padding:40px">فشل تحميل العقارات.</td></tr>';
  }
}

function openModal(title = 'إضافة عقار / وحدة') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('unitForm').reset();
  document.getElementById('unitId').value = '';
  
  const currentProject = document.getElementById('filterProject').value;
  if (currentProject) {
    document.getElementById('project_id').value = currentProject;
  }

  modal.classList.add('active');
}

function openEditModal(id) {
  const u = units.find(x => x.id == id);
  if (!u) return;

  openModal('تعديل العقار');
  document.getElementById('unitId').value = u.id;
  document.getElementById('project_id').value = u.project_id || '';
  document.getElementById('unit_type').value = u.unit_type || 'Apartment';
  document.getElementById('status').value = u.status || 'Available';
  document.getElementById('area').value = u.area || '';
  document.getElementById('rooms').value = u.rooms || '';
  document.getElementById('price').value = u.price || '';
}

function closeModal() {
  modal.classList.remove('active');
}

document.getElementById('saveUnit').addEventListener('click', async () => {
  const id = document.getElementById('unitId').value;
  const btn = document.getElementById('saveUnit');
  
  const payload = {
    project_id: document.getElementById('project_id').value,
    unit_type: document.getElementById('unit_type').value,
    status: document.getElementById('status').value,
    area: document.getElementById('area').value || null,
    rooms: document.getElementById('rooms').value || null,
    price: document.getElementById('price').value || null,
  };

  if (!payload.project_id || !payload.unit_type || !payload.status) { 
    toastError('المشروع، النوع، والحالة مطلوبة'); 
    return; 
  }

  btn.disabled = true;
  btn.textContent = 'جاري الحفظ...';

  try {
    if (id) {
      await api.put(`/units/${id}`, payload);
      toastSuccess('تم تحديث العقار');
    } else {
      await api.post('/units', payload);
      toastSuccess('تم إضافة العقار بنجاح');
    }
    closeModal();
    
    // Automatically select the project in filter if changed
    document.getElementById('filterProject').value = payload.project_id;
    loadUnits(payload.project_id);
  } catch (err) {
    toastError(err.message || 'فشل الحفظ');
  } finally {
    btn.disabled = false;
    btn.textContent = 'حفظ العقار';
  }
});

async function deleteUnit(id) {
  if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) return;
  
  try {
    await api.delete(`/units/${id}`);
    toastSuccess('تم الحذف بنجاح');
    loadUnits(document.getElementById('filterProject').value);
  } catch (err) {
    toastError('فشل الحذف');
  }
}

document.getElementById('openCreateModal').addEventListener('click', () => openModal());
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

init();
