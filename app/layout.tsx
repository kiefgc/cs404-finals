// app/layout.tsx
import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await authGuard();
  let userPayload = null;

  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true },
    });

    if (dbUser) {
      userPayload = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        handle: dbUser.handle,
        role: dbUser.role.name,
      };
    }
  }

  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${hanken.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-brand-bg text-gray-200 font-body antialiased selection:bg-brand-primary selection:text-white">
        <div className="flex flex-col min-h-screen">
          <Header user={userPayload} />
          <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}