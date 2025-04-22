"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, { Controls, Background, Panel, useNodesState, useEdgesState, addEdge, MarkerType } from "reactflow"
import "reactflow/dist/style.css"

// Suppress ResizeObserver errors
const suppressResizeObserverErrors = () => {
  const originalError = console.error
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("ResizeObserver loop") &&
      args[0].includes("undelivered notifications")
    ) {
      // Ignore ResizeObserver errors
      return
    }
    originalError(...args)
  }

  return () => {
    console.error = originalError
  }
}

export function ReactFlowWrapper({ initialNodes, initialEdges, onNodeClick, nodeTypes }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isReady, setIsReady] = useState(false)

  // Suppress ResizeObserver errors
  useEffect(() => {
    const cleanup = suppressResizeObserverErrors()
    return cleanup
  }, [])

  // Delay rendering to avoid initial ResizeObserver issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { strokeDasharray: "5, 5" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  const handleNodeClick = useCallback(
    (event, node) => {
      if (onNodeClick) {
        onNodeClick(node)
      }
    },
    [onNodeClick],
  )

  if (!isReady) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Initializing flow diagram...</p>
        </div>
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      nodeTypes={nodeTypes}
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

      <Panel
        position="top-right"
        className="bg-card/80 backdrop-blur-sm p-2 rounded-md border border-border mr-10 mt-2"
      >
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm bg-card border border-border rounded-md hover:bg-muted transition-colors"
            onClick={() => {
              // Simple fit view
              const reactFlowInstance = document.querySelector(".react-flow")
              if (reactFlowInstance) {
                reactFlowInstance.dispatchEvent(new Event("resize"))
              }
            }}
          >
            Fit View
          </button>
        </div>
      </Panel>

      <Panel
        position="bottom-center"
        className="bg-card/80 backdrop-blur-sm p-2 rounded-t-md border border-border border-b-0 mb-0"
      >
        <div className="text-xs text-muted-foreground">
          Tip: Drag nodes to position them. Click to select. Connect nodes by dragging from one handle to another.
        </div>
      </Panel>
    </ReactFlow>
  )
}
