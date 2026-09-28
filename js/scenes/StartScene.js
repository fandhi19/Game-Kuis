// ============================================================
// FILE: StartScene.js
// FUNGSI: Layar awal — pilih karakter + input nama & absen
// ============================================================

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    // ============================================
    // 1. LOAD SEMUA KARAKTER (5 karakter × 5 sprite)
    // ============================================
    Object.keys(ASSETS.characters).forEach((key) => {
      const c = ASSETS.characters[key];
      this.load.image(`${key}_front`, c.front);
      this.load.image(`${key}_walk_a`, c.walkA);
      this.load.image(`${key}_walk_b`, c.walkB);
      this.load.image(`${key}_jump`, c.jump);
      this.load.image(`${key}_hit`, c.hit);
    });

    // ============================================
    // 2. LOAD SEMUA BACKGROUND (5 stage)
    // ============================================
    ASSETS.backgrounds.forEach((bgPath, i) => {
      this.load.image("bg_" + i, bgPath);
    });
    this.load.image("bgStart", ASSETS.bgStart);

    // ============================================
    // 3. LOAD SEMUA PLATFORM (5 stage)
    // ============================================
    ASSETS.platforms.forEach((platPath, i) => {
      this.load.image("platform_" + i, platPath);
    });

    // ============================================
    // 4. LOAD OBJEK GAME (box, key, enemy, spike)
    // ============================================
    this.load.image("box", ASSETS.box);
    this.load.image("key", ASSETS.key);
    this.load.image("ground_tile", ASSETS.groundTile);
    this.load.image("enemy_walk_a", ASSETS.enemyWalkA);
    this.load.image("enemy_walk_b", ASSETS.enemyWalkB);
    this.load.image("spike", ASSETS.spike);

    // ============================================
    // 5. BGM (opsional)
    // ============================================
    this.load.audio("bgm", "assets/audio/bgm.mp3");
  }

  create() {
    this.cameras.main.fadeIn(500);

    // ---------- BACKGROUND ----------
    const bg = this.add.image(400, 200, "bgStart");
    bg.setDisplaySize(800, 400);
    bg.setDepth(-10);
    this.add.rectangle(400, 200, 800, 400, 0x000000, 0.18).setDepth(-9);

    // ---------- FORM HTML ----------
    const form = document.getElementById("start-form");
    if (form) form.classList.add("visible");

    const namaEl = document.getElementById("input-nama");
    const absenEl = document.getElementById("input-absen");
    if (namaEl) namaEl.value = "";
    if (absenEl) absenEl.value = "";

    // ---------- BGM ----------
    if (this.cache.audio.exists("bgm")) {
      if (!this.bgmSound || !this.bgmSound.isPlaying) {
        this.bgmSound = this.sound.add("bgm", { loop: true, volume: 0.4 });
        this.bgmSound.play();
      }
    } else {
      console.warn("⚠️ BGM gak ke-load");
    }

    // ---------- JUDUL ----------
    this.add
      .text(400, 30, "🍄 GAME KUIS 🍄", {
        fontSize: "34px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // ---------- SUBJUDUL ----------
    this.add
      .text(400, 76, "Pilih Karakter Kamu:", {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // ---------- 5 PILIHAN KARAKTER ----------
    const charKeys = Object.keys(ASSETS.characters);
    const startX = 130;
    const gapX = 135;
    const charY = 138;
    const boxW = 90;
    const boxH = 85;

    this.selectedChar = charKeys[0];
    this.charBoxes = {};
    this.charPreviews = {};

    charKeys.forEach((key, i) => {
      const x = startX + i * gapX;
      const c = ASSETS.characters[key];

      const box = this.add.rectangle(x, charY, boxW, boxH, 0xffffff, 0.1).setStrokeStyle(3, 0x666666).setInteractive({ useHandCursor: true });

      const preview = this.add.sprite(x, charY - 3, `${key}_front`).setScale(0.22);
      this.charPreviews[key] = preview;

      this.add
        .text(x, charY + boxH / 2 + 10, c.name, {
          fontSize: "13px",
          fontFamily: "Arial",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      this.charBoxes[key] = box;

      box.on("pointerdown", () => {
        audioFX.playBoxHit();
        this.selectCharacter(key);
      });
    });

    this.selectCharacter(this.selectedChar);

    // ---------- TOMBOL MULAI ----------
    const btn = this.add.rectangle(400, 355, 220, 42, 0xe52521).setStrokeStyle(4, 0x000000).setInteractive({ useHandCursor: true });

    this.add
      .text(400, 355, "MULAI GAME", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btn.on("pointerover", () => btn.setFillStyle(0xff3333));
    btn.on("pointerout", () => btn.setFillStyle(0xe52521));
    btn.on("pointerdown", () => this.startGame());

    this.events.once("shutdown", () => {
      const f = document.getElementById("start-form");
      if (f) f.classList.remove("visible");
    });
  }

  selectCharacter(key) {
    this.selectedChar = key;
    Object.keys(this.charBoxes).forEach((k) => {
      if (k === this.selectedChar) {
        this.charBoxes[k].setStrokeStyle(4, 0xfbd000);
        this.charBoxes[k].setFillStyle(0xfbd000, 0.3);
      } else {
        this.charBoxes[k].setStrokeStyle(3, 0x666666);
        this.charBoxes[k].setFillStyle(0xffffff, 0.1);
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
      this.time.delayedCall(1500, () => err.destroy());
      return;
    }

    const form = document.getElementById("start-form");
    if (form) form.classList.remove("visible");

    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start("StageScene", {
        stageIndex: 0,
        studentName: nama,
        studentNumber: absen,
        characterKey: this.selectedChar,
        answersMap: {},
        lives: 3,
      });
    });
  }
}
