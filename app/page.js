import FortuneGachaSection from "@/components/FortuneGachaSection";
import SnowGlobeSection from "@/components/SnowGlobeSection";
import BankTransferSection from "@/components/BankTransferSection";
import BestWishesSection from "@/components/BestWishesSection";
import LocationSection from "@/components/LocationSection";
import LocationWash from "@/components/LocationWash";
import { SparkBurstProvider } from "@/components/SparkBurstProvider";
import SafariWash from "@/components/SafariWash";
import SectionBackground from "@/components/SectionBackground";
import SectionShell from "@/components/SectionShell";
import WinterMotifPattern from "@/components/WinterMotifPattern";
import WishlistBoard from "@/components/WishlistBoard";
import WishlistSplashPreload from "@/components/WishlistSplashPreload";
import { getWishlistProducts, getPresentWinners, getWishes } from "@/lib/airtable";
import WishTicker from "@/components/WishTicker";
import { WishTickerProvider } from "@/components/WishTickerProvider";
import Link from "next/link";

export const revalidate = 60;

export default async function Home() {
  let products = [];
  let wishes = [];
  let winners = [];
  let errorMessage = null;

  try {
    products = await getWishlistProducts();
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  try {
    wishes = await getWishes();
  } catch {
    wishes = [];
  }

  try {
    winners = await getPresentWinners();
  } catch {
    winners = [];
  }

  return (
    <WishTickerProvider initialWishes={wishes} initialWinners={winners}>
    <div className="relative min-h-screen bg-gradient-to-b from-aira-snow via-white to-aira-iceLight [overflow-x:clip]">
      <WishTicker />
      <WishlistSplashPreload products={products} />
      <WinterMotifPattern />
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
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
              Hi onty ongkel, website ini untuk menyambut kehadiran {" "}
              <span className="text-sky-600">&quot;Little Mahardika&quot; 🧸</span>
              <br />Ucapan akan kami simpan dan sampaikan beberapa tahun mendatang
              <br />Terima kasih atas doa dan dukungannya.
            </p>
          </div>
        </header>

        <SectionShell
          className="mb-5 sm:mb-6"
          background={
            <SectionBackground src="/bg_3.jpg" gradient="soft" objectPosition="object-[center_30%]" />
          }
        >
          <div className="mx-auto w-full max-w-xl">
            <BestWishesSection />
          </div>
        </SectionShell>

        <SectionShell
          className="mb-5 !overflow-visible sm:mb-6"
          background={
            <SectionBackground src="/bg_3.jpg" gradient="soft" objectPosition="object-[center_70%]" />
          }
        >
          <div className="mx-auto w-full max-w-xl overflow-visible">
            <SnowGlobeSection />
          </div>
        </SectionShell>

        <SectionShell
          className="mb-5 sm:mb-6"
          background={
            <SectionBackground
              src="/bg_3.jpg"
              gradient="soft"
              objectPosition="object-[center_50%]"
            />
          }
        >
          <div className="mx-auto w-full max-w-xl">
            <FortuneGachaSection />
          </div>
        </SectionShell>

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
          <SectionShell
            className="mb-2"
            background={
              <SectionBackground
                src="/bg.jpg"
                gradient="wishlist"
                objectPosition="object-center"
              />
            }
          >
            <WishlistBoard products={products} />
          </SectionShell>
        )}

        <SectionShell
          className="mt-16 sm:mt-20"
          background={<LocationWash />}
        >
          <LocationSection />
        </SectionShell>

        /* <SectionShell
          className="mt-16 sm:mt-20"
          background={<SafariWash anchor="bottom" />}
        >
          <BankTransferSection />
        </SectionShell> */

        <footer className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 pb-6 text-center text-[10px] leading-relaxed text-slate-400">
          <span>Developed by Mahardiora</span>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <span>
            Powered by{" "}
            <Link
              href="https://teknodika.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 underline-offset-2 transition hover:text-sky-600 hover:underline"
            >
              Teknodika.com
            </Link>
          </span>
        </footer>

      </div>
      </SparkBurstProvider>
    </div>
    </WishTickerProvider>
  );
}
