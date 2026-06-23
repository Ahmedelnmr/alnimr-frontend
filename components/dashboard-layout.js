/**
 * dashboard-layout.js — Shared layout for all dashboard pages
 */

import { auth } from '../services/auth.js';

export function renderDashboardLayout(title = 'لوحة التحكم') {
  if (!auth.requireAuth()) return;
  const user = auth.getUser();

  const sidebarHtml = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">النمر<span>للعقارات</span></div>
        <div class="sidebar-subtitle">نظام الإدارة</div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">نظرة عامة</div>
        <a href="/pages/dashboard/index.html" class="sidebar-link ${title === 'لوحة التحكم' ? 'active' : ''}">
          <span class="link-icon">📊</span> الرئيسية
        </a>
        
        <div class="sidebar-section-label">الإدارة</div>
        <a href="/pages/dashboard/companies.html" class="sidebar-link ${title === 'المطورين' ? 'active' : ''}">
          <span class="link-icon">🏢</span> المطورين العقاريين
        </a>
        <a href="/pages/dashboard/projects.html" class="sidebar-link ${title === 'المشاريع' ? 'active' : ''}">
          <span class="link-icon">🏗️</span> إدارة المشاريع
        </a>
        <a href="/pages/dashboard/units.html" class="sidebar-link ${title === 'العقارات والوحدات' ? 'active' : ''}">
          <span class="link-icon">🚪</span> العقارات والوحدات
        </a>
        <a href="/pages/dashboard/media.html" class="sidebar-link ${title === 'صور المشاريع' ? 'active' : ''}">
          <span class="link-icon">🖼️</span> معرض الصور
        </a>
        
        <div class="sidebar-section-label">النظام</div>
        <a href="/index.html" target="_blank" class="sidebar-link">
          <span class="link-icon">🌐</span> عرض الموقع
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${user?.name?.charAt(0) || 'A'}</div>
          <div class="sidebar-user-info">
            <div class="user-name">${user?.name || 'مدير النظام'}</div>
            <div class="user-role">${user?.role || 'مسؤول'}</div>
          </div>
        </div>
      </div>
    </aside>
  `;

  const topbarHtml = `
    <header class="topbar">
      <div class="topbar-title">${title}</div>
      <div class="topbar-actions">
        <button class="btn btn-ghost" id="logoutBtn" style="color:var(--color-danger)">تسجيل الخروج</button>
      </div>
    </header>
  `;

  const mobileToggleHtml = `
    <div class="sidebar-toggle" id="sidebarToggle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </div>
  `;

  const mainContent = document.body.innerHTML;
  
  document.body.innerHTML = `
    <div class="dashboard-layout">
      ${sidebarHtml}
      <main class="dashboard-main">
        ${topbarHtml}
        <div class="page-content">
          ${mainContent}
        </div>
      </main>
      ${mobileToggleHtml}
    </div>
  `;

  document.getElementById('logoutBtn')?.addEventListener('click', () => auth.logout());
  
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}
