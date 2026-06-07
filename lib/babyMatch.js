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

const INSTINCT_ANALYSIS = {
  "cry-milk": {
    pairLabel: "😭 + 🍼",
    title: "Susu = Default Problem Solver",
    teamName: "Tim Susu Dulu",
    summary:
      "Kamu cenderung mengasosiasikan masalah dengan kebutuhan paling dasar: harus diisi dulu.",
    logicPattern:
      "stimulus (bayi nangis) → asumsi (lapar) → solusi cepat (susu)",
    interpretation:
      "lebih suka solusi yang langsung bisa dieksekusi daripada analisis panjang.",
    documentationHabit: "sedang",
  },
  "sleep-bed": {
    pairLabel: "😴 + 🛏️",
    title: "Shutdown Strategy",
    teamName: "Tim Reset Dulu",
    summary:
      "Kamu punya kecenderungan menyelesaikan beban dengan cara menghentikan sistem sementara. Bukan menghindar, tapi reset.",
    logicPattern: "overload → istirahat → stabilisasi",
    interpretation:
      "kalau situasi tidak bisa diproses, kamu memilih pause dulu sebelum lanjut.",
    documentationHabit: "sedang",
  },
  "poop-diaper": {
    pairLabel: "💩 + 🚼",
    title: "Problem Acceptance Mode",
    teamName: "Tim Eksekusi Langsung",
    summary:
      "Ini tipe yang tidak menunda masalah yang jelas. Ada hal tidak nyaman → langsung ditangani.",
    logicPattern:
      "problem terdeteksi → tidak ada alternatif → eksekusi langsung",
    interpretation:
      "kamu realistis, bukan tipe yang menunda hal yang sudah jelas.",
    documentationHabit: "sedang",
  },
  "smile-camera": {
    pairLabel: "😁 + 📸",
    title: "Memory Preservation Bias",
    teamName: "Tim Arsip Momen",
    summary:
      "Kamu cenderung mengamankan momen positif secara visual. Bukan sekadar menikmati, tapi juga menyimpan.",
    logicPattern: "positive event → capture → archive",
    interpretation:
      "kamu lebih percaya pada dokumentasi daripada ingatan.",
    documentationHabit: "tinggi",
  },
  "fussy-hold": {
    pairLabel: "🤒 + 🤱",
    title: "Stabilization First Response",
    teamName: "Tim Tenangkan Dulu",
    summary:
      "Respon awal kamu bukan solusi, tapi menstabilkan situasi. Kamu cenderung mengutamakan emosi/keadaan dulu sebelum tindakan.",
    logicPattern: "distress → calming → decision",
    interpretation:
      "kamu tidak terburu-buru menyelesaikan, tapi memastikan situasi aman dulu.",
    documentationHabit: "sedang",
  },
  "cold-blanket": {
    pairLabel: "🥶 + 🧣",
    title: "Preventive Protection Mode",
    teamName: "Tim Antisipasi",
    summary:
      "Kamu lebih cepat bereaksi terhadap potensi masalah daripada masalah itu sendiri.",
    logicPattern:
      "kemungkinan dingin → tindakan pencegahan → perlindungan",
    interpretation:
      "kamu cenderung antisipatif, kadang bahkan sebelum masalah benar-benar terjadi.",
    documentationHabit: "cukup",
  },
};

const PERFORMANCE_RANKS = [
  {
    id: "whisperer",
    emoji: "👑",
    title: "Baby Whisperer Instinct Mode",
    criteria: "≤ 35 detik + sedikit percobaan",
    match: (seconds, attempts) => seconds <= 35 && attempts <= 12,
    readiness: 97,
    points: [
      "minim ragu",
      "keputusan langsung",
      "pola sudah terbaca dengan cepat",
    ],
    analysis:
      "keputusan dibuat hampir tanpa delay antara melihat dan bertindak",
    decisionStyle: "insting dominan dengan respons sangat cepat",
  },
  {
    id: "fast-hands",
    emoji: "🏆",
    title: "Fast Hands Parent",
    criteria: "≤ 50 detik",
    match: (seconds) => seconds <= 50,
    readiness: 88,
    points: [
      "masih ada proses cek",
      "tapi tidak menghambat eksekusi",
    ],
    analysis:
      "keseimbangan antara insting dan logika masih terjaga",
    decisionStyle: "cukup seimbang antara insting dan logika",
  },
  {
    id: "sleepy",
    emoji: "☕",
    title: "Sleepy But Trying",
    criteria: "≤ 75 detik",
    match: (seconds) => seconds <= 75,
    readiness: 75,
    points: [
      "masih adaptif",
      "tapi belum otomatis",
    ],
    analysis: "proses belajar masih berjalan, tapi arah sudah benar",
    decisionStyle: "adaptif, masih mengandalkan evaluasi ulang",
  },
  {
    id: "chaos",
    emoji: "📦",
    title: "Chaos Clicker",
    criteria: "> 75 detik / banyak percobaan",
    match: () => true,
    readiness: 60,
    points: [
      "eksplorasi tinggi",
      "belum ada pola tetap",
    ],
    analysis: "lebih mengandalkan percobaan daripada insting",
    decisionStyle: "eksploratif, lebih trial & error",
  },
];

