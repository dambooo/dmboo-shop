import "./globals.css";
import { ShopProvider } from "@/lib/ShopContext";

export const metadata = {
  title: "GEZEG — Гоо сайхны бүтээгдэхүүн",
  description: "Чанартай, байгальд ээлтэй, өдөр тутмын арчилгааны бүтээгдэхүүнүүд. Шампунь, кондиционер, маск, тос — GEZEG албан ёсны дэлгүүр.",
  keywords: ["GEZEG", "гоо сайхан", "арчилгаа", "шампунь", "кондиционер", "маск", "тос", "байгальд ээлтэй"],
  metadataBase: new URL("https://gezegstore.mn"),
  openGraph: {
    title: "GEZEG — Гоо сайхны бүтээгдэхүүн",
    description: "Чанартай, байгальд ээлтэй, өдөр тутмын арчилгааны бүтээгдэхүүнүүд.",
    url: "https://gezegstore.mn",
    siteName: "GEZEG",
    locale: "mn_MN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEZEG — Гоо сайхны бүтээгдэхүүн",
    description: "Чанартай, байгальд ээлтэй, өдөр тутмын арчилгааны бүтээгдэхүүнүүд.",
  },
  alternates: {
    canonical: "https://gezegstore.mn",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body>
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
