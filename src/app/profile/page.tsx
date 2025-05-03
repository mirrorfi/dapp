"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TermsOfService } from "@/components/TermsOfService";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@metaplex/js";
import Moralis from "moralis";
import { TokenPortfolioCard } from "@/components/TokenPortfolioCard";

export default function Home() {
  const solConversionFactor = 1e9;

    const [address, setAddress] = useState<string>("");
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [tokens, setTokens] = useState<any[]>([]);
    const [historicalData, setHistoricalData] = useState<any[]>([]); // State for historical balance data
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [connection, setConnection] = useState<Connection | null>(null);
    const anchorWallet = useAnchorWallet();
    const { connected, publicKey } = useWallet();
    const [hasSignedTerms, setHasSignedTerms] = useState(false);
    const [checking, setChecking] = useState(true);
  
    useEffect(() => {
      // Initialize the connection and Moralis API when the component mounts
      const initConnectionAndMoralis = () => {
        const conn = new Connection(
          "https://solana-mainnet.g.alchemy.com/v2/" +
            process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        );
        setConnection(conn);
  
        Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      };
  
      if (!connection) {
      initConnectionAndMoralis();
      }
    }, [connection]);
  
    useEffect(() => {
      if(!anchorWallet) {
        console.log("Wallet Not Connected!");
        return;
      } else {
        console.log("Wallet Connected!");
        console.log("Anchor Wallet:", anchorWallet.publicKey?.toString());
        // setAddress(anchorWallet.publicKey?.toString() || "");
        setAddress("H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw")
      }
    }, [anchorWallet]);
  
    useEffect(() => {
      if (address != "") {
        console.log("Fetching wallet data for address:", address);
        fetchWalletData(); // Fetch wallet data when address changes
      }
    }, [address]);
  
    const fetchWalletData = async () => {
      if (!connection) return; // Ensure connection is available before fetching
  
      setLoading(true);
      setError(null);
  
      // Fetch portfolio data
      try {
        const response = await Moralis.SolApi.account.getSPL({
          network: "mainnet",
          address,
        });
  
        const data = response.toJSON();
        setTokens(data);
        console.log("Tokens:", data);
      } catch (err) {
        setError("Invalid address or unable to fetch data.");
        console.error("Error in fetchWalletData:", err);
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    const checkLocalSignature = () => {
      if (!publicKey) {
        setChecking(false);
        return;
      }

      const storedSignatures = localStorage.getItem("termsSignatures") || "{}";
      const signatures = JSON.parse(storedSignatures);
      setHasSignedTerms(!!signatures[publicKey.toBase58()]);
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

  return (
    <main className="flex min-h-screen h-screen items-center justify-between p-12 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground">

      {!loading ? 
      <div className="w-[47.5%] min-h-[90%] h-full p-12 flex flex-col gap-6 items-center rounded-xl overflow-y-auto
      bg-[#0F1218] rounded-xl border border-[#2D3748]/20">
        <h1 className="text-xl font-semibold text-gray-200">Portfolio</h1>
        <div className="w-full h-full flex flex-col gap-6">
          {tokens.map ((token, index) => {
            return <div key={index} className="w-full">
              <TokenPortfolioCard tokenData={token}/>
            </div>
          })}
        </div>
      </div> : 
      <div></div> 
      }

      <WalletMultiButton />

    

      {/* <div className="w-[47.5%] min-h-[90%] h-full p-6 flex flex-col gap-6 bg-[#1a1a1a] dark items-center">
        <h1 className="text-xl font-semibold text-gray-200">Chat Interface</h1>
        <div className="w-[70%] h-full flex flex-col gap-6">
          <Card className="w-full h-1/2 p-4 bg-[#2a2a2a] border-[#3a3a3a] flex flex-col">
            <h2 className="text-xl font-semibold text-gray-200">Dashboard</h2>
          </Card>
        </div>
      </div> */}

    </main>
  );
}
