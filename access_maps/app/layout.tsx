import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DM_Serif_Text } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Text({ 
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Access Maps",
  description: "Accessibility mapping for schools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
