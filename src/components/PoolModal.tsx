"use client";

import { MouseEvent } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Share } from "lucide-react";
import { shareToTwitter, createPoolShareConfig } from "@/lib/shareUtils";

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

interface CryptoPoolModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  positionInfo: positionData;
}

export default function CryptoPoolModal({
  open,
  setOpen,
  positionInfo,
}: CryptoPoolModalProps) {
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
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {positionInfo.pairName} Pool
              </h2>
              <div className="text-sm flex items-center gap-1.5 text-gray-300">
                Powered By
                <Image
                  src="/PNG/meteora-logo.png"
                  alt="Meteora Logo"
                  className="h-4 w-4"
                  width={16}
                  height={16}
                />
                Meteora
              </div>
            </div>
            <div className="bg-emerald-900 text-emerald-300 px-4 py-2 rounded-md font-medium">
              {positionInfo.apy.toFixed(2)}% APY
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="font-medium mb-2 text-gray-300">
                  Your Position:
                </div>
                <div className="text-2xl font-bold mb-3 text-white">
                  $
                  {(
                    positionInfo.positionXUSD + positionInfo.positionYUSD
                  ).toFixed(2)}{" "}
                  USD
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img
                        src={positionInfo.tokenXLogo}
                        alt="Token X"
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="text-gray-200">{`${(
                        positionInfo.positionX /
                        10 ** positionInfo.tokenXDecimal
                      ).toFixed(2)} ${positionInfo.tokenXSymbol}`}</span>
                    </div>
                    <span className="text-gray-400">
                      (${positionInfo.positionXUSD.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img
                        src={positionInfo.tokenYLogo}
                        alt="Token Y"
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="text-gray-200">{`${(
                        positionInfo.positionY /
                        10 ** positionInfo.tokenYDecimal
                      ).toFixed(2)} ${positionInfo.tokenYSymbol}`}</span>
                    </div>
                    <span className="text-gray-400">
                      (${positionInfo.positionYUSD.toFixed(2)})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="font-medium mb-2 text-gray-300">
                  Generated Yield:
                </div>
                <div className="text-2xl font-bold mb-3 text-white">
                  $
                  {(positionInfo.profitXUSD + positionInfo.profitYUSD).toFixed(
                    2
                  )}{" "}
                  USD
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img
                        src={positionInfo.tokenXLogo}
                        alt="Token X"
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="text-gray-200">
                        {positionInfo.profitX /
                          10 ** positionInfo.tokenXDecimal <
                        0.01
                          ? `<0.01 ${positionInfo.tokenXSymbol}`
                          : `${(
                              positionInfo.profitX /
                              10 ** positionInfo.tokenXDecimal
                            ).toFixed(2)} ${positionInfo.tokenXSymbol}`}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      (${positionInfo.profitXUSD.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <img
                        src={positionInfo.tokenYLogo}
                        alt="Token Y"
                        className="h-4 w-4 rounded-full"
                      />
                      <span className="text-gray-200">
                        {positionInfo.profitY /
                          10 ** positionInfo.tokenYDecimal <
                        0.01
                          ? `<0.01 ${positionInfo.tokenYSymbol}`
                          : `${(
                              positionInfo.profitY /
                              10 ** positionInfo.tokenYDecimal
                            ).toFixed(2)} ${positionInfo.tokenYSymbol}`}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      (${positionInfo.profitYUSD.toFixed(2)})
                    </span>
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
                    <div className="text-sm text-emerald-300 mb-1">
                      Total Value Locked:
                    </div>
                    <div className="text-xl font-bold text-white">
                      $
                      {(
                        positionInfo.reserveYUSD + positionInfo.reserveXUSD
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      USD
                    </div>
                  </div>
                  <div className="bg-emerald-900/30 p-3 rounded-md">
                    <div className="text-sm text-emerald-300 mb-1">
                      24h Yield:
                    </div>
                    <div className="text-xl font-bold text-white">
                      {positionInfo.apr.toFixed(4)}%
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-medium mb-2 text-gray-300">
                    Liquidity Allocation
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <img
                          src={positionInfo.tokenXLogo}
                          alt="Token X"
                          className="h-4 w-4 rounded-full"
                        />
                        <span className="text-gray-200">
                          {positionInfo.tokenXSymbol}
                        </span>
                      </div>
                      <span className="text-gray-200">
                        {positionInfo.reserveX.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <img
                          src={positionInfo.tokenYLogo}
                          alt="Token Y"
                          className="h-4 w-4 rounded-full"
                        />
                        <span className="text-gray-200">
                          {positionInfo.tokenYSymbol}
                        </span>
                      </div>
                      <span className="text-gray-200">
                        {positionInfo.reserveY.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">24h Fee:</div>
                    <div className="font-medium text-gray-200">
                      $
                      {positionInfo.fees_24h.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      24h Volume:
                    </div>
                    <div className="font-medium text-gray-200">
                      $
                      {positionInfo.volume_24h.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const totalYieldUSD =
                  positionInfo.profitXUSD + positionInfo.profitYUSD;
                const shareConfig = createPoolShareConfig(
                  positionInfo.pairName,
                  totalYieldUSD,
                  positionInfo.apy
                );
                shareToTwitter(shareConfig);
              }}
            >
              <Share className="mr-2 h-4 w-4" />
              Share Position
            </Button>
            <Button
              className="bg-gray-800 hover:bg-gray-700 text-white"
              onClick={() =>
                window.open(
                  `https://www.meteora.ag/dlmm/${positionInfo.pairAddress}`,
                  "_blank"
                )
              }
            >
              Check Position <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
