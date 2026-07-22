import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { BottomNav } from "@/components/layout/BottomNav";
import { ReviewPromptModal } from "@/components/reviews/ReviewPromptModal";
import { AuthProvider } from "@/components/providers/AuthProvider";

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
  title: "Premium Indian Plants",
  description: "Elegant and culturally rich e-commerce for premium Indian Plants.",
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
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground pb-16 md:pb-0">
        <AuthProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <AuthModal />
          <WhatsAppButton />
          <BottomNav />
          <ReviewPromptModal />
        </AuthProvider>
      </body>
    </html>
  );
}
