// ============================================================
// FILE: StageScene.js
// FUNGSI: Gameplay utama — player, ground, platform, moving platform,
//         spikes, box, key, musuh, nyawa, HUD & transisi stage
// ============================================================

class StageScene extends Phaser.Scene {
  constructor() {
    super("StageScene");
  }

  // ---------- INIT ----------
  init(data) {
    this.stageIndex = data.stageIndex || 0;
    this.studentName = data.studentName || "Anonim";
    this.studentNumber = data.studentNumber || "-";
    this.characterKey = data.characterKey || "green";
    this.answersMap = data.answersMap || {};
    this.lives = data.lives !== undefined ? data.lives : 3;
    this.keysCollected = 0;
    this.questionsDone = 0;
    this.isPaused = false;
    this.isTransitioning = false;
    this.isInvulnerable = false;
    this.isKnockedBack = false;
    this.hasKey = [false, false];

    this.lastHitDirX = -1;
    this.lastHitFromAbove = false;
  }

  // ---------- PRELOAD ----------
  preload() {
    const c = ASSETS.characters[this.characterKey] || ASSETS.characters["green"];
    const charKey = this.characterKey || "green";

    const safeLoad = (key, path) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, path);
      }
    };

    safeLoad(`${charKey}_front`, c.front);
    safeLoad(`${charKey}_walk_a`, c.walkA);
    safeLoad(`${charKey}_walk_b`, c.walkB);
    safeLoad(`${charKey}_jump`, c.jump);
    safeLoad(`${charKey}_hit`, c.hit);

    safeLoad("box", ASSETS.box);
    safeLoad("key", ASSETS.key);
    const platformPath = ASSETS.platforms[this.stageIndex] || ASSETS.platforms[0];
    safeLoad("platform_" + this.stageIndex, platformPath);
    safeLoad("ground_tile", ASSETS.groundTile);
    safeLoad("enemy_walk_a", ASSETS.enemyWalkA);
    safeLoad("enemy_walk_b", ASSETS.enemyWalkB);
    safeLoad("spike", ASSETS.spike);

    const bgPath = ASSETS.backgrounds[this.stageIndex] || ASSETS.backgrounds[0];
    safeLoad("bg_" + this.stageIndex, bgPath);
  }

  // ---------- CREATE ----------
  create() {
    const stage = STAGES[this.stageIndex];

    this.cameras.main.fadeIn(500);

    // Pastikan texture fallback selalu tersedia
    this.generateFallbackTextures();

    this.createBackground();
    this.createHUD(stage);

    // PHYSICS GROUPS
    this.groundGroup = this.physics.add.staticGroup();
    this.platformGroup = this.physics.add.staticGroup();
    this.movingPlatformGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.spikeGroup = this.physics.add.staticGroup();
    this.boxGroup = this.physics.add.staticGroup();
    this.keyGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.enemyGroup = this.physics.add.group();

    // BIKIN OBJEK STAGE
    this.createGrounds(stage);
    this.createPlatforms(stage);
    this.createMovingPlatforms(stage);
    this.createSpikes(stage);
    this.createBoxes(stage);
    this.createKeys(stage);
    this.createEnemies(stage);
    this.createPlayer();

    this.setupColliders();

    this.cursors = this.input.keyboard.createCursorKeys();

    // ============================================================
    // TOUCH CONTROLS (cuma muncul di HP/tablet)
    // ============================================================
    if (window.IS_TOUCH_DEVICE) {
      this.createTouchControls();
    }
  }

  // ============================================================
  // GENERATE FALLBACK TEXTURES (untuk tile kecil/indexed PNG)
  // ============================================================
  generateFallbackTextures() {
    // Box ❓ — Kuning dengan border gelap
    if (!this.textures.exists("box_gen")) {
      const boxGfx = this.make.graphics({ x: 0, y: 0, add: false });
      boxGfx.fillStyle(0xf0a000, 1);
      boxGfx.fillRect(0, 0, 40, 40);
      boxGfx.lineStyle(3, 0x4a2800, 1);
      boxGfx.strokeRect(1, 1, 38, 38);
      // Tambah efek gradient bawah
      boxGfx.fillStyle(0xc87800, 1);
      boxGfx.fillRect(2, 30, 36, 8);
      boxGfx.generateTexture("box_gen", 40, 40);
      boxGfx.destroy();
    }

    // Key 🔑 — Emas
    if (!this.textures.exists("key_gen")) {
      const keyGfx = this.make.graphics({ x: 0, y: 0, add: false });
      keyGfx.fillStyle(0xffd700, 1);
      keyGfx.fillCircle(12, 12, 10);
      keyGfx.fillStyle(0xffa500, 1);
      keyGfx.fillCircle(12, 12, 6);
      keyGfx.fillStyle(0xffd700, 1);
      keyGfx.fillRect(18, 10, 14, 4);
      keyGfx.fillRect(28, 14, 4, 5);
      keyGfx.fillRect(24, 14, 4, 4);
      keyGfx.lineStyle(1.5, 0x8b6914, 1);
      keyGfx.strokeCircle(12, 12, 10);
      keyGfx.generateTexture("key_gen", 36, 24);
      keyGfx.destroy();
    }

    // Enemy 🐸 — Hijau
    if (!this.textures.exists("enemy_gen_a")) {
      const eGfx = this.make.graphics({ x: 0, y: 0, add: false });
      eGfx.fillStyle(0x2ecc40, 1);
      eGfx.fillEllipse(18, 18, 28, 22);
      eGfx.fillStyle(0xffffff, 1);
      eGfx.fillCircle(11, 13, 5);
      eGfx.fillCircle(25, 13, 5);
      eGfx.fillStyle(0x222222, 1);
      eGfx.fillCircle(11, 13, 3);
      eGfx.fillCircle(25, 13, 3);
      eGfx.fillStyle(0xff6666, 1);
      eGfx.fillRect(10, 21, 16, 3);
      eGfx.generateTexture("enemy_gen_a", 36, 30);
      eGfx.destroy();
    }
    if (!this.textures.exists("enemy_gen_b")) {
      const eGfx2 = this.make.graphics({ x: 0, y: 0, add: false });
      eGfx2.fillStyle(0x27ae60, 1);
      eGfx2.fillEllipse(18, 18, 28, 22);
      eGfx2.fillStyle(0xffffff, 1);
      eGfx2.fillCircle(11, 13, 5);
      eGfx2.fillCircle(25, 13, 5);
      eGfx2.fillStyle(0x222222, 1);
      eGfx2.fillCircle(11, 13, 3);
      eGfx2.fillCircle(25, 13, 3);
      eGfx2.fillStyle(0xff4444, 1);
      eGfx2.fillRect(10, 22, 16, 3);
      eGfx2.generateTexture("enemy_gen_b", 36, 30);
      eGfx2.destroy();
    }
  }

  // ============================================================
  // BACKGROUND
  // ============================================================
  createBackground() {
    const bgKey = "bg_" + this.stageIndex;
    const bg = this.add.image(400, 200, bgKey);
    bg.setDisplaySize(800, 400);
    bg.setDepth(-10);
  }

  // ============================================================
  // HUD
  // ============================================================
  createHUD(stage) {
    this.add.text(15, 10, stage.name, {
      fontSize: "16px",
      fontFamily: "Arial",
      color: stage.themeColor || "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });

    this.add.text(15, 30, `Siswa: ${this.studentName} (${this.studentNumber})`, {
      fontSize: "12px",
      fontFamily: "Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });

    this.heartsText = this.add
      .text(785, 10, this.getHeartsString(), {
        fontSize: "18px",
        fontFamily: "Arial",
      })
      .setOrigin(1, 0);

    this.keysHUDText = this.add
      .text(785, 36, "🔑 Kunci: [ ❌ | ❌ ]", {
        fontSize: "13px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(1, 0);

    this.progressText = this.add.text(15, 48, "Progres Soal: 0/2", {
      fontSize: "13px",
      fontFamily: "Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });
  }

  getHeartsString() {
    let s = "";
    for (let i = 0; i < 3; i++) {
      s += i < this.lives ? "❤️ " : "🖤 ";
    }
    return s.trim();
  }

  updateHUD() {
    if (this.heartsText) this.heartsText.setText(this.getHeartsString());
    if (this.keysHUDText) {
      const k1 = this.hasKey[0] ? "✅" : "❌";
      const k2 = this.hasKey[1] ? "✅" : "❌";
      this.keysHUDText.setText(`🔑 Kunci: [ ${k1} | ${k2} ]`);
    }
    if (this.progressText) {
      this.progressText.setText(`Progres Soal: ${this.questionsDone}/2`);
    }
  }

  // ============================================================
  // BUAT GROUND
  // ============================================================
  createGrounds(stage) {
    stage.grounds.forEach((g) => {
      const isVisible = stage.showGround === true;
      const groundColor = stage.groundColor || 0x8b4513;
      const alpha = isVisible ? 1 : 0.001;

      // Buat visual rectangle
      const visual = this.add.rectangle(g.x, g.y, g.w, g.h, groundColor, alpha);
      if (isVisible) {
        visual.setStrokeStyle(3, 0x000000);
      }

      // Buat physics body terpisah — pastikan tepat aligned
      this.physics.add.existing(visual, true);
      visual.body.updateFromGameObject();
      this.groundGroup.add(visual);
    });
  }

  // ============================================================
  // BUAT PLATFORM
  // ============================================================
  createPlatforms(stage) {
    const platformKey = "platform_" + this.stageIndex;
    const defaultSink = stage.platformSink !== undefined ? stage.platformSink : 0;

    stage.platforms.forEach((p) => {
      const visual = this.add.image(p.x, p.y, platformKey);
      visual.setDisplaySize(p.w, p.h);

      const sinkOffset = p.sink !== undefined ? p.sink : defaultSink;
      const bodyHeight = 8;
      const bodyY = p.y - p.h / 2 + bodyHeight / 2 + sinkOffset;

      const body = this.add.rectangle(p.x, bodyY, p.w, bodyHeight, 0x000000, 0);
      this.physics.add.existing(body, true);
      body.body.updateFromGameObject();
      this.platformGroup.add(body);
    });
  }

  // ============================================================
  // MOVING PLATFORM
  // ============================================================
  createMovingPlatforms(stage) {
    if (!stage.movingPlatforms) return;
    stage.movingPlatforms.forEach((mp) => {
      const r = this.add.rectangle(mp.x, mp.y, mp.w, mp.h, 0xd2691e);
      r.setStrokeStyle(2, 0x000000);
      this.physics.add.existing(r, false);
      r.body.setAllowGravity(false);
      r.body.setImmovable(true);

      const targetX = mp.distanceX ? mp.x + mp.distanceX : mp.x;
      const targetY = mp.distanceY ? mp.y + mp.distanceY : mp.y;
      const duration = 200000 / (mp.speed || 80);

      this.tweens.add({
        targets: r.body.velocity,
        x: mp.distanceX ? (targetX > mp.x ? mp.speed : -mp.speed) : 0,
        y: mp.distanceY ? (targetY > mp.y ? mp.speed : -mp.speed) : 0,
        duration: duration,
        yoyo: true,
        repeat: -1,
        ease: "Linear",
      });

      this.movingPlatformGroup.add(r);
    });
  }

  // ============================================================
  // SPIKES
  // ============================================================
  createSpikes(stage) {
    if (!stage.spikes) return;
    stage.spikes.forEach((s) => {
      const spike = this.add.triangle(s.x, s.y, 0, s.h, s.w / 2, 0, s.w, s.h, 0xe52521);
      spike.setStrokeStyle(2, 0x000000);
      this.physics.add.existing(spike, true);
      spike.body.updateFromGameObject();
      this.spikeGroup.add(spike);
    });
  }

  // ============================================================
  // BOXES ❓
  // ============================================================
  createBoxes(stage) {
    // Pilih texture: box_gen (generated) atau box (PNG jika valid)
    const boxTex = this.textures.exists("box_gen") ? "box_gen" : "box";

    stage.boxes.forEach((b, i) => {
      const boxSize = 40; // ukuran visual box dalam px
      const box = this.physics.add.staticImage(b.x, b.y, boxTex);
      box.setDisplaySize(boxSize, boxSize);
      box.boxIndex = i;
      box.isOpened = false;
      box.refreshBody();

      box.qmark = this.add
        .text(b.x, b.y, "?", {
          fontSize: "26px",
          fontFamily: "Arial",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(1);

      this.boxGroup.add(box);
    });
  }

  // ============================================================
  // KEYS 🔑
  // ============================================================
  createKeys(stage) {
    const keyTex = this.textures.exists("key_gen") ? "key_gen" : "key";

    stage.keys.forEach((k, i) => {
      const key = this.physics.add.sprite(k.x, k.y, keyTex);
      key.setDisplaySize(36, 24);
      key.keyIndex = i;
      key.collected = false;

      key.body.setAllowGravity(false);
      key.body.setImmovable(true);

      this.keyGroup.add(key);

      key.floatTween = this.tweens.add({
        targets: key,
        y: k.y - 8,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    });
  }

  // ============================================================
  // ENEMIES
  // ============================================================
  createEnemies(stage) {
    const useGen = this.textures.exists("enemy_gen_a");
    const frameA = useGen ? "enemy_gen_a" : "enemy_walk_a";
    const frameB = useGen ? "enemy_gen_b" : "enemy_walk_b";
    const enemyAnimKey = "enemy_walk_gen";

    if (!this.anims.exists(enemyAnimKey)) {
      this.anims.create({
        key: enemyAnimKey,
        frames: [{ key: frameA }, { key: frameB }],
        frameRate: 6,
        repeat: -1,
      });
    }

    // Fallback legacy anim
    if (!this.anims.exists("enemy_walk")) {
      this.anims.create({
        key: "enemy_walk",
        frames: [{ key: frameA }, { key: frameB }],
        frameRate: 6,
        repeat: -1,
      });
    }

    stage.enemies.forEach((e) => {
      const enemy = this.physics.add.sprite(e.x, e.y, frameA);
      if (useGen) {
        enemy.setDisplaySize(36, 30);
      } else {
        enemy.setScale(1.5);
      }
      enemy.speed = e.speed;
      enemy.direction = 1;
      enemy.setVelocityX(e.speed);
      enemy.setCollideWorldBounds(true);

      enemy.patrolMin = e.patrolMin !== undefined ? e.patrolMin : null;
      enemy.patrolMax = e.patrolMax !== undefined ? e.patrolMax : null;

      // Body size: 24×20 visual
      const visW = 24;
      const visH = 20;
      const texW = enemy.width;
      const texH = enemy.height;
      const scaleX = enemy.scaleX;
      const scaleY = enemy.scaleY;
      enemy.body.setSize(visW / scaleX, visH / scaleY);
      enemy.body.setOffset((texW - visW / scaleX) / 2, (texH - visH / scaleY) / 2);

      enemy.anims.play(enemyAnimKey, true);
      enemy.flipX = false;

      this.enemyGroup.add(enemy);
    });
  }

  // ============================================================
  // PLAYER
  // ============================================================
  createPlayer() {
    const stage = STAGES[this.stageIndex];
    const firstGround = stage.grounds[0];
    const groundTop = firstGround.y - firstGround.h / 2;
    const spawnY = groundTop - 50;
    const charKey = this.characterKey || "green";

    this.player = this.physics.add.sprite(60, spawnY, `${charKey}_front`).setScale(0.2);
    this.player.setCollideWorldBounds(false);

    this.setPlayerBody();

    const animKey = `${charKey}_walk_anim`;
    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: [{ key: `${charKey}_walk_a` }, { key: `${charKey}_walk_b` }],
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  setPlayerBody() {
    if (!this.player || !this.player.body) return;
    // Sprite texture is 256×256, displayed at scale 0.2 → visual ~51×51px
    // setSize() uses pre-scale (texture) pixels, so to get a 36×46 visual body:
    //   bodyW_tex = 36 / 0.2 = 180, bodyH_tex = 46 / 0.2 = 230
    const SCALE = 0.2;
    const visualW = 36;
    const visualH = 46;
    const bodyW = Math.round(visualW / SCALE);  // 180
    const bodyH = Math.round(visualH / SCALE);  // 230
    const texW = this.player.width;   // 256
    const texH = this.player.height;  // 256
    const offsetX = (texW - bodyW) / 2;               // center horizontally
    const offsetY = texH - bodyH;                      // align to bottom of sprite
    this.player.body.setSize(bodyW, bodyH);
    this.player.body.setOffset(offsetX, offsetY);
  }

  // ============================================================
  // TOUCH CONTROLS — tombol virtual responsive & multi-touch
  // ============================================================
  createTouchControls() {
    const alpha = 0.45;
    const btnRadius = 30;
    const btnColor = 0x0f172a;
    const activeColor = 0xfbd000;
    const iconColor = "#ffffff";

    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;

    // Track active pointer IDs untuk multi-touch sejati
    this.pointersState = {
      left: null,
      right: null,
      jump: null,
    };

    // ---------- HELPER BIKIN TOMBOL TOUCH ----------
    const createBtn = (x, y, iconStr, labelKey) => {
      const container = this.add.container(x, y).setDepth(1000).setScrollFactor(0);

      const circle = this.add
        .circle(0, 0, btnRadius, btnColor, alpha)
        .setStrokeStyle(3, 0xffffff, 0.7)
        .setInteractive();

      const icon = this.add
        .text(0, 0, iconStr, {
          fontSize: "24px",
          fontFamily: "Arial",
          color: iconColor,
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      container.add([circle, icon]);

      const setPressed = (pressed, pointerId) => {
        if (pressed) {
          this[`touch${labelKey}`] = true;
          this.pointersState[labelKey] = pointerId;
          circle.setFillStyle(activeColor, 0.7);
          circle.setStrokeStyle(3, 0xffffff, 1.0);
          icon.setColor("#000000");
          container.setScale(0.92);

          if (navigator.vibrate) {
            try {
              navigator.vibrate(10);
            } catch (e) { }
          }
        } else {
          this[`touch${labelKey}`] = false;
          this.pointersState[labelKey] = null;
          circle.setFillStyle(btnColor, alpha);
          circle.setStrokeStyle(3, 0xffffff, 0.7);
          icon.setColor(iconColor);
          container.setScale(1.0);
        }
      };

      circle.on("pointerdown", (pointer) => {
        setPressed(true, pointer.id);
      });

      circle.on("pointerup", (pointer) => {
        if (this.pointersState[labelKey] === pointer.id || !pointer) {
          setPressed(false, null);
        }
      });

      circle.on("pointerout", (pointer) => {
        if (this.pointersState[labelKey] === pointer.id) {
          setPressed(false, null);
        }
      });

      circle.on("pointercancel", () => {
        setPressed(false, null);
      });

      return container;
    };

    // Tombol Kiri, Kanan, & Lompat
    this.btnLeftObj = createBtn(60, 340, "◀", "Left");
    this.btnRightObj = createBtn(140, 340, "▶", "Right");
    this.btnJumpObj = createBtn(740, 340, "▲", "Jump");

    // Global pointerup safety release
    this.input.on("pointerup", (pointer) => {
      Object.keys(this.pointersState).forEach((key) => {
        if (this.pointersState[key] === pointer.id) {
          this.pointersState[key] = null;
          this[`touch${key}`] = false;
          if (key === "Left" && this.btnLeftObj) this.btnLeftObj.getAt(0).setFillStyle(btnColor, alpha);
          if (key === "Right" && this.btnRightObj) this.btnRightObj.getAt(0).setFillStyle(btnColor, alpha);
          if (key === "Jump" && this.btnJumpObj) this.btnJumpObj.getAt(0).setFillStyle(btnColor, alpha);
        }
      });
    });
  }

  // ============================================================
  // COLLIDERS
  // ============================================================
  setupColliders() {
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup);
    this.physics.add.collider(this.player, this.movingPlatformGroup);

    this.physics.add.collider(this.player, this.boxGroup, this.hitBox, null, this);
    this.physics.add.overlap(this.player, this.enemyGroup, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.spikeGroup, this.hitSpike, null, this);
    this.physics.add.overlap(this.player, this.keyGroup, this.collectKey, null, this);

    this.physics.add.collider(this.enemyGroup, this.groundGroup);
    this.physics.add.collider(this.enemyGroup, this.platformGroup);
  }

  // ============================================================
  // UPDATE LOOP
  // ============================================================
  update() {
    if (this.isPaused || this.isTransitioning) {
      if (this.player && this.player.body) {
        this.player.setVelocityX(0);
      }
      return;
    }

    if (this.player.x < 20) this.player.x = 20;
    if (this.player.x > 780) this.player.x = 780;

    if (this.player.y > 450) {
      this.takeDamage("Pit");
      return;
    }

    // ---------- INPUT & ANIMASI PLAYER ----------
    const movingLeft = this.cursors.left.isDown || this.touchLeft === true;
    const movingRight = this.cursors.right.isDown || this.touchRight === true;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const charKey = this.characterKey || "green";

    this.wasOnGround = onGround;

    if (!this.isKnockedBack) {
      if (movingLeft) {
        this.player.setVelocityX(-200);
        this.player.flipX = true;
      } else if (movingRight) {
        this.player.setVelocityX(200);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
      }

      const jumpPressed = this.cursors.up.isDown || this.touchJump === true;

      if (jumpPressed && onGround) {
        this.player.setVelocityY(-480);
        audioFX.playJump();
        this.touchJump = false; // reset flag agar tak terulang
      }
    }

    if (!this.isKnockedBack) {
      if (!onGround) {
        if (this.player.anims.isPlaying) this.player.anims.stop();
        const jumpKey = `${charKey}_jump`;
        if (this.player.texture.key !== jumpKey) {
          this.player.setTexture(jumpKey);
          this.setPlayerBody();
        }
      } else {
        if (movingLeft || movingRight) {
          this.playWalkAnim();
        } else {
          this.stopWalkAnim();
        }
      }
    }

    // ---------- PATROLI MUSUH ----------
    const stage = STAGES[this.stageIndex];
    this.enemyGroup.getChildren().forEach((enemy) => {
      if (!enemy.body) return;

      if (enemy.patrolMin !== null && enemy.patrolMax !== null) {
        if (enemy.x <= enemy.patrolMin) enemy.direction = 1;
        if (enemy.x >= enemy.patrolMax) enemy.direction = -1;
      } else {
        if (enemy.x <= 20) enemy.direction = 1;
        if (enemy.x >= 780) enemy.direction = -1;

        const lookAheadX = enemy.x + enemy.direction * 30;
        let groundAhead = false;

        for (const g of stage.grounds) {
          const gLeft = g.x - g.w / 2;
          const gRight = g.x + g.w / 2;
          if (lookAheadX >= gLeft && lookAheadX <= gRight) {
            groundAhead = true;
            break;
          }
        }

        if (!groundAhead) {
          enemy.direction *= -1;
        }
      }

      enemy.setVelocityX(enemy.speed * enemy.direction);
      enemy.flipX = enemy.direction > 0;

      if (!enemy.anims.isPlaying) {
        enemy.anims.play("enemy_walk_gen", true);
      }

      if (enemy.y > 450) enemy.destroy();
    });
  }

  playWalkAnim() {
    const charKey = this.characterKey || "green";
    const animKey = `${charKey}_walk_anim`;
    if (!this.player.anims.isPlaying) {
      this.player.anims.play(animKey, true);
      this.setPlayerBody();
    }
  }

  stopWalkAnim() {
    const charKey = this.characterKey || "green";
    const frontKey = `${charKey}_front`;
    if (this.player.anims.isPlaying) {
      this.player.anims.stop();
    }
    if (this.player.texture.key !== frontKey) {
      this.player.setTexture(frontKey);
      this.setPlayerBody();
    }
  }

  // ============================================================
  // TAKE DAMAGE
  // ============================================================
  hitEnemy(player, enemy) {
    if (this.isInvulnerable || this.isTransitioning || this.isPaused) return;

    this.lastHitDirX = enemy.x < player.x ? 1 : -1;
    this.lastHitFromAbove = player.y < enemy.y - 20;

    this.takeDamage("Enemy");
  }

  hitSpike(player, spike) {
    if (this.isInvulnerable || this.isTransitioning || this.isPaused) return;

    this.lastHitDirX = player.flipX ? 1 : -1;
    this.lastHitFromAbove = false;

    this.takeDamage("Spike");
  }

  takeDamage(source) {
    if (this.isInvulnerable) {
      if (source === "Pit") {
        // Jika sedang kebal tapi jatuh ke jurang, cukup kembalikan ke awal tanpa mengurangi nyawa lagi
        const firstGround = STAGES[this.stageIndex].grounds[0];
        const groundTop = firstGround.y - firstGround.h / 2;
        this.player.setPosition(60, groundTop - 50);
        this.player.setVelocity(0, 0);
      }
      return;
    }

    audioFX.playHurt();
    this.cameras.main.shake(250, 0.012); // Camera shake feedback

    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    this.isInvulnerable = true;
    this.isKnockedBack = true;

    const charKey = this.characterKey || "green";
    if (this.player.anims.isPlaying) this.player.anims.stop();
    this.player.setTexture(`${charKey}_hit`);
    this.player.setFlipX(false);
    this.setPlayerBody();

    const knockbackX = this.lastHitDirX || -1;
    const knockbackY = this.lastHitFromAbove ? 200 : -300;

    this.player.setVelocity(knockbackX * 250, knockbackY);

    this.lastHitDirX = -1;
    this.lastHitFromAbove = false;

    let blinkTween = null;
    if (source !== "Pit") {
      blinkTween = this.tweens.add({
        targets: this.player,
        alpha: 0.2,
        duration: 200,
        yoyo: true,
        repeat: 7, // ~3 seconds of blinking
        onComplete: () => {
          this.player.setAlpha(1);
          this.isInvulnerable = false;
        }
      });
    }

    this.time.delayedCall(500, () => {
      const firstGround = STAGES[this.stageIndex].grounds[0];
      const groundTop = firstGround.y - firstGround.h / 2;

      this.player.setPosition(60, groundTop - 50);
      this.player.setVelocity(0, 0);
      this.player.setTexture(`${charKey}_front`);
      this.setPlayerBody();
      this.isKnockedBack = false;

      if (source === "Pit") {
        this.player.setAlpha(1);
        this.isInvulnerable = false;
      }
    });

    const msgText = source === "Pit" ? "⚠️ Jatuh ke jurang!" : "⚠️ Terkena Rintangan!";
    const msg = this.add
      .text(400, 150, msgText, {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ff4444",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.tweens.add({
      targets: msg,
      y: msg.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => msg.destroy(),
    });
  }

  // ============================================================
  // GAME OVER
  // ============================================================
  gameOver() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.player.setVelocity(0, 0);

    if (this.player.anims.isPlaying) this.player.anims.stop();
    const charKey = this.characterKey || "green";
    this.player.setTexture(`${charKey}_hit`);
    this.player.setFlipX(false);

    this.player.setVelocityY(-350);
    this.player.body.checkCollision.none = true;

    this.time.delayedCall(900, () => {
      audioFX.playGameOver();
      this.showGameOverScreen();
    });
  }

  showGameOverScreen() {
    this.add.rectangle(400, 200, 800, 400, 0x000000, 0.85).setDepth(200);

    this.add
      .text(400, 130, "💀 GAME OVER 💀", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#e52521",
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(400, 185, "Nyawa kamu telah habis!", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.add
      .text(400, 220, `Kamu sampai di: ${STAGES[this.stageIndex].name}`, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(201);

    const btn = this.add.rectangle(400, 285, 220, 45, 0xe52521).setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true }).setDepth(201);

    this.add
      .text(400, 285, "COBA LAGI", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(202);

    btn.on("pointerover", () => btn.setFillStyle(0xff3333));
    btn.on("pointerout", () => btn.setFillStyle(0xe52521));
    btn.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.restart({
          stageIndex: this.stageIndex,
          studentName: this.studentName,
          studentNumber: this.studentNumber,
          characterKey: this.characterKey,
          answersMap: this.answersMap,
          lives: 3,
        });
      });
    });
  }

  // ============================================================
  // AMBIL KUNCI
  // ============================================================
  collectKey(player, key) {
    if (this.isTransitioning || key.collected) return;
    key.collected = true;

    audioFX.playKey();
    const idx = key.keyIndex;

    if (key.floatTween) key.floatTween.stop();

    this.tweens.add({
      targets: key,
      scale: 0,
      duration: 200,
      onComplete: () => {
        if (key.body) key.body.enable = false;
        key.destroy();
      },
    });

    this.hasKey[idx] = true;
    this.keysCollected++;
    this.updateHUD();

    const pesan = this.add
      .text(key.x, key.y - 40, `🔑 Kunci ${idx + 1} Ditemukan!`, {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(50);

    this.tweens.add({
      targets: pesan,
      y: pesan.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => pesan.destroy(),
    });
  }

  // ============================================================
  // HIT BOX & BUKA SOAL
  // ============================================================
  hitBox(player, box) {
    if (box.isOpened) return;

    if (!this.hasKey[box.boxIndex]) {
      if (!this._lastNoKeyMsg || Date.now() - this._lastNoKeyMsg > 2000) {
        this._lastNoKeyMsg = Date.now();
        audioFX.playHurt();
        const msg = this.add
          .text(box.x, box.y - 40, `🔒 Butuh Kunci ${box.boxIndex + 1}!`, {
            fontSize: "15px",
            fontFamily: "Arial",
            color: "#ffdd44",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(50);

        this.tweens.add({
          targets: msg,
          alpha: 0,
          y: msg.y - 30,
          duration: 1200,
          onComplete: () => msg.destroy(),
        });
      }
      return;
    }

    audioFX.playBoxHit();
    this.openBox(box);
  }

  openBox(box) {
    box.isOpened = true;

    const startY = box.y;
    this.tweens.add({
      targets: [box, box.qmark],
      y: "-=15",
      duration: 100,
      yoyo: true,
      onComplete: () => {
        box.y = startY;
      },
    });

    box.setTint(0x9c9c9c);
    const globalIndex = this.stageIndex * 2 + box.boxIndex;
    this.showQuestion(globalIndex);
  }

  // ============================================================
  // SHOW QUESTION — TANPA FETCH! (fetch cuma di FinishScene)
  // ============================================================
  showQuestion(globalIndex) {
    this.isPaused = true;
    this.scene.pause();

    this.scene.launch("QuestionScene", {
      globalIndex: globalIndex,
      studentName: this.studentName,
      stageIndex: this.stageIndex,
      onAnswer: (answerData) => {
        // Simpan jawaban ke memory (tanpa fetch)
        this.answersMap[globalIndex] = answerData;
        this.questionsDone++;
        this.updateHUD();

        if (this.questionsDone >= 2) {
          audioFX.playWin();
          this.goToNextStage();
        }
      },
    });
  }

  // ============================================================
  // PINDAH STAGE
  // ============================================================
  goToNextStage() {
    this.isTransitioning = true;
    this.cameras.main.fadeOut(400); // ← dari 600 jadi 400ms

    this.time.delayedCall(500, () => {
      // ← dari 800 jadi 500ms
      if (this.stageIndex + 1 < STAGES.length) {
        this.scene.start("StageScene", {
          stageIndex: this.stageIndex + 1,
          studentName: this.studentName,
          studentNumber: this.studentNumber,
          characterKey: this.characterKey,
          answersMap: this.answersMap,
          lives: this.lives,
        });
      } else {
        this.scene.start("FinishScene", {
          studentName: this.studentName,
          studentNumber: this.studentNumber,
          answersMap: this.answersMap,
        });
      }
    });
  }
}
