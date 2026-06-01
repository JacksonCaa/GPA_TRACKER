# GPA Tracker - Hướng Dẫn Cài Đặt

## 📋 Yêu Cầu
- Node.js (v14+)
- npm
- Gmail Account

## 🚀 Cài Đặt

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Cấu Hình Gmail

**Bước 1: Bật 2-Factor Authentication**
- Đăng nhập vào Gmail: https://myaccount.google.com
- Chọn "Security" ở menu bên trái
- Bật "2-Step Verification"

**Bước 2: Tạo App Password**
- Vào https://myaccount.google.com/apppasswords
- Chọn "Mail" và "Windows Computer"
- Google sẽ tạo password 16 ký tự
- **Copy password này**

**Bước 3: Tạo File .env**
Tạo file `.env` trong thư mục GPA-TRACKER với nội dung:
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
PORT=3000
```

**Ví dụ:**
```
GMAIL_USER=john.doe@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop
PORT=3000
```

### 3. Chạy Server

```bash
npm start
```

Bạn sẽ thấy:
```
🚀 Server chạy tại http://localhost:3000
📁 Data lưu trong: users.json và grades.json
```

### 4. Mở App
- Mở `login.html` trong trình duyệt
- **Server phải đang chạy** để email và lưu dữ liệu hoạt động

## 🔐 Tính Năng Bảo Mật

### Mật khẩu phải chứa:
- ✓ Ít nhất **8 ký tự**
- ✓ Ít nhất **1 chữ hoa** (A-Z)
- ✓ Ít nhất **1 số** (0-9)
- ✓ Ít nhất **1 ký tự đặc biệt** (!@#$%^&*)

**Ví dụ mật khẩu hợp lệ:** `MyPassword123!`

### Xác thực Email:
- Mã xác thực gửi về email người dùng
- Mã có hiệu lực **10 phút**
- Phải nhập đúng mã mới tiến tới bước tiếp theo

### CAPTCHA:
- Giải phép tính đơn giản
- Chỉ xuất hiện ở bước xác nhận đăng ký

## 💾 Lưu Trữ Dữ Liệu

### Tài khoản
- Lưu trong file **`users.json`** trên server
- Mỗi email = 1 tài khoản
- Dữ liệu **không mất** khi tắt/bật lại server

### Dữ liệu Điểm
- Lưu trong file **`grades.json`** trên server
- Lưu riêng cho từng user theo email
- Dữ liệu **không mất** khi đổi trình duyệt hoặc máy tính
- Tự động tạo khi đăng ký tài khoản mới

> ⚠️ Hai file `users.json` và `grades.json` tự động tạo ra khi chạy server lần đầu. Không xóa hai file này!

## 📞 Khắc Phục Sự Cố

### Lỗi: "Lỗi gửi email"
**Nguyên nhân:**
- Server chưa chạy
- GMAIL_USER hoặc GMAIL_PASS sai
- App Password chưa được tạo

**Giải pháp:**
- Kiểm tra server chạy: mở `http://localhost:3000` trên trình duyệt
- Kiểm tra file `.env` đúng format
- Tạo lại App Password trên Gmail

### Lỗi: "Mã xác thực đã hết hạn"
- Mã có hiệu lực 10 phút
- Hãy yêu cầu gửi lại mã

### Lỗi: "Lỗi kết nối server"
- Server chưa chạy → chạy `npm start`
- Kiểm tra PORT trong `.env` có phải `3000` không

### Dữ liệu không lưu
- Kiểm tra server có đang chạy không
- Kiểm tra file `grades.json` có tồn tại trong thư mục project không

## 📧 Test Email

1. Vào tab `Đăng ký`
2. Nhập thông tin + email Gmail của bạn
3. Bấm "Tiếp tục" → server tự động gửi mã về Gmail
4. Kiểm tra hộp thư Gmail → tìm email từ `your-email@gmail.com`
5. Copy mã xác thực → Dán vào form → Hoàn tất

## 🔄 Quên Mật Khẩu

1. Click "Quên mật khẩu?" ở trang login
2. Nhập email đã đăng ký
3. Kiểm tra email để lấy mã xác thực
4. Nhập mã + mật khẩu mới (phải đủ mạnh)
5. Mật khẩu được cập nhật trên server ngay lập tức

## 📝 Ghi Chú

- **Không dùng tài khoản chính Gmail để test** - Tạo email test riêng
- **Mã xác thực là ngẫu nhiên** - Mỗi lần gửi lại sẽ khác
- **Không mã hóa mật khẩu** - Chỉ demo, trong production phải hash password
- **Dữ liệu lưu trên server** - Không mất khi xóa cache trình duyệt

## 🎯 Tính Năng Chính

✅ Đăng ký bằng Email + Xác thực OTP
✅ Đăng nhập bằng MSV hoặc Email
✅ Quên mật khẩu qua Email
✅ Validation mật khẩu mạnh
✅ Lưu trữ dữ liệu điểm trên server (không mất khi đổi máy/trình duyệt)
✅ Tài khoản lưu trên server (users.json)

---

**Phiên bản:** 2.0.0
**Tác giả:** GPA Tracker Team
**Cập nhật:** May 2026
