"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APYVals } from "@/lib/plugin/sanctum/tools/apyVals";
import StrategyModal from "@/components/StrategyModal";
import Moralis from "moralis";
import { StrategyDashboardHeader } from "@/components/strategy-dashboard/StrategyDashboardHeader";
import { StrategyGridView } from "@/components/strategy-dashboard/StrategyGridView";
import { StrategyListView } from "@/components/strategy-dashboard/StrategyListView";
import { Strategy } from "@/components/strategy-dashboard/types";
import { allAddresses } from "@/constants/nodeOptions";
import { getMeteoraPoolAPY } from "@/lib/meteora";

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
    // Initialize Moralis
    Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
    });
  }, []);
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch("/api/get-strategies");
        if (!response.ok) {
          throw new Error("Failed to fetch strategies");
        }
        const data = await response.json();

        const dataWithCategories = await Promise.all(data.map(async (strategy: Strategy) => {
          // Calculate total APY from LST nodes
          // const totalAPY = (strategy.nodes
          //   .filter((node) => node.data.nodeType === "lst")
          //   .reduce((sum, node) => {
          //     const nodeAPY = apyValues[node.data.label] || 0;
          //     return sum + nodeAPY;
          //   }, 0));

          const meteoraAPYs = await Promise.all(
            strategy.nodes
              .filter((node) => node.data.label === "Meteora")
              .map(async (node) => {
                // Find the parent nodes of the Meteora node
                const parentLabels = strategy.edges
                  .filter((edge) => edge.target === node.id)
                  .map((edge) => {
                    const parentNode = strategy.nodes.find(
                      (n) => n.id === edge.source
                    );
                    return parentNode ? parentNode.data.label : null;
                  })
                  .filter((label): label is string => label !== null);

                // Get the addresses of the parent nodes
                const tokenX_label = parentLabels[0];
                const tokenX_address = allAddresses[tokenX_label];
                const tokenY_label = parentLabels[1];
                const tokenY_address = allAddresses[tokenY_label];
                // Get the APY for the Meteora node
                const meteoraAPY = await getMeteoraPoolAPY(
                  tokenX_address,
                  tokenY_address
                );
                return (meteoraAPY/100) || 0;
              })
          );

          const totalAPY =
            strategy.nodes
              .filter((node) => node.data.nodeType === "lst")
              .reduce((sum, node) => {
                const nodeAPY = apyValues[node.data.label] || 0;
                return sum + (nodeAPY);
              }, 0) +
            meteoraAPYs.reduce((sum, apy) => sum + apy, 0);
          
          console.log("Total APY:", totalAPY);
          return {
            ...strategy,
            category: strategy.category || "LST",
            apy: totalAPY * 100, // Convert to percentage
          };
        }));
        console.log("Fuck is this??", dataWithCategories);
        setStrategies(dataWithCategories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load strategies"
        );
      } finally {
        setLoading(false);
      }
    };

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
  console.log("Strategies:", strategies);
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-950/20 text-foreground">
        <main className="p-6">
          {/* Header Skeleton */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-24">
                  <div className="h-full rounded-full border-gray-600 border-2 bg-card overflow-hidden">
                    <div className="w-full h-full animate-pulse bg-muted" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-20">
                <div className="h-full rounded-full border-gray-600 border-2 bg-card overflow-hidden">
                  <div className="w-full h-full animate-pulse bg-muted" />
                </div>
              </div>
              <div className="h-8 w-32">
                <div className="h-full rounded-full border-gray-600 border-2 bg-card overflow-hidden">
                  <div className="w-full h-full animate-pulse bg-muted" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid View Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden border-none backdrop-blur-sm relative min-h-[300px] rounded-lg bg-card"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-transparent h-32">
                    <div className="flex flex-col mt-3 px-5">
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="h-6 w-32 rounded-md overflow-hidden">
                          <div className="w-full h-full animate-pulse bg-muted" />
                        </div>
                        <div className="h-6 w-20 rounded-md overflow-hidden">
                          <div className="w-full h-full animate-pulse bg-muted" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((j) => (
                            <div
                              key={j}
                              className="w-6 h-6 rounded-full overflow-hidden"
                            >
                              <div className="w-full h-full animate-pulse bg-muted" />
                            </div>
                          ))}
                        </div>
                        <div className="h-6 w-16 rounded-full overflow-hidden">
                          <div className="w-full h-full animate-pulse bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 top-[60px] bottom-0">
                  <div className="w-full h-full animate-pulse bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        </main>
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

  if (!loading && strategies.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background/95 to-blue-950/20 text-foreground">
        <main className="flex flex-col items-center justify-center flex-1 p-6 -mt-32">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-4 rounded-full bg-card/50 backdrop-blur-sm">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No Strategies Found</h2>
            <p className="text-muted-foreground">
              Get started by creating your first strategy. You can combine
              different tokens and protocols to create unique investment
              strategies.
            </p>
            <Button asChild className="mt-2 rounded-full">
              <Link href="/create-strategy">Create Strategy</Link>
            </Button>
          </div>
        </main>
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
