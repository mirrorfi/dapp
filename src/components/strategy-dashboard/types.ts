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
  categories?: ("LST" | "DLMM" | "Lending")[];
  apy?: number;
}
