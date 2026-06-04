// ==================== CONFIG ====================
const API_URL = window.location.origin;

// ==================== DATA ====================
let currentYear = 1;
let gradesByYear = { 1: [], 2: [], 3: [], 4: [] };
let academicYear = localStorage.getItem('academicYear') || '2025-2026';

// ==================== LOGIN CHECK ====================
function checkLogin() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) { window.location.href = 'login.html'; return false; }
  return true;
}

function getCurrentUserData() {
  const data = localStorage.getItem('currentUserData');
  return data ? JSON.parse(data) : null;
}

function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentUserData');
  window.location.href = 'login.html';
}

// ==================== LOAD / SAVE (từ SERVER) ====================
async function loadData() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 giây timeout

    const res = await fetch(`${API_URL}/api/grades/${encodeURIComponent(currentUser)}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (data.success) {
      gradesByYear = data.grades;
    }
  } catch (e) {
    console.error('Lỗi load điểm:', e);
  }
}

function saveData() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return;

  fetch(`${API_URL}/api/grades/${encodeURIComponent(currentUser)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gradesByYear })
  }).catch(e => console.error('Lỗi lưu điểm:', e));
}

// ==================== GRADE UTILS ====================
function getGradeLetter(score) {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  if (score >= 5.5) return 'C';
  if (score >= 4.0) return 'D';
  return 'F';
}

function getGrade4(score) {
  if (score >= 8.5) return 4.0;
  if (score >= 7.0) return 3.0;
  if (score >= 5.5) return 2.0;
  if (score >= 4.0) return 1.0;
  return 0;
}

function getClassification(gpa4) {
  if (gpa4 >= 3.60) return { text: 'Xuất sắc', cls: 'xuat-sac' };
  if (gpa4 >= 3.20) return { text: 'Giỏi', cls: 'gioi' };
  if (gpa4 >= 2.50) return { text: 'Khá', cls: 'kha' };
  if (gpa4 >= 2.30) return { text: 'TB khá', cls: 'tb-kha' };
  if (gpa4 >= 2.00) return { text: 'Trung bình', cls: 'tb' };
  if (gpa4 >= 1.50) return { text: 'TB yếu', cls: 'tb-yeu' };
  if (gpa4 >= 1.00) return { text: 'Yếu', cls: 'yeu' };
  return { text: 'Kém', cls: 'kem' };
}

// ==================== TAB SYSTEM ====================
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');

  const yearSelector = document.querySelector('.year-selector');
  if (tabName === 'bangdiem') {
    yearSelector.style.display = 'flex';
  } else {
    yearSelector.style.display = 'none';
  }
}

