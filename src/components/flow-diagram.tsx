"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { FallbackFlow } from "@/components/fallback-flow"
import { ErrorBoundary } from "@/components/error-boundary"
import "reactflow/dist/style.css"

// Import or define CustomNodeWrapper
import { CustomNode } from "@/components/custom-node"
import ReactFlow, { addEdge, Background, Controls, MarkerType, useEdgesState, useNodesState } from "reactflow"

// Define types that match ReactFlow's API
type Node = {
  id: string
  type?: string
  data: any
  position: { x: number; y: number }
}

type Edge = {
  id: string
  source: string
  target: string
  animated?: boolean
  style?: React.CSSProperties
  markerEnd?: { type: MarkerType }
}

type Connection = {
  source: string
  target: string
}

// Initial nodes with custom styling
const initialNodes: Node[] = [
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
const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: true,
    style: { strokeDasharray: "5, 5" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
]

export function FlowDiagram({ onNodeClick }: { onNodeClick: (node: Node) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        console.error("Invalid edge connection:", params);
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            id: `e${params.source}-${params.target}`,
            ...params,
            animated: true,
            style: { strokeDasharray: "5, 5" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeClick(node);
    },
    [onNodeClick],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onReconnect={onConnect}
      onNodeClick={handleNodeClick}
      nodeTypes={{ customNode: CustomNode }}
      fitView
      className="bg-background"
      minZoom={0.2}
      maxZoom={1.5}
      defaultEdgeOptions={{
        animated: true,
        style: { strokeDasharray: "5, 5" },
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Controls className="bg-card/80 backdrop-blur-sm border border-border text-foreground" />
      <Background color="#3b82f6" gap={16} size={1} />
    </ReactFlow>
  );
}
