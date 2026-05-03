import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./Cartcontext";

import Footer from "./component/Footer";
import Script from "next/script";
import ConditionalNavbar from "./component/condinav";

// ── SEO Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Valorex — Premium Jersey Store",
    template: "%s | Valorex",
  },
  description:
    "Premium quality jerseys inspired by your favourite teams. Club, Retro, National & Top Pick jerseys. Fast delivery across Bangladesh.",
  keywords: ["jersey", "football jersey", "club jersey", "Bangladesh jersey shop", "valorex"],
  authors: [{ name: "Valorex" }],
  creator: "Valorex",
  metadataBase: new URL("https://valorex-app-fawn.vercel.app"), // ← তোমার Vercel URL দাও
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://valorex-app-fawn.vercel.app",
    siteName: "Valorex",
    title: "Valorex — Premium Jersey Store",
    description: "Premium quality jerseys inspired by your favourite teams.",
    images: [
      {
        url: "/og-image.jpg", // ← public/ folder এ একটা og-image.jpg রাখো (1200x630)
        width: 1200,
        height: 630,
        alt: "Valorex Jersey Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valorex — Premium Jersey Store",
    description: "Premium quality jerseys inspired by your favourite teams.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Facebook Pixel ID ─────────────────────────────────────────
// যখন FB Pixel পাবে, এখানে ID টা বসাও
const FB_PIXEL_ID = ""; // ← এখানে তোমার Pixel ID দাও, যেমন: "1234567890123456"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Facebook Pixel — শুধু ID দেওয়া থাকলে load হবে */}
        {FB_PIXEL_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>

      <body>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}