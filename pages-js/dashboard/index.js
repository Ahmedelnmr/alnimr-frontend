import { renderDashboardLayout } from '../../components/dashboard-layout.js';
import { api } from '../../services/api.js';
import { translateStatus, translateType } from '../../utils/helpers.js';

renderDashboardLayout('الرئيسية');

async function loadStats() {
  try {
    const stats = await api.get('/dashboard/stats');
    
    document.getElementById('statCompanies').textContent = stats.total_companies;
    document.getElementById('statProjects').textContent  = stats.total_projects;
    document.getElementById('statUnits').textContent     = stats.total_units;
    document.getElementById('statAvailable').textContent = stats.units_available;

    // Translate keys before passing to chart
    const statusData = {};
    for (const [k, v] of Object.entries(stats.projects_by_status)) statusData[translateStatus(k)] = v;
    
    const typeData = {};
    for (const [k, v] of Object.entries(stats.projects_by_type)) typeData[translateType(k)] = v;

    renderBarChart('chartStatus', statusData, stats.total_projects);
    renderBarChart('chartType', typeData, stats.total_projects);
  } catch (err) {
    console.error('Failed to load stats', err);
  }
}

function renderBarChart(containerId, dataObj, total) {
  const container = document.getElementById(containerId);
  if (!container || !dataObj) return;

  const html = Object.entries(dataObj).map(([key, count]) => {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.9rem;">
          <span>${key}</span>
          <span style="font-weight:600; direction:ltr;">${percent}% (${count})</span>
        </div>
        <div style="height:8px;background:#EDF2F7;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${percent}%;background:var(--color-gold);border-radius:4px;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html || '<div class="text-muted">لا توجد بيانات متاحة</div>';
}

loadStats();
