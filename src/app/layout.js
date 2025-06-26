import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import clsx from "clsx";
import Navigation from "@/components/Navigation";
import { cookies } from "next/headers";
import ThemeProvider from "@/context/ThemeProvider";
import SoundProvider from "@/context/SoundProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: {
    default: "fatima zahra . web developer . digital artist",
    template: "%s | fatima zahra . web developer . cg artist",
  },
  description: "Crafting engaging experiences for the internet.",
  openGraph: {
    title: "fatima zahra . web developer . digital artist",
    description: "Crafting engaging experiences for the internet.",
    url: "#",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "#",
        alt: "fatima zahra . web developer . digital artist",
        width: 1440,
        height: 810,
      },
    ],
  },
  twitter: {
    title: "fatima zahra . web developer . digital artist",
    description: "Crafting engaging experiences for the internet.",
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  const savedTheme = cookies().get("color-theme");
  const theme = savedTheme?.value || "dark";

  return (
    <html
      lang="en"
      className={clsx(
        theme,
        "overflow-x-hidden antialiased",
        GeistSans.variable,
        GeistMono.variable
      )}
      data-color-theme={theme}
      style={{
        scrollbarGutter: "stable",
      }}
    >
      <body className="text-neutral-950 dark:text-neutral-50 font-geistsans bg-neutral-200 dark:bg-neutral-925 relative overflow-x-hidden z-10">
        <ThemeProvider initialTheme={theme}>
          <SoundProvider>
            <Navigation />
            {children}
          </SoundProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
