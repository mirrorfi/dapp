"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import Moralis from "moralis";
import { TokenPortfolioCard } from "@/components/TokenPortfolioCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [tokens, setTokens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [connection, setConnection] = useState<Connection | null>(null);
  const anchorWallet = useAnchorWallet();
  const { connected, publicKey } = useWallet();
  const [hasSignedTerms, setHasSignedTerms] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [portfolioUSDBalance, setPortfolioUSDBalance] = useState<number>(0);
  const [portfolioUSDChange, setPortfolioUSDChange] = useState<number>(0);
  const [apiResponse, setApiResponse] = useState<any>(null);

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
    if (!anchorWallet) {
      console.log("Wallet Not Connected!");
      return;
    } else {
      console.log("Wallet Connected!");
      console.log("Anchor Wallet:", anchorWallet.publicKey?.toString());
      // setAddress(anchorWallet.publicKey?.toString() || "");
      setAddress("H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw");
    }
  }, [anchorWallet]);

  useEffect(() => {
    if (address != "") {
      console.log("Fetching wallet data for address:", address);
      fetchWalletData(); // Fetch wallet data when address changes
    }
  }, [address]);

  useEffect(() => {
    if (tokens.length > 0) {
      console.log("Fetching portfolio USD balance for tokens:", tokens);
      fetchPortfolioUSDBalance(); // Fetch portfolio USD balance when tokens change
    }
  }, [tokens])

  useEffect(() => {
    tokens.forEach((token) => {
      if(token.mint == apiResponse?.tokenAddress) {
        setPortfolioUSDChange((prev) => prev + ((apiResponse?.usdPrice24hrUsdChange) * token.amount));
      }
      console.log("Portfolio USD Change:", portfolioUSDChange);
    })
  }, [apiResponse])

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
  };

  const fetchTokenPrice = async (token: any) => {
    try {
      const response = await Moralis.SolApi.token.getTokenPrice({
        "network": "mainnet",
        "address": token.mint,
      });
      setPortfolioUSDBalance((prev) => prev + ((response.raw.usdPrice ?? 0) * token.amount));
      setApiResponse(response.raw);
    } catch (err) {
      console.error("Error fetching token price:", err);
    }
  };

  const fetchPortfolioUSDBalance = async () => {
    console.log("IM HERE")
    if (tokens.length > 0) {
      tokens.forEach((token) => {
        fetchTokenPrice(token);
      })
    }
    setLoadingBalance(false);
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

  if (checking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen h-screen p-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground overflow-hidden">
      {!loading ? (
        <div className="w-full h-full flex flex-col gap-6">
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card className="bg-[#171923] border-[#2D3748]/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Total Portfolio Value</CardDescription>
                <CardTitle className="text-2xl text-white">
                  {!loadingBalance || portfolioUSDBalance > 0 ? 
                    `$${Math.round(portfolioUSDBalance * 100) / 100}` :
                   "Loading..."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-sm font-medium ${portfolioUSDChange > 0 ? "text-green-500" : "text-red-500"}`}>
                  {portfolioUSDChange > 0 ? "+" : ""}
                  {portfolioUSDChange.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24h)
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#171923] border-[#2D3748]/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Assets</CardDescription>
                <CardTitle className="text-2xl text-white">{tokens.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">Across multiple chains</div>
              </CardContent>
            </Card>

            <Card className="bg-[#171923] border-[#2D3748]/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-400">Recommended Actions</CardDescription>
                <CardTitle className="text-2xl text-white">3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">Based on your portfolio</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-130px)]">
            {/* Portfolio Section */}
            <Card className="w-full lg:w-[60%] h-full bg-[#0F1218] border-[#2D3748]/30 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">Portfolio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-4 pb-6 pr-2">
                <div className="space-y-3">
                  {tokens.map((token, index) => (
                    <TokenPortfolioCard key={index} tokenData={token} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategies Section */}
            <Card className="w-full lg:w-[40%] h-full bg-[#0F1218] border-[#2D3748]/30 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">Recommended Strategies</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-4">
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col gap-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#171923] border-[#2D3748]/30">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24 bg-[#2D3748]" />
                  <Skeleton className="h-8 w-32 mt-1 bg-[#2D3748]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-20 bg-[#2D3748]" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-130px)]">
            <Card className="w-full lg:w-[60%] h-full bg-[#0F1218] border-[#2D3748]/30">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-[#2D3748]" />
              </CardHeader>
              <CardContent>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="mb-3">
                    <Skeleton className="h-20 w-full bg-[#2D3748]" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="w-full lg:w-[40%] h-full bg-[#0F1218] border-[#2D3748]/30">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-[#2D3748]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full mb-4 bg-[#2D3748]" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-24 w-full bg-[#2D3748]" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
