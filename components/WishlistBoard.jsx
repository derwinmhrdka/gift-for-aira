"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CategoryPills from "./CategoryPills";
import ProductModal from "./ProductModal";
import ProductSearch from "./ProductSearch";
import WishlistGrid from "./WishlistGrid";

const PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 20;

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
  const boardTopRef = useRef(null);
  const categories = useMemo(() => collectCategories(products), [products]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const handleCloseModal = useCallback(() => {
    document.body.style.removeProperty("overflow");
    setSelected(null);
  }, []);

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

  useEffect(() => {
    const updatePageSize = () => {
      if (typeof window === "undefined") return;
      setPageSize(window.innerWidth >= 1024 ? DESKTOP_PAGE_SIZE : PAGE_SIZE);
    };
    updatePageSize();
    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const goToPage = useCallback((nextPage) => {
    setPage(nextPage);
    if (boardTopRef.current) {
      boardTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <>
      <div ref={boardTopRef} />
      <ProductSearch value={search} onChange={setSearch} />
      <CategoryPills
        categories={categories}
        active={filter}
        onSelect={setFilter}
      />
      <WishlistGrid products={pagedProducts} onOpen={setSelected} />
      {totalPages > 1 ? (
        <div className="mt-4 flex justify-end">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/72 px-2.5 py-1.5 text-xs shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="h-6 w-6 rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Halaman sebelumnya"
            >
              ‹
            </button>
            <span className="min-w-[3.4rem] text-center font-semibold text-slate-700">
              {page}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="h-6 w-6 rounded-full text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Halaman berikutnya"
            >
              ›
            </button>
          </div>
        </div>
      ) : null}
      <ProductModal
        key={selected?.id ?? "closed"}
        product={selected}
        onClose={handleCloseModal}
      />
    </>
  );
}
