/* ==========================================================================
 * Pixel Factory Live - Sprite pixel art mini (tự vẽ bằng ma trận ký tự)
 *
 * Toàn bộ hình ảnh tạo bằng code, KHÔNG dùng ảnh bên ngoài.
 * '.' = trong suốt, ký tự khác = màu tra trong bảng palette.
 * Mỗi pixel sprite = 1 pixel thế giới game (nhỏ hơn V1 gấp đôi).
 * ========================================================================== */
window.PF = window.PF || {};

(function () {
  /* ---------- Công nhân mini 10x15 (nhìn ngang, hướng sang phải) ----------
   * 0 viền | 1 da | 2 tóc | 3 áo | 4 áo đậm | 5 quần | 6 mắt | 7 má | 8 mũ */
  var WORKER = [
    '..000000..',
    '.08888880.',
    '.08888880.',
    '.088888880',
    '.02211100.',
    '.02211610.',
    '.02211710.',
    '...01110..',
    '..0333330.',
    '.033333340',
    '.033333340',
    '.033333340',
    '.033333340',
    '.044444440',
    '.055555550'
  ];

  // Cánh tay 3x8, xoay quanh vai (đỉnh) để tạo hoạt ảnh
  var ARM = ['030', '030', '030', '030', '010', '010', '010', '.0.'];

  // Chân của công nhân vận chuyển (đứng cả người), 2 kiểu để bước đi
  var LEGS_STAND = ['..055055..', '..055055..', '..055055..', '..000000..'];
  var LEGS_WALK = ['.055..0550', '.055..0550', '.055..0550', '.000..0000'];

  function carrierBody(legs) {
    return WORKER.slice(0, 12).concat(legs);
  }

  var BOX_PAL = { 0: '#6b4430', 1: '#d9a066', 2: '#efc896', 3: '#8a5a3a', 4: '#f6e27a', 5: '#6fd67a', 6: '#ff8fa3' };

  // Xe đẩy 24x12: giỏ lưới + 2 bánh
  function cart() {
    var rows = [];
    var x;
    for (var y = 0; y < 12; y++) {
      var s = '';
      for (x = 0; x < 24; x++) {
        if (y === 0) s += '0';
        else if (y <= 7) s += x === 0 || x === 23 ? '0' : (y % 2 === 0 ? '2' : '1');
        else if (y === 8) s += '0';
        else s += (x >= 3 && x <= 6) || (x >= 17 && x <= 20) ? '5' : '.';
      }
      rows.push(s);
    }
    return rows;
  }

  PF.SPRITES = {
    worker: WORKER,
    arm: ARM,
    carrierStand: carrierBody(LEGS_STAND),
    carrierWalk: carrierBody(LEGS_WALK),

    fixed: {
      // ----- Thùng carton qua từng công đoạn (8x7, tâm đáy) -----
      box_flat:  { data: ['22222222', '11111111'], palette: BOX_PAL },
      box_open:  { data: ['03333330', '01111110', '01111110', '01111110', '01111110', '01111110', '00000000'], palette: BOX_PAL },
      box_item:  { data: ['06666660', '01111110', '01111110', '01111110', '01111110', '01111110', '00000000'], palette: BOX_PAL },
      box_taped: { data: ['02222220', '01144110', '01144110', '01111110', '01111110', '01111110', '00000000'], palette: BOX_PAL },
      box_ok:    { data: ['02222220', '01144110', '01144110', '01111110', '01111550', '01111550', '00000000'], palette: BOX_PAL },
      item:      { data: ['767', '666', '666'], palette: { 6: '#ff8fa3', 7: '#ffd0da' } },

      // ----- Máy móc thu nhỏ, đặt phía sau công nhân -----
      stack_flat: {
        data: ['000000000000', '022222222220', '011111111110', '022222222220', '011111111110', '000000000000'],
        palette: BOX_PAL
      },
      bin_items: {
        data: ['..6.76.6..', '.66676666.', '0000000000', '0111111110', '0111111110', '0111111110', '0333333330', '0000000000'],
        palette: { 0: '#6b4430', 1: '#d9a066', 3: '#8a5a3a', 6: '#ff8fa3', 7: '#ffd0da' }
      },
      tape_machine: {
        data: [
          '..0000000...',
          '.044444440..',
          '.044444440..',
          '..0055500...',
          '...05050....',
          '..0555550000',
          '.07777777110',
          '.07777777110',
          '.00000000000'
        ],
        palette: { 0: '#2b2d42', 4: '#f6e27a', 5: '#6b708f', 1: '#9a9fc0', 7: '#4a4e69' }
      },
      scanner: {
        data: [
          '00000000000', '09999999990', '09999999990', '09911199990', '09999999990',
          '00000000000', '....0770....', '...000000..', '..00000000.'
        ].map(function (r) { return (r + '...........').slice(0, 11); }),
        palette: { 0: '#2b2d42', 9: '#3d6b5a', 1: '#7dffb0', 7: '#4a4e69' }
      },
      scanner_on: {
        data: [
          '00000000000', '0AAAAAAAAA0', '0AAAAAAAAA0', '0AA11111AA0', '0AAAAAAAAA0',
          '00000000000', '....0770....', '...000000..', '..00000000.'
        ].map(function (r) { return (r + '...........').slice(0, 11); }),
        palette: { 0: '#2b2d42', A: '#7dffb0', 1: '#ffffff', 7: '#4a4e69' }
      },
      pallet: {
        data: ['000000000000', '011111111110', '000000000000'],
        palette: { 0: '#5a3b2e', 1: '#c98f5a' }
      },

      // ----- Môi trường -----
      wall: {
        data: ['11111111', '11111111', '11111111', '11111111', '11111111', '11111111', '11111111', '22222222'],
        palette: { 1: '#ffffff', 2: '#dddddd' }
      },
      belt_tile: {
        data: ['55555555', '22111111', '22111111', '00000000'],
        palette: { 0: '#2b2d42', 1: '#4a4e69', 2: '#6b708f', 5: '#9a9fc0' }
      },
      belt_leg: { data: ['0110', '0110', '0110', '0110'], palette: { 0: '#2b2d42', 1: '#6b708f' } },
      floor_tile: {
        data: ['33333333', '11111111', '11111111', '22222222'],
        palette: { 1: '#b58b6b', 2: '#9d7456', 3: '#c99d7b' }
      },
      lamp: {
        data: ['...33...', '..0440..', '.044440.', '04444440', '00000000'],
        palette: { 0: '#4a3f35', 3: '#8d8d99', 4: '#ffd166' }
      },
      door: {
        data: (function () {
          var r = [];
          for (var y = 0; y < 30; y++) {
            var s = '';
            for (var x = 0; x < 14; x++) {
              if (y === 0 || x === 0) s += '0';
              else if (y < 4) s += '3';
              else s += (y % 4 === 0 ? '2' : '1');
            }
            r.push(s);
          }
          return r;
        })(),
        palette: { 0: '#2b2d42', 1: '#6b708f', 2: '#565a82', 3: '#ffd166' }
      },
      cart: { data: cart(), palette: { 0: '#2b2d42', 1: '#9a9fc0', 2: '#c5c9e3', 5: '#4a4e69' } },

      icon_coin: {
        data: ['..0000..', '.011110.', '01133110', '01132210', '01122110', '01111110', '.011110.', '..0000..'],
        palette: { 0: '#7a4b12', 1: '#ffd23f', 2: '#ffb703', 3: '#fff1a8' }
      },
      icon_box: {
        data: ['00000000', '02224220', '01114110', '01114110', '01111110', '01111110', '03333330', '00000000'],
        palette: { 0: '#6b4430', 1: '#d9a066', 2: '#efc896', 3: '#b9794a', 4: '#f6e27a' }
      }
    }
  };

  // Bảng màu theo từng công nhân (màu mũ + áo theo công đoạn để dễ phân biệt nhóm)
  PF.palettes = {
    worker: function (stage, skin, hair) {
      return { 0: '#3a2a3a', 1: skin, 2: hair, 3: stage.color, 4: stage.shade, 5: '#4a5a8a', 6: '#3a2a3a', 7: '#ff9aa2', 8: stage.shade };
    },
    arm: function (stage, skin) {
      return { 0: '#3a2a3a', 1: skin, 3: stage.color };
    },
    wall: function (w) {
      return { 1: w.wall, 2: w.line };
    }
  };
})();
