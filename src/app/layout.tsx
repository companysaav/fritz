import type { Metadata } from "next";

import "./globals.css";
import { body, display, sans, mono, typewriter, hand, rune } from "@/lib/fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WalkingFritz } from "@/components/site/WalkingFritz";

export const metadata: Metadata = {
  title: {
    default: "fritz — stories, told properly.",
    template: "%s · fritz",
  },
  description:
    "A home for serialized web novels and writing, with media woven in — hosted by a cat named fritz.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${sans.variable} ${mono.variable} ${typewriter.variable} ${hand.variable} ${rune.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WalkingFritz />
      </body>
    </html>
  );
}
