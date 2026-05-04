"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import CategoryPills from "./CategoryPills";
import ProductSearch from "./ProductSearch";
import WishlistGrid from "./WishlistGrid";

const ProductModal = dynamic(() => import("./ProductModal"), {
  ssr: false,
  loading: () => null,
});

function collectCategories(products) {
  const set = new Set();
  for (const p of products) {
    if (p.categories?.length) {
      p.categories.forEach((c) => set.add(c));
    } else {
      set.add(p.primaryCategory);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "id"));
}

function productMatchesQuery(p, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const parts = [
    p.name,
    p.brand,
    p.warna,
    p.description,
    p.summary,
    p.priceLabel,
    ...(p.categories ?? []),
    p.primaryCategory,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  return parts.some((t) => t.includes(q));
}

export default function WishlistBoard({ products }) {
  const categories = useMemo(() => collectCategories(products), [products]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filteredByCategory = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) =>
      p.categories?.length
        ? p.categories.includes(filter)
        : p.primaryCategory === filter,
    );
  }, [products, filter]);

  const filtered = useMemo(() => {
    return filteredByCategory.filter((p) => productMatchesQuery(p, search));
  }, [filteredByCategory, search]);

  return (
    <>
      <ProductSearch value={search} onChange={setSearch} />
      <CategoryPills
        categories={categories}
        active={filter}
        onSelect={setFilter}
      />
      <WishlistGrid products={filtered} onOpen={setSelected} />
      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}
