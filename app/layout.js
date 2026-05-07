import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Mahardika’s Baby Wishlist",
  description: "Sweet picks for Mahardika's baby — curated with love.",
  openGraph: {
    title: "Mahardika’s Baby Wishlist",
    description: "Sweet picks for Mahardika's baby — curated with love.",
    images: ["/bg.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahardika’s Baby Wishlist",
    description: "Sweet picks for Mahardika's baby — curated with love.",
    images: ["/bg.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${jakarta.variable} font-sans text-lg leading-relaxed antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
