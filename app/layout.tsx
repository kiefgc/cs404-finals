import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "finals-hybrid",
  description: "a game rating site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${hanken.variable}`}>
      <body className="bg-brand-bg text-gray-200 font-body antialiased selection:bg-brand-primary selection:text-white">
        <div className="flex flex-col min-h-screen">
          
          <Header />
          
          {/* Main Context Area */}
          <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
            {children}
          </main>
          
          <Footer />
          
        </div>
      </body>
    </html>
  );
}