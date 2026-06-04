// ==================== THEME MANAGER ====================
const THEME_KEY = 'app-theme';

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'light') {
    html.classList.add('light-mode');
  } else {
    html.classList.remove('light-mode');
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const html = document.documentElement;
  const isLight = html.classList.contains('light-mode');
  applyTheme(isLight ? 'dark' : 'light');
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  const isLight = document.documentElement.classList.contains('light-mode');
  btn.textContent = isLight ? '☀️' : '🌙';
}

function createThemeToggle() {
  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.className = 'theme-toggle';
  const isLight = document.documentElement.classList.contains('light-mode');
  btn.innerHTML = isLight ? '☀️' : '🌙';
  btn.onclick = toggleTheme;
  btn.title = isLight ? 'Chế độ tối' : 'Chế độ sáng';
  document.body.appendChild(btn);
}

// Initialize theme immediately (before DOMContentLoaded to prevent FOUC)
initTheme();

document.addEventListener('DOMContentLoaded', () => {
  createThemeToggle();
  updateThemeButton();
});