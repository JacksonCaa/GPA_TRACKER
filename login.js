// ==================== CONFIG ====================
const API_URL = window.location.origin;

let tempSignupData = null;
let tempResetData = null;
let currentCaptcha = null;

// ==================== COMMON ====================
function switchLoginTab(tab) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-toggle button').forEach(b => b.classList.remove('active'));

  if (tab === 'login') document.querySelectorAll('.tab-toggle button')[0].classList.add('active');
  else if (tab === 'signup') document.querySelectorAll('.tab-toggle button')[1].classList.add('active');

  document.getElementById(`${tab}-form`).classList.add('active');
  clearErrorMessages();

  if (tab === 'signup') showSignupStep(1);
  else if (tab === 'reset') showResetStep(1);
}

function clearErrorMessages() {
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.success-msg').forEach(el => el.classList.remove('show'));
}

function showError(formType, message) {
  const el = document.getElementById(`${formType}-error`);
  if (el) { el.textContent = message; el.classList.add('show'); }
}

function showSuccess(formType, message) {
  const el = document.getElementById(`${formType}-success`);
  if (el) { el.textContent = message; el.classList.add('show'); }
}

function generateCaptcha() {
  const a = Math.floor(Math.random() * 50) + 1;
  const b = Math.floor(Math.random() * 50) + 1;
  currentCaptcha = { a, b, answer: a + b };
  document.getElementById('captcha-question').textContent = `${a} + ${b} = ?`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  if (!/[A-Z]/.test(password)) errors.push('Phải chứa ít nhất 1 chữ hoa');
  if (!/[0-9]/.test(password)) errors.push('Phải chứa ít nhất 1 số');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Phải chứa ít nhất 1 ký tự đặc biệt');
  return errors;
}

// ==================== ĐĂNG KÝ ====================
function showSignupStep(step) {
  document.getElementById('signup-step1').classList.remove('active');
  document.getElementById('signup-step2').classList.remove('active');
  document.getElementById(`signup-step${step}`).classList.add('active');
  if (step === 2) {
    generateCaptcha();
    document.getElementById('signup-code').value = '';
    document.getElementById('captcha-answer').value = '';
  }
}

function backToSignupStep1() {
  showSignupStep(1);
  clearErrorMessages();
}

function handleSignupStep1(event) {
  event.preventDefault();

  const msv = document.getElementById('signup-msv').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const name = document.getElementById('signup-name').value.trim();
  const password = document.getElementById('signup-password').value;
  const passwordConfirm = document.getElementById('signup-password-confirm').value;

  if (!msv || !email || !name || !password || !passwordConfirm) {
    showError('signup', '❌ Vui lòng điền đầy đủ thông tin'); return;
  }
  if (!isValidEmail(email)) { showError('signup', '❌ Email không hợp lệ'); return; }

  const pwErrors = validatePassword(password);
  if (pwErrors.length > 0) { showError('signup', '❌ ' + pwErrors[0]); return; }
  if (password !== passwordConfirm) { showError('signup', '❌ Mật khẩu không khớp'); return; }

  tempSignupData = { msv, email, name, password };
  sendVerificationEmail(email, 'signup');
}

