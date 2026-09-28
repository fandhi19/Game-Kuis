// ============================================================
// FILE: StartScene.js
// FUNGSI: Layar awal — pilih karakter + input nama & absen
// ============================================================

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    Object.keys(ASSETS.characters).forEach((key) => {
      const c = ASSETS.characters[key];
      this.load.image(`${key}_front`, c.front);
      this.load.image(`${key}_walk_a`, c.walkA);
      this.load.image(`${key}_walk_b`, c.walkB);
    });
    this.load.image("bgStart", ASSETS.bgStart);
    this.load.audio("bgm", "assets/audio/bgm.mp3");
  }

  create() {
    this.bgmSound = this.sound.add("bgm", { loop: true, volume: 0.5 });
    this.bgmSound.play();

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

    // ============================================================
    // BIKIN ANIMASI JALAN UNTUK SEMUA KARAKTER
    // ============================================================
    // Setiap karakter punya 1 animasi: "{key}_walkAnim"
    // Frame-nya bergantian: walk_a → walk_b → walk_a → ...
    Object.keys(ASSETS.characters).forEach((key) => {
      if (!this.anims.exists(`${key}_walkAnim`)) {
        this.anims.create({
          key: `${key}_walkAnim`,
          frames: [{ key: `${key}_walk_a` }, { key: `${key}_walk_b` }],
          frameRate: 6, // 6 frame per detik (cukup untuk langkah natural)
          repeat: -1, // Loop selamanya
        });
      }
    });

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
    this.charPreviews = {}; // ← BARU: nyimpen sprite preview

    charKeys.forEach((key, i) => {
      const x = startX + i * gapX;
      const c = ASSETS.characters[key];

      // Box pilihan
      const box = this.add.rectangle(x, charY, boxW, boxH, 0xffffff, 0.1).setStrokeStyle(3, 0x666666).setInteractive({ useHandCursor: true });

      // ← UBAH: dari add.image ke add.sprite (biar bisa animasi)
      const preview = this.add.sprite(x, charY - 3, `${key}_front`).setScale(0.22);
      this.charPreviews[key] = preview;

      // Nama karakter
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

  // ============================================================
  // SELECT CHARACTER — dengan animasi jalan
  // ============================================================
  selectCharacter(key) {
    this.selectedChar = key;

    // Update visual box (border + fill)
    Object.keys(this.charBoxes).forEach((k) => {
      if (k === key) {
        this.charBoxes[k].setStrokeStyle(4, 0xfbd000);
        this.charBoxes[k].setFillStyle(0xfbd000, 0.3);
      } else {
        this.charBoxes[k].setStrokeStyle(3, 0x666666);
        this.charBoxes[k].setFillStyle(0xffffff, 0.1);
      }
    });

    // Update animasi karakter
    Object.keys(this.charPreviews).forEach((k) => {
      const preview = this.charPreviews[k];
      if (k === key) {
        // Yang DIPILIH → jalan
        preview.anims.play(`${k}_walkAnim`, true);
      } else {
        // Yang TIDAK dipilih → diam (kembali ke front)
        preview.anims.stop();
        preview.setTexture(`${k}_front`);
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
