"use client"
import { useState, useCallback } from "react"
import type React from "react"

import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Save, Share2 } from "lucide-react"
import { CustomNode } from "@/components/custom-node"
import { CreateNodeDialog } from "@/components/create-node-dialog"
import { Dialog, DialogContent } from "@radix-ui/react-dialog"

// Define node types
const nodeTypes = {
  customNode: CustomNode,
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

const CreateStrategyPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [open, setOpen] = useState(false)

  const onConnect = useCallback(
    (params: Connection) =>
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
      ),
    [setEdges],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const handleCreateNode = useCallback(
    (nodeData: {
      label: string
      description: string
      nodeType: "deposit" | "stake" | "swap" | "apr" | "yield"
      percentage?: string
    }) => {
      const newNode: Node = {
        id: `${nodes.length + 1}-${Date.now()}`,
        type: "customNode",
        data: nodeData,
        position: {
          x: Math.random() * 300 + 200,
          y: Math.random() * 300 + 50,
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [nodes, setNodes],
  )


  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-6 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <img src="/SVG/MirrorFi-Logo-Blue.svg" alt="MirrorFi Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-semibold">Create Yield Strategy</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="space-x-1.5">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
          <Button size="sm" className="space-x-1.5">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex">
        <aside className="w-80 p-6 border-r border-border bg-card">
          <Accordion type="single" collapsible defaultValue="protocols">
            <AccordionItem value="protocols">
              <AccordionTrigger>Protocols</AccordionTrigger>
              <AccordionContent>
                <div className="py-2 space-y-1">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>
                      Create Protocol Node
                    </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Sanctum
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Jupiter
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Marinade
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="actions">
              <AccordionTrigger>Actions</AccordionTrigger>
              <AccordionContent>
                <div className="py-2 space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    Deposit
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Withdraw
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Swap
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    APR Check
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Yield Distribution
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {selectedNode && (
            <div className="mt-6 p-4 border border-border rounded-md">
              <h3 className="font-medium mb-2">Selected Node</h3>
              <p className="text-sm mb-1">Type: {selectedNode.data.nodeType || "Default"}</p>
              <p className="text-sm mb-1">Label: {selectedNode.data.label}</p>
              {selectedNode.data.description && (
                <p className="text-sm mb-1">Description: {selectedNode.data.description}</p>
              )}
              {selectedNode.data.percentage && <p className="text-sm">Allocation: {selectedNode.data.percentage}</p>}
            </div>
          )}
        </aside>

        <div className="flex-1 h-full">
          <CreateNodeDialog onCreateNode={handleCreateNode} isOpen={open} onClose={() => setOpen(false)}/>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Controls className="bg-card border border-border text-foreground" />
            <Background color="#3b82f6" gap={16} size={1} />
          </ReactFlow>
        </div>
      </main>
    </div>
  )
}

export default CreateStrategyPage
