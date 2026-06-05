export function parsePriceNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? null : n;
}

/** Nilai untuk urutan harga: utamakan Harga Sampai, lalu Harga Dari. */
export function getProductPriceSortKey(product) {
  const from = parsePriceNumber(product.priceFromRaw);
  const to = parsePriceNumber(product.priceToRaw);
  if (to != null) return to;
  if (from != null) return from;
  return null;
}

export function compareProductsByPrice(a, b, direction = "desc") {
  const ka = getProductPriceSortKey(a);
  const kb = getProductPriceSortKey(b);
  const aMissing = ka == null;
  const bMissing = kb == null;
  if (aMissing && bMissing) return a.name.localeCompare(b.name, "id");
  if (aMissing) return 1;
  if (bMissing) return -1;
  const diff = direction === "desc" ? kb - ka : ka - kb;
  if (diff !== 0) return diff;
  return a.name.localeCompare(b.name, "id");
}

export function sortProductsByPrice(products, direction = "desc") {
  return [...products].sort((a, b) => compareProductsByPrice(a, b, direction));
}
