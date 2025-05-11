"use client"

import { useState, MouseEvent } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Circle } from "lucide-react"

interface CryptoPoolModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  poolInfo: {
    poolName: string,
    tokenXLogo: string,
    tokenYLogo: string,
    tokenXPrice: number,
    tokenYPrice: number,
    poolAPY: string,
  }
}

export default function CryptoPoolModal({open, setOpen, poolInfo}: CryptoPoolModalProps) {
  // Handle click within the modal to prevent event propagation
  const handleDialogContentClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        onClick={handleDialogContentClick}
        className="sm:max-w-[550px] md:max-w-[650px] bg-gray-900 border-gray-800 text-gray-100 p-0 overflow-hidden"
      >
        <div className="p-6 space-y-6 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">{poolInfo.poolName} Pool</h2>
              <div className="text-sm flex items-center gap-1.5 text-gray-300">
                Powered By <Circle className="h-4 w-4 fill-emerald-500 text-emerald-500" /> Meteora
              </div>
            </div>
            <div className="bg-emerald-900 text-emerald-300 px-4 py-2 rounded-md font-medium">{poolInfo.poolAPY} APY</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="font-medium mb-2 text-gray-300">Your Position:</div>
                <div className="text-2xl font-bold mb-3 text-white">$1,234.56</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img src={poolInfo.tokenXLogo} alt="Token X" className="h-4 w-4 rounded-full" />
                      <span className="text-gray-200">0.01556 SOL</span>
                    </div>
                    <span className="text-gray-400">($0.03)</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img src={poolInfo.tokenYLogo} alt="Token Y" className="h-4 w-4 rounded-full" />
                      <span className="text-gray-200">10.24 USDC</span>
                    </div>
                    <span className="text-gray-400">($10.24)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="font-medium mb-2 text-gray-300">Generated Yield:</div>
                <div className="text-2xl font-bold mb-3 text-white">$0.00315823</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img src={poolInfo.tokenXLogo} alt="Token X" className="h-4 w-4 rounded-full" />
                      <span className="text-gray-200">0.01148 SOL</span>
                    </div>
                    <span className="text-gray-400">($0.02)</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img src={poolInfo.tokenYLogo} alt="Token Y" className="h-4 w-4 rounded-full" />
                      <span className="text-gray-200">0.019931 USDC</span>
                    </div>
                    <span className="text-gray-400">($0.02)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="font-medium mb-3 text-gray-300">Pool Stats:</div>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-emerald-900/30 p-3 rounded-md">
                    <div className="text-sm text-emerald-300 mb-1">Total Value Locked:</div>
                    <div className="text-xl font-bold text-white">$3,612,198.77</div>
                  </div>
                  <div className="bg-emerald-900/30 p-3 rounded-md">
                    <div className="text-sm text-emerald-300 mb-1">24h Yield:</div>
                    <div className="text-xl font-bold text-white">0.6786%</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-medium mb-2 text-gray-300">Liquidity Allocation</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <img src={poolInfo.tokenXLogo} alt="Token X" className="h-4 w-4 rounded-full" />
                        <span className="text-gray-200">SOL</span>
                      </div>
                      <span className="text-gray-200">6,758.30</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <img src={poolInfo.tokenYLogo} alt="Token Y" className="h-4 w-4 rounded-full" />
                        <span className="text-gray-200">USDC</span>
                      </div>
                      <span className="text-gray-200">2,496,786.00</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">24h Fee:</div>
                    <div className="font-medium text-gray-200">$24,512.47</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">24h Volume:</div>
                    <div className="font-medium text-gray-200">$59,799,563</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button className="bg-gray-800 hover:bg-gray-700 text-white">
              Check Position <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
