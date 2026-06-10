const REACTIONS_TABLE = "Reactions";

const FIELD = {
  type: "Type",
  particleX: "ParticleX",
  particleY: "ParticleY",
};

const VALID_TYPES = new Set(["love", "like", "snowflake"]);

function getMemoryStore() {
  if (!globalThis.__airaReactions) {
    globalThis.__airaReactions = {
      counts: { love: 0, like: 0, snowflake: 0 },
      events: [],
      nextId: 1,
    };
  }
  return globalThis.__airaReactions;
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

function clampParticle(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 50;
  return Math.min(90, Math.max(10, Math.round(n)));
}

function randomParticleCoord() {
  return clampParticle(10 + Math.random() * 80);
}

function normalizeEvent(record) {
  const fields = record.fields ?? {};
  const type = normalizeType(fields[FIELD.type]);
  if (!type) return null;

  return {
    id: record.id,
    type,
    x: clampParticle(fields[FIELD.particleX]),
    y: clampParticle(fields[FIELD.particleY]),
    at: Date.parse(record.createdTime ?? "") || Date.now(),
  };
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

async function getAirtableCounts() {
  const counts = { love: 0, like: 0, snowflake: 0 };
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

async function getAirtableEventsSince(sinceMs) {
  const events = [];
  let offset;

  do {
    const params = new URLSearchParams({
      pageSize: "100",
      "fields[]": FIELD.type,
      sort: "-createdTime",
    });
    params.append("fields[]", FIELD.particleX);
    params.append("fields[]", FIELD.particleY);
    if (offset) params.set("offset", offset);

    const data = await airtableFetch(`?${params.toString()}`);
    let stop = false;

    for (const record of data.records ?? []) {
      const created = Date.parse(record.createdTime ?? "") || 0;
      if (created <= sinceMs) {
        stop = true;
        break;
      }
      const event = normalizeEvent(record);
      if (event) events.push(event);
    }

    if (stop) break;
    offset = data.offset;
  } while (offset);

  return events.reverse();
}

function getMemoryEventsSince(sinceMs) {
  const store = getMemoryStore();
  return store.events.filter((event) => event.at > sinceMs);
}

function getMemoryCounts() {
  const store = getMemoryStore();
  return { ...store.counts };
}

function syncMemoryCounts(counts) {
  getMemoryStore().counts = { ...counts };
}

function addMemoryReaction(type, x, y) {
  const store = getMemoryStore();
  store.counts[type] += 1;
  const event = {
    id: `mem-${store.nextId++}`,
    type,
    x,
    y,
    at: Date.now(),
  };
  store.events.push(event);
  if (store.events.length > 500) {
    store.events.splice(0, store.events.length - 500);
  }
  return { counts: { ...store.counts }, event };
}

export async function getReactionsSince(sinceMs = 0) {
  const memoryCounts = getMemoryCounts();

  if (!airtableConfigured()) {
    return {
      counts: memoryCounts,
      events: getMemoryEventsSince(sinceMs),
      source: "memory",
    };
  }

  try {
    const [airtableCounts, events] = await Promise.all([
      getAirtableCounts(),
      getAirtableEventsSince(sinceMs),
    ]);
    syncMemoryCounts(airtableCounts);
    return { counts: airtableCounts, events, source: "airtable" };
  } catch {
    return {
      counts: memoryCounts,
      events: getMemoryEventsSince(sinceMs),
      source: "memory-fallback",
    };
  }
}

export async function addReaction(type, x, y) {
  const normalizedType = normalizeType(type);
  if (!normalizedType) {
    throw new Error("Invalid reaction type.");
  }

  const particleX = clampParticle(x ?? randomParticleCoord());
  const particleY = clampParticle(y ?? randomParticleCoord());

  if (!airtableConfigured()) {
    const result = addMemoryReaction(normalizedType, particleX, particleY);
    return { ...result, source: "memory" };
  }

  try {
    const data = await airtableFetch("", {
      method: "POST",
      body: JSON.stringify({
        records: [
          {
            fields: {
              [FIELD.type]: normalizedType,
              [FIELD.particleX]: particleX,
              [FIELD.particleY]: particleY,
            },
          },
        ],
      }),
    });

    const record = data.records?.[0];
    const event = record ? normalizeEvent(record) : null;
    const counts = await getAirtableCounts();
    syncMemoryCounts(counts);

    return {
      counts,
      event: event ?? {
        id: `tmp-${Date.now()}`,
        type: normalizedType,
        x: particleX,
        y: particleY,
        at: Date.now(),
      },
      source: "airtable",
    };
  } catch {
    const result = addMemoryReaction(normalizedType, particleX, particleY);
    return { ...result, source: "memory-fallback" };
  }
}
