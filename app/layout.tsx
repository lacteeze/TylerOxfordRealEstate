import type { Metadata } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-archivo",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "Tyler Oxford — REALTOR® & Oxford Media · St. John's NL",
  description:
    "St. John's real estate, shot and sold by an award winner. Tyler Oxford — REALTOR® (EXP Realty) and founder of Oxford Media, an in-house award-winning real estate media studio.",
};

const themeInit = `
try {
  var t = localStorage.getItem('to-theme') || 'dark';
  document.body.dataset.theme = t;
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${instrument.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
