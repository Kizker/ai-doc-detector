import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Document Detector — Detect AI-Generated Content",
  description:
    "Analyze and detect AI-generated text in academic documents. Upload PDF, DOCX, or images for per-sentence AI detection with confidence scoring.",
  keywords: [
    "AI detector",
    "AI content detection",
    "plagiarism checker",
    "academic integrity",
    "document analysis",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceMono.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
