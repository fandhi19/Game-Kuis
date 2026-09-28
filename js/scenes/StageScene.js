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
    this.hasKey = [false, false];

    this.lastHitDirX = -1;
    this.lastHitFromAbove = false;
  }

  // ---------- PRELOAD ----------
  preload() {
    const c = ASSETS.characters[this.characterKey] || ASSETS.characters["green"];
    this.load.image("player_front", c.front);
    this.load.image("player_walk_a", c.walkA);
    this.load.image("player_walk_b", c.walkB);
    this.load.image("player_jump", c.jump);
    this.load.image("player_hit", c.hit);

    this.load.image("box", ASSETS.box);
    this.load.image("key", ASSETS.key);
    const platformPath = ASSETS.platforms[this.stageIndex] || ASSETS.platforms[0];
    this.load.image("platform_" + this.stageIndex, platformPath);
    this.load.image("ground_tile", ASSETS.groundTile);
    this.load.image("enemy_walk_a", ASSETS.enemyWalkA);
    this.load.image("enemy_walk_b", ASSETS.enemyWalkB);
    this.load.image("spike", ASSETS.spike);

    const bgPath = ASSETS.backgrounds[this.stageIndex] || ASSETS.backgrounds[0];
    this.load.image("bg_" + this.stageIndex, bgPath);
  }

  // ---------- CREATE ----------
  create() {
    const stage = STAGES[this.stageIndex];

    this.cameras.main.fadeIn(500);

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

      const ground = this.add.rectangle(g.x, g.y, g.w, g.h, groundColor, alpha);

      if (isVisible) {
        ground.setStrokeStyle(3, 0x000000);
      }

      this.physics.add.existing(ground, true);
      this.groundGroup.add(ground);
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
      this.spikeGroup.add(spike);
    });
  }

  // ============================================================
  // BOXES ❓
  // ============================================================
  createBoxes(stage) {
    stage.boxes.forEach((b, i) => {
      const box = this.physics.add.staticImage(b.x, b.y, "box").setScale(2);
      box.boxIndex = i;
      box.isOpened = false;

      box.qmark = this.add
        .text(b.x, b.y, "?", {
          fontSize: "32px",
          fontFamily: "Arial",
          color: "#000000",
          fontStyle: "bold",
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
    stage.keys.forEach((k, i) => {
      const key = this.physics.add.sprite(k.x, k.y, "key").setScale(1.5);
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
    if (!this.anims.exists("enemy_walk")) {
      this.anims.create({
        key: "enemy_walk",
        frames: [{ key: "enemy_walk_a" }, { key: "enemy_walk_b" }],
        frameRate: 6,
        repeat: -1,
      });
    }

    stage.enemies.forEach((e) => {
      const enemy = this.physics.add.sprite(e.x, e.y, "enemy_walk_a").setScale(1.5);
      enemy.speed = e.speed;
      enemy.direction = 1;
      enemy.setVelocityX(e.speed);
      enemy.setCollideWorldBounds(true);

      enemy.patrolMin = e.patrolMin !== undefined ? e.patrolMin : null;
      enemy.patrolMax = e.patrolMax !== undefined ? e.patrolMax : null;

      const bodyW = 14;
      const bodyH = 14;
      enemy.body.setSize(bodyW, bodyH);
      enemy.body.setOffset((enemy.width - bodyW) / 2, (enemy.height - bodyH) / 2);

      enemy.anims.play("enemy_walk", true);
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
    const spawnY = groundTop - 40;

    this.player = this.physics.add.sprite(60, spawnY, "player_front").setScale(0.2);
    this.player.setCollideWorldBounds(false);

    const bodyW = 60;
    const bodyH = 80;
    this.player.body.setSize(bodyW, bodyH);
    this.player.body.setOffset((this.player.width - bodyW) / 2, this.player.height - bodyH - 20);

    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: [{ key: "player_walk_a" }, { key: "player_walk_b" }],
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  // ============================================================
  // TOUCH CONTROLS — tombol virtual untuk mobile
  // ============================================================
  createTouchControls() {
    const alpha = 0.35;
    const btnSize = 55;
    const btnColor = 0x000000;
    const iconColor = "#ffffff";

    // State tombol (buat tracking touch)
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;

    // ---------- TOMBOL KIRI ----------
    const btnLeft = this.add
      .circle(60, 340, btnSize / 2, btnColor, alpha)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setDepth(500)
      .setScrollFactor(0)
      .setInteractive();

    this.add
      .text(60, 340, "◀", {
        fontSize: "26px",
        fontFamily: "Arial",
        color: iconColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(501)
      .setScrollFactor(0);

    // ---------- TOMBOL KANAN ----------
    const btnRight = this.add
      .circle(140, 340, btnSize / 2, btnColor, alpha)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setDepth(500)
      .setScrollFactor(0)
      .setInteractive();

    this.add
      .text(140, 340, "▶", {
        fontSize: "26px",
        fontFamily: "Arial",
        color: iconColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(501)
      .setScrollFactor(0);

    // ---------- TOMBOL LOMPAT ----------
    const btnJump = this.add
      .circle(740, 340, btnSize / 2, btnColor, alpha)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setDepth(500)
      .setScrollFactor(0)
      .setInteractive();

    this.add
      .text(740, 340, "▲", {
        fontSize: "26px",
        fontFamily: "Arial",
        color: iconColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(501)
      .setScrollFactor(0);

    // ---------- EVENT HANDLERS ----------
    // Pakai pointerdown/pointerup biar bisa ditahan
    btnLeft.on("pointerdown", () => {
      this.touchLeft = true;
      btnLeft.setFillStyle(0xffffff, 0.6);
    });
    btnLeft.on("pointerup", () => {
      this.touchLeft = false;
      btnLeft.setFillStyle(btnColor, alpha);
    });
    btnLeft.on("pointerout", () => {
      this.touchLeft = false;
      btnLeft.setFillStyle(btnColor, alpha);
    });

    btnRight.on("pointerdown", () => {
      this.touchRight = true;
      btnRight.setFillStyle(0xffffff, 0.6);
    });
    btnRight.on("pointerup", () => {
      this.touchRight = false;
      btnRight.setFillStyle(btnColor, alpha);
    });
    btnRight.on("pointerout", () => {
      this.touchRight = false;
      btnRight.setFillStyle(btnColor, alpha);
    });

    btnJump.on("pointerdown", () => {
      this.touchJump = true;
      btnJump.setFillStyle(0xffffff, 0.6);
    });
    btnJump.on("pointerup", () => {
      this.touchJump = false;
      btnJump.setFillStyle(btnColor, alpha);
    });
    btnJump.on("pointerout", () => {
      this.touchJump = false;
      btnJump.setFillStyle(btnColor, alpha);
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
    // Gabungkan input keyboard + touch
    const movingLeft = this.cursors.left.isDown || this.touchLeft === true;
    const movingRight = this.cursors.right.isDown || this.touchRight === true;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    if (!this.isInvulnerable) {
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
        this.touchJump = false; // reset biar gak loncat terus
      }
    }

    if (!this.isInvulnerable) {
      if (!onGround) {
        if (this.player.anims.isPlaying) this.player.anims.stop();
        if (this.player.texture.key !== "player_jump") {
          this.player.setTexture("player_jump");
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

      // Sprite katak default hadap KIRI → flipX kalau jalan ke KANAN
      enemy.flipX = enemy.direction > 0;

      if (!enemy.anims.isPlaying) {
        enemy.anims.play("enemy_walk", true);
      }

      if (enemy.y > 450) enemy.destroy();
    });
  }

  playWalkAnim() {
    if (!this.player.anims.isPlaying) {
      this.player.anims.play("walk", true);
    }
  }

  stopWalkAnim() {
    if (this.player.anims.isPlaying) {
      this.player.anims.stop();
    }
    if (this.player.texture.key !== "player_front") {
      this.player.setTexture("player_front");
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
    if (this.isInvulnerable) return;

    audioFX.playHurt();
    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    this.isInvulnerable = true;

    if (this.player.anims.isPlaying) this.player.anims.stop();
    this.player.setTexture("player_hit");
    this.player.setFlipX(false);

    const knockbackX = this.lastHitDirX || -1;
    const knockbackY = this.lastHitFromAbove ? 200 : -300;

    this.player.setVelocity(knockbackX * 250, knockbackY);

    this.lastHitDirX = -1;
    this.lastHitFromAbove = false;

    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 150,
      yoyo: true,
      repeat: 6,
    });

    this.time.delayedCall(500, () => {
      const firstGround = STAGES[this.stageIndex].grounds[0];
      const groundTop = firstGround.y - firstGround.h / 2;

      this.player.setPosition(60, groundTop - 40);
      this.player.setVelocity(0, 0);
      this.player.setAlpha(1);
      this.player.setTexture("player_front");
      this.isInvulnerable = false;
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
    this.player.setTexture("player_hit");
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
