/* ==========================================================================
 * Station - Một khu làm việc: tường, cửa sổ, đèn, ghế, công nhân, bàn đóng
 * gói, băng chuyền và các thùng carton chạy trên băng chuyền.
 *
 * Vòng lặp của mỗi khu:
 *   thùng carton mở chạy trên băng chuyền -> dừng trước công nhân ->
 *   công nhân vươn tay, ấn xuống, dán băng keo -> thùng đóng kín ->
 *   băng chuyền chạy tiếp -> thùng ra khỏi màn hình.
 *
 * Khu số lẻ (1, 3) được lật ngang để dây chuyền chạy zig-zag cho đỡ đơn điệu.
 * Mỗi lần đóng gói xong, khu phát sự kiện 'product-packed' lên scene.
 * ========================================================================== */
PF.Station = class Station {
  constructor(scene, index, top, workerCfg) {
    this.scene = scene;
    this.index = index;
    this.cfg = workerCfg;
    this.L = PF.CONFIG.LAYOUT;
    this.speedFactor = workerCfg.speed;
    this.running = true;      // băng chuyền đang chạy?
    this.beltOffset = 0;
    this.cartons = [];

    var mirrored = index % 2 === 1;
    this.container = scene.add.container(mirrored ? PF.CONFIG.WIDTH : 0, top);
    this.container.setScale(mirrored ? -1 : 1, 1);

    this._build();
    this._seedCartons();
    this._startIdle();
  }

  /* ---------------------------- Dựng khu làm việc ---------------------------- */
  _build() {
    var s = this.scene;
    var L = this.L;
    var W = PF.CONFIG.WIDTH;
    var c = this.container;

    function add(obj) {
      c.add(obj);
      return obj;
    }

    // Tường, dầm trần
    add(s.add.tileSprite(0, 0, W, L.floorY, 'wall_' + this.index).setOrigin(0, 0));
    add(s.add.rectangle(0, 0, W, L.ceilingH, 0x3d405b).setOrigin(0, 0));
    add(s.add.rectangle(0, L.floorY - 2, W, 2, 0x000000, 0.12).setOrigin(0, 0));

    // Trang trí: cửa sổ, đèn treo
    add(s.add.image(L.windowX, L.windowY, 'window').setOrigin(0, 0));
    add(s.add.image(L.lampX, L.ceilingH, 'lamp').setOrigin(0, 0));

    // Ghế và công nhân (ngồi sau bàn)
    add(s.add.image(L.chairX, L.chairY, 'chair').setOrigin(0, 0));
    this.body = add(s.add.image(L.workerX, L.workerTopY, 'worker_' + this.index).setOrigin(0.5, 0));

    // Bàn đóng gói (che phần hông của công nhân)
    add(s.add.tileSprite(L.deskX, L.deskTopY + L.deskTopH, L.deskW, L.deskFrontH, 'desk_front').setOrigin(0, 0));
    add(s.add.tileSprite(L.deskX, L.deskTopY, L.deskW, L.deskTopH, 'desk_top').setOrigin(0, 0));
    add(s.add.rectangle(L.deskX, L.deskTopY, 2, L.deskTopH + L.deskFrontH, 0x5a3b2e).setOrigin(0, 0));
    add(s.add.rectangle(L.deskX + L.deskW - 2, L.deskTopY, 2, L.deskTopH + L.deskFrontH, 0x5a3b2e).setOrigin(0, 0));
    add(s.add.image(L.plantX, L.plantY, 'plant').setOrigin(0, 0));

    // Sàn nhà + bóng đổ dưới băng chuyền
    add(s.add.tileSprite(0, L.floorY, W, L.floorH, 'floor_tile').setOrigin(0, 0));
    add(s.add.rectangle(0, L.floorY, W, 4, 0x000000, 0.15).setOrigin(0, 0));

    // Chân và mặt băng chuyền
    for (var x = 20; x < W; x += L.legStep) {
      add(s.add.image(x, L.legY, 'belt_leg').setOrigin(0, 0));
    }
    this.belt = add(s.add.tileSprite(0, L.beltY, W, L.beltH, 'belt_tile').setOrigin(0, 0));

    // Cánh tay công nhân: luôn nằm trên cùng, xoay quanh vai
    this.arm = add(
      s.add
        .image(L.workerX + L.shoulderDX, L.workerTopY + L.shoulderDY, 'arm_' + this.index)
        .setOrigin(0.5, 0.125)
        .setRotation(PF.CONFIG.ARM.rest)
    );
  }

  /* ---------------------------- Thùng carton ---------------------------- */
  _spawnCarton(x, packed) {
    var L = this.L;
    var sprite = this.scene.add.image(x, L.beltY, packed ? 'carton_closed' : 'carton_open').setOrigin(0.5, 1);
    sprite.packed = !!packed;
    this.container.add(sprite);
    this.container.bringToTop(this.arm); // cánh tay luôn nằm trên thùng
    this.cartons.push(sprite);
    return sprite;
  }

  // Khi vào game đã có sẵn thùng trên băng chuyền cho đỡ trống
  _seedCartons() {
    var L = this.L;
    var spacing = PF.CONFIG.BELT.spacing;
    var x0 = L.packX - 50 - ((this.index * 17) % 60);
    this._spawnCarton(x0, false);
    for (var x = x0 + spacing; x < PF.CONFIG.WIDTH + 10; x += spacing) {
      this._spawnCarton(x, true);
    }
  }

  /* ---------------------------- Hoạt ảnh công nhân ---------------------------- */
  // Khi chờ: thân và tay nhấp nhô nhẹ theo từng nấc pixel
  _startIdle() {
    var self = this;
    var baseBodyY = this.L.workerTopY;
    var baseArmY = this.L.workerTopY + this.L.shoulderDY;
    var state = { t: 0 };

    this.scene.tweens.add({
      targets: state,
      t: 1,
      duration: 650,
      delay: this.index * 170,
      yoyo: true,
      repeat: -1,
      onUpdate: function () {
        var offset = state.t > 0.5 ? PF.CONFIG.PIXEL : 0;
        self.body.y = baseBodyY + offset;
        self.arm.y = baseArmY + offset;
      }
    });
  }

  // Vươn tay -> ấn xuống dán băng keo -> thu tay về
  _startPack(carton) {
    var self = this;
    var s = this.scene;
    var A = PF.CONFIG.ARM;
    var T = PF.CONFIG.PACK;
    var k = 1 / this.speedFactor; // thợ nhanh thì thao tác nhanh hơn

    this.running = false;

    s.tweens.add({
      targets: this.arm,
      rotation: A.raised,
      duration: T.raise * k,
      ease: 'Sine.easeOut',
      onComplete: function () {
        s.tweens.add({
          targets: self.arm,
          rotation: A.press,
          duration: T.press * k,
          ease: 'Sine.easeIn',
          onComplete: function () {
            self._seal(carton);
            s.tweens.add({
              targets: self.arm,
              rotation: A.rest,
              duration: T.release * k,
              ease: 'Sine.easeOut',
              onComplete: function () {
                self.running = true;
              }
            });
          }
        });
      }
    });
  }

  // Đóng kín thùng: đổi hình, nảy nhẹ, báo cho scene cộng sản phẩm
  _seal(carton) {
    carton.packed = true;
    carton.setTexture('carton_closed');
    this.scene.tweens.add({
      targets: carton,
      y: carton.y - PF.CONFIG.PIXEL * 2,
      duration: 70,
      yoyo: true
    });
    this.scene.events.emit('product-packed', { stationIndex: this.index });
  }

  /* ---------------------------- Cập nhật mỗi khung hình ---------------------------- */
  update(dt) {
    var L = this.L;
    var spacing = PF.CONFIG.BELT.spacing;
    var i;

    if (this.running) {
      var dx = PF.CONFIG.BELT.speed * this.speedFactor * dt;

      // Băng chuyền trượt (tilePosition giảm = hoa văn chạy sang phải)
      this.beltOffset -= dx;
      this.belt.tilePositionX = Math.round(this.beltOffset);

      // Di chuyển tất cả thùng, rồi mới kiểm tra thùng nào tới vị trí đóng gói
      var arrived = null;
      for (i = 0; i < this.cartons.length; i++) {
        var c = this.cartons[i];
        var prev = c.x;
        c.x += dx;
        if (!c.packed && prev < L.packX && c.x >= L.packX && !arrived) {
          arrived = c;
        }
      }
      if (arrived) {
        arrived.x = L.packX;
        this._startPack(arrived);
      }
    }

    // Xóa thùng đã ra khỏi màn hình
    for (i = this.cartons.length - 1; i >= 0; i--) {
      if (this.cartons[i].x > L.exitX) {
        this.cartons[i].destroy();
        this.cartons.splice(i, 1);
      }
    }

    // Thêm thùng mới ở mép trái khi thùng cuối đã đi đủ khoảng cách
    var minX = Infinity;
    for (i = 0; i < this.cartons.length; i++) {
      if (this.cartons[i].x < minX) minX = this.cartons[i].x;
    }
    if (minX >= L.spawnX + spacing) {
      this._spawnCarton(L.spawnX, false);
    }
  }
};
