"use client"
import dynamic from "next/dynamic"
import { CustomNode } from "@/components/custom-node"

// Dynamically import ReactFlow with no SSR to avoid hydration issues
const ReactFlowWrapper = dynamic(() => import("./react-flow-wrapper").then((mod) => mod.ReactFlowWrapper), {
  ssr: false,
  loading: () => <LoadingFlow />,
})

function LoadingFlow() {
  return (
    <div className="flex-1 h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Loading flow diagram...</p>
      </div>
    </div>
  )
}

// Define types that match ReactFlow's API
type Node = {
  id: string
  type?: string
  data: any
  position: { x: number; y: number }
}

// Initial nodes with custom styling
const initialNodes = [
  {
    id: "1",
    type: "customNode",
    data: {
      label: "Deposit SOL",
      description: "Initial SOL deposit",
      nodeType: "deposit",
    },
    position: { x: 50, y: 150 },
  },
  {
    id: "2",
    type: "customNode",
    data: {
      label: "Stake via Sanctum",
      description: "Stake tokens",
      nodeType: "stake",
      percentage: "60% of funds",
    },
    position: { x: 300, y: 50 },
  },
  {
    id: "3",
    type: "customNode",
    data: {
      label: "Jupiter Swap",
      description: "Swap tokens",
      nodeType: "swap",
      percentage: "40% of funds",
    },
    position: { x: 300, y: 250 },
  },
  {
    id: "4",
    type: "customNode",
    data: {
      label: "APR Check",
      description: "Evaluate yields",
      nodeType: "apr",
    },
    position: { x: 550, y: 150 },
  },
  {
    id: "5",
    type: "customNode",
    data: {
      label: "Yield Distribution",
      description: "Receive in preferred token",
      nodeType: "yield",
    },
    position: { x: 800, y: 150 },
  },
]

// Initial edges with custom styling
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: "arrowclosed",
    },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: "arrowclosed",
    },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: "arrowclosed",
    },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: "arrowclosed",
    },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: "arrowclosed",
    },
  },
]

export function SimplifiedFlow({ onNodeClick }: { onNodeClick: (node: Node) => void }) {
  // We'll pass the initial data to the wrapper component
  return (
    <div className="w-full h-full">
      <ReactFlowWrapper
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onNodeClick={onNodeClick}
        nodeTypes={{ customNode: CustomNode }}
      />
    </div>
  )
}
