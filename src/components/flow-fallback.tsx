"use client"

import { useRef, useState } from "react"

type NodeData = {
  id: string
  label: string
  description?: string
  nodeType?: "deposit" | "stake" | "swap" | "apr" | "yield"
  percentage?: string
  x: number
  y: number
}

type ConnectionData = {
  id: string
  source: string
  target: string
}

interface FlowFallbackProps {
  onNodeClick: (node: any) => void
}

export function FlowFallback({ onNodeClick }: FlowFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Initial nodes
  const nodes: NodeData[] = [
    {
      id: "1",
      label: "Deposit SOL",
      description: "Initial SOL deposit",
      nodeType: "deposit",
      x: 50,
      y: 150,
    },
    {
      id: "2",
      label: "Stake via Sanctum",
      description: "Stake tokens",
      nodeType: "stake",
      percentage: "60% of funds",
      x: 300,
      y: 50,
    },
    {
      id: "3",
      label: "Jupiter Swap",
      description: "Swap tokens",
      nodeType: "swap",
      percentage: "40% of funds",
      x: 300,
      y: 250,
    },
    {
      id: "4",
      label: "APR Check",
      description: "Evaluate yields",
      nodeType: "apr",
      x: 550,
      y: 150,
    },
    {
      id: "5",
      label: "Yield Distribution",
      description: "Receive in preferred token",
      nodeType: "yield",
      x: 800,
      y: 150,
    },
  ]

  // Initial connections
  const connections: ConnectionData[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e1-3", source: "1", target: "3" },
    { id: "e2-4", source: "2", target: "4" },
    { id: "e3-4", source: "3", target: "4" },
    { id: "e4-5", source: "4", target: "5" },
  ]

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      onNodeClick({
        id: node.id,
        data: {
          label: node.label,
          description: node.description,
          nodeType: node.nodeType,
          percentage: node.percentage,
        },
        position: { x: node.x, y: node.y },
      })
    }
  }

  // Draw connections between nodes
  const renderConnections = () => {
    return connections.map((connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)

      if (!sourceNode || !targetNode) return null

      // Calculate connection points
      const sourceX = sourceNode.x + 150 // Right side of source node
      const sourceY = sourceNode.y + 40 // Middle of source node
      const targetX = targetNode.x // Left side of target node
      const targetY = targetNode.y + 40 // Middle of target node

      // Create SVG path
      const path = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`

      return (
        <svg
          key={connection.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <path
            d={path}
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              fill="rgba(59, 130, 246, 0.5)"
            >
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>
        </svg>
      )
    })
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-background">
      {/* Background grid */}
      <div
        className="absolute w-full h-full"
        style={{
          backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          opacity: 0.2,
        }}
      ></div>

      {/* Render connections */}
      <div>{renderConnections()}</div>

      {/* Render nodes */}
      <div>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute cursor-pointer ${selectedNodeId === node.id ? "ring-2 ring-primary" : ""}`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              zIndex: selectedNodeId === node.id ? 10 : 2,
            }}
            onClick={() => handleNodeClick(node.id)}
          >
            <div className={`custom-node node-${node.nodeType || "default"}`}>
              <div className="custom-node-header">{node.label}</div>
              {node.description && <div className="custom-node-content">{node.description}</div>}
              {node.percentage && <div className="custom-node-content">{node.percentage}</div>}

              {/* Connection handles */}
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full right-0 top-1/2 translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
        <button className="p-2 bg-card/80 backdrop-blur-sm border border-border rounded-md text-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>

      {/* Tip panel */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur-sm p-2 rounded-t-md border border-border border-b-0 z-20">
        <div className="text-xs text-muted-foreground">Tip: Click nodes to select them.</div>
      </div>
    </div>
  )
}
