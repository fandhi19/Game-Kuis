// ============================================================
// FILE: QuestionScene.js
// FUNGSI: Overlay soal di atas StageScene
// ============================================================

class QuestionScene extends Phaser.Scene {
  constructor() {
    super("QuestionScene");
  }

  init(data) {
    this.globalIndex = data.globalIndex;
    this.studentName = data.studentName;
    this.stageIndex = data.stageIndex;
    this.onAnswer = data.onAnswer;
  }

  create() {
    const q = QUESTIONS[this.globalIndex];

    // ---------- OVERLAY GELAP ----------
    this.add.rectangle(400, 200, 800, 400, 0x000000, 0.85).setDepth(100);

    // ---------- PANEL PUTIH ----------
    this.add.rectangle(400, 200, 780, 395, 0xffffff).setStrokeStyle(6, 0x000000).setDepth(101);

    // ---------- LABEL SOAL (pojok kiri atas) ----------
    this.add
      .text(25, 15, `SOAL ${this.globalIndex + 1} DARI 10`, {
        fontSize: "13px",
        fontFamily: "Arial",
        color: "#666666",
        fontStyle: "bold",
      })
      .setOrigin(0, 0) // ← Kiri-atas (gak akan nabrak teks soal)
      .setDepth(102);

    // ---------- TEKS SOAL (top-anchored) ----------
    // Pakai setOrigin(0.5, 0) → teks tumbuh ke BAWAH dari y=45
    // Jadi gak akan nabrak label di atas
    this.add
      .text(400, 45, q.q, {
        fontSize: "12px", // ← Font diperkecil
        fontFamily: "Arial",
        color: "#000000",
        align: "center",
        wordWrap: { width: 720 },
        lineSpacing: 2,
      })
      .setOrigin(0.5, 0) // ← KUNCI: top-center anchor
      .setDepth(102);

    // ---------- TOMBOL JAWABAN (4 pilihan) ----------
    this.buttons = [];
    const startY = 260; // ← dari 250 jadi 260
    const gap = 36; // ← dari 38 jadi 36

    q.options.forEach((opt, i) => {
      const y = startY + i * gap;

      // Background tombol
      const btnBg = this.add.rectangle(400, y, 720, 30, 0xfbd000).setStrokeStyle(3, 0x000000).setDepth(102).setInteractive({ useHandCursor: true });

      // Teks tombol dengan label A/B/C/D
      const labels = ["A", "B", "C", "D"];
      const btnText = this.add
        .text(400, y, `${labels[i]}. ${opt}`, {
          fontSize: "13px",
          fontFamily: "Arial",
          color: "#000000",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(103);

      // Hover efek
      btnBg.on("pointerover", () => btnBg.setFillStyle(0xffdd44));
      btnBg.on("pointerout", () => btnBg.setFillStyle(0xfbd000));

      // Klik handler
      btnBg.on("pointerdown", () => {
        this.handleAnswer(i, q, btnBg, btnText);
      });

      this.buttons.push({ bg: btnBg, text: btnText });
    });
  }

  handleAnswer(chosenIndex, q, btnBg, btnText) {
    // Nonaktifkan semua tombol biar gak klik 2x
    this.buttons.forEach((b) => b.bg.disableInteractive());

    // Sorot pilihan yang dipilih (biru)
    btnBg.setFillStyle(0x2196f3);
    btnText.setColor("#ffffff");

    // Catat jawaban (TANPA info benar/salah ke user)
    const answerData = {
      namaSiswa: this.studentName,
      stage: this.stageIndex + 1,
      soalKeStage: (this.globalIndex % 2) + 1,
      soalGlobal: this.globalIndex + 1,
      pertanyaan: q.q,
      jawabanPemilih: q.options[chosenIndex],
      jawabanBenar: q.options[q.answer],
      apakahBenar: chosenIndex === q.answer,
      timestamp: new Date().toISOString(),
    };

    if (this.onAnswer) {
      this.onAnswer(answerData);
    }

    // Tutup overlay setelah delay singkat
    this.time.delayedCall(400, () => {
      this.closeScene();
    });
  }

  closeScene() {
    const stage = this.scene.get("StageScene");
    if (stage) {
      stage.isPaused = false;
    }
    this.scene.resume("StageScene");
    this.scene.stop();
  }
}
