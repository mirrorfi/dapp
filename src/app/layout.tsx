import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProviderWrapper } from "@/components/WalletProviderWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/navbar";
import localFont from "next/font/local";

const satoshi = localFont({
  src: "../../public/fonts/Satoshi-Bold.otf",
  variable: "--font-satoshi",
  style: "bold",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MirrorFi",
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
        <header className="h-16 sticky top-0 z-50">
          <Navbar />
        </header>
        <body
          className={`h-screen antialiased ${satoshi.variable} ${univaNova.variable}`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            <TooltipProvider>
              {children}
              <Toaster richColors />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </WalletProviderWrapper>
    </html>
  );
}
