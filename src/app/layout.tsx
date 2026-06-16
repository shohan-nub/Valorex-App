import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./Cartcontext";
import Footer from "./component/Footer";
import Script from "next/script";
import ConditionalNavbar from "./component/condinav";

const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ?? "";

export const metadata: Metadata = {
  title: {
    default: "Valorex — Football Jersey Store in Bangladesh",
    template: "%s | Valorex",
  },
  description:
    "Buy football jerseys in Bangladesh from Valorex. Club jerseys, retro football jerseys, national team kits and premium quality fan editions with fast delivery across Bangladesh.",
  keywords: [
    "football jersey Bangladesh",
    "jersey store Bangladesh",
    "club jersey",
    "retro football jersey",
    "national team jersey",
    "football shirt",
    "Bangladesh jersey shop",
    "Valorex",
  ],
  authors: [{ name: "Valorex" }],
  creator: "Valorex",
  metadataBase: new URL("https://valorexbd.com"), 
  icons: {
    icon: "/icon4.png",
    apple: "/icon4.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://valorexbd.com", 
    siteName: "Valorex",
    title: "Valorex — Football Jersey Store in Bangladesh",
    description:
      "Buy football jerseys in Bangladesh from Valorex. Club jerseys, retro football jerseys, national team kits and premium quality fan editions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Valorex Jersey Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valorex — Football Jersey Store in Bangladesh",
    description:
      "Buy football jerseys in Bangladesh from Valorex. Club jerseys, retro football jerseys, national team kits and premium quality fan editions.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

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
        </CartProvider>
      </body>
    </html>
  );
}