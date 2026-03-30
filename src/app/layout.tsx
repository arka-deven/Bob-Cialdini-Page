import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dr. Robert Cialdini AI — The Science of Influence",
  description:
    "Get personalized insights on influence and persuasion from the world's foremost authority — Dr. Robert Cialdini.",
  openGraph: {
    title: "Dr. Robert Cialdini AI — The Science of Influence",
    description:
      "Get personalized insights on influence and persuasion from the world's foremost authority.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Robert Cialdini AI",
    description: "Ask Dr. Cialdini anything about persuasion and influence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
