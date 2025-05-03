"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import SimplifiedFlow from "@/components/simplified-flow";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import StrategyModal from "@/components/StrategyModal";

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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/create-strategy?nodeList=[]&edgeList=[]"
                  className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-primary hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Strategy
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-8">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-[400px] grid-cols-2 mb-2">
              <TabsTrigger value="all">All Strategies</TabsTrigger>
              <TabsTrigger value="mine">My Strategies</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies
            .filter((strategy) => {
              if (activeTab === "all") return true;
              return (
                connected && publicKey && strategy.user === publicKey.toBase58()
              );
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
