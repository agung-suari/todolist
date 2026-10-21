import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const appFont = localFont({
  src: "./fonts/AlbertSans-Variable.ttf",
  variable: "--font-app",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ruang Tugas — Manajemen Tugas",
  description: "Atur tugas pribadi, pantau progres, dan simpan perubahanmu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={appFont.variable}
    >
      <body>{children}</body>
    </html>
  );
}
