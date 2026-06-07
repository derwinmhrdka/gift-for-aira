export const BABY_MATCH_PAIRS = [
  {
    pairId: "cry-milk",
    cards: [
      { emoji: "😭", label: "Menangis" },
      { emoji: "🍼", label: "Susu" },
    ],
  },
  {
    pairId: "sleep-bed",
    cards: [
      { emoji: "😴", label: "Mengantuk" },
      { emoji: "🛏️", label: "Tempat Tidur" },
    ],
  },
  {
    pairId: "poop-diaper",
    cards: [
      { emoji: "💩", label: "Pup" },
      { emoji: "🚼", label: "Popok" },
    ],
  },
  {
    pairId: "smile-camera",
    cards: [
      { emoji: "😁", label: "Tersenyum" },
      { emoji: "📸", label: "Kamera" },
    ],
  },
  {
    pairId: "fussy-hold",
    cards: [
      { emoji: "🤒", label: "Rewel" },
      { emoji: "🤱", label: "Digendong" },
    ],
  },
  {
    pairId: "cold-blanket",
    cards: [
      { emoji: "🥶", label: "Kedinginan" },
      { emoji: "🧣", label: "Selimut" },
    ],
  },
];

const MAIN_RANKS = [
  {
    id: "baby-whisperer-supreme",
    emoji: "👑",
    title: "Baby Whisperer Supreme",
    match: (s, a) => s <= 35 && a <= 10,
    description:
      "Selamat. Kamu menyelesaikan permainan dengan kecepatan yang cukup untuk membuat bayi, bidan, dan developer website merasa curiga.",
    predictions: [
      "🍼 Peluang jadi favorit bayi: 99%",
      "☕ Kebutuhan kopi: rendah",
      "🧠 RAM otak: tidak terbatas",
    ],
    memoryLine: "Kamu memiliki kemampuan memori yang legendaris.",
    secretStats: (s, a) => [
      "🍼 Peluang jadi favorit bayi: 99%",
      "📸 Prediksi jumlah foto bayi di galeri: 5.000+",
      "☕ Kebutuhan kopi mingguan: 2 gelas",
      "🧸 Tingkat kesiapan menjadi babysitter: elite tier",
    ],
    conclusion:
      "Direkomendasikan untuk menjaga bayi tanpa pengawasan. Developer website sedikit cemas.",
  },
  {
    id: "parenting-speedrunner",
    emoji: "🏆",
    title: "Parenting Speedrunner",
    match: (s, a) => s <= 50 && a <= 14,
    description:
      "Kamu bermain seperti seseorang yang sedang mengejar flash sale jam 00:00. Cepat. Efisien. Tanpa ampun.",
    predictions: [
      "📦 Paket yang berhasil di-checkout dalam 10 detik: banyak",
      "👶 Refleks menangkap bayi yang berguling: tinggi",
    ],
    memoryLine: "Kamu memiliki kemampuan memori yang sangat baik.",
    secretStats: () => [
      "🍼 Peluang jadi favorit bayi: 91%",
      "📸 Prediksi jumlah foto bayi di galeri: 3.842",
      "☕ Kebutuhan kopi mingguan: 9 gelas",
      "🧸 Tingkat kesiapan menjadi babysitter: sangat layak",
    ],
    conclusion:
      "Direkomendasikan untuk menjaga bayi, tetapi tetap diawasi saat ada urusan popok.",
  },
  {
    id: "midnight-survivor",
    emoji: "☕",
    title: "Midnight Survivor",
    match: (s, a) => s <= 75 && a <= 20,
    description:
      "Tidak sempurna. Tidak spektakuler. Tapi selalu berhasil sampai garis akhir. Sama seperti kehidupan orang tua baru.",
    predictions: [
      "☕ Konsumsi kopi: meningkat",
      "😴 Jam tidur: sedang dicari",
    ],
    memoryLine: "Kamu punya daya tahan yang patut diacungi jempol.",
    secretStats: () => [
      "🍼 Peluang jadi favorit bayi: 78%",
      "📸 Prediksi jumlah foto bayi di galeri: 1.204",
      "☕ Kebutuhan kopi mingguan: 14 gelas",
      "🧸 Tingkat kesiapan menjadi babysitter: cukup layak",
    ],
    conclusion:
      "Direkomendasikan untuk menjaga bayi di siang hari. Malam hari optional.",
  },
  {
    id: "marketplace-warrior",
    emoji: "🛍️",
    title: "Marketplace Warrior",
    match: (s, a) => s <= 120 && a <= 28,
    description:
      "Sepertinya fokusmu terbagi antara permainan ini dan notifikasi gratis ongkir. Tidak apa-apa. Kami mengerti.",
    predictions: [
      "📦 Paket bayi bulan depan: 17",
      "💸 Saldo rekening: rahasia negara",
    ],
    memoryLine: "Kamu akhirnya selesai — meski notifikasi Shopee sempat mengganggu.",
    secretStats: () => [
      "🍼 Peluang jadi favorit bayi: 62%",
      "📸 Prediksi jumlah foto bayi di galeri: 847",
      "☕ Kebutuhan kopi mingguan: 11 gelas",
      "🧸 Tingkat kesiapan menjadi babysitter: perlu latihan lagi",
    ],
    conclusion:
      "Direkomendasikan untuk menjaga bayi bersama co-pilot yang lebih fokus.",
  },
  {
    id: "chaos-coordinator",
    emoji: "🎪",
    title: "Chaos Coordinator",
    match: () => true,
    description:
      "Strategimu tidak diketahui. Polamu tidak bisa dianalisis. Namun secara ajaib permainan tetap selesai.",
    predictions: [
      "🎲 Tingkat keberuntungan: absurd",
      "🧦 Peluang kehilangan satu kaus kaki bayi: 97%",
      "☕ Peluang minum kopi yang sudah dingin: 100%",
    ],
    memoryLine: "Kamu menyelesaikan permainan dengan cara yang tidak bisa dijelaskan ilmiah.",
    secretStats: () => [
      "🍼 Peluang jadi favorit bayi: 50% (acak)",
      "📸 Prediksi jumlah foto bayi di galeri: ???",
      "☕ Kebutuhan kopi mingguan: tidak terhitung",
      "🧸 Tingkat kesiapan menjadi babysitter: butuh backup",
    ],
    conclusion:
      "Direkomendasikan untuk ikut main — asal ada orang dewasa yang lebih tenang di dekatnya.",
  },
];

