"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

interface PortfolioValueCardProps {
  totalValue: number
  totalChange: number
  topAssets: any[]
  userPositions: positionData[]
}

interface positionData {
  apy: number;
  apr: number;
  fees_24h: number;
  pairAddress: string;
  pairName: string;
  positionX: number;
  positionXUSD: number;
  positionY: number;
  positionYUSD: number;
  profitX: number;
  profitXUSD: number;
  profitY: number;
  profitYUSD: number;
  reserveX: number;
  reserveXUSD: number;
  reserveY: number;
  reserveYUSD: number;
  tokenXDecimal: number;
  tokenXLogo: string;
  tokenXMint: string;
  tokenXPrice: number;
  tokenXSymbol: string;
  tokenYDecimal: number;
  tokenYLogo: string;
  tokenYMint: string;
  tokenYPrice: number;
  tokenYSymbol: string;
  volume_24h: number;
  yield_24h: number;
}

export function PortfolioValueCard({ totalValue, totalChange, topAssets, userPositions
 }: PortfolioValueCardProps) {
  const isPositive = totalChange > 0

  // Format the percentage change
  const percentChange = (totalChange / (totalValue - totalChange)) * 100
  const formattedPercentChange = percentChange.toFixed(2) + "%"
  
  const [totalLockedValue, setTotalLockedValue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)

  const calculateTotalLockedValue = () => {
    userPositions.forEach((position) => {
      setTotalLockedValue((prev) => prev + position.positionXUSD + position.positionYUSD)
      setTotalProfit((prev) => prev + position.profitXUSD + position.profitYUSD)
    })
  }

  useEffect(() => {
    calculateTotalLockedValue()
  }, [])

  return (
    <Card className="bg-[#171923] border-[#2D3748]/30">
      <CardHeader>
        <div className="justify-between items-center grid grid-cols-2">
          <CardDescription className="text-gray-400">Total Portfolio Value</CardDescription>
          <CardDescription className="text-gray-400">Total Locked Value</CardDescription>
        </div>

        <div className="grid grid-cols-2 items-center">


          <div className="flex items-baseline gap-2">
            <CardTitle className="text-2xl text-white">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
            <div className={`flex items-center text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
              )}
              {formattedPercentChange}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <CardTitle className="text-2xl text-white">
              ${totalLockedValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
            <div className={`flex items-center text-sm font-medium ${totalProfit > 0 ? "text-green-500" : "text-red-500"}`}>
              {totalProfit > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
              )}
              {(() => {
              const percent = (totalProfit / (totalLockedValue - totalProfit)) * 100;
              if (percent > 0 && percent < 0.01) {
                return "<0.01%";
              }
              return percent.toFixed(2) + "%";
              })()}
            </div>
          </div>

        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 pb-4">

              <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-[#2D3748] flex items-center justify-center">
              {isPositive ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex flex-col justify-center h-fit">
              <p className="text-xs text-gray-400">Portfolio Value Change (24h)</p>
              <div className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"} flex items-center`}>
              {isPositive ? "+" : ""}
              ${totalChange.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (24h)
              </div>
            </div>
              </div>

              <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-[#2D3748] flex items-center justify-center">
              {totalProfit > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex flex-col justify-center h-fit">
              <p className="text-xs text-gray-400">Total Yield Gained</p>
              <div className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"} flex items-center`}>
              {isPositive ? "+" : ""}
              ${totalProfit.toFixed(2)}
              </div>
            </div>
              </div>

          </div>

        {/* Top assets */}
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-medium">Top Assets</p>
          {topAssets.map((asset, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white">{asset[0]}</span>
                <span className="text-xs text-gray-400">{(asset[1] / totalValue * 100).toFixed(1)}%</span>
              </div>
              <Progress
                value={asset[1] / totalValue * 100}
                className={`h-1.5 bg-gradient-to-r from-slate-800 to-slate-700 ${
                  index === 0
                    ? "[&>div]:bg-blue-500"
                    : index === 1
                      ? "[&>div]:bg-purple-500"
                      : "[&>div]:bg-green-500"
                }`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
