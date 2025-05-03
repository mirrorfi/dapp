"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import Moralis from "moralis"
import { useEffect, useState } from "react"
import { token } from "@coral-xyz/anchor/dist/cjs/utils"

interface TokenData {
  amount: string
  logo: string
  symbol: string
  name: string
  decimals: number
  mint: string
}

export function TokenPortfolioCard({
  tokenData = {
    amount: "600",
    logo: "https://logo.moralis.io/solana-mainnet_Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB_086c2a492208b058.webp",
    symbol: "USDT",
    name: "USDT",
    decimals: 6,
    mint: "12ryb6isCqHKK67LyKsJFLZtCR1sqLK8myMZtnHzEahf",
  },
}: {
  tokenData?: TokenData
}) {
  const [tokenPrice, setTokenPrice] = useState<number | null>(null)
  // Format the amount with commas for thousands
  const formattedAmount = Number(tokenData.amount).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })

  const fetchData = async () => {
    try {
      console.log("in fetch data")

      const response = await Moralis.SolApi.token.getTokenPrice({
        "network": "mainnet",
        "address": tokenData.mint,
      });
    
      console.log("the response for get token price", response.raw);
      setTokenPrice(response.raw.usdPrice ?? null)
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    // Fetch data when the component mounts
    console.log("Fetching data...")
    fetchData()
  }, [])

  return (
    <Card className="w-full border-0 bg-[#171923] hover:bg-[#1A202C] transition-all duration-200 overflow-hidden mb-3">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#2D3748] flex-shrink-0 ring-1 ring-[#4A5568]/30">
            {tokenData.logo ? (
              <div className="h-full w-full flex items-center justify-center text-base font-bold">
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
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-base font-bold text-white">
                {tokenData.symbol.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="font-bold text-base text-white tracking-wide">{tokenData.symbol}</h3>
            <p className="text-xs text-gray-400 font-medium">{tokenData.name}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-base text-white tracking-wide">
            {tokenPrice !== null ? 
              (Number(tokenData.amount) * tokenPrice < 0.01 ? 
              "<$0.01" : 
              "$" + (Math.round((Number(tokenData.amount) * tokenPrice) * 100) / 100)
              ) : 
              "Loading..."}
          </p>
          <p className="text-xs text-gray-400 font-medium">
            {formattedAmount} {tokenData.symbol}
          </p>
        </div>
      </div>
    </Card>
  )
}
