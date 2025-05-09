import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import SimplifiedFlow from "@/components/simplified-flow";


interface Strategy {
  _id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
  user: string;
  __v: number;
}

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

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard(
  { strategy }: StrategyCardProps
) {
  return (
    <Card
      key={strategy._id}
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none backdrop-blur-sm relative min-h-[300px] cursor-pointer"
      onClick={() => {}}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold">
          {strategy.name}
        </CardTitle>
      </CardHeader>
      <div className="absolute inset-x-0 top-[60px] bottom-0">
        <SimplifiedFlow
          nodes={strategy.nodes}
          edges={strategy.edges}
        />
      </div>
    </Card>
  );
}
