"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from 'next/dynamic'

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export function Navbar() {
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58() || "";

  // Truncate wallet address for display
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Get the current pathname
  const pathname = usePathname();

  // Map pathnames to titles
  const pageTitles: { [key: string]: string } = {
    "/strategy-dashboard": "Strategy Dashboard",
    "/create-strategy": "Create Yield Strategy",
    "/profile": "User Profile",
  };

  // Determine the title based on the current pathname
  const title = "MirrorFi"; //pageTitles[pathname] || "MirrorFi";

  return (
    <div className="border-b border-[#1a1b29] bg-[#0a0b14]">
      <div className="flex h-20 justify-around items-center px-6">
        <div className="flex items-center space-x-4">
          <Image
            src="/SVG/MirrorFi-Logo-Blue.svg"
            alt="MirrorFi Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex h-16 justify-around items-center px-6 opacity-0 cursor-default">
          <Button
            variant="outline"
            className="h-9 gap-2 rounded-md border-[#2a2b39] bg-[#1a1b29] text-cyan-400 hover:bg-[#2a2b39] hover:text-cyan-300"
          >
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">
              {truncatedAddress || "Connect Wallet"}
            </span>
          </Button>
        </div>

        <div className="mx-auto flex items-center space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/strategy-dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={`text-sm font-medium ${pathname === "/strategy-dashboard" ? "text-primary": "text-foreground"}  hover:text-primary`}>
                    Strategy Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Divider */}
              <div className="border-l border-[#3f4152] h-4 mx-4" />

              <NavigationMenuItem>
                <Link href="/create-strategy" legacyBehavior passHref>
                  <NavigationMenuLink className={`text-sm font-medium ${pathname === "/create-strategy" ? "text-primary": "text-foreground"} hover:text-primary`}>
                    Create Strategy
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <div className="border-l border-[#3f4152] h-4 mx-4" />

              <NavigationMenuItem>
                <Link href="/profile" legacyBehavior passHref>
                  <NavigationMenuLink className={`text-sm font-medium ${pathname === "/profile" ? "text-primary": "text-foreground"}  hover:text-primary`}>
                    Portfolio
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center space-x-4 opacity-0 cursor-default">
          <Image
            src="/SVG/MirrorFi-Logo-Blue.svg"
            alt="MirrorFi Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex h-16 justify-around items-center px-6">
          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
}
