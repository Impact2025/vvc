import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import PushNotificationBanner from "@/components/PushNotificationBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "VVC Goes UK — London Tour 2025",
  description: "Volg VVC live tijdens de London Tour! Wedstrijden, foto's, dagboek en meer.",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VVC Goes UK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f47920" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background text-on-surface">
        {children}
        <footer className="fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none md:bottom-0 md:pb-2">
          <a
            href="https://weareimpact.nl/"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto text-[10px] text-on-surface-variant/40 hover:text-on-surface-variant/70 transition-colors tracking-wide"
          >
            Innovatie met een sociaal hart · WeAreImpact
          </a>
        </footer>
        <PushNotificationBanner />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#1c1b1b",
              border: "1px solid #dec0b1",
              borderRadius: "0.5rem",
              fontFamily: "Manrope, sans-serif",
              fontSize: "14px",
              fontWeight: "500",
            },
          }}
        />
      </body>
    </html>
  );
}
