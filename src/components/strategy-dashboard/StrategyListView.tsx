import Image from "next/image";
import { Strategy } from "./types";
import { tokenLogos } from "@/constants/nodeOptions";

interface StrategyListViewProps {
  strategies: Strategy[];
  categoryFilter: string;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
  onStrategyClick: (strategy: Strategy) => void;
}

export const StrategyListView = ({
  strategies,
  categoryFilter,
  sortDirection,
  setSortDirection,
  onStrategyClick,
}: StrategyListViewProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-2 p-4 font-medium text-muted-foreground bg-card rounded-lg">
        <div>#</div>
        <div>Strategy Name</div>
        <div>Tokens</div>
        <div>Categories</div>
        <div className="text-right flex items-center justify-end gap-2">
          <button
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="cursor-pointer hover:text-primary focus:outline-none"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
          <span>APY</span>
        </div>
      </div>
      {strategies
        .filter((strategy) => {
          if (categoryFilter === "all") return true;
          return strategy.category?.toLowerCase() === categoryFilter;
        })
        .sort((a, b) =>
          sortDirection === "asc"
            ? (a.apy || 0) - (b.apy || 0)
            : (b.apy || 0) - (a.apy || 0)
        )
        .map((strategy: Strategy, index: number) => (
          <div
            key={strategy._id}
            onClick={() => onStrategyClick(strategy)}
            className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-2 p-4 transition-colors duration-200 hover:bg-gray-800 rounded-lg cursor-pointer items-center"
          >
            <div className="text-muted-foreground">{index + 1}</div>
            <div className="font-medium">{strategy.name}</div>
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
            <div className="flex items-center gap-2">
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
            <div className="text-right">
              <span className="font-medium">{strategy.apy?.toFixed(2)}%</span>
            </div>
          </div>
        ))}
    </div>
  );
};
