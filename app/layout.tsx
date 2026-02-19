import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpeakToSlides — Voice-first presentation builder",
  description:
    "Describe your presentation in text or voice. AI builds a beautiful deck instantly. Shareable link, no apps needed.",
  keywords: ["presentation", "AI", "voice", "slides", "deck builder", "speaktoslides"],
  openGraph: {
    title: "SpeakToSlides",
    description: "Speak. Slide. Share. AI-powered presentation builder.",
    siteName: "SpeakToSlides",
    type: "website",
    url: "https://speaktoslides.com",
    images: [
      {
        url: "https://speaktoslides.com/og/home.png",
        width: 1200,
        height: 630,
        alt: "SpeakToSlides — Speak. Slide. Share.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakToSlides",
    description: "Speak. Slide. Share. AI-powered presentation builder.",
    images: ["https://speaktoslides.com/og/home.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
