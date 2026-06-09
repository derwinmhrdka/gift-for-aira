import { sortProductsByPrice } from "./productPrice";

/**
 * Airtable field names — match your “Wishlist” table headers.
 */
export const FIELD_MAP = {
  name: "Nama",
  brand: "Brand",
  priceFrom: "Harga Dari",
  priceTo: "Harga Sampai",
  category: "Kategori",
  aiCategory: "Rekomendasi AI Kategori",
  description: "Deskripsi",
  summary: "Rangkuman Produk",
  color: "Warna",
  marketplace: "Link Marketplace",
  imageLink: "Link Gambar Otomatis",
  photo: "Foto",
  isHide: "isHide",
  done: "Done",
};

/** Legacy / fallback attachment column names (after explicit “Foto”). */
const ATTACHMENT_FIELD_FALLBACKS = [
  "Foto",
  "Product_Image",
  "Product Image",
  "Image",
  "Photo",
  "Gambar",
];

function getEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function formatIdr(value) {
  if (value === null || value === undefined || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) {
    return typeof value === "string" ? value.trim() : String(value);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPriceRange(priceFrom, priceTo) {
  const a = formatIdr(priceFrom);
  const b = formatIdr(priceTo);
  if (a && b) return `${a} – ${b}`;
  if (a) return a;
  if (b) return b;
  return "—";
}

function getField(record, key) {
  const fname = FIELD_MAP[key];
  if (fname && record.fields[fname] !== undefined) {
    return record.fields[fname];
  }
  return undefined;
}

/** Pull URLs from free text or a single URL field (multiple links possible). */
function urlsFromMarketplaceField(raw) {
  if (raw === null || raw === undefined) return [];
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    const found = t.match(/https?:\/\/[^\s,;]+/gi);
    if (found?.length) {
      return [...new Set(found.map((u) => u.replace(/[.,;)]+$/, "")))];
    }
    if (/^https?:\/\//i.test(t)) return [t];
    return [];
  }
  return [];
}

function classifyMarketplaceUrls(urls) {
  let shopeeUrl = "";
  let tokopediaUrl = "";
  const otherUrls = [];

  for (const u of urls) {
    const lower = u.toLowerCase();
    const isShopee =
      /shopee\.|shp\.ee|shop\.ee/i.test(lower);
    const isTokopedia =
      /tokopedia\.com|tokopage\.|\/tokopedia/i.test(lower);

    if (isShopee && !shopeeUrl) {
      shopeeUrl = u;
    } else if (isTokopedia && !tokopediaUrl) {
      tokopediaUrl = u;
    } else {
      otherUrls.push(u);
    }
  }

  return { shopeeUrl, tokopediaUrl, otherUrls };
}

/** Semua lampiran gambar dari kolom pertama yang berisi attachment. */
function allAttachmentUrls(fields) {
  for (const fieldName of ATTACHMENT_FIELD_FALLBACKS) {
    const val = fields[fieldName];
    if (!Array.isArray(val) || val.length === 0) continue;
    const urls = val
      .map((a) => (a && typeof a.url === "string" ? a.url.trim() : null))
      .filter(Boolean);
    if (urls.length > 0) return urls;
  }
  return [];
}

/** Daftar URL gambar: banyak lampiran “Foto”, atau beberapa link di “Link Gambar Otomatis”. */
function resolveImageUrls(fields) {
  const fromAttach = allAttachmentUrls(fields);
  if (fromAttach.length > 0) return fromAttach;

  const linkField = fields[FIELD_MAP.imageLink];
  if (typeof linkField === "string") {
    const t = linkField.trim();
    if (!t) return [];
    const found = t.match(/https?:\/\/[^\s,;]+/gi);
    if (found?.length) {
      return [...new Set(found.map((u) => u.replace(/[.,;)]+$/g, "")))];
    }
    if (/^https?:\/\//i.test(t)) return [t];
  }
  return [];
}

/** Turn Airtable cell values (string, number, select object, arrays, etc.) into display text. */
function airtableValueToText(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && !Number.isNaN(v)) {
    return String(v);
  }
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (Array.isArray(v)) {
    return v
      .map((item) => airtableValueToText(item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof v === "object") {
    if (typeof v.url === "string") return v.url.trim();
    if (typeof v.name === "string") return v.name.trim();
    if (typeof v.label === "string") return v.label.trim();
    if (v.value != null && typeof v.value !== "object") {
      return airtableValueToText(v.value);
    }
    if (typeof v.text === "string") return v.text.trim();
    try {
      return JSON.stringify(v);
    } catch {
      return "";
    }
  }
  return String(v);
}

function normalizeCategories(raw) {
  if (raw === null || raw === undefined) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((c) => airtableValueToText(c))
      .map((c) => c.trim())
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  if (typeof raw === "object") {
    const t = airtableValueToText(raw);
    return t ? [t] : [];
  }
  return [];
}

function normalizeRecord(record) {
  const { fields } = record;
  const name = getField(record, "name") ?? "Untitled";
  const brand = getField(record, "brand") ?? "";
  const priceFromValue = getField(record, "priceFrom");
  const priceToValue = getField(record, "priceTo");
  const description = getField(record, "description") ?? "";
  const summary = getField(record, "summary") ?? "";
  const color = getField(record, "color") ?? "";
  const isHideRaw = getField(record, "isHide");
  const isHide = isHideRaw === true;
  const doneRaw = getField(record, "done");
  const done = doneRaw === true;

  const catMain = normalizeCategories(getField(record, "category"));
  const catAi = normalizeCategories(getField(record, "aiCategory"));
  const categories = [
    ...new Set([...catMain, ...catAi].filter(Boolean)),
  ];

  const marketplaceRaw = getField(record, "marketplace");
  const parsedUrls = urlsFromMarketplaceField(airtableValueToText(marketplaceRaw));
  const { shopeeUrl, tokopediaUrl, otherUrls } =
    classifyMarketplaceUrls(parsedUrls);

  const imageUrls = resolveImageUrls(fields);
  const imageUrl = imageUrls[0] ?? null;

  return {
    id: record.id,
    name: airtableValueToText(name) || "Untitled",
    brand: airtableValueToText(brand),
    priceFromRaw: priceFromValue,
    priceToRaw: priceToValue,
    priceLabel: formatPriceRange(priceFromValue, priceToValue),
    imageUrl,
    imageUrls,
    categories,
    primaryCategory: categories[0] ?? "Tanpa kategori",
    description: airtableValueToText(description),
    summary: airtableValueToText(summary),
    warna: airtableValueToText(color),
    isHide,
    done,
    shopeeUrl,
    tokopediaUrl,
    marketplaceOtherUrls: otherUrls,
  };
}

/**
 * Fetch all records from the configured table (handles Airtable pagination).
 */
export async function listRecords() {
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const tableId = getEnv("AIRTABLE_TABLE_NAME");

  const baseUrl = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const all = [];
  let offset = null;

  do {
    const url = new URL(baseUrl);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 403 || res.status === 404) {
        throw new Error(
          [
            "Airtable menolak akses atau base/tabel tidak ditemukan (403/404).",
            "Periksa: (1) Personal Access Token punya scope data.records:read;",
            "(2) di airtable.com/create/tokens, base yang dipakai sudah ditambahkan ke token;",
            "(3) AIRTABLE_BASE_ID = bagian app… dari URL base (bukan URL lengkap);",
            "(4) AIRTABLE_TABLE_NAME = ID tabel tbl… atau nama tabel persis seperti di Airtable.",
            `Detail API: ${text.slice(0, 280)}`,
          ].join(" "),
        );
      }
      throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    if (Array.isArray(data.records)) {
      all.push(...data.records);
    }
    offset = data.offset ?? null;
  } while (offset);

  return all;
}

/**
 * Normalized products for the wishlist UI.
 */
export async function getWishlistProducts() {
  const records = await listRecords();
  const products = records.map(normalizeRecord).filter((p) => p.isHide !== true);
  return sortProductsByPrice(products, "desc");
}

/**
 * Set the Done checkbox to true for a wishlist record.
 */
export async function markWishlistProductDone(recordId) {
  const id = String(recordId ?? "").trim();
  if (!id) {
    throw new Error("Record id is required.");
  }

  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const tableId = getEnv("AIRTABLE_TABLE_NAME");
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        [FIELD_MAP.done]: true,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return normalizeRecord(data);
}

/** Field names for the “Wishes” table. */
export const WISHES_TABLE_NAME = "Wishes";

export const WISHES_FIELD_MAP = {
  name: "Name",
  message: "Message",
  createdDate: "CreatedDate",
  answer1: "Answer_1",
  answer2: "Answer_2",
  answer3: "Answer_3",
  answer4: "Answer_4",
  answer5: "Answer_5",
};

/**
 * Save a guest wish to the configured wishes table.
 */
export async function createWish({ name, message }) {
  const trimmedName = String(name ?? "").trim();
  const trimmedMessage = String(message ?? "").trim();

  if (!trimmedName) {
    throw new Error("Name is required.");
  }
  if (!trimmedMessage) {
    throw new Error("Message is required.");
  }
  if (trimmedName.length > 120) {
    throw new Error("Name is too long.");
  }
  if (trimmedMessage.length > 500) {
    throw new Error("Message is too long.");
  }

  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const tableId = WISHES_TABLE_NAME;
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            [WISHES_FIELD_MAP.name]: trimmedName,
            [WISHES_FIELD_MAP.message]: trimmedMessage,
            [WISHES_FIELD_MAP.createdDate]: new Date().toISOString(),
          },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.records?.[0] ?? null;
}

