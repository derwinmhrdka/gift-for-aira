import BackgroundMusicButton from "@/components/BackgroundMusicButton";
import FloatingSnowman from "@/components/FloatingSnowman";
import Snowfall from "@/components/Snowfall";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

function siteUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Mahardika’s Baby Wishlist",
  description: "Sweet picks for Mahardika's baby — curated with love.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Mahardika’s Baby Wishlist",
    description: "Sweet picks for Mahardika's baby — curated with love.",
    type: "website",
    locale: "id_ID",
    siteName: "Mahardika’s Baby Wishlist",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahardika’s Baby Wishlist",
    description: "Sweet picks for Mahardika's baby — curated with love.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${jakarta.variable} font-sans text-lg leading-relaxed antialiased`}
      >
        <Snowfall />
        <FloatingSnowman />
        <BackgroundMusicButton />
        {children}
      </body>
    </html>
  );
}
