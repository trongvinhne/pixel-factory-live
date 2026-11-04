/* ==========================================================================
 * Pixel Factory Live - Cấu hình chung (V1.1: nhà máy đông công nhân)
 * Mọi con số có thể tinh chỉnh đều nằm ở đây.
 *
 * Bố cục dọc 9:16 (360 x 640):
 *    0 ..  40   HUD (sản phẩm, tiền công)
 *   40 .. 440   4 dây chuyền x 100px, mỗi dây 6 công nhân = 24 công nhân
 *  440 .. 496   Khu thông tin (chú thích các công đoạn)
 *  496 .. 640   Khu dành cho khung bình luận LIVE (chưa có chức năng)
 * ========================================================================== */
window.PF = window.PF || {};

PF.CONFIG = {
  WIDTH: 360,
  HEIGHT: 640,

  HUD_HEIGHT: 40,
  ROW_COUNT: 4,
  ROW_HEIGHT: 100,
  INFO_TOP: 440,
  INFO_HEIGHT: 56,
  COMMENT_TOP: 496,

  // Tiền công cho mỗi sản phẩm hoàn thành (giữ nguyên từ V1)
  PAY_PER_ITEM: 500,
  CURRENCY_SUFFIX: ' ₫',

  // Tọa độ trong MỘT dây chuyền (gốc = góc trên-trái của dây)
  L: {
    ceilH: 3,
    stageX0: 28,          // tâm công nhân công đoạn 1
    stageDX: 50,          // khoảng cách giữa các công nhân
    workerW: 10,
    workerH: 15,
    workerTop: 29,        // đỉnh mũ công nhân
    tableTop: 44,         // mặt bàn / mặt băng chuyền
    tableX0: 6,
    tableX1: 254,
    tableFrontBottom: 72,
    floorY: 74,
    spotDX: 13,           // vị trí thùng so với công nhân (phía trước)
    machineDX: -13,       // vị trí máy so với công nhân (phía sau)
    beltX0: 256,
    beltX1: 296,
    beltLoadX: 266,       // chỗ thùng được đặt lên băng chuyền
    beltEndX: 292,        // thùng dừng cuối băng chuyền, rơi vào xe đẩy
    cartX: 306,           // tâm xe đẩy khi chờ nhận hàng
    cartBottom: 88,
    carrierX: 282,        // vị trí công nhân vận chuyển khi chờ
    carrierFeet: 90,
    doorX: 352,           // cổng giao hàng bên phải
    boxW: 8,
    boxH: 7
  },

  BELT_SPEED: 30,         // px/giây
  BOX_GAP: 11,            // khoảng cách tối thiểu giữa các thùng trên băng chuyền
  CART_CAPACITY: 3,       // số thùng mỗi xe trước khi đẩy đi giao
  WALK_SPEED: 38,         // px/giây

  // 5 công đoạn tại bàn + công đoạn vận chuyển
  STAGES: [
    { key: 'fold',  name: 'Gấp thùng',        color: '#ff7b7b', shade: '#d95f5f', work: 1.5 },
    { key: 'pack',  name: 'Đóng sản phẩm',    color: '#ffc94a', shade: '#d9a62f', work: 1.4 },
    { key: 'tape',  name: 'Dán băng keo',     color: '#6fd3b0', shade: '#4fb393', work: 1.2 },
    { key: 'check', name: 'Kiểm tra hàng',    color: '#6fb5ff', shade: '#4f95e0', work: 1.3 },
    { key: 'load',  name: 'Lên băng chuyền',  color: '#b79cff', shade: '#977be0', work: 0.9 },
    { key: 'ship',  name: 'Vận chuyển',       color: '#ff9ed2', shade: '#d97eb2', work: 0 }
  ],

  // Tốc độ làm việc từng dây (để các dây không chạy đồng bộ như nhau)
  ROW_SPEED: [1.0, 1.12, 0.92, 1.05],

  // Màu tường từng dây
  ROW_WALLS: [
    { wall: '#fde2d3', line: '#f4cbb6' },
    { wall: '#d6f0e0', line: '#bfe3cf' },
    { wall: '#dbe7ff', line: '#c4d5f5' },
    { wall: '#e9defa', line: '#d6c8f0' }
  ],

  SKINS: ['#ffd9b8', '#f1c27d', '#d9a066', '#a8744a'],
  HAIRS: ['#3a2a3a', '#6b4226', '#e0a84a', '#8a3b2e', '#222034', '#a0522d'],

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

  FONT: '"Courier New", Courier, monospace'
};
