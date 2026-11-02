/* ==========================================================================
 * Pixel Factory Live - Cấu hình chung (V1)
 * Mọi con số có thể tinh chỉnh đều nằm ở đây.
 * ========================================================================== */
window.PF = window.PF || {};

PF.CONFIG = {
  // Kích thước "thế giới" game, tỷ lệ 9:16 (Phaser sẽ co giãn vừa màn hình)
  WIDTH: 360,
  HEIGHT: 640,
  PIXEL: 2, // mỗi pixel của sprite = 2x2 điểm ảnh trong game

  // Bố cục dọc: HUD (64) + 4 khu làm việc (4 x 128) + chân trang (64) = 640
  HUD_HEIGHT: 64,
  FOOTER_HEIGHT: 64,
  STATION_COUNT: 4,
  STATION_HEIGHT: 128,

  // Tiền công cho mỗi sản phẩm đóng gói xong
  PAY_PER_ITEM: 500,
  CURRENCY_SUFFIX: ' ₫',

  // Tọa độ bên trong MỘT khu làm việc (gốc = góc trên-trái của khu)
  LAYOUT: {
    ceilingH: 4,
    // Công nhân
    workerX: 150,      // tâm ngang thân công nhân
    workerTopY: 36,    // đỉnh đầu
    shoulderDX: 2,     // vị trí vai (điểm xoay của cánh tay)
    shoulderDY: 19,
    // Ghế
    chairX: 132,
    chairY: 50,
    // Bàn đóng gói
    deskX: 96,
    deskW: 160,
    deskTopY: 66,
    deskTopH: 6,
    deskFrontH: 24,
    plantX: 232,
    plantY: 48,
    // Băng chuyền
    beltY: 88,
    beltH: 12,
    legY: 100,
    legStep: 60,
    // Sàn
    floorY: 108,
    floorH: 20,
    // Trang trí
    windowX: 22,
    windowY: 24,
    lampX: 142,
    // Thùng carton
    packX: 168,        // vị trí thùng dừng lại để công nhân đóng gói
    spawnX: -24,       // thùng xuất hiện ngoài mép trái
    exitX: 390         // thùng rời khỏi mép phải thì bị xóa
  },

  BELT: {
    speed: 64,         // px/giây
    spacing: 150       // khoảng cách giữa các thùng (px)
  },

  // Góc xoay của cánh tay (radian, âm = vươn về phía trước)
  ARM: {
    rest: -0.25,
    raised: -1.15,
    press: -0.45
  },

  // Thời gian từng bước đóng gói (ms)
  PACK: {
    raise: 260,
    press: 180,
    release: 220
  },

  COLORS: {
    hudBg: 0x2b2d42,
    hudLine: 0x1b1c2e,
    panel: 0x3d405b,
    panelLight: 0x565a82,
    panelDark: 0x1b1c2e,
    gold: '#ffd23f',
    cream: '#fff3d6',
    muted: '#b8bcd9'
  },

  FONT: '"Courier New", Courier, monospace',

  // 4 công nhân: màu áo, màu tóc, màu tường khu làm việc, tốc độ làm việc
  WORKERS: [
    { name: 'Mai',  shirt: '#ff7b7b', shirtShade: '#d95f5f', hair: '#6b4226', wall: '#fde2d3', wallLine: '#f4cbb6', speed: 1.0  },
    { name: 'Bảo',  shirt: '#6fd3b0', shirtShade: '#4fb393', hair: '#2d2a3a', wall: '#d6f0e0', wallLine: '#bfe3cf', speed: 1.1  },
    { name: 'Lan',  shirt: '#7bb6ff', shirtShade: '#5a96e0', hair: '#e0a84a', wall: '#dbe7ff', wallLine: '#c4d5f5', speed: 0.92 },
    { name: 'Khoa', shirt: '#b79cff', shirtShade: '#977be0', hair: '#8a3b2e', wall: '#e9defa', wallLine: '#d6c8f0', speed: 1.05 }
  ]
};
