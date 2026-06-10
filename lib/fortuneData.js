import {
  Baby,
  Briefcase,
  CloudRain,
  Coins,
  Heart,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";

export const FORTUNE_CATEGORIES = [
  {
    id: "asmara",
    label: "Asmara",
    japaneseKanji: "恋",
    japaneseKana: "こい",
    icon: Heart,
    iconClass: "text-pink-500",
    accentClass: "text-pink-500",
    hoverGlow:
      "group-hover:shadow-[0_18px_48px_-14px_rgba(236,72,153,0.35)]",
    selectedRing: "ring-pink-500/25",
  },
  {
    id: "karir",
    label: "Karir",
    japaneseKanji: "職",
    japaneseKana: "しょく",
    icon: Briefcase,
    iconClass: "text-sky-600",
    accentClass: "text-sky-600",
    hoverGlow:
      "group-hover:shadow-[0_18px_48px_-14px_rgba(14,165,233,0.32)]",
    selectedRing: "ring-sky-500/25",
  },
  {
    id: "keuangan",
    label: "Keuangan",
    japaneseKanji: "財",
    japaneseKana: "ざい",
    icon: Coins,
    iconClass: "text-amber-600",
    accentClass: "text-amber-600",
    hoverGlow:
      "group-hover:shadow-[0_18px_48px_-14px_rgba(217,119,6,0.32)]",
    selectedRing: "ring-amber-500/25",
  },
  {
    id: "energi",
    label: "Energi",
    japaneseKanji: "気",
    japaneseKana: "き",
    icon: Sparkles,
    iconClass: "text-violet-500",
    accentClass: "text-violet-500",
    hoverGlow:
      "group-hover:shadow-[0_18px_48px_-14px_rgba(139,92,246,0.32)]",
    selectedRing: "ring-violet-500/25",
  },
  {
    id: "momongan",
    label: "Momongan",
    japaneseKanji: "子",
    japaneseKana: "こ",
    icon: Baby,
    iconClass: "text-rose-500",
    accentClass: "text-rose-500",
    hoverGlow:
      "group-hover:shadow-[0_18px_48px_-14px_rgba(244,63,94,0.32)]",
    selectedRing: "ring-rose-500/25",
  },
];

export const LUCK_TIERS = {
  great: {
    id: "great",
    label: "Sangat Beruntung",
    icon: Star,
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 backdrop-blur-sm",
    scoreClass: "text-emerald-600",
    spark: {
      dot: "bg-teal-300 shadow-[0_0_14px_5px_rgba(45,212,191,0.75)]",
      star: "text-teal-200 drop-shadow-[0_0_8px_rgba(94,234,212,0.95)]",
    },
    min: 80,
    max: 99,
  },
  good: {
    id: "good",
    label: "Cukup Beruntung",
    icon: Sun,
    badgeClass:
      "bg-sky-500/10 text-sky-700 ring-sky-500/20 backdrop-blur-sm",
    scoreClass: "text-sky-600",
    spark: {
      dot: "bg-sky-300 shadow-[0_0_14px_5px_rgba(56,189,248,0.8)]",
      star: "text-white drop-shadow-[0_0_8px_rgba(186,230,253,0.95)]",
    },
    min: 50,
    max: 79,
  },
  bad: {
    id: "bad",
    label: "Kurang Beruntung",
    icon: CloudRain,
    badgeClass:
      "bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 backdrop-blur-sm",
    scoreClass: "text-zinc-500",
    spark: {
      dot: "bg-aira-ice shadow-[0_0_12px_4px_rgba(197,221,240,0.85)]",
      star: "text-white drop-shadow-[0_0_8px_rgba(219,234,254,0.9)]",
    },
    min: 10,
    max: 49,
  },
};

export const FORTUNE_TEXTS = {
  asmara: {
    great: [
      "Hari ini semesta lagi berpihak pada keberanianmu. Gak usah terlalu banyak gengsi, kalau mau chat atau ajak jalan duluan, gass aja.",
      "Ada sinyal bagus hari ini. Komunikasi bakal mengalir lancar tanpa perlu dipaksakan, momen pas buat makin akrab.",
    ],
    good: [
      "Kondisinya lagi aman terkendali. Respons dia sejauh ini cukup positif, tinggal pinter-pinter kamu aja jaga momentumnya agar gak garing.",
      "Gak usah terburu-buru mengambil kesimpulan. Jalani saja dulu ritmenya, pelan tapi pasti itu jauh lebih aman.",
    ],
    bad: [
      "Daripada waktu kamu habis buat nungguin kabar atau scroll nyari tahu kesibukan dia, mending fokus ke diri sendiri dulu hari ini.",
      "Ekspektasi yang terlalu tinggi kadang bikin kecewa sendiri. Coba kurangi overthinking dan biarkan semuanya mengalir natural.",
    ],
  },
  karir: {
    great: [
      "Hari yang produktif dan tenang. Tugas atau revisi bisa selesai lebih cepat dari perkiraan tanpa perlu banyak drama.",
      "Fokus dan konsentrasimu lagi tajam banget hari ini. Masalah pelik yang kemarin sempat bikin pusing bakal ketemu jalan keluarnya dengan mudah.",
    ],
    good: [
      "Rutinitas berjalan normal tanpa ada kendala besar. Semua target harian bisa tercapai dengan ritme kerja yang santai.",
      "Suasana di tempat kerja atau kampus cukup kondusif hari ini. Manfaatkan untuk mencicil tanggung jawab yang mendekati deadline.",
    ],
    bad: [
      "Fokus lagi agak menurun hari ini. Kalau tidak terlalu mendesak, hindari mengambil keputusan besar atau pekerjaan tambahan sore ini.",
      "Ada sedikit kendala teknis atau komunikasi yang agak miskom harian. Tarik napas dalam-dalam, tetap tenang, dan selesaikan satu per satu.",
    ],
  },
  keuangan: {
    great: [
      "Ada saja jalan untuk rezeki hari ini, entah dalam bentuk promo, traktiran, atau pengeluaran tak terduga yang tiba-tiba batal.",
      "Arus keuangan lagi lancar. Keputusan finansial yang kamu ambil akhir-akhir ini mulai menunjukkan hasil yang memuaskan.",
    ],
    good: [
      "Kondisi dompet masih stabil dan aman untuk memenuhi kebutuhan harian, termasuk kalau mau sedikit jajan di luar rencana.",
      "Finansial dalam posisi aman, tidak surplus tapi tidak minus juga. Cukup rem sedikit keinginan belanja yang sifatnya impulsif.",
    ],
    bad: [
      "Lagi banyak pengeluaran kecil yang kalau ditotal lumayan menguras kantong. Coba lebih selektif lagi sebelum check-out belanjaan.",
      "Dompet lagi agak sensitif hari ini. Hindari dulu nongkrong-nongkrong mahal atau impulsif buying berkedok self-reward.",
    ],
  },
  energi: {
    great: [
      "Kondisi fisik dan pikiran lagi prima. Energi positifmu hari ini bagus banget untuk menyelesaikan hal-hal yang sempat tertunda.",
      "Vibes kamu hari ini menyenangkan sekali. Mood yang stabil bikin kamu jadi tempat cerita yang seru buat orang-orang terdekat.",
    ],
    good: [
      "Hari berjalan santai dan tenang. Cocok untuk dinikmati dengan istirahat yang cukup atau sekadar melakukan hobi ringan di rumah.",
      "Energi berada di level menengah, cukup untuk menyelesaikan rutinitas harian tanpa merasa kelelahan di sore hari.",
    ],
    bad: [
      "Baterai tubuh agak low hari ini. Gak usah terlalu memaksakan diri, selesaikan yang wajib saja lalu istirahat lebih awal.",
      "Pikiran lagi agak penuh dan gampang lelah. Kurangi screen time atau bersosialisasi yang melelahkan, fokus pulihkan energi dulu.",
    ],
  },
  momongan: {
    great: [
      "Ada kabar baik yang dinanti-nanti dalam waktu dekat. Untuk yang sedang mengusahakan garis dua, semesta lagi kasih sinyal yang positif banget!",
      "Vibes rumah tanggamu lagi hangat dan harmonis sekali. Momen yang pas untuk merencanakan masa depan atau menyambut anggota keluarga baru.",
    ],
    good: [
      "Semuanya berjalan sesuai prosesnya, tidak perlu terlalu stres atau terburu-buru. Nikmati saja dulu waktu berdua bersama pasangan dengan santai.",
      "Kondisi kesehatan fisik lagi stabil. Ini modal bagus untuk terus menjaga pola hidup sehat demi rencana jangka panjang keluarga kecilmu.",
    ],
    bad: [
      "Pikiran lagi agak penuh dan gampang lelah hari ini. Kurangi dulu stres dari kerjaan, karena pikiran yang tenang adalah kunci utama kesehatan tubuhmu.",
      "Jangan terlalu mendengarkan omongan orang lain yang bikin kepikiran. Fokus saja pada kesiapan mental dan fisikmu sendiri bersama pasangan.",
    ],
  },
};

const TIER_KEYS = ["great", "good", "bad"];

export function rollFortune(categoryId) {
  const tierKey = TIER_KEYS[Math.floor(Math.random() * TIER_KEYS.length)];
  const tier = LUCK_TIERS[tierKey];
  const percent =
    tier.min + Math.floor(Math.random() * (tier.max - tier.min + 1));
  const pool = FORTUNE_TEXTS[categoryId]?.[tierKey] ?? [];
  const text = pool[Math.floor(Math.random() * pool.length)] ?? "";

  return {
    tierKey,
    tier,
    percent,
    text,
  };
}
