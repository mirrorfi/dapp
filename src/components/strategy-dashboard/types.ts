export const STRATEGY_CATEGORIES = ["LST", "DLMM", "Lending"] as const;
export type StrategyCategory = (typeof STRATEGY_CATEGORIES)[number];

export const getCategoryStyle = (category: StrategyCategory) => {
  switch (category) {
    case "LST":
      return "bg-blue-100 text-blue-800";
    case "DLMM":
      return "bg-purple-100 text-purple-800";
    case "Lending":
      return "bg-green-100 text-green-800";
  }
};

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    nodeType?: "protocol" | "token" | "lst";
    percentage?: string;
    connectionCount: number;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Strategy {
  _id: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
  user: string;
  __v: number;
  categories?: StrategyCategory[];
  apy?: number;
}
