"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Moralis from "moralis";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APYVals } from "@/lib/plugin/sanctum/tools/apyVals";
import StrategyModal from "@/components/StrategyModal";
import { StrategyDashboardHeader } from "@/components/strategy-dashboard/StrategyDashboardHeader";
import { StrategyGridView } from "@/components/strategy-dashboard/StrategyGridView";
import { StrategyListView } from "@/components/strategy-dashboard/StrategyListView";
import { StrategyDashboardSkeleton } from "@/components/strategy-dashboard/StrategyDashboardSkeleton";
import { Strategy } from "@/components/strategy-dashboard/types";
import { allAddresses } from "@/constants/nodeOptions";
import { getMeteoraPoolAPY } from "@/lib/meteora";

type Props = {
  searchParams: { id?: string };
};

const StrategyDashboardPage = ({ searchParams }: Props) => {
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

  useEffect(() => {
    // Initialize Moralis
    Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
    });
  }, []);

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

        const dataWithCategories = await Promise.all(
          data.map(async (strategy: Strategy) => {
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
                  return meteoraAPY / 100 || 0;
                })
            );

            const totalAPY =
              strategy.nodes
                .filter((node) => node.data.nodeType === "lst")
                .reduce((sum, node) => {
                  const nodeAPY = apyValues[node.data.label] || 0;
                  return sum + nodeAPY;
                }, 0) + meteoraAPYs.reduce((sum, apy) => sum + apy, 0);

            return {
              ...strategy,
              categories: strategy.categories || ["LST"],
              apy: totalAPY * 100, // Convert to percentage
            };
          })
        );

        setStrategies(dataWithCategories);
        const id = searchParams.id;
        if (id) {
          dataWithCategories.forEach((strategy: Strategy) => {
            if (strategy._id.toString() === id) {
              setSelectedStrategy(strategy);
              setModalOpen(true);
            }
          });
        }
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
    return <StrategyDashboardSkeleton />;
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
