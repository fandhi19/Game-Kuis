// ============================================================
// FILE: questions.js
// FUNGSI: Menyimpan data 10 soal (5 stage × 2 soal)
// ============================================================
// CATATAN: Field "answer" = index jawaban benar (0-3)
// ============================================================

const QUESTIONS = [
  // ---------- STAGE 1 ----------
  {
    q: "Perhatikan situasi berikut! Sebelum membuat sebuah program, seorang programmer biasanya membuat rancangan langkah-langkah penyelesaian masalah terlebih dahulu menggunakan bahasa yang sederhana dan terstruktur. Rancangan tersebut disebut ....",
    options: ["Variabel", "Pseudocode", "Compiler", "Database"],
    answer: 1,
  },
  {
    q: "Perhatikan bagian-bagian pseudocode berikut!\n\n1. Judul algoritma\n2. Deklarasi/input-output\n3. Langkah-langkah algoritma\n\nUrutan struktur pseudocode yang tepat adalah ....",
    options: ["1 → 2 → 3", "2 → 1 → 3", "3 → 2 → 1", "1 → 3 → 2"],
    answer: 0,
  },

  // ---------- STAGE 2 ----------
  {
    q: "Perhatikan pseudocode berikut!\n\nINPUT sisi\nluas ← sisi × sisi\nPRINT luas\n\nJika pengguna memasukkan nilai 5 untuk sisi, nilai yang ditampilkan oleh pseudocode tersebut adalah ....",
    options: ["10", "20", "25", "50"],
    answer: 2,
  },
  {
    q: "Perhatikan potongan pseudocode berikut!\n\nnilai ← 85\nPRINT nilai\n\nApa yang dilakukan oleh perintah PRINT nilai?",
    options: ["Memasukkan nilai dari pengguna", "Menghitung nilai", "Menyimpan nilai ke dalam memori", "Menampilkan nilai ke layar"],
    answer: 3,
  },

  // ---------- STAGE 3 ----------
  {
    q: 'Perhatikan pseudocode berikut!\n\nINPUT nilai\nIF nilai >= 75 THEN\n   PRINT "LULUS"\nELSE\n   PRINT "TIDAK LULUS"\nENDIF\n\nJika nilai yang dimasukkan adalah 60, output yang dihasilkan adalah ....',
    options: ["LULUS", "TIDAK LULUS", "60", "Tidak ada output"],
    answer: 1,
  },
  {
    q: "Perhatikan pseudocode berikut!\n\nSET harga ← 5000\nSET jumlah ← 3\n\nBerdasarkan pseudocode tersebut, fungsi SET adalah ....",
    options: ["Menampilkan data ke layar", "Menerima masukan dari pengguna", "Memberikan atau mengubah nilai suatu variabel", "Menghapus variabel dari program"],
    answer: 2,
  },

  // ---------- STAGE 4 ----------
  {
    q: "Perhatikan pernyataan berikut! Dalam sebuah program, diperlukan tempat untuk menyimpan data seperti nama, umur, atau nilai yang dapat digunakan selama proses program berlangsung. Tempat untuk menyimpan data tersebut disebut ....",
    options: ["Operator", "Variabel", "Algoritma", "Output"],
    answer: 1,
  },
  {
    q: "Seorang guru ingin membuat program untuk menyimpan nilai ujian siswa. Salah satu nilai siswa adalah 87.5. Tipe data yang paling sesuai untuk menyimpan nilai tersebut adalah ....",
    options: ["int", "char", "float", "string"],
    answer: 2,
  },

  // ---------- STAGE 5 ----------
  {
    q: "Perhatikan deklarasi variabel berikut!\n\nint umur;\nfloat nilai;\nchar grade;\nstring nama;\n\nVariabel yang digunakan untuk menyimpan satu karakter, seperti A, B, atau %, adalah ....",
    options: ["umur", "nilai", "grade", "nama"],
    answer: 2,
  },
  {
    q: 'Perhatikan data berikut!\n\n"Budi Santoso"\n\nJika data tersebut akan disimpan dalam sebuah variabel pada program, tipe data yang paling tepat adalah ....',
    options: ["int", "float", "char", "string"],
    answer: 3,
  },
];
