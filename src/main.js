/* ==========================================================================
 * Pixel Factory Live - Điểm khởi động
 * ========================================================================== */
window.addEventListener('load', function () {
  var C = PF.CONFIG;

  PF.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: C.WIDTH,
    height: C.HEIGHT,
    backgroundColor: '#1b1c2e',
    pixelArt: true,
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true
    },
    scale: {
      mode: Phaser.Scale.FIT,               // giữ đúng tỷ lệ 9:16 trên mọi màn hình
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
      activePointers: 1
    },
    disableContextMenu: true,
    scene: [PF.BootScene, PF.FactoryScene]
  });
});