const BONUS_RANKS = {
  "cry-milk": {
    emoji: "🍼",
    title: "Milk Detective",
    pairLabel: "😭 Menangis ↔ 🍼 Susu",
    description:
      "Entah kenapa susu selalu menjadi tersangka terakhir. Untung bayi tidak perlu menunggu hasil investigasi.",
    narrativeExtra:
      "Namun berdasarkan hasil investigasi kami… susu selalu jadi jawaban terakhir. Bayi mungkin sudah menyerah menunggu.",
  },
  "sleep-bed": {
    emoji: "😴",
    title: "Sleep Resistance Champion",
    pairLabel: "😴 Mengantuk ↔ 🛏️ Tempat Tidur",
    description:
      "Kamu berhasil menemukan semuanya. Kecuali tempat tidur. Sangat relatable.",
    narrativeExtra:
      "Namun tempat tidur baru kamu temukan di detik terakhir. Pola tidur bayi salut — dan khawatir.",
  },
  "poop-diaper": {
    emoji: "🚼",
    title: "Popok Avoider",
    pairLabel: "💩 Pup ↔ 🚼 Popok",
    description:
      "Secara ilmiah belum terbukti. Tapi ada indikasi kuat bahwa kamu berusaha menghindari urusan popok sampai detik terakhir.",
    narrativeExtra:
      "Namun berdasarkan hasil investigasi kami… ada kemungkinan kamu diam-diam berharap orang lain yang mengganti popok terlebih dahulu.",
  },
  "smile-camera": {
    emoji: "📸",
    title: "Moment Misser",
    pairLabel: "😁 Tersenyum ↔ 📸 Kamera",
    description:
      "Saat semua orang sibuk foto-foto, kamu masih mencari kameranya. Untung momen bahagia tidak benar-benar hilang.",
    narrativeExtra:
      "Namun kamera baru kamu temukan di akhir. Momen candid bayi sudah lewat — tapi kenangan tetap ada.",
  },
  "fussy-hold": {
    emoji: "🤱",
    title: "Emotional Support Intern",
    pairLabel: "🤒 Rewel ↔ 🤱 Digendong",
    description:
      "Kamu akhirnya menemukan solusi terbaik. Hanya sedikit terlambat.",
    narrativeExtra:
      "Namun solusi digendong baru muncul di detik penutup. Bayi rewel sudah lebih dulu rewel.",
  },
  "cold-blanket": {
    emoji: "🧣",
    title: "Thermal Awareness Trainee",
    pairLabel: "🥶 Kedinginan ↔ 🧣 Selimut",
    description:
      "Kamu peduli. Hanya saja tubuh bayi sempat merasakan angin lebih lama dari yang diharapkan.",
    narrativeExtra:
      "Namun selimut baru ditemukan belakangan. Bayi sempat merasakan draft — tapi tetap sayang kamu.",
  },
};

export function buildShuffledDeck() {
  const cards = BABY_MATCH_PAIRS.flatMap(({ pairId, cards: pairCards }) =>
    pairCards.map((card, index) => ({
      uid: `${pairId}-${index}`,
      pairId,
      emoji: card.emoji,
      label: card.label,
    })),
  );

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export function getMainRank(seconds, attempts) {
  return (
    MAIN_RANKS.find((rank) => rank.match(seconds, attempts)) ??
    MAIN_RANKS[MAIN_RANKS.length - 1]
  );
}

export function getBonusRank(lastPairId) {
  if (!lastPairId) return null;
  return BONUS_RANKS[lastPairId] ?? null;
}

export function getMatchResult({ seconds, attempts, lastPairId }) {
  const mainRank = getMainRank(seconds, attempts);
  const bonusRank = getBonusRank(lastPairId);

  const narrative = bonusRank
    ? `${mainRank.memoryLine} ${bonusRank.narrativeExtra}`
    : mainRank.memoryLine;

  return {
    stats: { seconds, attempts, lastPairId },
    mainRank: {
      emoji: mainRank.emoji,
      title: mainRank.title,
      description: mainRank.description,
      predictions: mainRank.predictions,
    },
    bonusRank: bonusRank
      ? {
          emoji: bonusRank.emoji,
          title: bonusRank.title,
          pairLabel: bonusRank.pairLabel,
          description: bonusRank.description,
        }
      : null,
    narrative,
    secretStats: mainRank.secretStats(seconds, attempts),
    conclusion: mainRank.conclusion,
  };
}

function vibrateShort() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(35);
  }
}

export function vibrateMatch() {
  vibrateShort();
}

export function vibrateMismatch() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([20, 40, 20]);
  }
}
