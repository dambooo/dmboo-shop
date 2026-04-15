import "./globals.css";
import { ShopProvider } from "@/lib/ShopContext";

export const metadata = {
  title: "GEZEG — Гоо сайхны бүтээгдэхүүн",
  description: "Чанартай, байгальд ээлтэй, өдөр тутмын арчилгааны бүтээгдэхүүнүүд",
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
