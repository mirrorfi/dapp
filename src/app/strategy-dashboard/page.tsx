"use client";

import SimplifiedFlow from "@/components/simplified-flow";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StrategyModal from "@/components/StrategyModal";
import Moralis from "moralis";

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    nodeType?: "protocol" | "token";
    percentage?: string;
    connectionCount: number;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

const CATEGORIES = ["LST", "DLMM", "Lending"] as const;

interface Strategy {
  _id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
  user: string;
  __v: number;
  category?: "LST" | "DLMM" | "Lending";
  apy?: number;
}

const StrategyDashboardPage = () => {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const getCategoryCount = (category: string) =>
    strategies.filter((s) => s.category === category).length;

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch("/api/get-strategies");
        if (!response.ok) {
          throw new Error("Failed to fetch strategies");
        }
        const data = await response.json();
        // Use actual category and APY values from fetched strategies, but provide defaults if missing
        const dataWithCategories = data.map((strategy: Strategy) => ({
          ...strategy,
          category: strategy.category || CATEGORIES[0], // Default to first category if missing
          apy: strategy.apy ?? 0, // Default to 0 if APY is missing
        }));
        setStrategies(dataWithCategories);
        console.log("Fetched strategies:", dataWithCategories);
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

    
    fetchStrategies();
  }, []);

  const handleCardClick = (strategy: Strategy) => {
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
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : ""
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
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : ""
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
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies
              .filter((strategy) => {
                if (categoryFilter === "all") return true;
                return strategy.category?.toLowerCase() === categoryFilter;
              })
              .map((strategy: Strategy) => (
                <Card
                  key={strategy._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none backdrop-blur-sm relative min-h-[300px] cursor-pointer group"
                  onClick={() => handleCardClick(strategy)}
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
                      <CardHeader className="flex flex-col space-y-2 mt-3 px-5">
                        <div className="flex items-center justify-between w-full">
                          <CardTitle className="text-lg font-bold text-white">
                            {strategy.name}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-300">APY</span>
                            <span className="text-lg font-bold text-white">
                              {strategy.apy?.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {strategy.nodes
                              .filter((node) => node.data.nodeType === "token")
                              .map((node) => (
                                <Image
                                  key={node.id}
                                  src={`/PNG/${node.data.label.toLowerCase()}-logo.png`}
                                  alt={node.data.label}
                                  width={24}
                                  height={24}
                                  className="rounded-full border border-gray-500"
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
                    <SimplifiedFlow
                      nodes={strategy.nodes}
                      edges={strategy.edges}
                    />
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-2 p-4 font-medium text-muted-foreground bg-card rounded-lg">
              <div>#</div>
              <div>Strategy Name</div>
              <div>Tokens</div>
              <div>Categories</div>
              <div className="text-right flex items-center justify-end gap-2">
                <button
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    )
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
                  onClick={() => handleCardClick(strategy)}
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
                          src={`/PNG/${node.data.label.toLowerCase()}-logo.png`}
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
                    <span className="font-medium">
                      {strategy.apy?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
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
