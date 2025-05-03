import Image from "next/image"
import { Card } from "@/components/ui/card"

interface TokenData {
  amount: string
  logo: string
  symbol: string
  name: string
  decimals: number
}

export function TokenPortfolioCard({
  tokenData = {
    amount: "600",
    logo: "https://logo.moralis.io/solana-mainnet_Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB_086c2a492208b058.webp",
    symbol: "USDT",
    name: "USDT",
    decimals: 6,
  },
}: {
  tokenData?: TokenData
}) {
  // Format the amount with commas for thousands
  const formattedAmount = Number(tokenData.amount).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })

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
          <p className="font-semibold text-base text-white tracking-wide">{formattedAmount}</p>
          <p className="text-xs text-gray-400 font-medium">
            {formattedAmount} {tokenData.symbol}
          </p>
        </div>
      </div>
    </Card>
  )
}
