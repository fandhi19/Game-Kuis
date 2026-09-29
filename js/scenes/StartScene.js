// ============================================================
// FILE: StartScene.js
// FUNGSI: Layar awal — pilih karakter + input nama & absen (Responsive)
// ============================================================

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    const safeLoad = (key, path) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, path);
      }
    };

    // 1. LOAD SEMUA KARAKTER (5 karakter × 5 sprite)
    Object.keys(ASSETS.characters).forEach((key) => {
      const c = ASSETS.characters[key];
      safeLoad(`${key}_front`, c.front);
      safeLoad(`${key}_walk_a`, c.walkA);
      safeLoad(`${key}_walk_b`, c.walkB);
      safeLoad(`${key}_jump`, c.jump);
      safeLoad(`${key}_hit`, c.hit);
    });

    // 2. LOAD SEMUA BACKGROUND (5 stage)
    ASSETS.backgrounds.forEach((bgPath, i) => {
      safeLoad("bg_" + i, bgPath);
    });
    safeLoad("bgStart", ASSETS.bgStart);

    // 3. LOAD SEMUA PLATFORM (5 stage)
    ASSETS.platforms.forEach((platPath, i) => {
      safeLoad("platform_" + i, platPath);
    });

    // 4. LOAD OBJEK GAME
    safeLoad("box", ASSETS.box);
    safeLoad("key", ASSETS.key);
    safeLoad("ground_tile", ASSETS.groundTile);
    safeLoad("enemy_walk_a", ASSETS.enemyWalkA);
    safeLoad("enemy_walk_b", ASSETS.enemyWalkB);
    safeLoad("spike", ASSETS.spike);

    // 5. BGM
    if (!this.cache.audio.exists("bgm")) {
      this.load.audio("bgm", "assets/audio/bgm.mp3");
    }
  }

  create() {
    this.cameras.main.fadeIn(500);

    // BIKIN ANIMASI JALAN UNTUK SEMUA KARAKTER
    Object.keys(ASSETS.characters).forEach((key) => {
      const animKey = `${key}_walk_anim`;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: [{ key: `${key}_walk_a` }, { key: `${key}_walk_b` }],
          frameRate: 6,
          repeat: -1,
        });
      }
    });

    // BACKGROUND
    const bg = this.add.image(400, 200, "bgStart");
    bg.setDisplaySize(800, 400);
    bg.setDepth(-10);
    this.add.rectangle(400, 200, 800, 400, 0x000000, 0.25).setDepth(-9);

    // FORM HTML
    const form = document.getElementById("start-form");
    if (form) form.classList.add("visible");

    const namaEl = document.getElementById("input-nama");
    const absenEl = document.getElementById("input-absen");
    if (namaEl) namaEl.value = "";
    if (absenEl) absenEl.value = "";

    // BGM
    if (this.cache.audio.exists("bgm")) {
      if (!this.bgmSound || !this.bgmSound.isPlaying) {
        this.bgmSound = this.sound.add("bgm", { loop: true, volume: 0.4 });
        this.bgmSound.play();
      }
    }

    // JUDUL
    const title = this.add
      .text(400, 24, "🍄 GAME KUIS 🍄", {
        fontSize: "30px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 27,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // SUBJUDUL
    this.add
      .text(400, 56, "Pilih Karakter Kamu:", {
        fontSize: "13px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // 5 PILIHAN KARAKTER
    const charKeys = Object.keys(ASSETS.characters);
    const startX = 130;
    const gapX = 135;
    const charY = 120;
    const boxW = 84;
    const boxH = 68;
    const BASE_PREVIEW_SCALE = 0.18;

    this.selectedChar = charKeys[0];
    this.charBoxes = {};
    this.charPreviews = {};
    this.charLabels = {};

    charKeys.forEach((key, i) => {
      const x = startX + i * gapX;
      const c = ASSETS.characters[key];

      const box = this.add.rectangle(x, charY, boxW, boxH, 0xffffff, 0.15).setStrokeStyle(3, 0x666666).setInteractive({ useHandCursor: true });

      const preview = this.add.sprite(x, charY - 4, `${key}_front`).setScale(BASE_PREVIEW_SCALE);
      this.charPreviews[key] = preview;

      const label = this.add
        .text(x, charY + boxH / 2 + 8, c.name, {
          fontSize: "12px",
          fontFamily: "Arial",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      this.charBoxes[key] = box;
      this.charLabels[key] = label;

      box.on("pointerover", () => {
        if (this.selectedChar !== key) {
          box.setStrokeStyle(3, 0xffffff);
          this.tweens.add({ targets: box, scaleX: 1.05, scaleY: 1.05, duration: 100 });
          this.tweens.add({ targets: preview, scaleX: BASE_PREVIEW_SCALE * 1.05, scaleY: BASE_PREVIEW_SCALE * 1.05, duration: 100 });
        }
      });

      box.on("pointerout", () => {
        if (this.selectedChar !== key) {
          box.setStrokeStyle(3, 0x666666);
          this.tweens.add({ targets: box, scaleX: 1.0, scaleY: 1.0, duration: 100 });
          this.tweens.add({ targets: preview, scaleX: BASE_PREVIEW_SCALE, scaleY: BASE_PREVIEW_SCALE, duration: 100 });
        }
      });

      box.on("pointerdown", () => {
        audioFX.playBoxHit();
        this.selectCharacter(key);
      });
    });

    this.selectCharacter(this.selectedChar);

    // TOMBOL MULAI
    const btnContainer = this.add.container(400, 356);

    const btn = this.add.rectangle(0, 0, 210, 40, 0xe52521).setStrokeStyle(4, 0x000000).setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "MULAI GAME ➔", {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btnContainer.add([btn, btnText]);

    this.tweens.add({
      targets: btnContainer,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    btn.on("pointerover", () => btn.setFillStyle(0xff3333));
    btn.on("pointerout", () => btn.setFillStyle(0xe52521));
    btn.on("pointerdown", () => {
      this.tweens.add({
        targets: btnContainer,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 80,
        yoyo: true,
        onComplete: () => this.startGame(),
      });
    });

    this.events.once("shutdown", () => {
      const f = document.getElementById("start-form");
      if (f) f.classList.remove("visible");
    });
  }

  selectCharacter(key) {
    const BASE_PREVIEW_SCALE = 0.18;
    this.selectedChar = key;
    Object.keys(this.charBoxes).forEach((k) => {
      const box = this.charBoxes[k];
      const preview = this.charPreviews[k];
      const label = this.charLabels[k];

      this.tweens.killTweensOf(box);
      this.tweens.killTweensOf(preview);

      if (k === this.selectedChar) {
        box.setStrokeStyle(4, 0xfbd000);
        box.setFillStyle(0xfbd000, 0.35);
        label.setColor("#fbd000");

        box.setScale(1.05);
        preview.setScale(BASE_PREVIEW_SCALE * 1.05);

        this.tweens.add({
          targets: box,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 100,
          yoyo: true,
        });
        this.tweens.add({
          targets: preview,
          scaleX: BASE_PREVIEW_SCALE * 1.08,
          scaleY: BASE_PREVIEW_SCALE * 1.08,
          duration: 100,
          yoyo: true,
        });

        const animKey = `${k}_walk_anim`;
        if (this.anims.exists(animKey)) {
          preview.anims.play(animKey, true);
        }
      } else {
        box.setStrokeStyle(3, 0x555555);
        box.setFillStyle(0xffffff, 0.1);
        label.setColor("#ffffff");

        box.setScale(1.0);

        if (preview.anims.isPlaying) {
          preview.anims.stop();
        }
        preview.setTexture(`${k}_front`);
        preview.setScale(BASE_PREVIEW_SCALE);
      }
    });
  }

  startGame() {
    audioFX.init();
    audioFX.playKey();

    const namaEl = document.getElementById("input-nama");
    const absenEl = document.getElementById("input-absen");

    const nama = (namaEl && namaEl.value.trim()) || "Anonim";
    const absen = (absenEl && absenEl.value.trim()) || "";

    if (!absen) {
      audioFX.playWrong();
      const err = this.add
        .text(400, 310, "⚠️ No. absen harus diisi!", {
          fontSize: "13px",
          fontFamily: "Arial",
          color: "#ff4444",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: err,
        y: err.y - 10,
        alpha: 0,
        duration: 1500,
        delay: 500,
        onComplete: () => err.destroy(),
      });
      return;
    }

    const form = document.getElementById("start-form");
    if (form) form.classList.remove("visible");

    // ============================================================
    // ACAK URUTAN SOAL (Fisher-Yates Shuffle)
    // Setiap murid dapat urutan soal BERBEDA → gak bisa nyontek
    // ============================================================
    const questionOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = questionOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionOrder[i], questionOrder[j]] = [questionOrder[j], questionOrder[i]];
    }
    console.log("🎲 Urutan soal untuk murid ini:", questionOrder);
    // ============================================================

    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start("StageScene", {
        stageIndex: 0,
        studentName: nama,
        studentNumber: absen,
        characterKey: this.selectedChar,
        answersMap: {},
        lives: 3,
        questionOrder: questionOrder, // ← KIRIM urutan soal
      });
    });
  }
}
