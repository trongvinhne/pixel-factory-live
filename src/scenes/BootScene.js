/* ==========================================================================
 * BootScene - Tạo toàn bộ texture pixel art từ code rồi chuyển sang game.
 * Không tải bất kỳ tệp ảnh nào.
 * ========================================================================== */
PF.BootScene = class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    var C = PF.CONFIG;
    var S = PF.SPRITES;
    var self = this;

    function make(key, data, palette) {
      self.textures.generate(key, { data: data, pixelWidth: 1, pixelHeight: 1, palette: palette });
    }

    // Sprite dùng chung
    Object.keys(S.fixed).forEach(function (key) {
      make(key, S.fixed[key].data, S.fixed[key].palette);
    });

    // Tường từng dây
    C.ROW_WALLS.forEach(function (w, r) {
      make('wall_' + r, S.fixed.wall.data, PF.palettes.wall(w));
    });

    // Công nhân: mỗi người một tông da + màu tóc riêng, màu mũ/áo theo công đoạn
    for (var r = 0; r < C.ROW_COUNT; r++) {
      for (var s = 0; s < C.STAGES.length; s++) {
        var n = r * C.STAGES.length + s;
        var stage = C.STAGES[s];
        var skin = C.SKINS[(n * 3 + r) % C.SKINS.length];
        var hair = C.HAIRS[(n * 5 + s) % C.HAIRS.length];
        var pal = PF.palettes.worker(stage, skin, hair);

        make('arm_' + r + '_' + s, S.arm, PF.palettes.arm(stage, skin));
        if (s < 5) {
          make('worker_' + r + '_' + s, S.worker, pal);
        } else {
          // Công nhân vận chuyển đứng cả người, có 2 kiểu chân để bước đi
          make('worker_' + r + '_' + s, S.carrierStand, pal);
          make('worker_' + r + '_' + s + '_walk', S.carrierWalk, pal);
        }
      }
    }

    this.scene.start('FactoryScene');
  }
};
