/* ==========================================================================
 * FactoryScene - Màn hình nhà xưởng: HUD, 4 khu làm việc, chân trang.
 * ========================================================================== */
PF.FactoryScene = class FactoryScene extends Phaser.Scene {
  constructor() {
    super('FactoryScene');
  }

  create() {
    var C = PF.CONFIG;

    this.totalItems = 0;
    this.totalWage = 0;
    this.stations = [];

    // 4 khu làm việc xếp dọc, mỗi khu 1 công nhân
    for (var i = 0; i < C.STATION_COUNT; i++) {
      var top = C.HUD_HEIGHT + i * C.STATION_HEIGHT;
      this.stations.push(new PF.Station(this, i, top, C.WORKERS[i]));
    }

    this._buildHud();
    this._buildFooter();
    this._refreshHud(false);

    // Mỗi khu đóng xong 1 thùng sẽ phát sự kiện này
    this.events.on('product-packed', this._onProductPacked, this);
    this.events.once('shutdown', function () {
      this.events.off('product-packed', this._onProductPacked, this);
    }, this);
  }

  update(time, delta) {
    // Giới hạn dt để không bị "nhảy cóc" khi quay lại từ tab khác
    var dt = Math.min(delta, 50) / 1000;
    for (var i = 0; i < this.stations.length; i++) {
      this.stations[i].update(dt);
    }
  }

  /* ---------------------------- Logic đếm ---------------------------- */
  _onProductPacked() {
    this.totalItems += 1;
    this.totalWage += PF.CONFIG.PAY_PER_ITEM;
    this._refreshHud(true);
  }

  /* ---------------------------- Giao diện ---------------------------- */
  _buildHud() {
    var C = PF.CONFIG;
    var g = this.add.graphics();

    // Nền thanh trên cùng
    g.fillStyle(C.COLORS.hudBg, 1).fillRect(0, 0, C.WIDTH, C.HUD_HEIGHT);
    g.fillStyle(C.COLORS.hudLine, 1).fillRect(0, C.HUD_HEIGHT - 4, C.WIDTH, 4);

    // Hai ô thông tin
    this._drawPanel(g, 8, 8, 168, 44);
    this._drawPanel(g, 184, 8, 168, 44);

    // Ô trái: số sản phẩm
    this.add.image(18, 30, 'icon_box').setOrigin(0, 0.5);
    this._label(40, 13, 'SẢN PHẨM');
    this.itemsText = this._value(40, 26);

    // Ô phải: tiền công
    this.add.image(194, 30, 'icon_coin').setOrigin(0, 0.5);
    this._label(216, 13, 'TIỀN CÔNG');
    this.wageText = this._value(216, 26);
  }

  _buildFooter() {
    var C = PF.CONFIG;
    var y = C.HEIGHT - C.FOOTER_HEIGHT;
    var g = this.add.graphics();

    g.fillStyle(C.COLORS.hudBg, 1).fillRect(0, y, C.WIDTH, C.FOOTER_HEIGHT);
    g.fillStyle(C.COLORS.hudLine, 1).fillRect(0, y, C.WIDTH, 4);

    this.add
      .text(C.WIDTH / 2, y + 26, 'PIXEL FACTORY LIVE', {
        fontFamily: C.FONT,
        fontSize: '16px',
        fontStyle: 'bold',
        color: C.COLORS.gold
      })
      .setOrigin(0.5);

    this.add
      .text(C.WIDTH / 2, y + 46, 'Phiên bản V1', {
        fontFamily: C.FONT,
        fontSize: '11px',
        color: C.COLORS.muted
      })
      .setOrigin(0.5);
  }

  // Ô bảng điều khiển kiểu pixel: viền tối, nền xám tím, vạch sáng phía trên
  _drawPanel(g, x, y, w, h) {
    var col = PF.CONFIG.COLORS;
    g.fillStyle(col.panelDark, 1).fillRect(x, y, w, h);
    g.fillStyle(col.panel, 1).fillRect(x + 2, y + 2, w - 4, h - 4);
    g.fillStyle(col.panelLight, 1).fillRect(x + 2, y + 2, w - 4, 2);
  }

  _label(x, y, str) {
    var C = PF.CONFIG;
    return this.add.text(x, y, str, {
      fontFamily: C.FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: C.COLORS.muted
    });
  }

  _value(x, y) {
    var C = PF.CONFIG;
    var t = this.add.text(x, y, '0', {
      fontFamily: C.FONT,
      fontSize: '18px',
      fontStyle: 'bold',
      color: C.COLORS.gold
    });
    t.baseY = y;
    return t;
  }

  // Ghi giá trị mới; thu nhỏ chữ nếu quá dài để không tràn ô
  _setValue(textObj, str, maxWidth, pop) {
    textObj.setText(str);
    textObj.setScale(1);
    if (textObj.width > maxWidth) {
      textObj.setScale(maxWidth / textObj.width);
    }
    if (pop) {
      this.tweens.killTweensOf(textObj);
      textObj.y = textObj.baseY;
      this.tweens.add({
        targets: textObj,
        y: textObj.baseY - 2,
        duration: 70,
        yoyo: true
      });
    }
  }

  _refreshHud(pop) {
    var C = PF.CONFIG;
    this._setValue(this.itemsText, this.totalItems.toLocaleString('vi-VN'), 128, pop);
    this._setValue(
      this.wageText,
      this.totalWage.toLocaleString('vi-VN') + C.CURRENCY_SUFFIX,
      128,
      pop
    );
  }
};
