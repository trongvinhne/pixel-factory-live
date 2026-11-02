/* ==========================================================================
 * BootScene - Tạo toàn bộ texture pixel art từ code rồi chuyển sang game.
 * Không tải bất kỳ tệp ảnh nào.
 * ========================================================================== */
PF.BootScene = class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    var px = PF.CONFIG.PIXEL;
    var S = PF.SPRITES;
    var self = this;

    function make(key, data, palette) {
      self.textures.generate(key, {
        data: data,
        pixelWidth: px,
        pixelHeight: px,
        palette: palette
      });
    }

    // Sprite dùng chung
    Object.keys(S.fixed).forEach(function (key) {
      make(key, S.fixed[key].data, S.fixed[key].palette);
    });

    // Sprite riêng cho từng công nhân / khu làm việc
    PF.CONFIG.WORKERS.forEach(function (w, i) {
      make('worker_' + i, S.worker.data, PF.palettes.worker(w));
      make('arm_' + i, S.arm.data, PF.palettes.arm(w));
      make('wall_' + i, S.wall.data, PF.palettes.wall(w));
    });

    this.scene.start('FactoryScene');
  }
};
