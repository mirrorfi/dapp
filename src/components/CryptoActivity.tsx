"use client"
import useWalletData from "@/lib/useWalletData"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useEffect } from "react"

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

interface PortfolioCardProps extends TokenInfo {
  onClick?: () => void
}

export function PortfolioCard({
  name,
  address,
  roi,
  price_in_usd,
  amount_owned,
  value_usd,
  token_logo,
  token_symbol,
  onClick,
}: PortfolioCardProps) {

  return (
    <div
      className="w-full rounded-xl px-4 py-3 flex justify-between items-center font-semibold hover:cursor-pointer
      bg-[#333333] border-[#444444] hover:bg-[#3a3a3a] transition-colors"
      onClick={onClick}
    >
      {/* token name and amt owned in USD */}
      <div className="w-[40%] h-full flex items-center gap-4 py-2">
        <div className="w-12 h-12 bg-transparent rounded-full relative flex-shrink-0">
          <img
            src={token_logo || "/placeholder.svg"}
            alt={`${name} logo`}
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <div className="flex-col h-full w-full justify-center flex gap-2">
          <p className="text-base md:text-lg text-gray-200">{name}</p>
          <div className="w-fit h-full flex gap-2 text-gray-400 items-center justify-center">
            <p className="text-sm md:text-base"> ${value_usd.toLocaleString()} </p>

            <div
              className={`py-1 px-2 rounded-xl text-sm ${
                roi > 0
                  ? "text-green-400 bg-green-300/20"
                  : roi < 0
                    ? "text-red-500 bg-red-400/20 bg-opacity-20"
                    : "text-gray-500 bg-gray-500 bg-opacity-20"
              }`}
            >
              <span className="flex items-center">
                {roi > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(roi)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* token price and token owned */}
      <div className="flex-col h-full w-fit justify-center flex gap-2 text-base md:text-lg items-end p-1">
        <p className="text-gray-200">${price_in_usd.toLocaleString()}</p>
        <p className="text-gray-400 text-sm md:text-base">
          {amount_owned.toLocaleString()} {token_symbol}
        </p>
      </div>
    </div>
  )
}

