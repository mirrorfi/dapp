import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProviderWrapper } from "@/components/WalletProviderWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "MirrorFi",
  description:
    "Share/Mirror the best Yield Strategies across multiple protocols",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <WalletProviderWrapper>
        <header className="">
          <Navbar />
        </header>
        <body>
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