/**
 * Update doorprize answers on an existing wish record.
 */
export async function updateWishAnswers({
  wishId,
  answer1,
  answer2,
  answer3,
  answer4,
  answer5,
}) {
  const id = String(wishId ?? "").trim();
  if (!id) {
    throw new Error("Wish ID is required.");
  }

  const fields = {};
  const pairs = [
    [WISHES_FIELD_MAP.answer1, answer1],
    [WISHES_FIELD_MAP.answer2, answer2],
    [WISHES_FIELD_MAP.answer3, answer3],
    [WISHES_FIELD_MAP.answer4, answer4],
    [WISHES_FIELD_MAP.answer5, answer5],
  ];

  for (const [field, value] of pairs) {
    const text = String(value ?? "").trim();
    if (text) fields[field] = text.slice(0, 500);
  }

  if (Object.keys(fields).length === 0) {
    throw new Error("At least one answer is required.");
  }

  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(WISHES_TABLE_NAME)}/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data;
}

function normalizeWishRecord(record) {
  const { fields } = record;
  return {
    id: record.id,
    name: airtableValueToText(fields[WISHES_FIELD_MAP.name]),
    message: airtableValueToText(fields[WISHES_FIELD_MAP.message]),
    createdDate: fields[WISHES_FIELD_MAP.createdDate] ?? null,
  };
}

