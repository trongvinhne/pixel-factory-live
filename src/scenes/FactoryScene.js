/* ==========================================================================
 * FactoryScene - Màn hình nhà máy: HUD, 4 dây chuyền (24 công nhân),
 * khu thông tin và khung chừa cho bình luận LIVE.
 * ========================================================================== */
PF.FactoryScene = class FactoryScene extends Phaser.Scene {
  constructor() {
    super('FactoryScene');
  }

  create() {
    var C = PF.CONFIG;

    this.totalItems = 0;
    this.totalWage = 0;
    this.rows = [];

    for (var i = 0; i < C.ROW_COUNT; i++) {
      this.rows.push(new PF.Row(this, i, C.HUD_HEIGHT + i * C.ROW_HEIGHT));
    }

    this._buildHud();
    this._buildInfoZone();
    this._buildCommentZone();
    this._refreshHud(false);

    // Mỗi thùng hàng hoàn thành (rơi vào xe đẩy) phát sự kiện này
    this.events.on('product-packed', this._onProductPacked, this);
    this.events.once('shutdown', function () {
      this.events.off('product-packed', this._onProductPacked, this);
    }, this);
  }

  update(time, delta) {
    // Giới hạn dt để không bị "nhảy cóc" khi quay lại từ tab khác
    var dt = Math.min(delta, 50) / 1000;
    for (var i = 0; i < this.rows.length; i++) this.rows[i].update(dt);
  }

  /* ---------------------------- Logic đếm ---------------------------- */
  _onProductPacked() {
    this.totalItems += 1;
    this.totalWage += PF.CONFIG.PAY_PER_ITEM;
    this._refreshHud(true);
  }

  /* ---------------------------- HUD ---------------------------- */
  _buildHud() {
    var C = PF.CONFIG;
    var g = this.add.graphics();

    g.fillStyle(C.COLORS.hudBg, 1).fillRect(0, 0, C.WIDTH, C.HUD_HEIGHT);
    g.fillStyle(C.COLORS.hudLine, 1).fillRect(0, C.HUD_HEIGHT - 3, C.WIDTH, 3);

    this._drawPanel(g, 6, 5, 170, 30);
    this._drawPanel(g, 184, 5, 170, 30);

    this.add.image(14, 20, 'icon_box').setOrigin(0, 0.5);
    this._label(28, 8, 'SẢN PHẨM');
    this.itemsText = this._value(28, 17);

    this.add.image(192, 20, 'icon_coin').setOrigin(0, 0.5);
    this._label(206, 8, 'TIỀN CÔNG');
    this.wageText = this._value(206, 17);
  }

  // Ô bảng điều khiển kiểu pixel: viền tối, nền xám tím, vạch sáng phía trên
  _drawPanel(g, x, y, w, h) {
    var col = PF.CONFIG.COLORS;
    g.fillStyle(col.panelDark, 1).fillRect(x, y, w, h);
    g.fillStyle(col.panel, 1).fillRect(x + 2, y + 2, w - 4, h - 4);
    g.fillStyle(col.panelLight, 1).fillRect(x + 2, y + 2, w - 4, 1);
  }

  _label(x, y, str) {
    var C = PF.CONFIG;
    return this.add.text(x, y, str, {
      fontFamily: C.FONT,
      fontSize: '8px',
      fontStyle: 'bold',
      color: C.COLORS.muted
    });
  }

  _value(x, y) {
    var C = PF.CONFIG;
    var t = this.add.text(x, y, '0', {
      fontFamily: C.FONT,
      fontSize: '14px',
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
    if (textObj.width > maxWidth) textObj.setScale(maxWidth / textObj.width);
    if (pop) {
      this.tweens.killTweensOf(textObj);
      textObj.y = textObj.baseY;
      this.tweens.add({ targets: textObj, y: textObj.baseY - 1, duration: 60, yoyo: true });
    }
  }

  _refreshHud(pop) {
    var C = PF.CONFIG;
    this._setValue(this.itemsText, this.totalItems.toLocaleString('vi-VN'), 130, pop);
    this._setValue(this.wageText, this.totalWage.toLocaleString('vi-VN') + C.CURRENCY_SUFFIX, 142, pop);
  }

  /* ---------------------------- Khu thông tin ---------------------------- */
  // Chú thích 6 công đoạn, màu trùng với mũ/áo và biển trên đầu công nhân
  _buildInfoZone() {
    var C = PF.CONFIG;
    var g = this.add.graphics();
    var top = C.INFO_TOP;

    g.fillStyle(C.COLORS.hudBg, 1).fillRect(0, top, C.WIDTH, C.INFO_HEIGHT);
    g.fillStyle(C.COLORS.hudLine, 1).fillRect(0, top, C.WIDTH, 3);

    for (var i = 0; i < C.STAGES.length; i++) {
      var col = i % 3;
      var row = Math.floor(i / 3);
      var x = 10 + col * 118;
      var y = top + 11 + row * 20;
      var stage = C.STAGES[i];

      g.fillStyle(C.COLORS.panelDark, 1).fillRect(x, y, 10, 10);
      g.fillStyle(parseInt(stage.color.slice(1), 16), 1).fillRect(x + 1, y + 1, 8, 8);

      this.add.text(x + 15, y + 5, (i + 1) + ' ' + stage.name, {
        fontFamily: C.FONT,
        fontSize: '9px',
        fontStyle: 'bold',
        color: C.COLORS.cream
      }).setOrigin(0, 0.5);
    }
  }

  /* ---------------------------- Khung bình luận LIVE ---------------------------- */
  // Chỉ chừa chỗ (chưa có chức năng TikTok LIVE ở giai đoạn này)
  _buildCommentZone() {
    var C = PF.CONFIG;
    var top = C.COMMENT_TOP;
    var h = C.HEIGHT - top;
    var g = this.add.graphics();

    g.fillStyle(0x161726, 1).fillRect(0, top, C.WIDTH, h);
    g.fillStyle(C.COLORS.hudLine, 1).fillRect(0, top, C.WIDTH, 3);

    // Khung nét đứt
    var x0 = 10, y0 = top + 12, x1 = C.WIDTH - 10, y1 = C.HEIGHT - 10;
    g.fillStyle(C.COLORS.panelLight, 0.7);
    for (var x = x0; x < x1; x += 8) {
      g.fillRect(x, y0, 4, 1);
      g.fillRect(x, y1, 4, 1);
    }
    for (var y = y0; y < y1; y += 8) {
      g.fillRect(x0, y, 1, 4);
      g.fillRect(x1, y, 1, 4);
    }

    this.add.text(C.WIDTH / 2, top + h / 2 - 6, 'KHUNG BÌNH LUẬN LIVE', {
      fontFamily: C.FONT,
      fontSize: '11px',
      fontStyle: 'bold',
      color: C.COLORS.muted
    }).setOrigin(0.5);

    this.add.text(C.WIDTH / 2, top + h / 2 + 10, '(dành cho giai đoạn sau)', {
      fontFamily: C.FONT,
      fontSize: '9px',
      color: '#7c80a8'
    }).setOrigin(0.5);
  }
};
