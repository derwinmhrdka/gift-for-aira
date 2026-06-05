"use client";

import { useSplashPreload } from "@/components/SplashScreen";
import { useEffect } from "react";

const PRELOAD_COUNT = 12;

export default function WishlistSplashPreload({ products }) {
  const { registerUrls } = useSplashPreload();

  useEffect(() => {
    if (!products?.length) return;

    const urls = products
      .slice(0, PRELOAD_COUNT)
      .map((p) => p.imageUrls?.[0] ?? p.imageUrl ?? null)
      .filter(Boolean);

    registerUrls(urls);
  }, [products, registerUrls]);

  return null;
}
