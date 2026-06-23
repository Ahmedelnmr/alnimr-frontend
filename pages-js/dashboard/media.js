import { renderDashboardLayout } from '../../components/dashboard-layout.js';
import { api } from '../../services/api.js';
import { uploadToCloudinary } from '../../services/cloudinary.js';
import { toastSuccess, toastError } from '../../services/toast.js';

renderDashboardLayout('صور المشاريع');

let projects = [];
let currentProjectId = null;
const modal = document.getElementById('uploadModal');
const btnUpload = document.getElementById('openUploadModal');

async function init() {
  await loadProjects();
  setupFilter();
  setupUpload();
  
  if (projects.length > 0) {
    document.getElementById('filterProject').value = projects[0].id;
    await loadMedia(projects[0].id);
  }
}

async function loadProjects() {
  try {
    const data = await api.get('/projects', { per_page: 100 });
    projects = data.data || [];
    
    const filterSel = document.getElementById('filterProject');
    const options = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    filterSel.innerHTML = `<option value="">جميع المشاريع (اختر مشروعاً)</option>${options}`;
  } catch (err) {
    toastError('فشل تحميل المشاريع');
  }
}

function setupFilter() {
  document.getElementById('filterProject').addEventListener('change', (e) => {
    loadMedia(e.target.value);
  });
}

async function loadMedia(projectId) {
  const container = document.getElementById('galleryContainer');
  currentProjectId = projectId;
  
  if (!projectId) {
    container.innerHTML = '<div class="text-center text-muted" style="padding:40px">يرجى اختيار مشروع من القائمة بالأعلى.</div>';
    btnUpload.disabled = true;
    return;
  }

  btnUpload.disabled = false;
  container.innerHTML = '<div class="text-center text-muted" style="padding:40px">جاري تحميل الصور...</div>';

  try {
    const media = await api.get(`/projects/${projectId}/media`);

    if (!media.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🖼️</div><h3>لا يوجد صور</h3><p>اضغط على زر إضافة صور للبدء.</p></div>';
      return;
    }

    container.innerHTML = `
      <div class="gallery-grid">
        ${media.map(m => `
          <div class="gallery-card">
            ${m.type === 'video' 
              ? `<video src="${m.file_url}" controls style="width:100%;height:100%;object-fit:cover;"></video>` 
              : `<img src="${m.file_url}" loading="lazy" />`
            }
            <div class="gallery-card-overlay">
              <button class="btn btn-danger btn-sm delete-media-btn" data-id="${m.id}">حذف</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.delete-media-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteMedia(btn.dataset.id));
    });

  } catch (err) {
    container.innerHTML = '<div class="text-center text-danger" style="padding:40px">فشل تحميل الصور.</div>';
  }
}

function openModal() {
  if (!currentProjectId) return;
  const project = projects.find(p => p.id == currentProjectId);
  if (!project) return;

  document.getElementById('projectNameDisplay').value = project.name;
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

function setupUpload() {
  const zone = document.getElementById('mediaUploadZone');
  const fileInput = document.getElementById('mediaFile');

  zone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentProjectId) {
      toastError('يرجى اختيار المشروع أولاً');
      return;
    }

    zone.querySelector('p').textContent = 'جاري الرفع لمعالجة سحابية... يرجى الانتظار';
    try {
      // 1. Upload to Cloudinary
      const url = await uploadToCloudinary(file, 'projects/gallery');
      
      // 2. Save to database via API
      await api.post('/media', {
        model_type: 'project',
        model_id: currentProjectId,
        file_url: url,
        type: file.type.startsWith('video/') ? 'video' : 'image'
      });

      toastSuccess('تم إضافة الوسائط بنجاح');
      loadMedia(currentProjectId);
    } catch (err) {
      toastError(err.message || 'فشل الرفع');
    } finally {
      zone.querySelector('p').textContent = 'اضغط لاختيار الصور أو الفيديوهات أو اسحبها هنا';
      fileInput.value = '';
    }
  });
}

async function deleteMedia(id) {
  if (!confirm('هل أنت متأكد من حذف هذه الصورة نهائياً؟')) return;
  
  try {
    await api.delete(`/media/${id}`);
    toastSuccess('تم حذف الصورة');
    loadMedia(currentProjectId);
  } catch (err) {
    toastError('فشل الحذف');
  }
}

btnUpload.addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);

init();
