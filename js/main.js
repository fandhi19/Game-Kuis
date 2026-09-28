// ============================================================
// FILE: main.js
// FUNGSI: Inisialisasi Phaser dengan responsive scaling
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

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },

  scene: [StartScene, StageScene, QuestionScene, FinishScene],
};

const game = new Phaser.Game(config);

// ============================================================
// DETEKSI APAKAH PERANGKAT TOUCH (HP/TABLET)
// ============================================================
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};

// Simpan global biar bisa diakses scene
window.IS_TOUCH_DEVICE = isTouchDevice();
