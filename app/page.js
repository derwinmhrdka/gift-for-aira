import BankTransferSection from "@/components/BankTransferSection";
import ConfirmationSection from "@/components/ConfirmationSection";
import LocationSection from "@/components/LocationSection";
import LocationWash from "@/components/LocationWash";
import { SparkBurstProvider } from "@/components/SparkBurstProvider";
import SafariWash from "@/components/SafariWash";
import Snowfall from "@/components/Snowfall";
import WinterMotifPattern from "@/components/WinterMotifPattern";
import WishlistBoard from "@/components/WishlistBoard";
import { getWishlistProducts } from "@/lib/airtable";
import Link from "next/link";

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
    <div className="relative min-h-screen bg-gradient-to-b from-aira-snow via-white to-aira-iceLight [overflow-x:clip]">
      <WinterMotifPattern />
      <Snowfall />
      <SparkBurstProvider>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="relative isolate mb-12 overflow-hidden rounded-3xl px-4 py-8 text-center sm:px-6 sm:py-10">
          <SafariWash anchor="top" />
          <div className="relative z-10">
            <div className="[text-shadow:0_1px_2px_rgba(255,255,255,0.92),0_0_28px_rgba(219,234,254,0.75)]">
              <p className="font-display text-base font-semibold uppercase tracking-[0.2em] text-aira-navy sm:text-lg">
                Baby wishlist
              </p>
              <h1 className="font-display mt-3 text-5xl font-bold tracking-tight text-aira-navy sm:text-6xl lg:text-7xl">
                Mahardika&apos;s{" "}
                <span className="bg-gradient-to-r from-sky-500 to-aira-navy bg-clip-text text-transparent [text-shadow:none] drop-shadow-sm">
                  Baby
                </span>
              </h1>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Wishlist si kecil, berisi hadiah-hadiah yang dia sukai. Terima kasih atas semua dukungannya yaa! 💖❄️
            </p>
          </div>
        </header>

        {errorMessage ? (
          <div
            className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-800"
            role="alert"
          >
            <p className="font-semibold">Tidak bisa memuat wishlist</p>
            <p className="mt-1 text-base opacity-90">{errorMessage}</p>
            <Link
              href="/"
              className="mt-3 inline-flex rounded-2xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Coba lagi
            </Link>
          </div>
        ) : (
          <WishlistBoard products={products} />
        )}

        <div className="relative isolate mt-16 overflow-hidden rounded-3xl px-2 pb-8 pt-6 sm:mt-20 sm:px-4 sm:pb-10 sm:pt-8">
          <SafariWash anchor="bottom" />
          <div className="relative z-10">
            <BankTransferSection />
          </div>
        </div>

        <div className="relative isolate mt-16 overflow-hidden rounded-3xl px-2 pb-8 pt-6 sm:mt-20 sm:px-4 sm:pb-10 sm:pt-8">
          <LocationWash />
          <div className="relative z-10">
            <LocationSection />
          </div>
        </div>

        <div className="relative z-10 mt-12 sm:mt-14">
          <ConfirmationSection />
        </div>
      </div>
      </SparkBurstProvider>
    </div>
  );
}
