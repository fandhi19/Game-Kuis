// ============================================================
// FILE: FinishScene.js
// FUNGSI: Layar akhir — rekap jawaban, skor, statistik, & kirim DB (Animated)
// ============================================================

class FinishScene extends Phaser.Scene {
  constructor() {
    super("FinishScene");
  }

  init(data) {
    this.studentName = data.studentName || "Anonim";
    this.studentNumber = data.studentNumber || "-";

    // Konversi answersMap ke Array
    if (data.answersMap) {
      this.answers = Object.values(data.answersMap);
    } else {
      this.answers = data.answers || [];
    }
  }

  create() {
    this.cameras.main.fadeIn(500);
    audioFX.playWin();

    // ============================================================
    // HITUNG SKOR
    // ============================================================
    const totalSoal = this.answers.length;
    const jumlahBenar = this.answers.filter((a) => a.apakahBenar).length;
    const jumlahSalah = totalSoal - jumlahBenar;
    const persen = totalSoal > 0 ? Math.round((jumlahBenar / totalSoal) * 100) : 0;
    const totalNilai = persen;

    // ============================================================
    // KIRIM REKAP KE GOOGLE SHEETS
    // ============================================================
    const dataKirim = {
      namaSiswa: this.studentName,
      noAbsen: this.studentNumber,
      jumlahBenar: jumlahBenar,
      jumlahSalah: jumlahSalah,
      totalNilai: totalNilai,
    };

    try {
      const backupKey = `kuis_backup_${this.studentNumber}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(dataKirim));
      console.log("💾 Backup tersimpan di localStorage:", backupKey);
    } catch (e) {
      console.warn("⚠️ Gagal simpan backup:", e);
    }

    fetch("https://script.google.com/macros/s/AKfycbyz2BdjKk0OHiBHqwz_AlZBswgAFSRcANk7JcVVUVuOV0QVM4onEPQAwPeEGnG9dDPcCQ/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataKirim),
    })
      .then(() => {
        console.log("✅ Rekap berhasil dikirim ke database");
      })
      .catch((error) => {
        console.error("❌ Gagal kirim:", error);
      });

    // ============================================================
    // JUDUL DENGAN BOUNCE & PARTICLES
    // ============================================================
    const title = this.add
      .text(400, 42, "🏆 SELESAI! 🏆", {
        fontSize: "38px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 46,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ============================================================
    // PANEL SISWA
    // ============================================================
    const panelSiswa = this.add.rectangle(400, 115, 520, 58, 0x000000, 0.55).setStrokeStyle(2, 0xfbd000, 0.8);

    this.add
      .text(400, 102, `👤 Nama: ${this.studentName}`, {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(400, 126, `🔢 No. Absen: ${this.studentNumber}`, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#e2e8f0",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // ============================================================
    // PANEL SKOR
    // ============================================================
    let skorWarna = "#4caf50";
    if (persen < 50) skorWarna = "#f44336";
    else if (persen < 75) skorWarna = "#ffb300";

    const scoreText = this.add
      .text(400, 182, `Skor Akhir: ${jumlahBenar} / ${totalSoal} (${persen}%)`, {
        fontSize: "30px",
        fontFamily: "Arial",
        color: skorWarna,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: scoreText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      yoyo: true,
      repeat: 3,
      ease: "Sine.easeInOut",
    });

    // ============================================================
    // PESAN MOTIVASI
    // ============================================================
    let pesan = "Semangat terus belajar ya! 💪";
    if (persen >= 90) pesan = "Sempurna! Kamu luar biasa jenius! 🌟👑";
    else if (persen >= 70) pesan = "Hasil yang sangat bagus! Pertahankan! 👍✨";

    this.add
      .text(400, 230, pesan, {
        fontSize: "15px",
        fontFamily: "Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // ============================================================
    // REKAP SINGKAT
    // ============================================================
    this.add
      .text(400, 265, `Benar: ${jumlahBenar}  |  Salah: ${jumlahSalah}`, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#cbd5e1",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // ============================================================
    // TOMBOL MAIN LAGI (BER-ANIMASI)
    // ============================================================
    const btnContainer = this.add.container(400, 335);

    const btn = this.add
      .rectangle(0, 0, 210, 44, 0xe52521)
      .setStrokeStyle(4, 0x000000)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "MAIN LAGI 🔄", {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btnContainer.add([btn, btnText]);

    this.tweens.add({
      targets: btnContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    btn.on("pointerover", () => btn.setFillStyle(0xff3333));
    btn.on("pointerout", () => btn.setFillStyle(0xe52521));

    btn.on("pointerdown", () => {
      audioFX.playKey();
      this.tweens.add({
        targets: btnContainer,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.cameras.main.fadeOut(500);
          this.time.delayedCall(500, () => {
            this.scene.start("StartScene");
          });
        },
      });
    });

    console.log("========== REKAP JAWABAN SISWA ==========");
    console.log("Nama Siswa :", this.studentName);
    console.log("No. Absen  :", this.studentNumber);
    console.table(this.answers);
  }
}

