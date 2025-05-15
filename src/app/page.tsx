"use client";

import { TermsOfService } from "@/components/TermsOfService";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import StrategyDashboardPage from "./strategy-dashboard/page";


type Props = {
  searchParams: { id?: string }
}


export default function Home({ searchParams }: Props) {
  const { connected, publicKey } = useWallet();
  const [hasSignedTerms, setHasSignedTerms] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLocalSignature = () => {
      if (!publicKey) {
        setChecking(false);
        return;
      }

      const storedSignatures = localStorage.getItem("termsSignatures") || "{}";
      const signatures = JSON.parse(storedSignatures);
      setHasSignedTerms(!!signatures[publicKey.toBase58()]);
      //   setHasSignedTerms(false);
      setChecking(false);
    };

    checkLocalSignature();
  }, [publicKey]);

  const handleTermsSigned = () => {
    setHasSignedTerms(true);
  };

  if (checking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground">
        <div>Loading...</div>
      </main>
    );
  }

  if (connected && !hasSignedTerms) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground">
        <TermsOfService onSign={handleTermsSigned} />
      </main>
    );
  }

  return <StrategyDashboardPage searchParams={searchParams}/>;
}
