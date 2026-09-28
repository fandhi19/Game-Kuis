// ============================================================
// FILE: main.js
// FUNGSI: Inisialisasi Phaser dengan responsive scaling & multi-touch
// ============================================================

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: "#5c94fc",
  pixelArt: true,
  parent: "game-wrapper",

  // RESPONSIVE SCALING — biar auto-fit di semua layar
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 400,
  },

  // MULTI-TOUCH SUPPORT (agar bisa tekan Kiri/Kanan & Lompat bersamaan)
  input: {
    activePointers: 3,
  },

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900 },
      debug: true,
    },
  },

  scene: [StartScene, StageScene, QuestionScene, FinishScene],
};

const game = new Phaser.Game(config);

// ============================================================
// DETEKSI APAKAH PERANGKAT TOUCH (HP/TABLET)
// ============================================================
const isTouchDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Simpan global biar bisa diakses scene
window.IS_TOUCH_DEVICE = isTouchDevice();
