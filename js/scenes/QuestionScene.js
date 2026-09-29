// ============================================================
// FILE: QuestionScene.js
// FUNGSI: Overlay soal di atas StageScene (Responsive & Animated)
// ============================================================

class QuestionScene extends Phaser.Scene {
  constructor() {
    super("QuestionScene");
  }

  init(data) {
    this.globalIndex = data.globalIndex; // Slot (1-10) — buat label
    this.questionIndex = data.questionIndex; // Soal asli (acak) — buat konten
    this.studentName = data.studentName;
    this.stageIndex = data.stageIndex;
    this.onAnswer = data.onAnswer;
  }

  create() {
    // PAKAI questionIndex (bukan globalIndex) untuk konten soal
    const q = QUESTIONS[this.questionIndex];

    // ---------- OVERLAY GELAP ----------
    this.overlay = this.add.rectangle(400, 200, 800, 400, 0x000000, 0.85).setDepth(100);

    // ---------- PANEL UTAMA CONTAINER ----------
    this.panelContainer = this.add.container(400, 200).setDepth(101);

    const panelBg = this.add.rectangle(0, 0, 760, 375, 0xffffff).setStrokeStyle(5, 0x000000);
    const headerBg = this.add.rectangle(0, -165, 760, 40, 0xfbd000).setStrokeStyle(3, 0x000000);

    const labelText = this.add
      .text(0, -165, `❓ SOAL ${this.globalIndex + 1} DARI 10`, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const questionText = this.add
      .text(0, -130, q.q, {
        fontSize: "13px",
        fontFamily: "Arial",
        color: "#1e293b",
        align: "center",
        fontStyle: "bold",
        wordWrap: { width: 700 },
        lineSpacing: 3,
      })
      .setOrigin(0.5, 0);

    this.panelContainer.add([panelBg, headerBg, labelText, questionText]);

    // ---------- TOMBOL JAWABAN ----------
    this.buttons = [];
    const startY = 40;
    const gap = 38;

    q.options.forEach((opt, i) => {
      const y = startY + i * gap;
      const btnContainer = this.add.container(0, y);

      const btnBg = this.add.rectangle(0, 0, 700, 32, 0xf8fafc).setStrokeStyle(2, 0x94a3b8).setInteractive({ useHandCursor: true });

      const labels = ["A", "B", "C", "D"];
      const btnText = this.add
        .text(-330, 0, `${labels[i]}. ${opt}`, {
          fontSize: "13px",
          fontFamily: "Arial",
          color: "#0f172a",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      btnContainer.add([btnBg, btnText]);
      this.panelContainer.add(btnContainer);

      btnBg.on("pointerover", () => {
        btnBg.setFillStyle(0xe2e8f0);
        btnBg.setStrokeStyle(2, 0x2563eb);
      });

      btnBg.on("pointerout", () => {
        btnBg.setFillStyle(0xf8fafc);
        btnBg.setStrokeStyle(2, 0x94a3b8);
      });

      btnBg.on("pointerdown", () => {
        this.tweens.add({
          targets: btnContainer,
          scaleX: 0.98,
          scaleY: 0.98,
          duration: 60,
          yoyo: true,
          onComplete: () => {
            this.handleAnswer(i, q, btnBg, btnText);
          },
        });
      });

      this.buttons.push({ bg: btnBg, text: btnText, container: btnContainer });
    });

    // Pop-in Animation
    this.panelContainer.setScale(0.85);
    this.panelContainer.setAlpha(0);
    this.tweens.add({
      targets: this.panelContainer,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 1.0,
      duration: 250,
      ease: "Back.easeOut",
    });
  }

  handleAnswer(chosenIndex, q, btnBg, btnText) {
    this.buttons.forEach((b) => b.bg.disableInteractive());

    btnBg.setFillStyle(0x2563eb);
    btnBg.setStrokeStyle(3, 0x1d4ed8);
    btnText.setColor("#ffffff");

    const answerData = {
      namaSiswa: this.studentName,
      stage: this.stageIndex + 1,
      soalKeStage: (this.globalIndex % 2) + 1,
      soalGlobal: this.globalIndex + 1, // Slot urutan di game (1-10)
      soalAsli: this.questionIndex + 1, // ← Soal asli (1-10) buat guru cek
      pertanyaan: q.q,
      jawabanPemilih: q.options[chosenIndex],
      jawabanBenar: q.options[q.answer],
      apakahBenar: chosenIndex === q.answer,
      timestamp: new Date().toISOString(),
    };

    if (this.onAnswer) {
      this.onAnswer(answerData);
    }

    this.tweens.add({
      targets: this.panelContainer,
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0,
      duration: 200,
      delay: 300,
      onComplete: () => {
        this.closeScene();
      },
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
