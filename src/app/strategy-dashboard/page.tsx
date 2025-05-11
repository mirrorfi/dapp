"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import SimplifiedFlow from "@/components/simplified-flow";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import StrategyModal from "@/components/StrategyModal";

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

interface Strategy {
  _id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
  user: string;
  __v: number;
}

const StrategyDashboardPage = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch("/api/get-strategies");
        if (!response.ok) {
          throw new Error("Failed to fetch strategies");
        }
        const data = await response.json();
        setStrategies(data);
        console.log("Fetched strategies:", data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load strategies"
        );
      } finally {
        setLoading(false);
      }
    };

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
            <button
              onClick={() => setCategoryFilter("all")}
              className={`h-8 px-4 rounded-full border-gray-600 border-2 bg-card transition-colors ${
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              All ({strategies.length})
            </button>
            <button
              onClick={() => setCategoryFilter("lst")}
              className={`h-8 px-4 rounded-full border-gray-600 border-2 bg-card transition-colors ${
                categoryFilter === "lst"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              LST
            </button>
            <button
              onClick={() => setCategoryFilter("dlmm")}
              className={`h-8 px-4 rounded-full border-gray-600 border-2 bg-card transition-colors ${
                categoryFilter === "dlmm"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              DLMM
            </button>
            <button
              onClick={() => setCategoryFilter("lending")}
              className={`h-8 px-4 rounded-full border-gray-600 border-2 bg-card transition-colors ${
                categoryFilter === "lending"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              Lending
            </button>
          </div>
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
        </div>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies
              .filter(() => {
                // For now, show all strategies until category data is available
                return true;
              })
              .map((strategy: Strategy) => (
                <Card
                  key={strategy._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none backdrop-blur-sm relative min-h-[300px] cursor-pointer"
                  onClick={() => handleCardClick(strategy)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-bold">
                      {strategy.name}
                    </CardTitle>
                    {connected &&
                      publicKey &&
                      strategy.user === publicKey.toBase58() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 hover:text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement delete functionality
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                  </CardHeader>
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
              <div className="text-right">APY</div>
            </div>
            {strategies
              .filter(() => {
                // For now, show all strategies until category data is available
                return true;
              })
              .map((strategy: Strategy, index: number) => (
                <div
                  key={strategy._id}
                  onClick={() => handleCardClick(strategy)}
                  className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-2 p-4 transition-colors duration-200 hover:bg-accent/80 rounded-lg cursor-pointer items-center"
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
                    {/* Placeholder categories */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      DLMM
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">12.5%</span>
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
