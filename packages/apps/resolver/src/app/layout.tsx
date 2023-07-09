import type { Metadata } from "next";
import { Inter } from "next/font/google";

import NextTopLoader from "nextjs-toploader";

import { GITHUB_URL } from "@xcpcio/types";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resolver",
  description: "Resolver for ICPC/CCPC",
  keywords: ["ICPC", "CCPC", "Resolver"],
  applicationName: "Resolver",
  authors: {
    name: "XCPCIO",
    url: GITHUB_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextTopLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
