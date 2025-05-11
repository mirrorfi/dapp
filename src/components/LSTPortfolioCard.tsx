"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import Moralis from "moralis";
import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { sanctumGetLSTAPY } from "@/lib/plugin/sanctum/tools";

interface TokenData {
  amount: string;
  logo: string;
  symbol: string;
  name: string;
  decimals: number;
  mint: string;
}

interface LSTPortfolioCard {
  tokenData?: TokenData;
  tokenPrices: any;
}

export function LSTPortfolioCard({ tokenData, tokenPrices }: LSTPortfolioCard) {
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apy, setAPY] = useState<number>(0);

  const isPositiveChange = apiResponse?.usdPrice24hrUsdChange > 0;

  // Format the amount with commas for thousands
  const formattedAmount = Number(tokenData?.amount).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });

  const getAPY = async () => {
    try {
      const response: { apys: Record<string, number> } = await sanctumGetLSTAPY(tokenData?.mint ? [tokenData.mint] : []);
      console.log("finding APY of ", tokenData?.mint);
      console.log("APY data: ", response);
      const mint = tokenData?.mint || "";
      setAPY(response.apys[mint] ?? 0);
      return response;
    } catch (error) {
      console.error("Error fetching APY data: ", error);
    }
  }

  useEffect(() => {
    // Fetch data when the component mounts
    console.log("Fetching data...");
    const priceInfo = tokenPrices.find((price: any) => price.mint === tokenData?.mint)
    console.log("priceInfo of ", tokenData?.logo, " is ", priceInfo)
    setTokenPrice(priceInfo?.usdPrice ?? null);
    setApiResponse(priceInfo);
    getAPY()
  }, []);

  return (
    <Card className="w-full border-0 bg-[#171923] hover:bg-[#1A202C] transition-all duration-200 overflow-hidden mb-3 text-lg py-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#2D3748] flex-shrink-0 ring-1 ring-[#4A5568]/30">
            {tokenData?.logo ? (
              <div className="h-full w-full flex items-center justify-center text-lg font-bold">
                <span className="absolute inset-0 flex items-center justify-center text-white z-10">
                  {tokenData.symbol.charAt(0)}
                </span>
                <Image
                  src={tokenData.logo || "/placeholder.svg"}
                  alt={`${tokenData.symbol} logo`}
                  fill
                  sizes="40px"
                  className="object-cover z-20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg font-bold text-white">
                {tokenData?.symbol.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex">

            <div className="flex-col">
              <h3 className="font-bold text-lg text-white tracking-wide">
                {tokenData?.name}
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                {formattedAmount} {tokenData?.symbol}
              </p>
            </div>

            <div className="w-fit h-[20%] p-2 bg-transparent text-green-500 text-lg flex">
              {Math.round(apy * 10000) / 100}% APY
            </div>

          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-lg text-white tracking-wide font">
            {tokenPrice !== null
              ? Number(tokenData?.amount) * tokenPrice < 0.01
                ? "<$0.01"
                : "$" +
                  Math.round(Number(tokenData?.amount) * tokenPrice * 100) / 100
              : "Loading..."}
          </p>

          <div className="flex items-center justify-end">
            {isPositiveChange ? (
              <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
            )}
            <p
              className={`text-sm ${
                apiResponse?.usdPrice24hrUsdChange > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {apiResponse != null
                ? Math.abs(
                    Number(tokenData?.amount) * apiResponse.usdPrice24hrUsdChange
                  ) < 0.01
                  ? Number(tokenData?.amount) *
                      apiResponse.usdPrice24hrUsdChange >
                    0
                    ? "+<$0.01"
                    : "-<$0.01"
                  : Number(tokenData?.amount) *
                      apiResponse.usdPrice24hrUsdChange >
                    0
                  ? "+$" +
                    Math.round(
                      Number(tokenData?.amount) *
                        apiResponse.usdPrice24hrUsdChange *
                        100
                    ) /
                      100
                  : "-$" +
                    Math.abs(
                      Math.round(
                        Number(tokenData?.amount) *
                          apiResponse.usdPrice24hrUsdChange *
                          100
                      ) / 100
                    )
                : "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