function switchYear(year) {
  currentYear = year;
  document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-year="${year}"]`).classList.add('active');
  renderGradeTable();
}

// ==================== BẢNG ĐIỂM ====================
function renderGradeTable() {
  const tbody = document.getElementById('grade-tbody');
  const grades = gradesByYear[currentYear];
  const yearNames = { 1: 'Nhất', 2: 'Hai', 3: 'Ba', 4: 'Bốn' };
  const titleEl = document.getElementById('grade-title');

  titleEl.textContent = `Chi tiết – Năm ${yearNames[currentYear]} (${academicYear})`;

  let totalWeighted10 = 0, totalWeighted4 = 0, totalCredits = 0;
  let failCount = 0, passCredits = 0;

  tbody.innerHTML = '';

  if (grades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">Chưa có dữ liệu cho năm này</td></tr>';
    document.getElementById('gpa10-val').textContent = '0.00';
    document.getElementById('gpa4-val').textContent = '0.00';
    document.getElementById('gpa10-desc').textContent = '0 môn';
    document.getElementById('gpa4-desc').textContent = 'Xếp loại: -';
    document.getElementById('tc-val').textContent = '0';
    document.getElementById('tc-desc').textContent = 'TC';
    document.getElementById('fail-val').textContent = '0';
    document.getElementById('fail-desc').textContent = '-';
    return;
  }

  grades.forEach((g, idx) => {
    const letter = g.isGDTC ? (g.score >= 5.0 ? 'P' : 'F') : getGradeLetter(g.score);
    const pass = g.isGDTC ? g.score >= 5.0 : g.score >= 4.0;

    if (!g.isGDTC) {
      const g4 = getGrade4(g.score);
      totalWeighted10 += g.score * g.credits;
      totalWeighted4 += g4 * g.credits;
      totalCredits += g.credits;
      if (!pass) failCount++;
      else passCredits += g.credits;
    }

    const badgeCls = g.isGDTC ? (pass ? 'C' : 'F') : letter;

    tbody.innerHTML += `<tr>
      <td><input type="text" class="edit-input" value="${g.code}" onchange="updateGradeData(${currentYear}, ${idx}, 'code', this.value)" style="width:80px;"></td>
      <td><input type="text" class="edit-input" value="${g.name}" onchange="updateGradeData(${currentYear}, ${idx}, 'name', this.value)"></td>
      <td><input type="number" class="edit-input" value="${g.credits}" min="1" max="4" onchange="updateGradeData(${currentYear}, ${idx}, 'credits', parseInt(this.value)); renderGradeTable();" style="width:50px;"></td>
      <td><input type="number" class="edit-input" value="${g.score}" min="0" max="10" step="0.1" onchange="updateGradeData(${currentYear}, ${idx}, 'score', parseFloat(this.value)); renderGradeTable();" style="width:60px;"></td>
      <td><span class="grade-badge ${badgeCls}">${letter}</span></td>
      <td><span class="result-icon ${pass ? 'result-pass' : 'result-fail'}">${pass ? '✓' : '✗'}</span></td>
      <td><button class="delete-row-btn" onclick="deleteSubject(${currentYear}, ${idx})">🗑️</button></td>
    </tr>`;
  });

  const gpa10 = totalCredits > 0 ? (totalWeighted10 / totalCredits) : 0;
  const gpa4 = totalCredits > 0 ? (totalWeighted4 / totalCredits) : 0;
  const cls = getClassification(gpa4);

  let totalPassCredits = 0;
  let allFailCount = 0;
  Object.values(gradesByYear).forEach(yearGrades => {
    yearGrades.forEach(g => {
      if (!g.isGDTC) {
        const pass = g.score >= 4.0;
        if (pass) totalPassCredits += g.credits;
        else allFailCount++;
      }
    });
  });

  document.getElementById('gpa10-val').textContent = gpa10.toFixed(2);
  document.getElementById('gpa4-val').textContent = gpa4.toFixed(2);
  document.getElementById('gpa10-desc').textContent = `${grades.filter(g => !g.isGDTC).length} môn`;
  document.getElementById('gpa4-desc').textContent = `Xếp loại: ${cls.text}`;
  document.getElementById('tc-val').textContent = totalPassCredits;
  document.getElementById('tc-desc').textContent = 'TC Tích Lũy';
  document.getElementById('fail-val').textContent = allFailCount;
  document.getElementById('fail-desc').textContent = grades.filter(g => !g.isGDTC && getGradeLetter(g.score) === 'F').map(g => g.code).join(', ') || '-';
}

function updateGradeData(year, idx, field, value) {
  gradesByYear[year][idx][field] = value;
  saveData();
}

function deleteSubject(year, idx) {
  gradesByYear[year].splice(idx, 1);
  saveData();
  renderGradeTable();
}

function addSubjectToYear() {
  gradesByYear[currentYear].push({ code: '', name: '', credits: 3, score: 0, isGDTC: false });
  saveData();
  renderGradeTable();
}

// ==================== TÍNH GPA ====================
let calcSubjects = [];

function renderCalcSubjects() {
  const container = document.getElementById('calc-subjects');
  container.innerHTML = '';
  calcSubjects.forEach((s, i) => {
    container.innerHTML += `
    <div class="subject-card" data-index="${i}">
      <button class="remove-btn" onclick="removeSubject(${i})">✕</button>
      <div class="subject-name">
        <input type="text" value="${s.name}" placeholder="Tên môn học..." onchange="calcSubjects[${i}].name=this.value">
      </div>
      <div class="subject-row">
        <div class="field-group">
          <label>Điểm (0-10)</label>
          <input type="number" id="score-${i}" min="0" max="10" step="0.1" placeholder="VD: 8.5">
        </div>
        <div class="field-group">
          <label>Tín chỉ</label>
          <div class="credit-btns">
            ${[1,2,3,4].map(c => `<button class="credit-btn${s.credits===c?' active':''}" onclick="setCredit(${i},${c})">${c}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  });
}

function setCredit(idx, val) {
  calcSubjects[idx].credits = val;
  renderCalcSubjects();
}

function removeSubject(idx) {
  calcSubjects.splice(idx, 1);
  renderCalcSubjects();
}

function addSubject() {
  calcSubjects.push({ name: '', credits: 3 });
  renderCalcSubjects();
}

function calculateGPA() {
  let total10 = 0, total4 = 0, totalC = 0;

  const grades = gradesByYear[currentYear];
  grades.forEach(g => {
    if (!g.isGDTC) {
      total10 += g.score * g.credits;
      total4 += getGrade4(g.score) * g.credits;
      totalC += g.credits;
    }
  });

  let valid = true;
  calcSubjects.forEach((s, i) => {
    const input = document.getElementById(`score-${i}`);
    const score = parseFloat(input?.value);
    if (isNaN(score) || score < 0 || score > 10) { valid = false; return; }
    total10 += score * s.credits;
    total4 += getGrade4(score) * s.credits;
    totalC += s.credits;
  });

  if (!valid || totalC === 0) {
    alert('Vui lòng nhập điểm hợp lệ (0-10) cho tất cả các môn!');
    return;
  }

  const gpa10 = total10 / totalC;
  const gpa4 = total4 / totalC;
  const cls = getClassification(gpa4);

  const resultDiv = document.getElementById('gpa-result');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <h3>Kết quả dự kiến (cộng dồn ${totalC} TC)</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;">
      <div>
        <div style="color:var(--text-muted);font-size:12px;margin-bottom:4px;">GPA HỆ 10</div>
        <div class="gpa-val" style="color:var(--accent-blue)">${gpa10.toFixed(2)}</div>
      </div>
      <div>
        <div style="color:var(--text-muted);font-size:12px;margin-bottom:4px;">GPA HỆ 4</div>
        <div class="gpa-val" style="color:var(--accent-cyan)">${gpa4.toFixed(2)}</div>
      </div>
    </div>
    <div class="gpa-class class-label ${cls.cls}" style="margin-top:10px;font-size:16px;font-weight:700;">Xếp loại: ${cls.text}</div>
  `;
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function updateQuickCalc() {
  const score = parseFloat(document.getElementById('quick-score').value);
  const gradeDiv = document.getElementById('quick-grade');
  const scaleDiv = document.getElementById('quick-scale');

  if (isNaN(score) || score < 0 || score > 10) {
    gradeDiv.textContent = '-';
    gradeDiv.style.color = 'var(--text-muted)';
    scaleDiv.textContent = '0.0';
    scaleDiv.style.color = 'var(--accent-purple)';
    return;
  }

  const letter = getGradeLetter(score);
  const scale4 = getGrade4(score);
  const colorMap = { 'A': 'var(--grade-a)', 'B': 'var(--grade-b)', 'C': 'var(--grade-c)', 'D': 'var(--grade-d)', 'F': 'var(--grade-f)' };

  gradeDiv.textContent = letter;
  gradeDiv.style.color = colorMap[letter];
  scaleDiv.textContent = scale4.toFixed(1);
  scaleDiv.style.color = colorMap[letter];
}

// ==================== CHATBOT ====================
const knowledgeBase = {
  thangDiem: `Thang điểm TLU:\n• 8.5 - 10.0 → A (4.0)\n• 7.0 - 8.4 → B (3.0)\n• 5.5 - 6.9 → C (2.0)\n• 4.0 - 5.4 → D (1.0)\n• Dưới 4.0 → F (0)\n• HP GDTC: ≥ 5.0 = Đạt (P), < 5.0 = Không đạt`,
  xepLoai: `Xếp loại học lực theo GPA hệ 4:\n• Xuất sắc: 3.60 - 4.00\n• Giỏi: 3.20 - 3.59\n• Khá: 2.50 - 3.19\n• TB khá: 2.30 - 2.49\n• Trung bình: 2.00 - 2.29\n• TB yếu: 1.50 - 1.99\n• Yếu: 1.00 - 1.49\n• Kém: Dưới 1.00`,
  congThuc: `Công thức tính GPA:\nA = Σ(aᵢ × xᵢ) / Σ(xᵢ)\nTrong đó:\n• A: Điểm trung bình chung\n• aᵢ: Điểm học phần thứ i\n• xᵢ: Số tín chỉ học phần thứ i`,
  hocLai: `Quy định học lại:\n• Môn F vẫn tính vào GPA (điểm hệ 4 = 0)\n• Không có thi lại, nếu không đạt phải HỌC LẠI\n• Khi học lại: lấy điểm CAO NHẤT\n• Học lại từ lần 2 trở đi: đóng 100% học phí\n• Môn B, C, D được đăng ký học cải thiện điểm`,
  canhBao: `Cảnh báo học tập:\n• Tổng TC môn F tích lũy vượt quá 24 TC → Bị cảnh báo kết quả học tập`,
  thoiGian: `Khung thời gian học:\nSÁNG: Tiết 1-6 (7:00-12:25)\nCHIỀU: Tiết 7-12 (12:55-18:20)\nTỐI: Tiết 13-15 (18:50-21:30)`,
};

function findAnswer(question) {
  const q = question.toLowerCase();
  if (/thang điểm|điểm chữ|a b c d f/.test(q)) return knowledgeBase.thangDiem;
  if (/xếp loại|xuất sắc|giỏi|khá|trung bình|kém|yếu/.test(q)) return knowledgeBase.xepLoai;
  if (/công thức|tính gpa|cách tính|trung bình chung/.test(q)) return knowledgeBase.congThuc;
  if (/học lại|thi lại|điểm f|môn f|cải thiện|không đạt/.test(q)) return knowledgeBase.hocLai;
  if (/cảnh báo|24 tc/.test(q)) return knowledgeBase.canhBao;
  if (/thời gian|giờ học|tiết|lịch học/.test(q)) return knowledgeBase.thoiGian;
  if (/gpa/.test(q)) return knowledgeBase.congThuc + '\n\n' + knowledgeBase.xepLoai;
  return `Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể hỏi về:\n• "Thang điểm"\n• "Xếp loại"\n• "Công thức tính GPA"\n• "Học lại"\n• "Cảnh báo học tập"\n• "Thời gian học"`;
}

let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('chat-window');
  const btn = document.getElementById('chat-toggle');
  win.classList.toggle('open', chatOpen);
  btn.innerHTML = chatOpen ? '✕' : '💬';
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML += `<div class="msg user">${escapeHtml(text)}</div>`;
  input.value = '';

  setTimeout(() => {
    const answer = findAnswer(text);
    msgs.innerHTML += `<div class="msg bot">${answer.replace(/\n/g, '<br>')}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 400);

  msgs.scrollTop = msgs.scrollHeight;
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ==================== CHỈNH SỬA NĂM HỌC ====================
function editYearAcademic() {
  const newYear = prompt('Nhập năm học (VD: 2026-2027):', academicYear);
  if (newYear && newYear.trim()) {
    academicYear = newYear.trim();
    localStorage.setItem('academicYear', academicYear);
    document.getElementById('year-display').textContent = academicYear;
    renderGradeTable();
  }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkLogin()) return;

  const userData = getCurrentUserData();
  if (userData) {
    document.getElementById('user-info').textContent = `${userData.name} · MSV: ${userData.msv} · `;
    const yearSpan = document.getElementById('year-display');
    yearSpan.textContent = academicYear;
    yearSpan.style.cursor = 'pointer';
    yearSpan.style.textDecoration = 'underline';
    document.getElementById('logout-btn').style.display = 'inline-block';
  }

  try {
    await loadData();
  } catch (e) {
    console.error('Init error:', e);
  } finally {
    renderGradeTable();
    renderCalcSubjects();
    hideAppLoader(); // Luôn tắt loader dù lỗi hay không
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
});

function hideAppLoader() {
  const loader = document.getElementById('app-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 800);
    }, 300);
  }
}