// ============================================================
// FILE: FinishScene.js
// FUNGSI: Layar akhir — rekap jawaban, skor, statistik, & kirim DB
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
    // HITUNG SKOR — DINAMIS (bukan hardcoded 10)
    // ============================================================
    const totalSoal = this.answers.length; // ← dari data, bukan hardcoded
    const jumlahBenar = this.answers.filter((a) => a.apakahBenar).length;
    const jumlahSalah = totalSoal - jumlahBenar;
    const persen = totalSoal > 0 ? Math.round((jumlahBenar / totalSoal) * 100) : 0;
    const totalNilai = persen; // sama aja, tapi explicit

    // ============================================================
    // KIRIM REKAP KE GOOGLE SHEETS (1x di akhir)
    // ============================================================
    const dataKirim = {
      namaSiswa: this.studentName,
      noAbsen: this.studentNumber,
      jumlahBenar: jumlahBenar,
      jumlahSalah: jumlahSalah,
      totalNilai: totalNilai,
    };

    // Simpan ke localStorage sebagai backup
    // Kalau fetch gagal, data masih bisa di-recover nanti
    try {
      const backupKey = `kuis_backup_${this.studentNumber}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(dataKirim));
      console.log("💾 Backup tersimpan di localStorage:", backupKey);
    } catch (e) {
      console.warn("⚠️ Gagal simpan backup:", e);
    }

    // Fetch ke Google Sheets
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
        console.log("📊 Data terkirim:", dataKirim);
      })
      .catch((error) => {
        console.error("❌ Gagal kirim:", error);
        console.log("💾 Data masih tersimpan di localStorage, hubungi guru.");
      });

    // ============================================================
    // JUDUL
    // ============================================================
    this.add
      .text(400, 50, "🏆 SELESAI! 🏆", {
        fontSize: "42px",
        fontFamily: "Arial",
        color: "#fbd000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // ============================================================
    // PANEL SISWA
    // ============================================================
    this.add.rectangle(400, 125, 520, 65, 0x000000, 0.4).setStrokeStyle(2, 0xffffff, 0.6);

    this.add
      .text(400, 112, `👤 Nama: ${this.studentName}`, {
        fontSize: "17px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(400, 138, `🔢 No. Absen: ${this.studentNumber}`, {
        fontSize: "15px",
        fontFamily: "Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // ============================================================
    // PANEL SKOR
    // ============================================================
    let skorWarna = "#4caf50"; // Hijau
    if (persen < 50)
      skorWarna = "#f44336"; // Merah
    else if (persen < 75) skorWarna = "#ffb300"; // Kuning

    this.add
      .text(400, 195, `Skor Akhir: ${jumlahBenar} / ${totalSoal} (${persen}%)`, {
        fontSize: "32px",
        fontFamily: "Arial",
        color: skorWarna,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // ============================================================
    // PESAN MOTIVASI
    // ============================================================
    let pesan = "Semangat terus belajar ya! 💪";
    if (persen >= 90) pesan = "Sempurna! Kamu luar biasa jenius! 🌟👑";
    else if (persen >= 70) pesan = "Hasil yang sangat bagus! Pertahankan! 👍✨";

    this.add
      .text(400, 245, pesan, {
        fontSize: "16px",
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
      .text(400, 280, `Benar: ${jumlahBenar}  |  Salah: ${jumlahSalah}`, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#cccccc",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // ============================================================
    // TOMBOL MAIN LAGI
    // ============================================================
    const btn = this.add.rectangle(400, 345, 220, 48, 0xe52521).setStrokeStyle(4, 0x000000).setInteractive({ useHandCursor: true });

    this.add
      .text(400, 345, "MAIN LAGI", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btn.on("pointerover", () => btn.setFillStyle(0xff3333));
    btn.on("pointerout", () => btn.setFillStyle(0xe52521));

    btn.on("pointerdown", () => {
      audioFX.playKey();
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => {
        this.scene.start("StartScene");
      });
    });

    // ============================================================
    // LOG KE CONSOLE
    // ============================================================
    console.log("========== REKAP JAWABAN SISWA ==========");
    console.log("Nama Siswa :", this.studentName);
    console.log("No. Absen  :", this.studentNumber);
    console.log("Total Soal :", totalSoal);
    console.log("Benar      :", jumlahBenar);
    console.log("Salah      :", jumlahSalah);
    console.log("Nilai      :", totalNilai);
    console.table(this.answers);
  }
}
