"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import Moralis from "moralis";
import { useEffect, useState } from "react";
import CryptoPoolModal from "./PoolModal";

interface poolData {
  tokenXMint: string;
  tokenYMint: string;
  poolAddress: string;
  apy: number;
  fees_24h: number;
  reserve_x_amt: number;
  reserve_y_amt: number;
  trade_volume_24h: number;
  poolName: string;
}

interface PoolPortfolioCardProps {
  poolInfo?: poolData;
}

export function PoolPortfolioCard({ poolInfo }: PoolPortfolioCardProps) {
  const [tokenXData, setTokenXData] = useState<any>();
  const [tokenYData, setTokenYData] = useState<any>();
  const [openModal, setOpenModal] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<any>();

  useEffect(() => {
    // Fetch data when the component mounts
    console.log("Fetching data on pool portfolio card");

    const fetchPriceData = async () => {
      try {
        const response = await fetch(
          `https://lite-api.jup.ag/price/v2?ids=${poolInfo?.tokenXMint},${poolInfo?.tokenYMint}`
        );

        const data = await response.json();
        console.log("Data fetched in pool card: ", data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    const fetchXTokenData = async () => {
      try {
        const responseXToken = await fetch(`
          https://api.solana.fm/v0/tokens/${poolInfo?.tokenXMint}
          `);

        const data = await responseXToken.json();
        console.log("Data fetched for token x: ", data);
        setTokenXData(data);
      } catch (error) {
        console.error("Error fetching data for token x: ", error);
      }
    };

    const fetchYTokenData = async () => {
      try {
        const responseYToken = await fetch(`
          https://api.solana.fm/v0/tokens/${poolInfo?.tokenYMint}
          `);

        const data = await responseYToken.json();
        console.log("Data fetched for token y: ", data);
        setTokenYData(data);
      } catch (error) {
        console.error("Error fetching data for token y: ", error);
      }
    };

    const fetchTokenPrices = async () => {
      try {
        const priceResponse = await fetch(`https://lite-api.jup.ag/price/v2?ids=${poolInfo?.tokenXMint},${poolInfo?.tokenYMint}`);

        const data = await priceResponse.json();
        console.log("Data fetched for token prices: ", data);
        setTokenPrices(data.data)
        console.log("token prices saved: ", tokenPrices);
      } catch (error) {
        console.error("Error fetching data for token prices: ", error);
      }
    }

    fetchPriceData();
    fetchXTokenData();
    fetchYTokenData();
    fetchTokenPrices();
  }, []);

  // This prevents the modal from reopening when clicking off the modal
  const handleClickCard = () => {
    setOpenModal(true);
  };

  return (
    <>
      <Card
        onClick={handleClickCard}
        className="w-full border-0 bg-[#171923] hover:bg-[#1A202C] transition-all duration-200 overflow-hidden mb-3 py-0 text-sm"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#2D3748] flex-shrink-0 ring-1 ring-[#4A5568]/30 flex items-center justify-center border-2 border-[#171923]">
                {tokenXData?.result.data.logo && (
                  <Image
                    src={tokenXData.result.data.logo}
                    alt={`${tokenXData.result.data.symbol} logo`}
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
                {tokenYData?.result.data.logo && (
                  <Image
                    src={tokenYData.result.data.logo}
                    alt={`${tokenYData.result.data.symbol} logo`}
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
              {poolInfo?.poolName}
            </h3>
            </div>


            <div className="w-fit h-[20%] p-2 bg-transparent text-green-500 text-lg flex">
              {poolInfo?.apy.toFixed(2)}% APY
            </div>
          </div>
        </div>
      </Card>
      {/* Render modal outside the Card to prevent event bubbling */}
      <CryptoPoolModal open={openModal} setOpen={setOpenModal} 
      poolInfo={
        {
          poolName: poolInfo?.poolName ?? "",
          tokenXLogo: tokenXData?.result.data.logo,
          tokenYLogo: tokenYData?.result.data.logo,
          tokenXPrice: tokenXData?.result.data.price,
          tokenYPrice: tokenYData?.result.data.price,
          poolAPY: poolInfo?.apy.toFixed(2) + "%",
        }
      }/>
    </>
  );
}
