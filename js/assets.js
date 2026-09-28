// ============================================================
// FILE: assets.js
// FUNGSI: Menyimpan path semua aset (gambar)
// ============================================================

const ASSETS = {
  // ---------- DAFTAR KARAKTER ----------
  // Setiap karakter punya 3 sprite: front, walk_a, walk_b
  // - front  : sprite diam (idle)
  // - walk_a : frame 1 animasi jalan
  // - walk_b : frame 2 animasi jalan
  characters: {
    yellow: {
      name: "Kuning",
      front: "assets/Characters/character_yellow_front.png",
      walkA: "assets/Characters/character_yellow_walk_a.png",
      walkB: "assets/Characters/character_yellow_walk_b.png",
      jump: "assets/Characters/character_yellow_jump.png", // ← BARU
      hit: "assets/Characters/character_yellow_hit.png", // ← BARU
    },
    purple: {
      name: "Ungu",
      front: "assets/Characters/character_purple_front.png",
      walkA: "assets/Characters/character_purple_walk_a.png",
      walkB: "assets/Characters/character_purple_walk_b.png",
      jump: "assets/Characters/character_purple_jump.png", // ← BARU
      hit: "assets/Characters/character_purple_hit.png", // ← BARU
    },
    pink: {
      name: "Pink",
      front: "assets/Characters/character_pink_front.png",
      walkA: "assets/Characters/character_pink_walk_a.png",
      walkB: "assets/Characters/character_pink_walk_b.png",
      jump: "assets/Characters/character_pink_jump.png",
      hit: "assets/Characters/character_pink_hit.png",
    },
    green: {
      name: "Hijau",
      front: "assets/Characters/character_green_front.png",
      walkA: "assets/Characters/character_green_walk_a.png",
      walkB: "assets/Characters/character_green_walk_b.png",
      jump: "assets/Characters/character_green_jump.png",
      hit: "assets/Characters/character_green_hit.png",
    },
    beige: {
      name: "Krem",
      front: "assets/Characters/character_beige_front.png",
      walkA: "assets/Characters/character_beige_walk_a.png",
      walkB: "assets/Characters/character_beige_walk_b.png",
      jump: "assets/Characters/character_beige_jump.png",
      hit: "assets/Characters/character_beige_hit.png",
    },
  },

  backgrounds: ["assets/Backgrounds/bg_stage1_v2.png", "assets/Backgrounds/bg_stage2_v2.jpg", "assets/Backgrounds/bg_stage3_v2.png", "assets/Backgrounds/bg_stage4_v2.png", "assets/Backgrounds/bg_stage5_v2.png"],

  // ---------- PLATFORM PER STAGE ----------
  // Index 0 = stage 1, index 1 = stage 2, dst.
  // Kalau belum punya gambar khusus, pakai platform default dulu
  platforms: [
    "assets/Tiles/platform.png", // Stage 1 (default - udah bener)
    "assets/Tiles/platform_stage2.png", // Stage 2 ← BARU
    "assets/Tiles/platform_stage3.png", // Stage 3
    "assets/Tiles/platform_stage4.png", // Stage 4
    "assets/Tiles/platform_stage5.png", // Stage 5 (belum dibuat)
  ],

  bgStart: "assets/Backgrounds/bg_star.png",

  // ---------- TILE & OBJEK ----------
  box: "assets/Tiles/tile_0161.png", // Kotak ❓
  key: "assets/Tiles/tile_0403.png", // Kunci 🔑
  groundTile: "assets/Tiles/ground_tile.png",
  spike: "assets/Tiles/tile_0365.png", // Duri / Rintangan

  // Musuh (katak) — 2 frame animasi
  enemyWalkA: "assets/Tiles/tile_0418.png", // frame 1
  enemyWalkB: "assets/Tiles/tile_0419.png", // frame 2
};
