# Bitcoin Analyzer - Real-time

Phần mềm phân tích Bitcoin theo thời gian thực với dự đoán xu hướng tăng/giảm.

## Tính năng

✅ **Tự động cập nhật** mỗi 30 giây
✅ **Biểu đồ giá** real-time (60 phút gần nhất)
✅ **Chỉ số kỹ thuật** đầy đủ: RSI, MA, EMA, MACD, Bollinger Bands
✅ **Dự đoán xu hướng** với xác suất tăng/giảm
✅ **Tín hiệu giao dịch** MUA/BÁN/GIỮ
✅ **Responsive** - Hoạt động tốt trên mobile

## Hướng dẫn Deploy lên GitHub Pages

### Bước 1: Tạo GitHub Repository

1. Truy cập: https://github.com/new
2. Repository name: `bitcoin-analyzer` (hoặc tên bất kỳ)
3. Chọn **Public**
4. Nhấn **Create repository**

### Bước 2: Upload files

**Cách 1: Qua giao diện web**
1. Vào repository vừa tạo
2. Nhấn **Add file** → **Upload files**
3. Kéo thả 2 files: `index.html` và `app.js`
4. Nhấn **Commit changes**

**Cách 2: Qua Git (nếu có Git)**
```bash
git clone https://github.com/username/bitcoin-analyzer.git
cd bitcoin-analyzer
# Copy 2 files index.html và app.js vào đây
git add .
git commit -m "Initial commit"
git push
```

### Bước 3: Bật GitHub Pages

1. Vào repository
2. Nhấn **Settings** (⚙️)
3. Trong menu bên trái, nhấn **Pages**
4. Ở phần **Source**, chọn:
   - Branch: `main` (hoặc `master`)
   - Folder: `/ (root)`
5. Nhấn **Save**
6. Đợi 1-2 phút

### Bước 4: Truy cập

URL của bạn sẽ là:
```
https://username.github.io/bitcoin-analyzer/
```

(Thay `username` bằng tên GitHub của bạn)

## Cách sử dụng

1. Mở URL trên điện thoại/máy tính
2. App tự động tải dữ liệu và phân tích
3. Cập nhật tự động mỗi 30 giây
4. Không cần làm gì thêm!

## Lưu ý

- Cần kết nối Internet để lấy dữ liệu
- Dữ liệu từ CoinGecko API (miễn phí)
- Hoạt động tốt nhất trên trình duyệt hiện đại

## Support

Nếu gặp vấn đề, kiểm tra:
- Đã bật GitHub Pages đúng branch chưa
- URL có đúng định dạng không
- Đợi 2-3 phút sau khi deploy

---

Made with ❤️ for Bitcoin traders
