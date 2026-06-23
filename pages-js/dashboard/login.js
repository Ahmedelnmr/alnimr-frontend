import { auth } from '../../services/auth.js';
import { toastError } from '../../services/toast.js';

if (auth.isAuthenticated()) {
  window.location.href = 'index.html';
}

const form = document.getElementById('loginForm');
const btn  = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner spinner-sm" style="margin-left: 8px;"></div> جاري تسجيل الدخول...';
  
  try {
    await auth.login(email, password);
    const redirect = auth.getRedirect();
    auth.clearRedirect();
    window.location.href = redirect;
  } catch (err) {
    toastError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
    btn.disabled = false;
    btn.innerHTML = 'تسجيل الدخول';
  }
});
