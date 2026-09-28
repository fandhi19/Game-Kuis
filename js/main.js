// ============================================================
// FILE: main.js
// ============================================================

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: "#5c94fc",
  pixelArt: true,

  // PENTING: Parent = ID wrapper di index.html
  parent: "game-wrapper",

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
