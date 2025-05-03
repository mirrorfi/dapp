"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import SimplifiedFlow from "@/components/simplified-flow";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import StrategyModal from "@/components/StrategyModal";

import {getAgent} from "@/lib/agentKitUtils";

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
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
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const fetchStrategies = async () => {
      console.log("Fetching agent...");
      const agent = await getAgent();
      console.log("Agent fetched:", agent);
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
      <header className="p-6 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/SVG/MirrorFi-Logo-Blue.svg"
              alt="MirrorFi Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold">MirrorFi</h1>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:space-x-2">
          <div className="flex-1/3">
            <InteractiveHoverButton
              onClick={() =>
                (window.location.href =
                  "/create-strategy?nodeList=[]&edgeList=[]")
              }
              className="text-sm border-gray-700"
            >
              Create Strategy
            </InteractiveHoverButton>
          </div>
          <Input
            placeholder="Search strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[400px] lg:w-[500px] rounded-full flex-1/3"
          />
          <div className="flex-1/3 flex justify-end">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-[300px] lg:w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Strategies</TabsTrigger>
                <TabsTrigger value="mine">My Strategies</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies
            .filter((strategy) => {
              // First filter by tab
              const tabFilter =
                activeTab === "all"
                  ? true
                  : connected &&
                    publicKey &&
                    strategy.user === publicKey.toBase58();

              // Then filter by search query
              const searchFilter =
                searchQuery.trim() === ""
                  ? true
                  : strategy.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase());

              return tabFilter && searchFilter;
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