/**
 * Fetch all wishes for the running ticker (handles pagination).
 */
export async function getWishes() {
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const baseUrl = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(WISHES_TABLE_NAME)}`;
  const headers = { Authorization: `Bearer ${apiKey}` };

  const all = [];
  let offset = null;

  do {
    const url = new URL(baseUrl);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set(
      "sort[0][field]",
      WISHES_FIELD_MAP.createdDate,
    );
    url.searchParams.set("sort[0][direction]", "desc");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    if (Array.isArray(data.records)) {
      all.push(...data.records);
    }
    offset = data.offset ?? null;
  } while (offset);

  return all
    .map(normalizeWishRecord)
    .filter((w) => w.name && w.message);
}

/** Field names for the “Presents” table (mini gift roulette). */
export const PRESENTS_TABLE_NAME = "Presents";

export const PRESENTS_FIELD_MAP = {
  name: "Name",
  available: "Available",
  description: "Description",
  winnerContact: "WinnerContact",
  winnerName: "WinnerName",
  createdDate: "CreatedDate",
};

function getPresentField(fields, key) {
  const mapped = PRESENTS_FIELD_MAP[key];
  if (mapped && fields[mapped] !== undefined) {
    return fields[mapped];
  }
  if (fields[key] !== undefined) {
    return fields[key];
  }
  return undefined;
}

export function isZonkPresentName(name) {
  const n = String(name ?? "")
    .trim()
    .toLowerCase();
  return n === "zonk" || n.startsWith("zonk ");
}

export const ZONK_SEGMENT_PREFIX = "zonk:";

export function isZonkSegmentId(id) {
  return String(id ?? "").startsWith(ZONK_SEGMENT_PREFIX);
}

function createZonkSegment(slot) {
  return {
    id: `${ZONK_SEGMENT_PREFIX}${slot}`,
    name: "Zonk",
    available: true,
    isZonk: true,
  };
}

function createWheelZonks(count) {
  return Array.from({ length: count }, (_, slot) => createZonkSegment(slot));
}

function normalizePresentRecord(record) {
  const { fields } = record;
  const name = airtableValueToText(getPresentField(fields, "name"));
  const availableRaw = getPresentField(fields, "available");
  const available = availableRaw === true || availableRaw === "true";
  const description = airtableValueToText(getPresentField(fields, "description"));
  const winnerContact = airtableValueToText(getPresentField(fields, "winnerContact"));
  const winnerName = airtableValueToText(getPresentField(fields, "winnerName"));
  const createdDate = getPresentField(fields, "createdDate") ?? null;

  return {
    id: record.id,
    name: name || "Hadiah",
    description,
    winnerContact,
    winnerName,
    createdDate,
    available,
    isZonk: isZonkPresentName(name),
  };
}

/**
 * Fetch all presents for the spin wheel (handles pagination).
 */
export async function getPresents() {
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const baseUrl = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(PRESENTS_TABLE_NAME)}`;
  const headers = { Authorization: `Bearer ${apiKey}` };

  const all = [];
  let offset = null;

  do {
    const url = new URL(baseUrl);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    if (Array.isArray(data.records)) {
      all.push(...data.records);
    }
    offset = data.offset ?? null;
  } while (offset);

  return all.map(normalizePresentRecord).filter((p) => p.name).sort((a, b) =>
    a.name.localeCompare(b.name, "id"),
  );
}

