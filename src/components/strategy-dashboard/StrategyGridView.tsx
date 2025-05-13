import SimplifiedFlow from "@/components/simplified-flow";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Strategy } from "./types";
import { tokenLogos } from "@/constants/nodeOptions";

interface StrategyGridViewProps {
  strategies: Strategy[];
  categoryFilter: string;
  onStrategyClick: (strategy: Strategy) => void;
}

export const StrategyGridView = ({
  strategies,
  categoryFilter,
  onStrategyClick,
}: StrategyGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {strategies
        .sort((a, b) => (b.apy || 0) - (a.apy || 0))
        .filter((strategy) => {
          if (categoryFilter === "all") return true;
          return strategy.category?.toLowerCase() === categoryFilter;
        })
        .map((strategy: Strategy) => (
          <Card
            key={strategy._id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none backdrop-blur-sm relative min-h-[300px] cursor-pointer group"
            onClick={() => onStrategyClick(strategy)}
          >
            {/* Blur effects container */}
            <div className="absolute inset-0">
              {/* Left edge darken */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/15 via-black/5 to-transparent z-10" />
              {/* Right edge darken */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/15 via-black/5 to-transparent z-10" />
              {/* Bottom edge darken */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/15 via-black/5 to-transparent z-10" />
              {/* Top info section with gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-transparent h-32 z-10">
                <CardHeader className="flex flex-col mt-3 px-5">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg font-bold text-white">
                      {strategy.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-300 -mb-1">APY</span>
                      <span className="text-lg font-bold text-white">
                        {strategy.apy?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {strategy.nodes
                        .filter((node) => node.data.nodeType === "token")
                        .map((node) => (
                          <Image
                            key={node.id}
                            src={tokenLogos[node.data.label]}
                            alt={node.data.label}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ))}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        strategy.category === "LST"
                          ? "bg-blue-100 text-blue-800"
                          : strategy.category === "DLMM"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {strategy.category}
                    </span>
                  </div>
                </CardHeader>
              </div>
            </div>
            <div className="absolute inset-x-0 top-[60px] bottom-0">
              <SimplifiedFlow nodes={strategy.nodes} edges={strategy.edges} />
            </div>
          </Card>
        ))}
    </div>
  );
};
