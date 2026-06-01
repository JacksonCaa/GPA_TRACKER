# 📋 Admin Panel - Hướng Dẫn Sử Dụng

## 🔐 Truy Cập Admin Panel
- **URL:** `http://localhost:3000/admin.html`
- **Mật khẩu mặc định:** `admin2025`

---

## 📥 1. Import Dữ Liệu (Import Data)

### Cách 1: Dán trực tiếp JSON
1. Vào tab **"📥 Import Dữ Liệu"**
2. Dán dữ liệu JSON vào textarea
3. Nhấn **"📥 Import"**

### Format JSON chuẩn:
```json
[
  {
    "email": "user1@gmail.com",
    "msv": "255128192",
    "name": "Nguyễn Văn A",
    "password": "Pass@123456"
  },
  {
    "email": "user2@gmail.com",
    "msv": "255128193",
    "name": "Trần Thị B",
    "password": "Pass@123456"
  }
]
```

### Cách 2: Tải file JSON
1. Vào tab **"📥 Import Dữ Liệu"**
2. Chọn file JSON
3. Nhấn **"📥 Import"**

### ⚠️ Lưu ý:
- **Email phải duy nhất** - không được trùng với email đã tồn tại
- **Mật khẩu phải an toàn**: ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt
- Ví dụ mật khẩu hợp lệ: `MyPassword123!`

---

## 📤 2. Export Dữ Liệu (Export Data)

### Export JSON
1. Vào tab **"📤 Export Dữ Liệu"**
2. Nhấn **"📤 Export Tất Cả"**
3. File JSON tự động tải xuống

### Export CSV
1. Vào tab **"📤 Export Dữ Liệu"**
2. Nhấn **"📊 Export CSV"**
3. File CSV tự động tải xuống

---

## 📋 3. Quản Lý Sinh Viên (Manage Users)

### Xem danh sách:
1. Vào tab **"📋 Quản Lý Sinh Viên"**
2. Bảng hiển thị tất cả sinh viên

### Tìm kiếm:
- Gõ email hoặc MSV vào ô tìm kiếm
- Danh sách sẽ tự động lọc

### Xóa sinh viên:
1. Tìm sinh viên cần xóa
2. Nhấn nút **"Xóa"**
3. Xác nhận lại
4. Dữ liệu sinh viên sẽ bị xóa

---

## 📊 Ví Dụ Thực Tế

### Thêm 5 sinh viên một lần:
```json
[
  {
    "email": "hoa.nguyen@tlu.edu.vn",
    "msv": "2551281132",
    "name": "Nguyễn Thị Hoa",
    "password": "SecurePass123!"
  },
  {
    "email": "hung.tran@tlu.edu.vn",
    "msv": "2551281133",
    "name": "Trần Văn Hùng",
    "password": "SecurePass456!"
  },
  {
    "email": "linh.pham@tlu.edu.vn",
    "msv": "2551281134",
    "name": "Phạm Thúy Linh",
    "password": "SecurePass789!"
  },
  {
    "email": "khanh.do@tlu.edu.vn",
    "msv": "2551281135",
    "name": "Đỗ Minh Khánh",
    "password": "SecurePass101!"
  },
  {
    "email": "tam.hoang@tlu.edu.vn",
    "msv": "2551281136",
    "name": "Hoàng Duy Tâm",
    "password": "SecurePass202!"
  }
]
```

---

## ❓ FAQ

**Q: Email đã tồn tại sẽ như thế nào?**  
A: Import sẽ bỏ qua email đó (không ghi đè).

**Q: Mất dữ liệu khi xóa sinh viên?**  
A: Có! Toàn bộ dữ liệu điểm số cũng sẽ bị xóa. Hãy export trước nếu cần lưu.

**Q: Có thể thay đổi mật khẩu admin không?**  
A: Hiện tại là `admin2025`, thay đổi được trong file `admin.html` (dòng cuối cùng của hàm `checkAdmin()`).

---

## 🔒 Bảo Mật

- ⚠️ **KHÔNG chia sẻ** Admin Panel URL với sinh viên
- ⚠️ **ĐỔI mật khẩu** nếu có người biết
- 💾 **BACKUP dữ liệu** định kỳ bằng Export

---

**Cập nhật lần cuối:** 2026-06-01
