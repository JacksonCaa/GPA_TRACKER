const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ==================== DATABASE ====================
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set! Check your .env file.');
}

// Tạo connection mới cho mỗi query
async function query(text, params) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    await client.end();
  }
}

// Tạo bảng nếu chưa có
async function initDB() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        msv TEXT NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS grades (
        email TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'
      )
    `);
    console.log('✅ Database sẵn sàng!');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo database:', err.message);
  }
}

initDB();

// ==================== CREATE ADMIN ====================
async function createAdminIfNotExists() {
  try {
    const check = await query('SELECT email FROM users WHERE msv = $1', ['26092007']);
    if (check.rows.length === 0) {
      await query(
        'INSERT INTO users (email, msv, name, password) VALUES ($1, $2, $3, $4)',
        ['admin@icetech.local', '26092007', 'Administrator', 'ICETECH2K7@']
      );
      await query(
        'INSERT INTO grades (email, data) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        ['admin@icetech.local', JSON.stringify({ 1: [], 2: [], 3: [], 4: [] })]
      );
      console.log('✅ Tài khoản Admin đã được tạo! MSV: 26092007');
    }
  } catch (err) {
    console.error('Admin creation error:', err.message);
  }
}

createAdminIfNotExists();

// ==================== EMAIL ====================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const verificationCodes = {};

// Gửi mã xác thực
app.post('/api/send-verification', async (req, res) => {
  const { email, type } = req.body;
  if (!email) return res.status(400).json({ error: 'Email không hợp lệ' });

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  verificationCodes[email] = { code, timestamp: Date.now(), type };

  const subject = type === 'signup' ? 'Mã xác thực đăng ký ICE TECH' : 'Mã xác thực đặt lại mật khẩu';
  const message = type === 'signup'
    ? `Mã xác thực đăng ký của bạn là: <strong>${code}</strong><br><br>Mã này có hiệu lực trong 10 phút.`
    : `Mã xác thực đặt lại mật khẩu của bạn là: <strong>${code}</strong><br><br>Mã này có hiệu lực trong 10 phút.`;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#3b82f6;">ICE TECH</h2>
        <p>${message}</p>
        <p style="color:#999;font-size:12px;margin-top:20px;">Đây là email tự động. Vui lòng không trả lời.</p>
      </div>`
    });
    res.json({ success: true, message: 'Mã xác thực đã được gửi' });
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    res.status(500).json({ error: 'Lỗi gửi email. Kiểm tra cấu hình Gmail.' });
  }
});

// Xác minh mã
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!verificationCodes[email]) return res.status(400).json({ error: 'Email chưa được gửi mã' });

  const { code: storedCode, timestamp } = verificationCodes[email];
  if (Date.now() - timestamp > 10 * 60 * 1000) {
    delete verificationCodes[email];
    return res.status(400).json({ error: 'Mã xác thực đã hết hạn' });
  }
  if (code.toUpperCase() !== storedCode) return res.status(400).json({ error: 'Mã xác thực không đúng' });

  delete verificationCodes[email];
  res.json({ success: true });
});

// ==================== AUTH ====================
// Đăng ký
app.post('/api/register', async (req, res) => {
  const { msv, email, name, password } = req.body;
  if (!msv || !email || !name || !password) return res.status(400).json({ error: 'Thiếu thông tin' });

  try {
    const check = await query('SELECT email FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'Email đã tồn tại' });

    await query(
      'INSERT INTO users (email, msv, name, password) VALUES ($1, $2, $3, $4)',
      [email, msv, name, password]
    );
    await query(
      'INSERT INTO grades (email, data) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [email, JSON.stringify({ 1: [], 2: [], 3: [], 4: [] })]
    );

    res.json({ success: true, user: { msv, email, name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { input, password } = req.body;

  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 OR msv = $1',
      [input]
    );

    if (result.rows.length === 0) return res.status(400).json({ error: 'MSV hoặc Email không tồn tại' });

    const user = result.rows[0];
    if (user.password !== password) return res.status(400).json({ error: 'Mật khẩu không đúng' });

    res.json({ success: true, user: { msv: user.msv, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Đổi mật khẩu
app.post('/api/reset-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    await query('UPDATE users SET password = $1 WHERE email = $2', [password, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== GRADES ====================
app.get('/api/grades/:email', async (req, res) => {
  try {
    const result = await query('SELECT data FROM grades WHERE email = $1', [req.params.email]);
    const grades = result.rows.length > 0 ? result.rows[0].data : { 1: [], 2: [], 3: [], 4: [] };
    res.json({ success: true, grades });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/grades/:email', async (req, res) => {
  const { gradesByYear } = req.body;
  try {
    await query(
      'INSERT INTO grades (email, data) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET data = $2',
      [req.params.email, JSON.stringify(gradesByYear)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== ADMIN API ====================
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await query('SELECT email, msv, name, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/api/admin/users/:email', async (req, res) => {
  try {
    await query('DELETE FROM users WHERE email = $1', [req.params.email]);
    await query('DELETE FROM grades WHERE email = $1', [req.params.email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ==================== START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
