"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import CryptoPoolModal from "./PoolModal";
import { TrendingDown, TrendingUp } from "lucide-react";

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

// positionXUSD + positionYUSD + positionXProfit + positionYProfit

interface PoolPortfolioCardProps {
  positionInfo?: positionData;
}

export function PoolPortfolioCard({ positionInfo }: PoolPortfolioCardProps) {
  const [openModal, setOpenModal] = useState(false);

  // This prevents the modal from reopening when clicking off the modal
  const handleClickCard = () => {
    setOpenModal(true);
  };

  const [totalLockedValue, setTotalLockedValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const calculateTotalLockedValue = () => {
    setTotalLockedValue(
      (positionInfo?.positionXUSD ?? 0) +
        (positionInfo?.positionYUSD ?? 0) +
        (positionInfo?.profitXUSD ?? 0) +
        (positionInfo?.profitYUSD ?? 0)
    );
    setTotalProfit(
      (positionInfo?.profitXUSD ?? 0) + (positionInfo?.profitYUSD ?? 0)
    );
  };

  useEffect(() => {
    calculateTotalLockedValue();
  }, []);

  return (
    <>
      <Card
        onClick={handleClickCard}
        className="w-full border-0 bg-[#171923] hover:bg-[#1A202C] transition-all duration-200 overflow-hidden mb-3 py-0 text-sm"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center space-x-2">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#2D3748] flex-shrink-0 ring-1 ring-[#4A5568]/30 flex items-center justify-center border-2 border-[#171923]">
                {positionInfo?.tokenXLogo && (
                  <Image
                    src={positionInfo.tokenXLogo}
                    alt={`${positionInfo.tokenXMint} logo`}
                    fill
                    sizes="40px"
                    className="object-cover z-20"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#2D3748] flex-shrink-0 ring-1 ring-[#4A5568]/30 flex items-center justify-center -ml-5 border-2 border-[#171923]">
                {positionInfo?.tokenYLogo && (
                  <Image
                    src={positionInfo.tokenYLogo}
                    alt={`${positionInfo.tokenYLogo} logo`}
                    fill
                    sizes="40px"
                    className="object-cover z-20"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                )}
              </div>
              <h3 className="font-bold text-lg text-white tracking-wide flex">
                {positionInfo?.pairName}
              </h3>
            </div>

            <div className="w-fit h-[20%] p-2 bg-transparent text-green-500 text-lg flex">
              {positionInfo?.apy.toFixed(2)}% APY
            </div>

            <div className="ml-auto text-right">
              <p className="font-semibold text-lg text-white tracking-wide font">
                ${totalLockedValue.toFixed(2)}
              </p>

              <div className="flex items-center justify-end">
                {totalProfit > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
                )}
                <p
                  className={`text-sm ${
                    totalProfit > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {totalProfit > 0 ? "+" : "-"}${totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Render modal outside the Card to prevent event bubbling */}
      {positionInfo && (
        <CryptoPoolModal
          open={openModal}
          setOpen={setOpenModal}
          positionInfo={{
            apy: positionInfo.apy,
            apr: positionInfo.apr,
            fees_24h: positionInfo.fees_24h,
            pairAddress: positionInfo.pairAddress,
            pairName: positionInfo.pairName,
            positionX: positionInfo.positionX,
            positionXUSD: positionInfo.positionXUSD,
            positionY: positionInfo.positionY,
            positionYUSD: positionInfo.positionYUSD,
            profitY: positionInfo.profitY,
            profitYUSD: positionInfo.profitYUSD,
            reserveX: positionInfo.reserveX,
            reserveXUSD: positionInfo.reserveXUSD,
            reserveY: positionInfo.reserveY,
            reserveYUSD: positionInfo.reserveYUSD,
            tokenXDecimal: positionInfo.tokenXDecimal,
            tokenXLogo: positionInfo.tokenXLogo,
            tokenXMint: positionInfo.tokenXMint,
            tokenXPrice: positionInfo.tokenXPrice,
            tokenXSymbol: positionInfo.tokenXSymbol,
            tokenYDecimal: positionInfo.tokenYDecimal,
            tokenYLogo: positionInfo.tokenYLogo,
            tokenYMint: positionInfo.tokenYMint,
            tokenYPrice: positionInfo.tokenYPrice,
            tokenYSymbol: positionInfo.tokenYSymbol,
            volume_24h: positionInfo.volume_24h,
            yield_24h: positionInfo.yield_24h,
            profitX: positionInfo.profitX,
            profitXUSD: positionInfo.profitXUSD,
          }}
        />
      )}
    </>
  );
}
