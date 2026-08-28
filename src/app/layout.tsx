import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { BottomNav } from "@/components/layout/BottomNav";
import { ReviewPromptModal } from "@/components/reviews/ReviewPromptModal";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ArogyaAI } from "@/components/chat/ArogyaAI";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Arogyavruksham",
  description: "Elegant and culturally rich e-commerce for premium Indian Plants from Arogyavruksham.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Arogyavruksham",
    description: "Elegant and culturally rich e-commerce for premium Indian Plants.",
    url: "https://arogyavruksham.com",
    siteName: "Arogyavruksham",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arogyavruksham",
    description: "Premium Indian Plants for your home and garden.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground pb-16 md:pb-0">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <AuthModal />
          <WhatsAppButton />
          <ArogyaAI />
          <BottomNav />
          <ReviewPromptModal />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
