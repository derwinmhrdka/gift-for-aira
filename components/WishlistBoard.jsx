"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FeatureCard from "./FeatureCard";
import GiftThankYouPopup from "./GiftThankYouPopup";
import CategoryPills from "./CategoryPills";
import ProductModal from "./ProductModal";
import ProductSearch from "./ProductSearch";
import ProductSortButton from "./ProductSortButton";
import WishlistGrid from "./WishlistGrid";
import { sortProductsByPrice } from "@/lib/productPrice";

const PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 20;
const RESERVED_FILTER = "__reserved__";

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

export default function WishlistBoard({ products: initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const boardTopRef = useRef(null);
  const categories = useMemo(() => collectCategories(products), [products]);
  const reservedCount = useMemo(
    () => products.filter((p) => p.done === true).length,
    [products],
  );
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState("desc");
  const [selected, setSelected] = useState(null);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleCloseModal = useCallback(() => {
    document.body.style.removeProperty("overflow");
    setSelected(null);
  }, []);

  const handleProductDone = useCallback((id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, done: true } : p)),
    );
  }, []);

  const handleGiftSuccess = useCallback(() => {
    document.body.style.removeProperty("overflow");
    setSelected(null);
    setThankYouOpen(true);
  }, []);

  const filteredByCategory = useMemo(() => {
    if (filter === "all") return products;
    if (filter === RESERVED_FILTER) {
      return products.filter((p) => p.done === true);
    }
    return products.filter((p) =>
      p.categories?.length
        ? p.categories.includes(filter)
        : p.primaryCategory === filter,
    );
  }, [products, filter]);

  const filtered = useMemo(() => {
    const list = filteredByCategory.filter((p) => productMatchesQuery(p, search));
    return sortProductsByPrice(list, priceSort);
  }, [filteredByCategory, search, priceSort]);

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
  }, [filter, search, priceSort]);

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
      <section
        className="mx-auto mb-5 w-full max-w-xl sm:mb-6"
        aria-labelledby="gift-recommendations-heading"
      >
        <FeatureCard className="!px-4 !py-4 sm:!px-5 sm:!py-5">
          <h2
            id="gift-recommendations-heading"
            className="font-display text-xl font-bold text-aira-navy sm:text-2xl"
          >
            Rekomendasi Hadiah
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Mau kasih kado tapi bingung? Bisa cek wishlist kami di bawah 😊
          </p>
        </FeatureCard>
      </section>
      <div className="mb-6 flex w-full items-stretch gap-2 sm:mx-auto sm:mb-8 sm:max-w-2xl">
        <ProductSearch
          value={search}
          onChange={setSearch}
          className="min-w-0 flex-1"
        />
        <ProductSortButton value={priceSort} onChange={setPriceSort} />
      </div>
      <CategoryPills
        categories={categories}
        active={filter}
        onSelect={setFilter}
        reservedCount={reservedCount}
        reservedFilterValue={RESERVED_FILTER}
      />
      <WishlistGrid
        products={pagedProducts}
        onOpen={setSelected}
        emptyMessage={
          filter === RESERVED_FILTER
            ? "Belum ada produk yang sudah dibeli."
            : "Tidak ada produk di kategori ini."
        }
      />
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
        onMarkedDone={handleProductDone}
        onGiftSuccess={handleGiftSuccess}
      />
      <GiftThankYouPopup
        open={thankYouOpen}
        onClose={() => setThankYouOpen(false)}
      />
    </>
  );
}