function handleSignupStep2(event) {
  event.preventDefault();

  const code = document.getElementById('signup-code').value.trim().toUpperCase();
  const captchaAnswer = parseInt(document.getElementById('captcha-answer').value);

  if (captchaAnswer !== currentCaptcha.answer) {
    showError('signup', '❌ CAPTCHA không đúng');
    generateCaptcha();
    document.getElementById('captcha-answer').value = '';
    return;
  }

  // Xác thực mã rồi đăng ký
  fetch(`${API_URL}/api/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tempSignupData.email, code })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) { showError('signup', '❌ ' + data.error); return; }

    // Tạo tài khoản trên server
    return fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempSignupData)
    });
  })
  .then(r => r && r.json())
  .then(data => {
    if (!data) return;
    if (data.error) { showError('signup', '❌ ' + data.error); return; }

    tempSignupData = null;
    showSuccess('signup', '✓ Đăng ký thành công!');
    setTimeout(() => switchLoginTab('login'), 1500);
  })
  .catch(() => showError('signup', '❌ Lỗi kết nối server'));
}

// ==================== QUÊN MẬT KHẨU ====================
function showResetStep(step) {
  document.getElementById('reset-step1').classList.remove('active');
  document.getElementById('reset-step2').classList.remove('active');
  document.getElementById(`reset-step${step}`).classList.add('active');
  if (step === 1) document.getElementById('reset-email').value = '';
}

function backToResetStep1() {
  showResetStep(1);
  clearErrorMessages();
}

function handleResetStep1(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email').value.trim();
  if (!isValidEmail(email)) { showError('reset', '❌ Email không hợp lệ'); return; }

  tempResetData = { email };
  document.getElementById('reset-email-display').textContent = email;
  sendVerificationEmail(email, 'reset');
}

function handleResetStep2(event) {
  event.preventDefault();
  const code = document.getElementById('reset-code').value.trim().toUpperCase();
  const password = document.getElementById('reset-password').value;
  const passwordConfirm = document.getElementById('reset-password-confirm').value;

  const pwErrors = validatePassword(password);
  if (pwErrors.length > 0) { showError('reset', '❌ ' + pwErrors[0]); return; }
  if (password !== passwordConfirm) { showError('reset', '❌ Mật khẩu không khớp'); return; }

  fetch(`${API_URL}/api/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tempResetData.email, code })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) { showError('reset', '❌ ' + data.error); return; }

    return fetch(`${API_URL}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: tempResetData.email, password })
    });
  })
  .then(r => r && r.json())
  .then(data => {
    if (!data) return;
    if (data.error) { showError('reset', '❌ ' + data.error); return; }

    tempResetData = null;
    showSuccess('reset', '✓ Mật khẩu đã được đặt lại!');
    setTimeout(() => switchLoginTab('login'), 1500);
  })
  .catch(() => showError('reset', '❌ Lỗi kết nối server'));
}

// ==================== EMAIL API ====================
function sendVerificationEmail(email, type) {
  fetch(`${API_URL}/api/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) { showError(type, '❌ ' + data.error); return; }
    if (type === 'signup') {
      document.getElementById('email-display').textContent = email;
      showSignupStep(2);
      showSuccess('signup', '✓ Mã xác thực đã được gửi!');
    } else {
      showResetStep(2);
      showSuccess('reset', '✓ Mã xác thực đã được gửi!');
    }
  })
  .catch(() => showError(type, '❌ Lỗi gửi email. Server có đang chạy không?'));
}

// ==================== ĐĂNG NHẬP ====================
function handleLogin(event) {
  event.preventDefault();
  const input = document.getElementById('login-msv').value.trim();
  const password = document.getElementById('login-password').value;

  fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) { showError('login', '❌ ' + data.error); return; }

    // Lưu session
    localStorage.setItem('currentUser', data.user.email);
    localStorage.setItem('currentUserData', JSON.stringify(data.user));
    window.location.href = 'index.html';
  })
  .catch(() => showError('login', '❌ Lỗi kết nối server'));
}

// ==================== CHECK LOGIN ====================
function initLoginSplash() {
  const splash = document.getElementById('splash-screen');
  const loginContainer = document.getElementById('login-container');
  if (!splash || !loginContainer) return;

  loginContainer.style.display = 'none';
  splash.classList.remove('hide');

  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => {
      splash.style.display = 'none';
      loginContainer.style.display = 'flex';
    }, 600);
  }, 1600);
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('login.html')) {
    if (localStorage.getItem('currentUser')) {
      window.location.href = 'index.html';
      return;
    }
    initLoginSplash();
  }
});
