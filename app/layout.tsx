import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpeakToSlides — Voice-first presentation builder",
  description:
    "Describe your presentation in text or voice. AI builds a beautiful deck instantly. Shareable link, no apps needed.",
  keywords: ["presentation", "AI", "voice", "slides", "deck builder"],
  openGraph: {
    title: "SpeakToSlides",
    description: "Speak. Slide. Share. AI-powered presentation builder.",
    siteName: "SpeakToSlides",
    type: "website",
    url: "https://speaktoslides.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakToSlides",
    description: "Speak. Slide. Share. AI-powered presentation builder.",
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
