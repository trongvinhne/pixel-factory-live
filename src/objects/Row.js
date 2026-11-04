/* ==========================================================================
 * Row - Một dây chuyền sản xuất hoàn chỉnh (6 công nhân, 6 công đoạn):
 *
 *   1 Gấp thùng -> 2 Đóng sản phẩm -> 3 Dán băng keo -> 4 Kiểm tra hàng
 *     -> 5 Đưa lên băng chuyền -> băng chuyền -> rơi vào xe đẩy
 *     -> 6 Công nhân vận chuyển đẩy xe (đủ 3 thùng) ra cổng giao hàng,
 *        rồi quay về với xe trống.
 *
 * Mỗi công đoạn là một máy trạng thái: chờ thùng -> làm việc -> làm xong
 * -> chờ chỗ trống phía sau -> chuyển thùng sang công đoạn kế tiếp.
 * Nếu phía sau đầy, công nhân phải đứng chờ nên dây chuyền có "nhịp"
 * thật chứ không phải hoạt ảnh lặp lại cố định.
 *
 * Khi một thùng rơi vào xe đẩy, Row phát sự kiện 'product-packed'.
 * ========================================================================== */
PF.Row = class Row {
  constructor(scene, index, top) {
    var C = PF.CONFIG;
    this.scene = scene;
    this.index = index;
    this.C = C;
    this.L = C.L;
    this.speed = C.ROW_SPEED[index];
    this.count = 0;
    this.muted = false;

    this.container = scene.add.container(0, top);
    this.layers = {};
    var self = this;
    ['bg', 'machines', 'bodies', 'table', 'cart', 'boxes', 'arms', 'text'].forEach(function (n) {
      self.layers[n] = scene.add.container(0, 0);
      self.container.add(self.layers[n]);
    });

    this._buildBackground();
    this._buildMachines();
    this._buildWorkers();
    this._buildTable();
    this._initFlow();
    this._warmUp(5 + index * 1.7);
  }

  /* ------------------------------ Vị trí ------------------------------ */
  stageX(i) {
    return this.L.stageX0 + this.L.stageDX * i;
  }

  spotX(i) {
    return this.stageX(i) + this.L.spotDX;
  }

  _rect(layer, x, y, w, h, color, alpha) {
    var r = this.scene.add.rectangle(x, y, w, h, color, alpha === undefined ? 1 : alpha).setOrigin(0, 0);
    this.layers[layer].add(r);
    return r;
  }

  _img(layer, x, y, key, ox, oy) {
    var im = this.scene.add.image(x, y, key).setOrigin(ox === undefined ? 0 : ox, oy === undefined ? 0 : oy);
    this.layers[layer].add(im);
    return im;
  }

  /* ------------------------------ Dựng cảnh ------------------------------ */
  _buildBackground() {
    var s = this.scene;
    var L = this.L;
    var W = this.C.WIDTH;
    var bg = this.layers.bg;

    bg.add(s.add.tileSprite(0, 0, W, L.floorY, 'wall_' + this.index).setOrigin(0, 0));
    this._rect('bg', 0, 0, W, L.ceilH, 0x3d405b);
    this._rect('bg', 0, 20, W, 2, 0x000000, 0.07);          // đường ống trên tường
    this._rect('bg', 0, L.floorY - 2, W, 2, 0x000000, 0.12);

    // Đèn treo + biển màu công đoạn phía trên mỗi công nhân
    for (var i = 0; i < 6; i++) {
      var x = i < 5 ? this.stageX(i) : L.carrierX;
      this._img('bg', x - 4, L.ceilH, 'lamp');
      this._rect('bg', x - 4, 11, 8, 4, parseInt(this.C.STAGES[i].color.slice(1), 16));
      this._rect('bg', x - 4, 15, 8, 1, 0x000000, 0.2);
    }

    // Cổng giao hàng bên phải
    this._img('bg', L.doorX - 6, L.tableTop, 'door');

    // Sàn + nhãn dây
    bg.add(s.add.tileSprite(0, L.floorY, W, this.C.ROW_HEIGHT - L.floorY, 'floor_tile').setOrigin(0, 0));
    this._rect('bg', 0, L.floorY, W, 3, 0x000000, 0.15);
    this._rect('bg', 0, this.C.ROW_HEIGHT - 2, W, 2, 0x1b1c2e, 0.55);

    this.label = s.add.text(5, 80, 'DÂY ' + (this.index + 1) + ' · 0', {
      fontFamily: this.C.FONT,
      fontSize: '9px',
      fontStyle: 'bold',
      color: this.C.COLORS.cream,
      stroke: '#3a2a3a',
      strokeThickness: 2
    });
    this.layers.text.add(this.label);
  }

  _buildMachines() {
    var L = this.L;
    var keys = ['stack_flat', 'bin_items', 'tape_machine', 'scanner', 'pallet'];
    this.machines = [];
    for (var i = 0; i < 5; i++) {
      this.machines.push(this._img('machines', this.stageX(i) + L.machineDX, L.tableTop, keys[i], 0.5, 1));
    }
  }

  _buildWorkers() {
    var L = this.L;
    var C = this.C;
    var r = this.index;
    this.workers = [];
    for (var i = 0; i < 5; i++) {
      this.workers.push(
        new PF.StageWorker(this.scene, this.layers, this.stageX(i), {
          top: L.workerTop,
          bodyKey: 'worker_' + r + '_' + i,
          armKey: 'arm_' + r + '_' + i,
          profile: C.STAGES[i].key
        })
      );
    }
    // Công nhân vận chuyển đứng trên sàn, bên dưới băng chuyền
    this.carrier = new PF.StageWorker(this.scene, this.layers, L.carrierX, {
      top: L.carrierFeet - 16,
      bodyKey: 'worker_' + r + '_5',
      armKey: 'arm_' + r + '_5',
      profile: 'ship'
    });
  }

  _buildTable() {
    var s = this.scene;
    var L = this.L;
    // Bàn làm việc
    this._rect('table', L.tableX0, L.tableTop + 4, L.tableX1 - L.tableX0, L.tableFrontBottom - L.tableTop - 4, 0xc98f5a);
    this._rect('table', L.tableX0, L.tableFrontBottom - 3, L.tableX1 - L.tableX0, 3, 0xa8744a);
    this._rect('table', L.tableX0, L.tableTop, L.tableX1 - L.tableX0, 4, 0xf0c89a);
    this._rect('table', L.tableX0, L.tableTop + 3, L.tableX1 - L.tableX0, 1, 0xd9a066);
    this._rect('table', L.tableX0, L.tableTop, 2, L.tableFrontBottom - L.tableTop, 0x5a3b2e);

    // Băng chuyền + chân
    this._rect('table', 270, L.tableTop + 4, 3, L.floorY - L.tableTop - 4, 0x6b708f);
    this._rect('table', 290, L.tableTop + 4, 3, L.floorY - L.tableTop - 4, 0x6b708f);
    this.beltTile = s.add.tileSprite(L.beltX0, L.tableTop, L.beltX1 - L.beltX0, 4, 'belt_tile').setOrigin(0, 0);
    this.layers.table.add(this.beltTile);
  }

  /* ------------------------------ Luồng sản xuất ------------------------------ */
  _initFlow() {
    var L = this.L;
    this.spots = [null, null, null, null, null];
    this.reserved = [false, false, false, false, false];
    this.stages = [];
    for (var i = 0; i < 5; i++) {
      this.stages.push({ state: 'wait', t: 0, dur: 1, fx: {} });
    }
    this.moves = [];
    this.belt = [];
    this.beltReserved = false;
    this.dropping = false;

    // Xe đẩy + công nhân vận chuyển
    this.cart = this._makeCart(L.cartX, 1);
    this.cart.state = 'ready';
    this.cState = 'idle';
    this.cT = 0;
    this.tidyT = 0;
    this.walkT = 0;
  }

  _makeCart(x, alpha) {
    var img = this._img('cart', x, this.L.cartBottom, 'cart', 0.5, 1);
    img.setAlpha(alpha);
    return { img: img, x: x, boxes: [], state: 'arriving' };
  }

  _newBox(x, y, key) {
    var sp = this._img('boxes', x, y, key, 0.5, 1);
    return { sp: sp };
  }

  // Chuyển một vật theo đường cong parabol
  _move(box, x1, y1, arc, dur, onDone) {
    this.moves.push({
      box: box, x0: box.sp.x, y0: box.sp.y, x1: x1, y1: y1, arc: arc, dur: dur, t: 0, onDone: onDone
    });
  }

  _updateMoves(dt) {
    for (var i = this.moves.length - 1; i >= 0; i--) {
      var m = this.moves[i];
      m.t += dt;
      var u = Math.min(1, m.t / m.dur);
      m.box.sp.x = m.x0 + (m.x1 - m.x0) * u;
      m.box.sp.y = m.y0 + (m.y1 - m.y0) * u - m.arc * 4 * u * (1 - u);
      if (u >= 1) {
        this.moves.splice(i, 1);
        if (m.onDone) m.onDone();
      }
    }
  }

  _spawnFlat() {
    var self = this;
    var L = this.L;
    var box = this._newBox(this.stageX(0) + L.machineDX, L.tableTop - 5, 'box_flat');
    this.reserved[0] = true;
    this._move(box, this.spotX(0), L.tableTop, 8, 0.3, function () {
      self.spots[0] = box;
      self.reserved[0] = false;
    });
  }

  /* ---- Mỗi công đoạn tại bàn ---- */
  _updateStage(i, dt) {
    var st = this.stages[i];
    var w = this.workers[i];
    var def = this.C.STAGES[i];

    if (st.state === 'wait') {
      if (i === 0 && !this.spots[0] && !this.reserved[0]) this._spawnFlat();
      if (this.spots[i]) {
        st.state = 'work';
        st.t = 0;
        st.dur = (def.work * (0.9 + Math.random() * 0.3)) / this.speed;
        st.fx = {};
      }
    }

    if (st.state === 'work') {
      st.t += dt;
      var p = Math.min(1, st.t / st.dur);
      this._stageAction(i, p, st);
      w.update(dt, p);
      if (p >= 1) {
        st.state = 'done';
        this._resetMachine(i);
      }
    } else {
      w.update(dt, null);
    }

    if (st.state === 'done') this._tryHandoff(i, st);
  }

  // Hiệu ứng riêng của từng công đoạn (đổi hình thùng, máy móc chuyển động)
  _stageAction(i, p, st) {
    var L = this.L;
    var box = this.spots[i];
    var self = this;

    if (i === 0) {
      if (p > 0.5 && !st.fx.a) { box.sp.setTexture('box_open'); st.fx.a = true; }
    } else if (i === 1) {
      if (p > 0.35 && !st.fx.a) {
        st.fx.a = true;
        var item = this._newBox(this.stageX(1) + L.machineDX, L.tableTop - 8, 'item');
        this._move(item, this.spotX(1), L.tableTop - 5, 9, 0.3, function () {
          box.sp.setTexture('box_item');
          item.sp.destroy();
        });
      }
    } else if (i === 2) {
      this.machines[2].y = L.tableTop + (p > 0.4 && p < 0.6 ? 1 : 0);
      if (p > 0.5 && !st.fx.a) { box.sp.setTexture('box_taped'); st.fx.a = true; }
    } else if (i === 3) {
      this.machines[3].setTexture(p > 0.25 && p < 0.75 ? 'scanner_on' : 'scanner');
      if (p > 0.7 && !st.fx.a) { box.sp.setTexture('box_ok'); st.fx.a = true; }
    }
  }

  _resetMachine(i) {
    if (i === 2) this.machines[2].y = this.L.tableTop;
    if (i === 3) this.machines[3].setTexture('scanner');
  }

  _tryHandoff(i, st) {
    var self = this;
    var L = this.L;
    var box = this.spots[i];

    if (i < 4) {
      var t = i + 1;
      if (this.spots[t] || this.reserved[t]) return;       // phía sau đang bận -> đứng chờ
      this.reserved[t] = true;
      this.spots[i] = null;
      this._move(box, this.spotX(t), L.tableTop, 14, 0.5, function () {
        self.spots[t] = box;
        self.reserved[t] = false;
      });
      st.state = 'wait';
    } else {
      var last = this.belt.length ? this.belt[this.belt.length - 1].sp.x : null;
      if (this.beltReserved || (last !== null && last < L.beltLoadX + this.C.BOX_GAP)) return;
      this.beltReserved = true;
      this.spots[4] = null;
      this._move(box, L.beltLoadX, L.tableTop, 12, 0.45, function () {
        self.belt.push(box);
        self.beltReserved = false;
      });
      st.state = 'wait';
    }
  }

  /* ---- Băng chuyền + xe đẩy ---- */
  _updateBelt(dt) {
    var L = this.L;
    var v = this.C.BELT_SPEED;
    this.beltTile.tilePositionX -= v * dt;

    for (var k = 0; k < this.belt.length; k++) {
      var b = this.belt[k];
      var lim = k === 0 ? L.beltEndX : this.belt[k - 1].sp.x - this.C.BOX_GAP;
      b.sp.x = Math.min(b.sp.x + v * dt, lim);
    }

    // Thùng ở cuối băng chuyền rơi vào xe đẩy (nếu xe đang chờ và còn chỗ)
    var front = this.belt[0];
    var cart = this.cart;
    if (front && front.sp.x >= L.beltEndX - 0.5 && cart.state === 'ready' && !this.dropping &&
        cart.boxes.length < this.C.CART_CAPACITY) {
      this._dropIntoCart(this.belt.shift());
    }
  }

  _dropIntoCart(box) {
    var self = this;
    var L = this.L;
    var cart = this.cart;
    var slots = [[-6, 0], [4, 0], [-1, -7]];
    var slot = slots[cart.boxes.length];
    this.dropping = true;

    this._move(box, cart.x + slot[0], L.cartBottom - 5 + slot[1], 6, 0.35, function () {
      cart.boxes.push({ box: box, dx: slot[0], dy: slot[1] });
      self.dropping = false;
      self.count += 1;
      self.label.setText('DÂY ' + (self.index + 1) + ' · ' + self.count);
      self.tidyT = 0.5;
      if (!self.muted) self.scene.events.emit('product-packed', { stationIndex: self.index });
      if (cart.boxes.length >= self.C.CART_CAPACITY) {
        cart.state = 'leaving';
        self.cState = 'push';
      }
    });
  }

  _placeCartBoxes(alpha) {
    var cart = this.cart;
    cart.img.x = cart.x;
    cart.img.setAlpha(alpha);
    for (var i = 0; i < cart.boxes.length; i++) {
      var b = cart.boxes[i];
      b.box.sp.x = cart.x + b.dx;
      b.box.sp.y = this.L.cartBottom - 5 + b.dy;
      b.box.sp.setAlpha(alpha);
    }
  }

  /* ---- Công nhân vận chuyển ---- */
  _updateCarrier(dt) {
    var L = this.L;
    var c = this.carrier;
    var cart = this.cart;
    var v = this.C.WALK_SPEED;
    var moving = false;
    var p = null;
    var alpha = 1;

    if (this.cState === 'idle') {
      if (this.tidyT > 0) {
        this.tidyT -= dt;
        p = 1 - Math.max(0, this.tidyT) / 0.5;
        c.setProfile('ship');
      }
    } else if (this.cState === 'push') {
      // Đẩy xe đầy hàng ra cổng giao hàng
      moving = true;
      cart.x = Math.min(L.doorX, cart.x + v * dt);
      c.setX(cart.x - 24);
      c.setProfile('push');
      p = 0.5;
      if (cart.x >= L.doorX) {
        this.cState = 'shipped';
        this.cT = 0;
      }
    } else if (this.cState === 'shipped') {
      // Xe biến mất vào cổng (mờ dần), công nhân đứng nghỉ một nhịp
      this.cT += dt;
      alpha = Math.max(0, 1 - this.cT / 0.35);
      if (this.cT >= 0.35) {
        for (var i = 0; i < cart.boxes.length; i++) cart.boxes[i].box.sp.destroy();
        cart.img.destroy();
        this.cart = this._makeCart(L.doorX, 0);
        this.cState = 'back';
        c.setFacing(-1);
        alpha = 0;
      }
    } else if (this.cState === 'back') {
      // Công nhân quay về, kéo theo xe trống từ cổng ra
      moving = true;
      cart = this.cart;
      c.setX(Math.max(L.carrierX, c.x - v * dt));
      cart.x = Math.max(L.cartX, cart.x - v * dt);
      alpha = Math.min(1, (L.doorX - cart.x) / 14);
      if (c.x <= L.carrierX && cart.x <= L.cartX) {
        c.setFacing(1);
        cart.state = 'ready';
        this.cState = 'idle';
        alpha = 1;
      }
    }

    // Bước đi: đổi qua lại hai kiểu chân
    this.walkT += dt;
    var key = 'worker_' + this.index + '_5';
    c.setBodyTexture(moving && Math.floor(this.walkT / 0.18) % 2 === 1 ? key + '_walk' : key);

    c.update(dt, p);
    this._placeCartBoxes(alpha);
  }

  /* ------------------------------ Cập nhật ------------------------------ */
  update(dt) {
    for (var i = 0; i < 5; i++) this._updateStage(i, dt);
    this._updateMoves(dt);
    this._updateBelt(dt);
    this._updateCarrier(dt);
  }

  // Chạy trước vài giây để lúc mở game dây chuyền đã có thùng ở mọi công đoạn
  _warmUp(seconds) {
    this.muted = true;
    for (var t = 0; t < seconds; t += 1 / 30) this.update(1 / 30);
    this.muted = false;
    this.count = 0;
    this.label.setText('DÂY ' + (this.index + 1) + ' · 0');
  }
};
