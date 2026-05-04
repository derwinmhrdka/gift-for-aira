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

function firstAttachmentUrl(fields) {
  for (const fieldName of ATTACHMENT_FIELD_FALLBACKS) {
    const val = fields[fieldName];
    if (Array.isArray(val) && val.length > 0 && val[0]?.url) {
      return val[0].url;
    }
  }
  return null;
}

function resolveImageUrl(fields) {
  const fromAttach = firstAttachmentUrl(fields);
  if (fromAttach) return fromAttach;

  const linkField = fields[FIELD_MAP.imageLink];
  if (typeof linkField === "string") {
    const t = linkField.trim();
    if (/^https?:\/\//i.test(t)) return t;
  }
  return null;
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

  const catMain = normalizeCategories(getField(record, "category"));
  const catAi = normalizeCategories(getField(record, "aiCategory"));
  const categories = [
    ...new Set([...catMain, ...catAi].filter(Boolean)),
  ];

  const marketplaceRaw = getField(record, "marketplace");
  const parsedUrls = urlsFromMarketplaceField(airtableValueToText(marketplaceRaw));
  const { shopeeUrl, tokopediaUrl, otherUrls } =
    classifyMarketplaceUrls(parsedUrls);

  return {
    id: record.id,
    name: airtableValueToText(name) || "Untitled",
    brand: airtableValueToText(brand),
    priceFromRaw: priceFromValue,
    priceToRaw: priceToValue,
    priceLabel: formatPriceRange(priceFromValue, priceToValue),
    imageUrl: resolveImageUrl(fields),
    categories,
    primaryCategory: categories[0] ?? "Tanpa kategori",
    description: airtableValueToText(description),
    summary: airtableValueToText(summary),
    warna: airtableValueToText(color),
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
  const products = records.map(normalizeRecord);
  products.sort((a, b) => a.name.localeCompare(b.name, "id"));
  return products;
}