const EFFICIENCY_RANKS = [
  {
    id: "direct",
    emoji: "🎯",
    title: "Direct Pattern Recognition",
    criteria: "≤ 12 langkah",
    match: (attempts) => attempts <= 12,
    readiness: 92,
    meaning: "otak langsung mengenali pasangan tanpa banyak eksplorasi",
  },
  {
    id: "controlled",
    emoji: "👍",
    title: "Controlled Exploration",
    criteria: "13–20 langkah",
    match: (attempts) => attempts <= 20,
    readiness: 82,
    meaning: "masih berpikir, tapi tidak kehilangan arah",
  },
  {
    id: "trial",
    emoji: "🤹‍♂️",
    title: "Trial-Based Learning",
    criteria: "21–30 langkah",
    match: (attempts) => attempts <= 30,
    readiness: 70,
    meaning: "pola ditemukan melalui proses, bukan insting awal",
  },
  {
    id: "exploration",
    emoji: "🎪",
    title: "Full Exploration Mode",
    criteria: "30+ langkah",
    match: () => true,
    readiness: 55,
    meaning:
      "strategi dibentuk dari pengalaman langsung, bukan prediksi",
  },
];

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

export function getPerformanceRank(seconds, attempts) {
  return (
    PERFORMANCE_RANKS.find((rank) => rank.match(seconds, attempts)) ??
    PERFORMANCE_RANKS[PERFORMANCE_RANKS.length - 1]
  );
}

export function getEfficiencyRank(attempts) {
  return (
    EFFICIENCY_RANKS.find((rank) => rank.match(attempts)) ??
    EFFICIENCY_RANKS[EFFICIENCY_RANKS.length - 1]
  );
}

export function getInstinctAnalysis(lastPairId) {
  if (!lastPairId) return null;
  return INSTINCT_ANALYSIS[lastPairId] ?? null;
}

/** @deprecated use getPerformanceRank */
export function getMainRank(seconds, attempts) {
  return getPerformanceRank(seconds, attempts);
}

/** @deprecated use getInstinctAnalysis */
export function getBonusRank(lastPairId) {
  return getInstinctAnalysis(lastPairId);
}

function buildPatternSummary(lastPairId, performance, efficiency) {
  const bullets = [];

  if (lastPairId === "cry-milk" || lastPairId === "poop-diaper") {
    bullets.push("masalah sederhana → solusi cepat");
  } else if (
    performance.id === "whisperer" ||
    performance.id === "fast-hands"
  ) {
    bullets.push("masalah sederhana → solusi cepat");
  }

  if (lastPairId === "smile-camera") {
    bullets.push("momen positif → disimpan");
  }

  if (efficiency.id !== "direct" || performance.id === "chaos") {
    bullets.push("situasi tidak pasti → dieksplorasi dulu");
  }

  if (
    lastPairId === "poop-diaper" ||
    lastPairId === "fussy-hold" ||
    lastPairId === "cold-blanket"
  ) {
    bullets.push("kondisi darurat → langsung ditangani");
  }

  if (bullets.length < 3) {
    if (!bullets.some((b) => b.startsWith("masalah sederhana"))) {
      bullets.unshift("masalah sederhana → solusi cepat");
    }
    if (!bullets.some((b) => b.startsWith("situasi tidak pasti"))) {
      bullets.push("situasi tidak pasti → dieksplorasi dulu");
    }
  }

  return bullets.slice(0, 4);
}

function buildConclusion(performance, efficiency, parentingReadiness) {
  if (parentingReadiness >= 90) {
    return "sangat siap, dengan insting kuat dan respons cepat terhadap situasi nyata";
  }
  if (parentingReadiness >= 80) {
    return "cukup siap, dengan kecenderungan berpikir praktis dan respons cepat terhadap situasi nyata";
  }
  if (parentingReadiness >= 70) {
    return "masih berkembang, tapi sudah menunjukkan pola adaptif yang positif";
  }
  return "masih dalam fase eksplorasi, tapi semangat belajar sudah terlihat jelas";
}

export function getMatchResult({ seconds, attempts, lastPairId }) {
  const performance = getPerformanceRank(seconds, attempts);
  const efficiency = getEfficiencyRank(attempts);
  const instinct = getInstinctAnalysis(lastPairId);
  const parentingReadiness = Math.round(
    (performance.readiness + efficiency.readiness) / 2,
  );
  const patternSummary = buildPatternSummary(
    lastPairId,
    performance,
    efficiency,
  );
  const conclusion = buildConclusion(
    performance,
    efficiency,
    parentingReadiness,
  );

  return {
    stats: { seconds, attempts, lastPairId },
    intro: {
      title: "Yang Dinilai",
      lead: "Ini bukan tebak-tebakan.",
      body: "Kami lihat pola kamu dari:",
      criteria: [
        "🧠 insting pertama (cara kamu menyelesaikan masalah)",
        "⏱️ waktu respon (seberapa cepat kamu ambil keputusan)",
        "👣 jumlah percobaan (berapa sering kamu perlu trial & error)",
      ],
    },
    instinctAnalysis: instinct
      ? {
          pairLabel: instinct.pairLabel,
          title: instinct.title,
          teamName: instinct.teamName,
          summary: instinct.summary,
          logicPattern: instinct.logicPattern,
          interpretation: instinct.interpretation,
        }
      : null,
    performanceAnalysis: {
      emoji: performance.emoji,
      title: performance.title,
      criteria: performance.criteria,
      points: performance.points,
      readiness: performance.readiness,
      analysis: performance.analysis,
    },
    efficiencyAnalysis: {
      emoji: efficiency.emoji,
      title: efficiency.title,
      criteria: efficiency.criteria,
      readiness: efficiency.readiness,
      meaning: efficiency.meaning,
    },
    finalResult: {
      teamName: instinct?.teamName ?? "Tim Explorer",
      instinctTitle: instinct?.title ?? "Adaptive Pattern Mode",
      patternSummary,
      finalScore: {
        seconds,
        attempts,
        parentingReadiness,
        documentationHabit: instinct?.documentationHabit ?? "sedang",
        decisionStyle: performance.decisionStyle,
      },
      conclusion,
    },
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
