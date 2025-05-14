import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Strategy } from "./types";

interface StrategyDashboardHeaderProps {
  strategies: Strategy[];
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

const CATEGORIES = ["LST", "DLMM", "Lending"] as const;

export const StrategyDashboardHeader = ({
  strategies,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
}: StrategyDashboardHeaderProps) => {
  const router = useRouter();

  const getCategoryCount = (category: "LST" | "DLMM" | "Lending") =>
    strategies.filter((s) => s.categories?.includes(category)).length;

  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm">
        <>
          <button
            onClick={() => setCategoryFilter("all")}
            className={`h-8 px-3 rounded-full border-gray-600 border-2 bg-card transition-colors ${
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            All ({strategies.length})
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category.toLowerCase())}
              className={`h-8 px-3 rounded-full border-gray-600 border-2 bg-card transition-colors ${
                categoryFilter === category.toLowerCase()
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              {category} ({getCategoryCount(category)})
            </button>
          ))}
        </>
      </div>
      <div className="flex items-center gap-4">
        <div className="inline-flex h-8 items-center rounded-full border-gray-600 border-2 bg-card text-card-foreground">
          <div
            className={`flex h-full items-center justify-center rounded-l-full px-3 transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="flex items-center justify-center"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
          <div
            className={`flex h-full items-center justify-center rounded-r-full px-3 transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            <button
              onClick={() => setViewMode("list")}
              className="flex items-center justify-center"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
        <Button
          onClick={() => router.push("/create-strategy")}
          className="h-8 px-3 rounded-full border-gray-600 border-2 flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Strategy
        </Button>
      </div>
    </div>
  );
};
