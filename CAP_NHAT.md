## 🎉 Cập Nhật Hoàn Tất - GPA Tracker

### ✅ Những gì vừa được thêm/sửa:

#### 1️⃣ **Sửa Placeholder Đăng Nhập**
- **Trước:** `26612/1194` (kiểu MSV cũ)
- **Sau:** `255128192` (số sinh viên ẩn như bạn yêu cầu)
- **Nơi thay đổi:** `login.html` dòng 315

---

#### 2️⃣ **Chỉnh Sửa Năm Học Vĩnh Viễn**
- **Tính năng:** Nhấp vào năm học ở phía trên (ví dụ "2025-2026") để chỉnh sửa
- **Lưu trữ:** Được lưu vĩnh viễn trong máy (localStorage)
- **Cách thay đổi:**
  1. Vào trang chính (`index.html`)
  2. Nhấp vào năm học (có gạch chân) ở phía trên cùng
  3. Nhập năm học mới (ví dụ: `2026-2027`)
  4. Bấm OK → Dữ liệu được lưu

---

#### 3️⃣ **Kiểm Tra Email Trùng Lặp**
- **Quy tắc:** Nếu email đã tồn tại → **KHÔNG được đăng ký**
- **Thông báo:** `❌ Email đã tồn tại`
- **Phía server:** Kiểm tra tự động (file `server.js`)

---

#### 4️⃣ **Admin Panel - Quản Lý Dữ Liệu** 🆕
Tạo trang **admin.html** để cập nhật dữ liệu dễ dàng:

**📍 URL:** `http://localhost:3000/admin.html`  
**🔐 Mật khẩu:** `admin2025`

### 🎯 3 Tính Năng Chính:

#### 📥 **Import Dữ Liệu** (Thêm sinh viên hàng loạt)
- Dán JSON hoặc tải file JSON
- Format:
```json
[
  {
    "email": "user@gmail.com",
    "msv": "255128192",
    "name": "Tên Sinh Viên",
    "password": "Pass@123456"
  }
]
```

#### 📤 **Export Dữ Liệu** (Sao lưu dữ liệu)
- Export JSON (có preview)
- Export CSV (Excel)
- File tự động tải về máy

#### 📋 **Quản Lý Sinh Viên**
- Xem danh sách tất cả sinh viên
- Tìm kiếm theo email/MSV
- Xóa sinh viên (cảnh báo trước)

---

### 📝 Lưu Ý Quan Trọng

⚠️ **Email phải duy nhất** - không thể trùng lặp
⚠️ **Mật khẩu phải mạnh:** ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt  
✅ **Ví dụ mật khẩu hợp lệ:** `MyPassword123!`

---

### 🚀 Cách Bật Web

**Bước 1:** Mở Command Prompt  
**Bước 2:** Gõ:
```
cd d:\GPA-TRACKER
npm start
```

**Bước 3:** Truy cập:
- **Trang chính:** `http://localhost:3000`
- **Đăng nhập:** `http://localhost:3000/login.html`
- **Admin Panel:** `http://localhost:3000/admin.html` (mật khẩu: `admin2025`)

---

### 📂 Các File Được Sửa/Tạo

✏️ **Sửa:**
- `login.html` - Đổi placeholder MSV
- `index.html` - Thêm chức năng chỉnh sửa năm học
- `app.js` - Thêm hàm `editYearAcademic()`
- `server.js` - Thêm API admin (`/api/admin/users`)

🆕 **Tạo:**
- `admin.html` - Admin Panel (quản lý dữ liệu)
- `ADMIN_GUIDE.md` - Hướng dẫn chi tiết sử dụng Admin

---

**✨ Hoàn tất! Bạn có thể test ngay bây giờ.**
