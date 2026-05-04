/**
 * Quick API check (local): node --env-file=.env.local scripts/smoke-airtable.mjs
 * Prints only HTTP status + error summary — never prints the token.
 */
const base = process.env.AIRTABLE_BASE_ID;
const table = process.env.AIRTABLE_TABLE_NAME;
const key = process.env.AIRTABLE_API_KEY;

for (const name of ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID", "AIRTABLE_TABLE_NAME"]) {
  if (!process.env[name]) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
}

const url = `https://api.airtable.com/v0/${encodeURIComponent(base)}/${encodeURIComponent(table)}?pageSize=1`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${key}` },
});

const text = await res.text();
console.log("HTTP", res.status);

if (!res.ok) {
  try {
    const j = JSON.parse(text);
    console.log("error:", j?.error?.type, "-", j?.error?.message ?? text.slice(0, 200));
  } catch {
    console.log(text.slice(0, 300));
  }
  process.exit(res.status === 200 ? 0 : 1);
}

try {
  const j = JSON.parse(text);
  console.log("OK — records in sample:", j.records?.length ?? 0);
} catch {
  console.log("OK — unparsed body");
}
