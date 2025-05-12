"use client";

import { useEffect, useState } from "react";
import { APYVals } from "@/lib/plugin/sanctum/tools/apyVals";
import StrategyModal from "@/components/StrategyModal";
import Moralis from "moralis";
import { StrategyDashboardHeader } from "@/components/strategy-dashboard/StrategyDashboardHeader";
import { StrategyGridView } from "@/components/strategy-dashboard/StrategyGridView";
import { StrategyListView } from "@/components/strategy-dashboard/StrategyListView";
import { Strategy } from "@/components/strategy-dashboard/types";

const StrategyDashboardPage = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [apyValues, setApyValues] = useState<Record<string, number>>({});

  // Fetch APY values
  useEffect(() => {
    const fetchAPYValues = async () => {
      try {
        const values = await APYVals();
        setApyValues(values);
      } catch (error) {
        console.error("Failed to fetch APY values:", error);
      }
    };
    fetchAPYValues();
  }, []);

  // Fetch strategies and calculate total APY
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch("/api/get-strategies");
        if (!response.ok) {
          throw new Error("Failed to fetch strategies");
        }
        const data = await response.json();

        const dataWithCategories = data.map((strategy: Strategy) => {
          // Calculate total APY from LST nodes
          const totalAPY = strategy.nodes
            .filter((node) => node.data.nodeType === "lst")
            .reduce((sum, node) => {
              const nodeAPY = apyValues[node.data.label] || 0;
              return sum + nodeAPY;
            }, 0);

          return {
            ...strategy,
            category: strategy.category || "LST",
            apy: totalAPY * 100, // Convert to percentage
          };
        });
        console.log(dataWithCategories);
        setStrategies(dataWithCategories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load strategies"
        );
      } finally {
        setLoading(false);
      }
    };

    // Initialize Moralis
    Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
    });

    
    if (Object.keys(apyValues).length > 0) {
      fetchStrategies();
    }
  }, [apyValues]);

  const handleStrategyClick = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStrategy(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading strategies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-950/20 text-foreground">
      <main className="p-6">
        <StrategyDashboardHeader
          strategies={strategies}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {viewMode === "grid" ? (
          <StrategyGridView
            strategies={strategies}
            categoryFilter={categoryFilter}
            onStrategyClick={handleStrategyClick}
          />
        ) : (
          <StrategyListView
            strategies={strategies}
            categoryFilter={categoryFilter}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            onStrategyClick={handleStrategyClick}
          />
        )}
      </main>

      {selectedStrategy && (
        <StrategyModal
          strategy={selectedStrategy}
          isOpen={modalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default StrategyDashboardPage;
