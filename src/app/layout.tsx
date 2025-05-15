import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProviderWrapper } from "@/components/WalletProviderWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/navbar";
import localFont from "next/font/local";
import { AgentProvider } from "@/lib/AgentProvider";
import { Analytics } from "@vercel/analytics/next"

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Bold.otf",
  variable: "--font-satoshi",
  style: "bold",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MirrorFi - Copy Yield Farming on Solana",
  description:
    "Share/Mirror the best Yield Strategies across multiple protocols",
};

const univaNova = localFont({
  src: "../../public/fonts/UnivaNova-Regular.otf",
  variable: "--font-univa",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <WalletProviderWrapper>
        <AgentProvider>
          <header className="h-20 sticky top-0 z-50">
            <Navbar />
          </header>
          <body
            className={`h-[80vh] antialiased ${satoshi.variable} ${univaNova.variable}`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange={false}
            >
              <TooltipProvider>
                {children}
                <Analytics />
                <Toaster richColors />
              </TooltipProvider>
            </ThemeProvider>
          </body>
        </AgentProvider>
      </WalletProviderWrapper>
    </html>
  );
}
