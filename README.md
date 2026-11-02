# Pixel Factory Live — V1 (khung game + màn hình nhà xưởng)

Game 2D pixel art, tỷ lệ dọc 9:16, chủ đề công xưởng đóng gói hàng hóa.
Công nghệ: HTML, CSS, JavaScript, [Phaser 3](https://phaser.io/) (MIT).

## Phạm vi V1

Có:
- 4 công nhân ngồi ở 4 khu làm việc, góc nhìn ngang (side view)
- Bàn đóng gói, băng chuyền, thùng carton chạy trên băng chuyền
- Hoạt ảnh công nhân: vươn tay, ấn xuống dán băng keo, thu tay về, thân nhấp nhô khi chờ
- Bộ đếm sản phẩm và tiền công trên HUD
- Toàn bộ hình ảnh tự vẽ bằng code (không dùng ảnh bên ngoài)

Chưa có (để các giai đoạn sau): tích hợp TikTok LIVE, lưu dữ liệu, âm thanh, menu.

## Cấu trúc thư mục

```
pixel-factory-live/
├── index.html                  Trang chính, nạp Phaser + mã nguồn
├── css/
│   └── style.css               Toàn màn hình, khóa cuộn/zoom, giữ nét pixel
├── src/
│   ├── config.js               Mọi thông số chỉnh được (kích thước, tốc độ, tiền công, màu áo...)
│   ├── sprites.js              Sprite pixel art dạng ma trận ký tự + bảng màu
│   ├── main.js                 Khởi tạo Phaser (9:16, pixelArt, co giãn FIT)
│   ├── objects/
│   │   └── Station.js          Một khu làm việc: công nhân, bàn, băng chuyền, thùng carton
│   └── scenes/
│       ├── BootScene.js        Sinh texture từ code rồi chuyển sang FactoryScene
│       └── FactoryScene.js     Dựng 4 khu, HUD, chân trang, cộng điểm
└── README.md
```

## Chạy thử

Cần có Internet (Phaser nạp từ CDN jsDelivr).

- Cách nhanh: mở `index.html` bằng trình duyệt (các script là script thường nên mở trực tiếp file vẫn chạy).
- Hoặc chạy máy chủ cục bộ rồi mở bằng điện thoại cùng mạng Wi-Fi:
  ```bash
  python3 -m http.server 8080
  # mở http://<IP-máy-tính>:8080 trên điện thoại
  ```

## Đưa lên GitHub Pages để mở bằng điện thoại

1. Đẩy toàn bộ thư mục lên repository `trongvinhne/pixel-factory-live` (nhánh `main`).
2. Vào **Settings → Pages**, chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`.
3. Mở `https://trongvinhne.github.io/pixel-factory-live/` trên điện thoại.

## Tinh chỉnh nhanh (trong `src/config.js`)

| Muốn đổi | Sửa ở |
|---|---|
| Tiền công mỗi sản phẩm | `PAY_PER_ITEM` |
| Tốc độ băng chuyền | `BELT.speed` |
| Khoảng cách giữa các thùng | `BELT.spacing` |
| Tốc độ thao tác từng công nhân | `WORKERS[i].speed` |
| Màu áo, tóc, tường từng khu | `WORKERS[i]` |
| Thời gian vươn tay / ấn / thu tay | `PACK` |

## Ghi chú kỹ thuật

- Thế giới game 360×640, mỗi pixel sprite = 2×2 điểm ảnh; Phaser co canvas theo kiểu `FIT` và CSS `image-rendering: pixelated` giữ nét pixel.
- Khu làm việc số lẻ được lật ngang để dây chuyền chạy zig-zag.
- Mỗi lần đóng gói xong, `Station` phát sự kiện `product-packed` lên scene; đây là điểm nối sẵn để các giai đoạn sau gắn thêm tính năng mà không phải sửa logic băng chuyền.
