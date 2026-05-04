import BankTransferSection from "@/components/BankTransferSection";
import WishlistBoard from "@/components/WishlistBoard";
import { getWishlistProducts } from "@/lib/airtable";

export const revalidate = 60;

export default async function Home() {
  let products = [];
  let errorMessage = null;

  try {
    products = await getWishlistProducts();
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-aira-yellow">
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-fuchsia-200/60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-32 left-1/4 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-10 right-10 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <p className="font-display text-base font-semibold uppercase tracking-[0.2em] text-violet-600 sm:text-lg">
            Baby wishlist
          </p>
          <h1 className="font-display mt-3 text-5xl font-bold tracking-tight text-stone-800 sm:text-6xl lg:text-7xl">
            Untuk{" "}
            <span className="bg-gradient-to-r from-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
              Aira
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 sm:text-xl">
            Hadiah manis &mdash; pilih kategori, ketuk kartu untuk detail, lalu
            belanja di Shopee atau Tokopedia.
          </p>
        </header>

        {errorMessage ? (
          <div
            className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-800"
            role="alert"
          >
            <p className="font-semibold">Tidak bisa memuat wishlist</p>
            <p className="mt-1 text-base opacity-90">{errorMessage}</p>
          </div>
        ) : (
          <WishlistBoard products={products} />
        )}

        <BankTransferSection />
      </div>
    </div>
  );
}