/**
 * Mini gift roulette winners for the running ticker.
 */
export async function getPresentWinners() {
  const all = await getPresents();
  return all
    .filter(
      (p) =>
        !p.isZonk &&
        String(p.winnerName ?? "").trim() &&
        String(p.winnerContact ?? "").trim(),
    )
    .map((p) => ({
      id: p.id,
      winnerName: String(p.winnerName).trim(),
      prizeName: String(p.description ?? "").trim() || p.name,
      createdDate: p.createdDate ?? null,
    }))
    .sort((a, b) => {
      const ta = Date.parse(a.createdDate ?? "") || 0;
      const tb = Date.parse(b.createdDate ?? "") || 0;
      return tb - ta;
    });
}

export const WHEEL_ZONK_COUNT = 5;
export const WHEEL_PRIZE_COUNT = 5;
export const WHEEL_SEGMENT_COUNT = WHEEL_ZONK_COUNT + WHEEL_PRIZE_COUNT;

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomUpTo(items, count) {
  if (items.length <= count) return shuffleArray(items);
  return shuffleArray(items).slice(0, count);
}

/** All available prizes appear first; remaining slots filled with random duplicates. */
function pickWheelPrizes(availablePrizes, count) {
  if (!availablePrizes.length || count <= 0) return [];

  if (availablePrizes.length >= count) {
    return pickRandomUpTo(availablePrizes, count);
  }

  const guaranteed = shuffleArray(availablePrizes);
  const remainder = count - guaranteed.length;
  const pool = shuffleArray(availablePrizes);
  const extras = [];
  for (let i = 0; i < remainder; i += 1) {
    extras.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return shuffleArray([...guaranteed, ...extras]);
}

function interleaveZonkAndPrizes(zonks, prizes) {
  const result = [];
  const pairs = Math.min(zonks.length, prizes.length);

  for (let i = 0; i < pairs; i += 1) {
    result.push(zonks[i]);
    result.push(prizes[i]);
  }

  for (let i = pairs; i < zonks.length; i += 1) {
    result.push(zonks[i]);
  }

  return result;
}

/**
 * Build one spin wheel: 5 synthetic zonk + 5 available prizes (duplicates if < 5).
 */
export function buildWheelSegments(allPresents) {
  const prizes = allPresents.filter((p) => !p.isZonk);
  const availablePrizes = prizes.filter((p) => p.available);

  const wheelZonks = createWheelZonks(WHEEL_ZONK_COUNT);
  const wheelPrizes = pickWheelPrizes(availablePrizes, WHEEL_PRIZE_COUNT);

  return interleaveZonkAndPrizes(wheelZonks, wheelPrizes).map((present, slot) => ({
    ...present,
    wheelSlot: slot,
    wheelKey: `${present.id}-${slot}`,
  }));
}

function resolveWheelFromSegmentIds(allPresents, segmentIds) {
  if (!Array.isArray(segmentIds) || segmentIds.length === 0) {
    return null;
  }

  const wheel = segmentIds.map((id, slot) => {
    if (isZonkSegmentId(id)) {
      return {
        ...createZonkSegment(slot),
        id,
        wheelSlot: slot,
        wheelKey: `${id}-${slot}`,
      };
    }

    const present = allPresents.find((p) => p.id === id);
    if (!present) return null;
    return {
      ...present,
      wheelSlot: slot,
      wheelKey: `${present.id}-${slot}`,
    };
  });

  if (wheel.some((item) => !item)) return null;
  return wheel;
}

export async function setPresentUnavailable(recordId) {
  const id = String(recordId ?? "").trim();
  if (!id) throw new Error("Present record ID is required.");

  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(PRESENTS_TABLE_NAME)}/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        [PRESENTS_FIELD_MAP.available]: false,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export async function updatePresentWinner(recordId, { winnerContact, winnerName }) {
  const id = String(recordId ?? "").trim();
  const contact = String(winnerContact ?? "").trim();
  const name = String(winnerName ?? "").trim();

  if (!id) throw new Error("Present record ID is required.");
  if (!contact) throw new Error("Whatsapp/Email wajib diisi.");
  if (!name) throw new Error("Nama pemenang wajib diisi.");
  if (contact.length > 200) throw new Error("Kontak terlalu panjang.");
  if (name.length > 120) throw new Error("Nama pemenang terlalu panjang.");

  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(PRESENTS_TABLE_NAME)}/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        [PRESENTS_FIELD_MAP.winnerContact]: contact,
        [PRESENTS_FIELD_MAP.winnerName]: name.slice(0, 120),
        [PRESENTS_FIELD_MAP.createdDate]: new Date().toISOString(),
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

/**
 * Wheel segments for one spin (5 zonk + 5 available prizes).
 */
export function hasAvailablePrizes(allPresents) {
  return allPresents.some((p) => !p.isZonk && p.available);
}

export async function getWheelPresentsPayload() {
  const all = await getPresents();
  const wheel = buildWheelSegments(all);
  if (!wheel.length) {
    throw new Error("Daftar hadiah belum tersedia.");
  }
  return {
    presents: wheel,
    hasAvailablePrizes: hasAvailablePrizes(all),
  };
}

/**
 * Pick a random segment on the wheel and resolve spin outcome (server-side).
 */
export async function spinPresent({ segmentIds } = {}) {
  const all = await getPresents();
  if (!hasAvailablePrizes(all)) {
    throw new Error("Yah hadiahnya sudah habis.");
  }

  const wheel =
    resolveWheelFromSegmentIds(all, segmentIds) ?? buildWheelSegments(all);

  if (!wheel.length) {
    throw new Error("Daftar hadiah belum tersedia.");
  }

  const index = Math.floor(Math.random() * wheel.length);
  const picked = wheel[index];
  const freshPicked =
    picked.isZonk || isZonkSegmentId(picked.id)
      ? picked
      : all.find((p) => p.id === picked.id) ?? picked;

  if (freshPicked.isZonk || isZonkSegmentId(freshPicked.id)) {
    return {
      outcome: "zonk",
      index,
      present: freshPicked,
      canSpinAgain: false,
    };
  }

  if (!freshPicked.available) {
    return {
      outcome: "unavailable",
      index,
      present: freshPicked,
      canSpinAgain: true,
    };
  }

  await setPresentUnavailable(freshPicked.id);

  return {
    outcome: "win",
    index,
    present: { ...freshPicked, available: false },
    canSpinAgain: false,
  };
}

/** Field names for the “Participation” table (one row per visitor + game). */
export const PARTICIPATION_TABLE_NAME = "Participation";

export const PARTICIPATION_FIELD_MAP = {
  visitorHash: "VisitorHash",
  game: "Game",
  wishId: "WishId",
  createdAt: "CreatedAt",
};

function participationTableUrl() {
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  return {
    apiKey,
    url: `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(PARTICIPATION_TABLE_NAME)}`,
  };
}

function normalizeParticipationRecord(record) {
  const { fields } = record;
  return {
    id: record.id,
    visitorHash: airtableValueToText(fields[PARTICIPATION_FIELD_MAP.visitorHash]),
    game: airtableValueToText(fields[PARTICIPATION_FIELD_MAP.game]),
    wishId: airtableValueToText(fields[PARTICIPATION_FIELD_MAP.wishId]),
    createdAt: fields[PARTICIPATION_FIELD_MAP.createdAt] ?? null,
  };
}

function escapeAirtableFormulaString(value) {
  return String(value).replace(/'/g, "\\'");
}

function fingerprintLookupKeys(visitorHash) {
  const visitor = String(visitorHash ?? "").trim();
  if (!visitor) return [];
  return [visitor, `fp:${visitor}`];
}

function ipLookupKeys(ipHash) {
  const ip = String(ipHash ?? "").trim();
  if (!ip) return [];
  return [`ip:${ip}`];
}

function participationStorageKeys(visitorHash, ipHash) {
  const keys = [];
  const visitor = String(visitorHash ?? "").trim();
  const ip = String(ipHash ?? "").trim();

  if (visitor) keys.push(`fp:${visitor}`);
  if (ip) keys.push(`ip:${ip}`);

  return keys;
}

/**
 * Fetch participation rows for one or more stored identity keys.
 */
export async function getParticipationRecordsForKeys(keys) {
  const uniqueKeys = [...new Set(keys.map((key) => String(key ?? "").trim()).filter(Boolean))];
  if (!uniqueKeys.length) return [];

  const { apiKey, url } = participationTableUrl();
  const field = PARTICIPATION_FIELD_MAP.visitorHash;
  const formula =
    uniqueKeys.length === 1
      ? `{${field}} = '${escapeAirtableFormulaString(uniqueKeys[0])}'`
      : `OR(${uniqueKeys
          .map((key) => `{${field}} = '${escapeAirtableFormulaString(key)}'`)
          .join(",")})`;

  const res = await fetch(
    `${url}?filterByFormula=${encodeURIComponent(formula)}&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.records ?? []).map(normalizeParticipationRecord);
}

/** @deprecated Use getParticipationSignalsForIdentity */
export async function getParticipationRecords(visitorHash) {
  return getParticipationRecordsForKeys(fingerprintLookupKeys(visitorHash));
}

/**
 * Fetch fingerprint + IP participation sets separately (for tiered checks).
 */
export async function getParticipationSignalsForIdentity(visitorHash, ipHash) {
  const fpKeys = fingerprintLookupKeys(visitorHash);
  const ipKeys = ipLookupKeys(ipHash);

  const [fpRecords, ipRecords] = await Promise.all([
    fpKeys.length ? getParticipationRecordsForKeys(fpKeys) : [],
    ipKeys.length ? getParticipationRecordsForKeys(ipKeys) : [],
  ]);

  return {
    fpGames: new Set(fpRecords.map((record) => record.game).filter(Boolean)),
    ipGames: new Set(ipRecords.map((record) => record.game).filter(Boolean)),
  };
}

/**
 * Tiered block check:
 * 1) fingerprint sudah main → tolak
 * 2) fingerprint beda, IP sama dengan yang sudah main → tolak (ganti browser)
 */
export async function checkParticipationTiered(visitorHash, ipHash, game) {
  const gameId = String(game ?? "").trim();
  if (!gameId) return { blocked: false };

  const { fpGames, ipGames } = await getParticipationSignalsForIdentity(
    visitorHash,
    ipHash,
  );

  if (fpGames.has(gameId)) {
    return { blocked: true, reason: "fingerprint" };
  }

  if (visitorHash && ipGames.has(gameId)) {
    return { blocked: true, reason: "ip" };
  }

  return { blocked: false };
}

/** @deprecated Use getParticipationSignalsForIdentity */
export async function getParticipatedGameSetForIdentity(visitorHash, ipHash) {
  const { fpGames, ipGames } = await getParticipationSignalsForIdentity(
    visitorHash,
    ipHash,
  );
  return new Set([...fpGames, ...ipGames]);
}

/** @deprecated Use getParticipatedGameSetForIdentity */
export async function getParticipatedGameSet(visitorHash) {
  const { fpGames } = await getParticipationSignalsForIdentity(visitorHash, "");
  return fpGames;
}

export async function hasParticipatedInGameForIdentity(visitorHash, ipHash, game) {
  const result = await checkParticipationTiered(visitorHash, ipHash, game);
  return result.blocked;
}

/** @deprecated Use hasParticipatedInGameForIdentity */
export async function hasParticipatedInGame(visitorHash, game) {
  return hasParticipatedInGameForIdentity(visitorHash, "", game);
}

async function recordParticipationByKey({ storageKey, game, wishId }) {
  const key = String(storageKey ?? "").trim();
  const gameId = String(game ?? "").trim();
  if (!key || !gameId) return { alreadyRecorded: true };

  const existing = await getParticipationRecordsForKeys([key]);
  if (existing.some((record) => record.game === gameId)) {
    return { alreadyRecorded: true };
  }

  const { apiKey, url } = participationTableUrl();
  const fields = {
    [PARTICIPATION_FIELD_MAP.visitorHash]: key,
    [PARTICIPATION_FIELD_MAP.game]: gameId,
    [PARTICIPATION_FIELD_MAP.createdAt]: new Date().toISOString(),
  };

  const trimmedWishId = String(wishId ?? "").trim();
  if (trimmedWishId) {
    fields[PARTICIPATION_FIELD_MAP.wishId] = trimmedWishId;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }] }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  return { alreadyRecorded: false };
}

/**
 * Record participation by fingerprint and IP (cross-browser on same network).
 */
export async function recordParticipation({ visitorHash, ipHash, game, wishId }) {
  const gameId = String(game ?? "").trim();
  if (!gameId) {
    throw new Error("Game is required.");
  }

  const storageKeys = participationStorageKeys(visitorHash, ipHash);
  if (!storageKeys.length) {
    throw new Error("Visitor hash or IP hash is required.");
  }

  let alreadyRecorded = true;
  for (const storageKey of storageKeys) {
    const result = await recordParticipationByKey({
      storageKey,
      game: gameId,
      wishId,
    });
    if (!result.alreadyRecorded) alreadyRecorded = false;
  }

  return { alreadyRecorded };
}

/**
 * Fetch a single wish record (includes doorprize answer fields).
 */
export async function getWishRecordById(wishId) {
  const id = String(wishId ?? "").trim();
  if (!id) {
    throw new Error("Wish ID is required.");
  }

  const apiKey = getEnv("AIRTABLE_API_KEY");
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(WISHES_TABLE_NAME)}/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export function wishHasDoorprizeAnswers(fields) {
  const answerFields = [
    WISHES_FIELD_MAP.answer1,
    WISHES_FIELD_MAP.answer2,
    WISHES_FIELD_MAP.answer3,
    WISHES_FIELD_MAP.answer4,
    WISHES_FIELD_MAP.answer5,
  ];

  return answerFields.some((field) => {
    const text = airtableValueToText(fields?.[field]);
    return Boolean(text);
  });
}
