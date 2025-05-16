"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import Moralis from "moralis";
import { TokenPortfolioCard } from "@/components/TokenPortfolioCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioChart } from "@/components/PortfolioChart";
import { PortfolioValueCard } from "@/components/PortfolioValueCard";
import SimplifiedFlow from "@/components/simplified-flow";
import { PoolPortfolioCard } from "@/components/PoolPortfolioCard";
import { LSTPortfolioCard } from "@/components/LSTPortfolioCard";
import { getAllUserPositions } from "@/lib/meteora";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import StrategyModal from "@/components/StrategyModal";

import { LSTMintAddressesList } from "@/constants/nodeOptions";
const LSTMintAddresses = LSTMintAddressesList;

interface Strategy {
  _id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
  user: string;
  __v: number;
}

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [tokens, setTokens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connection, setConnection] = useState<Connection | null>(null);
  const anchorWallet = useAnchorWallet();
  const { connected, publicKey } = useWallet();
  const [hasSignedTerms, setHasSignedTerms] = useState(false);
  const [checking, setChecking] = useState(true);
  const [portfolioUSDBalance, setPortfolioUSDBalance] = useState<number>(0);
  const [portfolioUSDChange, setPortfolioUSDChange] = useState<number>(0);
  const [tokenPrices, setTokenPrices] = useState<any[]>([]);
  const [topAssets, setTopAssets] = useState<any[]>([]);
  const [assets, setAssets] = useState<[string, number][]>([]); // Typed assets for clarity
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [solBalance, setSolBalance] = useState<string>("");
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStrategy(null);
  };

  const handleCardClick = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch("/api/get-strategies");
        if (!response.ok) {
          throw new Error("Failed to fetch strategies");
        }
        const data = (await response.json()) as Strategy[];
        setStrategies(data);
        console.log("Fetched strategies:", data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load strategies"
        );
      } finally {
      }
    };

    fetchStrategies();
  }, []);

  const fetchUserPositions = async () => {
    try {
      setLoading(true);
      const response = await getAllUserPositions(new PublicKey(address || ""));
      console.log("User positions: ", response);
      setUserPositions(response);
    } catch (error) {
      console.error("Error fetching user positions: ", error);
    } finally {
    }
  };

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
      setAddress(anchorWallet.publicKey?.toString() || "");
      // setAddress("H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw");
    }
  }, [anchorWallet]);

  useEffect(() => {
    if (address != "") {
      console.log("Fetching wallet data for address:", address);
      // Reset states for new address
      setTokens([]);
      setTokenPrices([]);
      setAssets([]);
      setTopAssets([]);
      setPortfolioUSDBalance(0);
      setPortfolioUSDChange(0);
      setLoading(true); // For fetchWalletData
      fetchWalletData(); // Fetch wallet data when address changes
      fetchUserPositions();
    } else {
      // Clear all data if address is removed
      setTokens([]);
      setTokenPrices([]);
      setAssets([]);
      setTopAssets([]);
      setPortfolioUSDBalance(0);
      setPortfolioUSDChange(0);
    }
  }, [address]);

  useEffect(() => {
    if (tokens.length > 0) {
      console.log("Fetching portfolio USD balance for tokens:", tokens);
      fetchPortfolioUSDBalance(); // Fetch portfolio USD balance when tokens change
    } else {
      // If there are no tokens, reset dependent states
      setPortfolioUSDBalance(0);
      setPortfolioUSDChange(0);
      setTokenPrices([]);
      setAssets([]);
      setTopAssets([]);
    }
  }, [tokens]);

  const fetchWalletData = async () => {
    if (!connection) return;

    setLoading(true);
    setError(null);

    try {
      // First get the SOL balance
      const solResponse = await Moralis.SolApi.account.getBalance({
        network: "mainnet",
        address: address,
      });

      console.log("Acquired Sol Balance is ", solResponse.raw);
      const solBalanceValue = solResponse.raw.solana;
      setSolBalance(solBalanceValue);

      // Then fetch SPL tokens
      const response = await Moralis.SolApi.account.getSPL({
        network: "mainnet",
        address,
      });

      const data = response.toJSON();
      console.log("Tokens:", data);

      // Add SOL to the data array with the correct balance already set
      const dataWithSOL = [
        ...data,
        {
          amount: solBalanceValue, // Set the actual SOL balance right away
          logo: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/So11111111111111111111111111111111111111112.png",
          symbol: "SOL",
          decimals: 9,
          name: "Solana",
          mint: "So11111111111111111111111111111111111111112",
        },
      ];

      // Set tokens state with the complete array including SOL with balance
      setTokens(dataWithSOL);
    } catch (err) {
      setError("Invalid address or unable to fetch data.");
      console.error("Error in fetchWalletData:", err);
    }
  };

  const fetchTokenPrice = async (token: any) => {
    try {
      const response = await Moralis.SolApi.token.getTokenPrice({
        network: "mainnet",
        address: token.mint,
      });
      const priceData = response.raw;
      // Ensure priceData has a way to be identified, e.g., priceData.tokenAddress or add token.mint to it
      const dataWithMint = {
        ...priceData,
        mint: token.mint,
        symbol: token.symbol,
      }; // Add mint and symbol for easier mapping

      setPortfolioUSDBalance(
        (prev) => prev + (dataWithMint.usdPrice ?? 0) * token.amount
      );
      setTokenPrices((prevPrices) => [...prevPrices, dataWithMint]);
    } catch (err) {
      console.error(`Error fetching token price for ${token.mint}:`, err);
      // Add a placeholder with error and mint/symbol for completion check and mapping
      setTokenPrices((prevPrices) => [
        ...prevPrices,
        {
          mint: token.mint,
          symbol: token.symbol,
          error: true,
          usdPrice: 0,
          usdPrice24hrUsdChange: 0,
        },
      ]);
    }
  };

  const fetchPortfolioUSDBalance = async () => {
    if (tokens.length > 0) {
      // Reset portfolioUSDBalance and tokenPrices before fetching new set
      setPortfolioUSDBalance(0);
      setTokenPrices([]);

      // Using a loop to fetch prices one by one.
      // Consider Promise.all if parallel fetching is desired and API supports it well.
      for (const token of tokens) {
        await fetchTokenPrice(token);
      }
    }
  };

  // New useEffect to process data once all token prices are fetched
  useEffect(() => {
    if (tokens.length > 0 && tokenPrices.length === tokens.length) {
      let newPortfolioUSDChange = 0;
      const newAssetsCalculated: [string, number][] = [];

      tokens.forEach((token) => {
        if (token.symbol === "SOL") {
          console.log("I SHOULD BE FUCKING CALCULATED WHAT THE FUCK BRO");
        }
        // Find the corresponding price info using mint
        const priceInfo = tokenPrices.find(
          (p) => p.mint === token.mint && !p.error
        );

        if (priceInfo) {
          if (token.symbol === "SOL") {
            console.log("i should have a price info here");
          }
          newPortfolioUSDChange +=
            (priceInfo.usdPrice24hrUsdChange ?? 0) * token.amount;
          newAssetsCalculated.push([
            token.symbol,
            token.amount * (priceInfo.usdPrice ?? 0),
          ]);
        }
      });

      setPortfolioUSDChange(newPortfolioUSDChange);
      setAssets(newAssetsCalculated);
    }
  }, [tokens, tokenPrices]);

  useEffect(() => {
    // This effect determines when the main portfolio data loading and processing is complete.
    if (tokens.length > 0 && tokenPrices.length === tokens.length) {
      // Path A: Tokens exist and all prices fetched
      if (assets.length > 0) {
        getTopAssets();
      } else {
        // Assets might be empty if all token values are zero.
        setTopAssets([]);
      }
    } else if (
      address &&
      tokens.length === 0 &&
      tokenPrices.length === 0 &&
      loading
    ) {
      // Path B: An address is set, loading was true, but the fetch resulted in no tokens/prices.
      // This implies the fetch cycle for this address is complete but yielded nothing.
      setAssets([]); // Ensure assets are cleared
      setTopAssets([]); // Ensure top assets are cleared
      setPortfolioUSDBalance(0); // Reset balances
      setPortfolioUSDChange(0);
    }
    // Note: If 'address' becomes empty, setLoading(false) is handled by the useEffect depending on [address].
  }, [assets, tokens, tokenPrices, address, loading]); // Added address and loading to dependencies

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

  useEffect(() => {
    if (
      tokens.length == tokenPrices.length &&
      tokenPrices.length > 0 &&
      tokens.length > 0
    ) {
      setLoading(false); // Set loading to false when all token prices are fetched
    }
  }, [tokens, tokenPrices]);

  function getTopAssets() {
    const sortedAssets = assets.sort((a, b) => b[1] - a[1]);
    const topAssets = sortedAssets.slice(0, 3);
    setTopAssets(topAssets);
    console.log("Top Assets:", topAssets);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen h-[calc(100vh+500px)] p-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground overflow-hidden items-center justify-center">
      {!loading ? (
        <div className="w-[80%] h-full flex flex-col gap-6">
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <PortfolioValueCard
              totalValue={portfolioUSDBalance}
              totalChange={portfolioUSDChange}
              topAssets={topAssets}
              userPositions={userPositions}
            />

            <PortfolioChart
              currentValue={portfolioUSDBalance}
              valueChange24h={portfolioUSDChange}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-130px)] overflow-hidden">
            {/* Combined Portfolio Section */}
            <Card className="w-full lg:w-[60%] h-full bg-[#0F1218] border-[#2D3748]/30 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">
                    Portfolio
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto pt-4 pb-6 pr-2 h-full">
                {/* Meteora Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 w-full h-fit mb-4">
                    <Image
                      src="/PNG/meteora-logo.png"
                      alt="Meteora Logo"
                      className="h-5 w-5"
                      width={20}
                      height={20}
                    />
                    <h3 className="text-lg font-semibold text-white">
                      Meteora
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {userPositions.map((position, index) => (
                      <PoolPortfolioCard
                        key={index}
                        positionInfo={{
                          tokenXMint: position.tokenXMint,
                          tokenYMint: position.tokenYMint,
                          pairAddress: position.pairAddress,
                          apy: position.apy,
                          apr: position.apr,
                          fees_24h: position.fees_24h,
                          reserveX: position.reserveX,
                          reserveXUSD: position.reserveXUSD,
                          reserveY: position.reserveY,
                          volume_24h: position.volume_24h,
                          pairName: position.pairName,
                          tokenXLogo: position.tokenXLogo,
                          tokenYLogo: position.tokenYLogo,
                          tokenXPrice: position.tokenXPrice,
                          tokenYPrice: position.tokenYPrice,
                          tokenXSymbol: position.tokenXSymbol,
                          tokenYSymbol: position.tokenYSymbol,
                          tokenXDecimal: position.tokenXDecimal,
                          tokenYDecimal: position.tokenYDecimal,
                          positionX: position.positionX,
                          positionY: position.positionY,
                          positionXUSD: position.positionXUSD,
                          positionYUSD: position.positionYUSD,
                          profitY: position.profitY,
                          profitYUSD: position.profitYUSD,
                          reserveYUSD: position.reserveYUSD,
                          yield_24h: position.yield_24h,
                          profitX: position.profitX,
                          profitXUSD: position.profitXUSD,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 w-full h-fit mb-4">
                    <Image
                      src="/PNG/sanctum-logo.png"
                      alt="Sanctum Logo"
                      className="h-5 w-5"
                      width={20}
                      height={20}
                    />
                    <h3 className="text-lg font-semibold text-white">LSTs</h3>
                  </div>
                  <div className="space-y-3">
                    {tokens
                      .filter((token) => LSTMintAddresses.includes(token.mint))
                      .map((token, index) => (
                        <LSTPortfolioCard
                          key={index}
                          tokenData={token}
                          tokenPrices={tokenPrices}
                        />
                      ))}
                  </div>
                </div>

                {/* Portfolio Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Tokens
                  </h3>
                  <div className="space-y-3">
                    <TokenPortfolioCard
                      tokenData={{
                        amount: solBalance,
                        logo: "https://cdn.jsdelivr.net/gh/saber-hq/spl-token-icons@master/icons/101/So11111111111111111111111111111111111111112.png",
                        symbol: "SOL",
                        decimals: 6,
                        name: "Solana",
                        mint: "So11111111111111111111111111111111111111112",
                      }}
                      tokenPrices={tokenPrices}
                    />

                    {tokens
                      .filter(
                        (token) =>
                          !LSTMintAddresses.includes(token.mint) &&
                          token.symbol !== "SOL"
                      )
                      .map((token, index) => (
                        <TokenPortfolioCard
                          key={index}
                          tokenData={token}
                          tokenPrices={tokenPrices}
                        />
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategies Section */}
            <Card className="w-full lg:w-[40%] h-full bg-[#0F1218] border-[#2D3748]/30 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">
                  Recommended Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col overflow-y-auto pt-4 gap-8">
                {strategies.slice(0, 3).map((strategy: Strategy) => (
                  <Card
                    key={strategy._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none backdrop-blur-sm relative min-h-[300px] cursor-pointer"
                    onClick={() => handleCardClick(strategy)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-lg font-bold">
                        {strategy.name}
                      </CardTitle>
                    </CardHeader>
                    <div className="absolute inset-x-0 top-[60px] bottom-0">
                      <SimplifiedFlow
                        nodes={strategy.nodes}
                        edges={strategy.edges}
                      />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="w-[80%] h-full flex flex-col gap-6">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[1, 2].map((i) => (
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
                {[1, 2].map((i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-24 w-full bg-[#2D3748]" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedStrategy && (
        <StrategyModal
          strategy={selectedStrategy}
          isOpen={modalOpen}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
