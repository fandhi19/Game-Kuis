// ============================================================
// FILE: stages.js
// FUNGSI: Layout 5 stage dengan rintangan bervariasi
// ============================================================

const STAGES = [
  // ==========================================================
  // STAGE 1: TUTORIAL
  // ==========================================================
  {
    name: "STAGE 1: PADANG RUMPUT",
    themeColor: "#ffffff",
    groundColor: 0x8b4513,
    strokeColor: 0x000000,
    grounds: [
      { x: 400, y: 425, w: 800, h: 180 }, // ← dari y:380,h:40 → y:400,h:180
    ],
    platforms: [
      { x: 200, y: 270, w: 120, h: 20, sink: 2 },
      { x: 600, y: 270, w: 120, h: 20, sink: 2 },
    ],
    boxes: [
      { x: 400, y: 180 },
      { x: 700, y: 180 },
    ],
    keys: [
      { x: 200, y: 230 },
      { x: 600, y: 230 },
    ],
    enemies: [],
  },

  // ==========================================================
  // STAGE 2: HUTAN
  // ==========================================================
  {
    name: "STAGE 2: PADANG GURUN",

    themeColor: "#ffffff",
    groundColor: 0x8b4513,
    strokeColor: 0x000000,
    grounds: [
      { x: 400, y: 425, w: 800, h: 180 }, // ← dari y:380,h:40 → y:400,h:180
    ],
    platforms: [
      { x: 150, y: 280, w: 100, h: 30, sink: 16 },
      { x: 400, y: 220, w: 120, h: 30, sink: 16 },
      { x: 650, y: 280, w: 100, h: 30, sink: 16 },
    ],
    boxes: [
      { x: 400, y: 100 },
      { x: 650, y: 150 },
    ],
    keys: [
      { x: 150, y: 240 },
      { x: 400, y: 180 },
    ],
    // Musuh 👾 — di ground kanan
    enemies: [{ x: 650, y: 320, speed: 60 }],
  },

  // ==========================================================
  // STAGE 3: PEGUNUNGAN SALJU
  // ==========================================================
  // Ground surface di y=200 (match sama background)
  // Semua elemen digeser naik biar align
  {
    name: "STAGE 3: PEGUNUNGAN SALJU",
    themeColor: "#ffffff",
    showGround: false,
    groundColor: 0x0000ff,
    strokeColor: 0x000000,

    // Ground kiri & kanan — top surface di y=200
    grounds: [
      { x: 150, y: 296, w: 300, h: 200 }, // Kiri (top di y=200)
      { x: 650, y: 296, w: 300, h: 200 }, // Kanan (top di y=200)
    ],

    // Platform
    platforms: [
      { x: 400, y: 130, w: 110, h: 28, sink: 2 }, // Atas tengah
      { x: 310, y: 322, w: 105, h: 28, sink: 2 }, // Platform bawah kiri
      { x: 463, y: 322, w: 110, h: 28, sink: 2 }, // Platform bawah kanan
    ],

    // Kotak ❓
    boxes: [
      { x: 658, y: 80 }, // Kanan atas
      { x: 469, y: 259 },
    ],

    // Kunci 🔑
    keys: [
      { x: 400, y: 60 }, // Di atas platform tengah
      { x: 308, y: 282 }, // Di atas platform kiri bawah
    ],

    // Musuh 👾 — di ground kanan
    enemies: [{ x: 700, y: 186, speed: 100 }],

    // Spike ⚠️ — di ground kiri (sitting on ground)
    spikes: [
      { x: 213, y: 190, w: 20, h: 18 },
      { x: 235, y: 190, w: 20, h: 18 },
    ],
  },

  // ==========================================================
  // STAGE 4: KASTIL
  // ==========================================================
  {
    name: "STAGE 4: GUA KRISTAL",
    themeColor: "#ffffff",
    showGround: false,
    groundColor: 0x8b4513,
    strokeColor: 0x000000,

    // ← Ground diturunin 25px (y: 400 → 425)
    // Top surface dari 310 → 335
    grounds: [
      { x: 100, y: 418, w: 300, h: 180 },
      { x: 700, y: 418, w: 240, h: 180 },
    ],

    platforms: [
      { x: 400, y: 300, w: 120, h: 30, sink: 6 },
      { x: 400, y: 200, w: 120, h: 30, sink: 6 },
    ],

    boxes: [
      { x: 200, y: 250 },
      { x: 600, y: 250 },
    ],

    keys: [
      { x: 400, y: 260 },
      { x: 700, y: 260 }, // ← turunin dikit biar match ground baru
    ],

    // ← Musuh juga turunin biar spawn di atas ground baru (top=335)
    enemies: [
      { x: 700, y: 300, speed: 80 },
      { x: 100, y: 300, speed: 80 },
    ],

    // ← SPIKE BARU: di atas platform tengah bawah (400, 300)
    // Platform top = 300 - 10 = 290
    // Spike h = 18, jadi y = 290 - 18 = 272
    spikes: [{ x: 425, y: 282, w: 20, h: 18 }],
  },

  // ==========================================================
  // STAGE 5: FINAL
  // ==========================================================
  // Layout berdasarkan referensi background kastil api:
  //   - 2 plateau (kiri & kanan) dengan top di y=270
  //   - 1 pulau melayang di tengah dengan top di y=308
  //   - Player harus turun-naik antar pulau
  {
    name: "STAGE 5: KASTIL API",
    themeColor: "#ffffff",
    showGround: false,
    groundColor: 0x8b4513,
    strokeColor: 0x000000,

    // ← Ground baru (sesuai garis putih di gambar)
    grounds: [
      // Plateau kiri (top: 270)
      { x: 130, y: 362, w: 260, h: 180 },
      // Pulau melayang tengah (top: 308) - lebih pendek dari plateau
      { x: 402, y: 352, w: 90, h: 84 },
      // Plateau kanan (top: 270)
      { x: 680, y: 362, w: 240, h: 180 },
    ],

    // Platform (jembatan antar pulau + platform atas)
    platforms: [
      { x: 240, y: 210, w: 100, h: 30, sink: 6 }, // Bridge kiri
      { x: 560, y: 210, w: 100, h: 30, sink: 6 }, // Bridge kanan
      { x: 400, y: 150, w: 100, h: 30, sink: 6 }, // Platform atas tengah
    ],

    // Kotak ❓ di atas bridge
    boxes: [
      { x: 240, y: 90 },
      { x: 560, y: 90 },
    ],

    // Kunci di atas plateau kiri & kanan
    keys: [
      { x: 400, y: 270 },
      { x: 720, y: 230 },
    ],

    // Musuh jalan di plateau (bukan di pulau tengah yang kecil)
    enemies: [
      { x: 130, y: 240, speed: 100 }, // Plateau kiri
      { x: 680, y: 240, speed: 120 }, // Plateau kanan
      {
        x: 400,
        y: 127, // Di atas platform tengah (top=140)
        speed: 60, // Pelan biar gak susah
        patrolMin: 360, // Batas kiri (platform mulai di x=350)
        patrolMax: 440, // Batas kanan (platform selesai di x=450)
      },
    ],

    spikes: [
      { x: 207, y: 192, w: 20, h: 18 }, // Bridge kiri
      { x: 527, y: 192, w: 20, h: 18 }, // Bridge kanan
    ],
  },
];
