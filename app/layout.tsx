import type { Metadata } from "next";
import { Poppins, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Tyler Oxford — REALTOR® & Move Media · St. John's NL",
  description:
    "St. John's real estate, shot and sold by an award winner. Tyler Oxford — REALTOR® (EXP Realty) and founder of Move Media, an in-house award-winning real estate media studio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${hanken.variable}`}>
        <div className="page-shell">
          <Header />
          {children}
          <ConditionalFooter />
        </div>
      </body>
    </html>
  );
}
