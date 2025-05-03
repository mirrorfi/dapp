"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { PortfolioCard } from "./CryptoActivity"
import useWalletData from "@/lib/useWalletData"

export interface TokenInfo {
  name: string
  address: string
  roi: number
  price_in_usd: number
  amount_owned: number
  value_usd: number
  token_logo: string
  token_symbol: string
}

const sampleTokens: TokenInfo[] = [
  {
    name: "Wrapped Ether",
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    roi: 3.7,
    price_in_usd: 2312,
    amount_owned: 500,
    value_usd: 1156000,
    token_logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    token_symbol: "WETH",
  },
  {
    name: "Bitcoin",
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    roi: -2.3,
    price_in_usd: 43250,
    amount_owned: 12,
    value_usd: 519000,
    token_logo: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
    token_symbol: "BTC",
  },
  {
    name: "Polygon",
    address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    roi: 8.2,
    price_in_usd: 0.58,
    amount_owned: 150000,
    value_usd: 87000,
    token_logo: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
    token_symbol: "MATIC",
  },
  {
    name: "Chainlink",
    address: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
    roi: 5.1,
    price_in_usd: 13.42,
    amount_owned: 3500,
    value_usd: 46970,
    token_logo: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png",
    token_symbol: "LINK",
  },
  {
    name: "Uniswap",
    address: "0xb33eaad8d922b1083446dc23f610c2567fb5180f",
    roi: -1.8,
    price_in_usd: 7.25,
    amount_owned: 5200,
    value_usd: 37700,
    token_logo: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png",
    token_symbol: "UNI",
  },
]

export function ActiveGridsCard() {


  return (
    <>
      <Card className="w-full h-1/2 p-6 bg-[#2a2a2a] border-[#3a3a3a] overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 h-full p-4">
            <h2 className="text-xl font-semibold text-gray-200">Active Grids</h2>
          </div>
          <ScrollArea className="flex-1 w-full pr-4">
            <div className="grid-cols-2 grid gap-6">
              {sampleTokens.map((token) => (
                <PortfolioCard key={token.address} {...token} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </>
  );
}

