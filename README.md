# Pixel Factory Live — V1.1 (nhà máy đông công nhân)

Game 2D pixel art, tỷ lệ dọc 9:16 (tối ưu để phát TikTok LIVE), chủ đề công xưởng đóng gói hàng hóa.
Công nghệ: HTML, CSS, JavaScript, [Phaser 3](https://phaser.io/) (MIT).

## Có gì trong V1.1

- **24 công nhân** làm việc cùng lúc, chia **4 dây chuyền × 6 công đoạn**
- Công nhân pixel **mini** (10×15 px), mỗi người một tông da và màu tóc; mũ + áo theo màu công đoạn
- 6 công đoạn liên tiếp, mỗi công đoạn có máy móc và hoạt ảnh riêng:

| # | Công đoạn | Hoạt ảnh |
|---|---|---|
| 1 | Gấp thùng | hai nhịp gập nắp, tấm carton phẳng thành thùng mở |
| 2 | Đóng sản phẩm | với tay lấy hàng từ khay, thả vào thùng |
| 3 | Dán băng keo | nhấc tay, ấn xuống, đầu máy dán băng keo nhún theo |
| 4 | Kiểm tra hàng | quét qua lại, màn hình máy quét sáng lên, dán nhãn xanh |
| 5 | Lên băng chuyền | nhấc thùng, đẩy sang băng chuyền |
| 6 | Vận chuyển | thùng rơi vào xe đẩy, công nhân vỗ chỉnh hàng; đủ 3 thùng thì đẩy xe ra cổng giao hàng rồi quay về với xe trống |

- Dây chuyền hoạt động theo **trạng thái thật**: công nhân đứng chờ khi công đoạn sau chưa trống; thùng xếp hàng trên băng chuyền khi xe đẩy đang đi giao
- Mỗi dây có tốc độ riêng nên các dây không chạy đồng bộ
- Giữ nguyên từ V1: bộ đếm **sản phẩm** và **tiền công**, sự kiện `product-packed`
- Khu **thông tin** (chú thích công đoạn) và khung chừa cho **bình luận LIVE** ở phía dưới (~23% chiều cao)
- Toàn bộ hình ảnh tự vẽ bằng code, không dùng ảnh bên ngoài

Chưa có (để giai đoạn sau): tích hợp TikTok LIVE, lưu dữ liệu, âm thanh, menu.

## Bố cục màn hình (360 × 640)

```
  0 .. 40    HUD: sản phẩm | tiền công
 40 .. 440   4 dây chuyền, mỗi dây 100px (6 công nhân)
440 .. 496   Khu thông tin: chú thích 6 công đoạn
496 .. 640   Khung bình luận LIVE (chỉ chừa chỗ)
```

## Cấu trúc thư mục

```
pixel-factory-live/
├── index.html
├── css/style.css
├── src/
│   ├── config.js               Mọi thông số chỉnh được
│   ├── sprites.js              Sprite pixel art (ma trận ký tự) + bảng màu
│   ├── main.js                 Khởi tạo Phaser (9:16, pixelArt, co giãn FIT)
│   ├── objects/
│   │   ├── StageWorker.js      Công nhân mini + hoạt ảnh tay theo công đoạn
│   │   └── Row.js              Một dây chuyền: 6 công đoạn, băng chuyền, xe đẩy
│   └── scenes/
│       ├── BootScene.js        Sinh texture từ code
│       └── FactoryScene.js     Dựng 4 dây, HUD, khu thông tin, khung LIVE
└── README.md
```

## Chạy thử

Cần có Internet (Phaser nạp từ CDN jsDelivr).

- Mở `index.html` bằng trình duyệt, hoặc chạy `python3 -m http.server 8080` rồi mở bằng điện thoại cùng Wi-Fi.
- GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root** (repo cần public với gói miễn phí).

## Tinh chỉnh nhanh (`src/config.js`)

| Muốn đổi | Sửa ở |
|---|---|
| Tiền công mỗi sản phẩm | `PAY_PER_ITEM` |
| Thời gian từng công đoạn | `STAGES[i].work` (giây) |
| Tốc độ từng dây | `ROW_SPEED` |
| Tốc độ băng chuyền | `BELT_SPEED` |
| Số thùng mỗi xe đẩy | `CART_CAPACITY` |
| Màu mũ/áo, màu tường, tông da, màu tóc | `STAGES`, `ROW_WALLS`, `SKINS`, `HAIRS` |

## Ghi chú kỹ thuật

- Mỗi công đoạn là một máy trạng thái (chờ → làm → xong → chuyển thùng); thùng được chuyển bằng quỹ đạo parabol, có "đặt chỗ" ô đích để không bao giờ hai thùng chồng nhau.
- Khi mở game, mỗi dây chạy trước vài giây để các công đoạn đã có thùng ngay từ khung hình đầu tiên (không tính vào bộ đếm).
- Thùng rơi vào xe đẩy thì Row phát sự kiện `product-packed` lên scene; đây là điểm nối cho các giai đoạn sau.
- Canvas căn giữa bằng CSS flex (`autoCenter` của Phaser tắt để không lệch 2 lần).
