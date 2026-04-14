import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Million Miles · CarSensor",
  description: "Ассортимент автомобилей с CarSensor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen">
        <Providers>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <footer className="mx-auto mt-12 max-w-7xl px-4 pb-8 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
            Million Miles · данные получены с CarSensor.net для целей тестирования
          </footer>
        </Providers>
      </body>
    </html>
  );
}
