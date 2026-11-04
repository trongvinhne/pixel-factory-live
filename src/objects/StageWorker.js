/* ==========================================================================
 * StageWorker - Một công nhân mini: thân + cánh tay xoay quanh vai.
 * Mỗi công đoạn có "hồ sơ chuyển động" của cánh tay riêng (ARM_PROFILES):
 *   fold  : hai nhịp gập nắp thùng
 *   pack  : với tay vào khay sản phẩm (phía sau) rồi thả vào thùng
 *   tape  : nhấc tay, ấn xuống đầu máy dán băng keo
 *   check : quét qua lại, kiểm tra
 *   load  : nhấc thùng lên rồi đẩy sang băng chuyền
 *   ship  : (công nhân vận chuyển) vỗ chỉnh hàng / đẩy xe
 * Khi không làm việc, công nhân nhấp nhô nhẹ và tay đung đưa.
 * ========================================================================== */
(function () {
  var REST = -0.3;

  function ease(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  PF.ARM_PROFILES = {
    fold: function (p) {
      return -0.5 - 0.8 * Math.abs(Math.sin(p * Math.PI * 3));
    },
    pack: function (p) {
      if (p < 0.35) return REST + 0.9 * ease(p / 0.35);          // với ra sau lấy hàng
      if (p < 0.65) return 0.6 - 1.9 * ease((p - 0.35) / 0.3);   // đưa vào thùng
      return -1.3 + 1.0 * ease((p - 0.65) / 0.35);               // thu tay về
    },
    tape: function (p) {
      if (p < 0.4) return REST - 1.0 * ease(p / 0.4);            // nhấc tay
      if (p < 0.6) return -1.3 + 0.4 * ease((p - 0.4) / 0.2);    // ấn xuống
      return -0.9 + 0.6 * ease((p - 0.6) / 0.4);
    },
    check: function (p) {
      return -1.15 + 0.3 * Math.sin(p * Math.PI * 4);
    },
    load: function (p) {
      if (p < 0.45) return REST - 1.2 * ease(p / 0.45);          // nhấc thùng
      if (p < 0.75) return -1.5 + 0.5 * ease((p - 0.45) / 0.3);  // đẩy sang
      return -1.0 + 0.7 * ease((p - 0.75) / 0.25);
    },
    ship: function (p) {
      return REST - 1.0 * Math.sin(p * Math.PI);                 // vỗ chỉnh hàng trong xe
    },
    push: function () {
      return -1.35;                                              // đẩy xe
    }
  };

  PF.StageWorker = class StageWorker {
    /**
     * @param layers  {bodies, arms} - hai container của dây chuyền
     * @param opts    {top, bodyKey, armKey, profile}
     */
    constructor(scene, layers, x, opts) {
      this.x = x;
      this.top = opts.top;
      this.profile = opts.profile;
      this.facing = 1;          // 1 = nhìn phải, -1 = nhìn trái
      this.angle = REST;        // góc tay (chưa tính hướng nhìn)
      this.t = Math.random() * 10;
      this.phase = Math.random() * Math.PI * 2;

      this.body = scene.add.image(x, this.top, opts.bodyKey).setOrigin(0.5, 0);
      this.arm = scene.add.image(x + 2, this.top + 8, opts.armKey).setOrigin(0.5, 0.06);
      layers.bodies.add(this.body);
      layers.arms.add(this.arm);
      this._apply(0);
    }

    setX(x) {
      this.x = x;
    }

    setFacing(dir) {
      this.facing = dir;
      this.body.setFlipX(dir < 0);
    }

    setBodyTexture(key) {
      this.body.setTexture(key);
    }

    setProfile(name) {
      this.profile = name;
    }

    // p = tiến độ 0..1 của việc đang làm; null = đang rảnh
    update(dt, p) {
      this.t += dt;
      var target;
      if (p === null || p === undefined) {
        target = REST + Math.sin(this.t * 2.4 + this.phase) * 0.06;
      } else {
        target = PF.ARM_PROFILES[this.profile](p);
      }
      var k = Math.min(1, dt * (p === null || p === undefined ? 8 : 30));
      this.angle += (target - this.angle) * k;

      var rate = p === null || p === undefined ? 1.3 : 4;
      var bob = Math.sin(this.t * rate * Math.PI + this.phase) > 0.4 ? 1 : 0;
      this._apply(bob);
    }

    _apply(bob) {
      this.body.x = this.x;
      this.body.y = this.top + bob;
      this.arm.x = this.x + 2 * this.facing;
      this.arm.y = this.top + 8 + bob;
      this.arm.rotation = this.angle * this.facing;
    }

    // Vị trí bàn tay (dùng khi cần gắn vật vào tay)
    destroy() {
      this.body.destroy();
      this.arm.destroy();
    }
  };
})();
