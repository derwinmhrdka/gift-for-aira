const REACTIONS_TABLE = "Reactions";

const FIELD = {
  type: "Type",
  count: "Count",
};

const VALID_TYPES = new Set(["love", "like", "snowflake"]);
const TYPE_LIST = ["love", "like", "snowflake"];

const COUNTS_CACHE_MS = 10_000;

function getMemoryStore() {
  if (!globalThis.__airaReactions) {
    globalThis.__airaReactions = {
      counts: { love: 0, like: 0, snowflake: 0 },
      nextId: 1,
      countsCache: null,
      countsCacheAt: 0,
    };
  }
  return globalThis.__airaReactions;
}

function emptyCounts() {
  return { love: 0, like: 0, snowflake: 0 };
}

function bumpCountsCache(type) {
  const store = getMemoryStore();
  const base = store.countsCache ?? store.counts;
  store.countsCache = {
    ...base,
    [type]: (base[type] ?? 0) + 1,
  };
  store.countsCacheAt = Date.now();
  syncMemoryCounts(store.countsCache);
}

function airtableConfigured() {
  return Boolean(
    process.env.AIRTABLE_API_KEY?.trim() &&
      process.env.AIRTABLE_BASE_ID?.trim(),
  );
}

function reactionsTableUrl() {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  if (!apiKey || !baseId) {
    throw new Error("Airtable is not configured.");
  }
  return {
    apiKey,
    url: `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(REACTIONS_TABLE)}`,
  };
}

function valueToText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && !Number.isNaN(value)) return String(value);
  if (typeof value === "object") {
    if (typeof value.name === "string") return value.name.trim();
    if (typeof value.label === "string") return value.label.trim();
  }
  return String(value).trim();
}

function normalizeType(value) {
  const type = valueToText(value).toLowerCase();
  return VALID_TYPES.has(type) ? type : null;
}

async function airtableFetch(path, options = {}) {
  const { apiKey, url } = reactionsTableUrl();
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

/** Legacy: satu baris = satu klik (tanpa field Count). */
async function scanLegacyRowCounts() {
  const counts = emptyCounts();
  let offset;

  do {
    const params = new URLSearchParams({
      pageSize: "100",
      "fields[]": FIELD.type,
    });
    if (offset) params.set("offset", offset);

    const data = await airtableFetch(`?${params.toString()}`);
    for (const record of data.records ?? []) {
      const type = normalizeType(record.fields?.[FIELD.type]);
      if (type) counts[type] += 1;
    }
    offset = data.offset;
  } while (offset);

  return counts;
}

async function fetchCounterRows() {
  const records = [];
  let offset;

  do {
    const params = new URLSearchParams({ pageSize: "100" });
    params.append("fields[]", FIELD.type);
    params.append("fields[]", FIELD.count);
    if (offset) params.set("offset", offset);

    const data = await airtableFetch(`?${params.toString()}`);
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);

  return records;
}

function countsFromCounterRows(records) {
  const counts = emptyCounts();
  let hasCounterField = false;

  for (const record of records) {
    const type = normalizeType(record.fields?.[FIELD.type]);
    if (!type) continue;

    const raw = record.fields?.[FIELD.count];
    if (raw !== undefined && raw !== null && raw !== "") {
      hasCounterField = true;
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) {
        counts[type] = Math.max(counts[type], Math.floor(n));
      }
    }
  }

  return hasCounterField ? counts : null;
}

async function readAirtableCounts() {
  const records = await fetchCounterRows();
  const counterCounts = countsFromCounterRows(records);
  if (counterCounts) return counterCounts;
  return scanLegacyRowCounts();
}

async function getAirtableCounts({ force = false } = {}) {
  const store = getMemoryStore();
  const fresh =
    store.countsCache &&
    Date.now() - store.countsCacheAt < COUNTS_CACHE_MS;

  if (!force && fresh) {
    return { ...store.countsCache };
  }

  try {
    const counts = await readAirtableCounts();
    store.countsCache = counts;
    store.countsCacheAt = Date.now();
    syncMemoryCounts(counts);
    return counts;
  } catch {
    if (store.countsCache) return { ...store.countsCache };
    return getMemoryCounts();
  }
}

async function findCounterRecord(type) {
  const formula = `{${FIELD.type}}='${type}'`;
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: "1",
  });
  params.append("fields[]", FIELD.type);
  params.append("fields[]", FIELD.count);

  const data = await airtableFetch(`?${params.toString()}`);
  return data.records?.[0] ?? null;
}

async function incrementAirtableCount(type) {
  const existing = await findCounterRecord(type);

  if (existing?.id) {
    const current = Number(existing.fields?.[FIELD.count]);
    const next =
      Number.isFinite(current) && current >= 0 ? current + 1 : 1;

    await airtableFetch("", {
      method: "PATCH",
      body: JSON.stringify({
        records: [
          {
            id: existing.id,
            fields: { [FIELD.count]: next },
          },
        ],
      }),
    });
    return;
  }

  await airtableFetch("", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            [FIELD.type]: type,
            [FIELD.count]: 1,
          },
        },
      ],
    }),
  });
}

function getMemoryCounts() {
  const store = getMemoryStore();
  return { ...store.counts };
}

function syncMemoryCounts(counts) {
  getMemoryStore().counts = { ...counts };
}

function bumpMemoryCount(type) {
  const store = getMemoryStore();
  store.counts[type] += 1;
  return { ...store.counts };
}

export async function getReactionsSince(_sinceMs = 0) {
  const memoryCounts = getMemoryCounts();

  if (!airtableConfigured()) {
    return {
      counts: memoryCounts,
      events: [],
      source: "memory",
    };
  }

  try {
    const airtableCounts = await getAirtableCounts();
    return {
      counts: airtableCounts,
      events: [],
      source: "airtable",
    };
  } catch {
    const store = getMemoryStore();
    const counts = store.countsCache
      ? { ...store.countsCache }
      : memoryCounts;
    return {
      counts,
      events: [],
      source: "memory-fallback",
    };
  }
}

export async function addReaction(type) {
  const normalizedType = normalizeType(type);
  if (!normalizedType) {
    throw new Error("Invalid reaction type.");
  }

  if (!airtableConfigured()) {
    const counts = bumpMemoryCount(normalizedType);
    return { counts, source: "memory" };
  }

  try {
    await incrementAirtableCount(normalizedType);
    bumpCountsCache(normalizedType);
    const store = getMemoryStore();
    const counts = store.countsCache
      ? { ...store.countsCache }
      : getMemoryCounts();

    return { counts, source: "airtable" };
  } catch {
    const counts = bumpMemoryCount(normalizedType);
    return { counts, source: "memory-fallback" };
  }
}
