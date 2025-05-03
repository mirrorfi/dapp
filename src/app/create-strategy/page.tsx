"use client";
import { useState, useCallback, useEffect } from "react";
import type React from "react";

import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import Image from "next/image";

import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { CreateNodeDialog } from "@/components/create-node-dialog"
import { CustomNode } from "@/components/custom-node"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { createStrategy } from "@/lib/database/db_actions/test-actions"
import { SaveStrategyDialog } from "@/components/save-strategy-dialog"

// Define node types
const nodeTypes = {
  customNode: CustomNode,
};

// Initial nodes with custom styling
let initialNodes: Node[] = [
  {
    id: "1",
    type: "customNode",
    data: {
      label: "SOL Wallet",
      description: "",
      nodeType: "deposit",
      connectionCount: 0,
    },
    position: { x: 50, y: 150 },
    sourcePosition: Position.Right,
    targetPosition: undefined,
    draggable: false,
  },
];

// Initial edges with custom styling
let initialEdges: Edge[] = [];

const CreateStrategyPage = (nodeList: Node[] = [], edgeList: Edge[] = []) => {
  console.log("Node List:", nodeList);
  console.log("Edge List:", edgeList);
  // Initialize state for nodes and edges
  initialNodes = nodeList.length > 0 ? nodeList : initialNodes;
  initialEdges = edgeList.length > 0 ? edgeList : initialEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [open, setOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [nodeToConnect, setNodeToConnect] = useState<Node | null>(null)

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
          eds
        )
      ),
    [setEdges]
  );

  const handleCreateNode = useCallback(
    (nodeData: {
      label: string;
      description: string;
      nodeType: "protocol" | "token";
    }) => {
      let connectionCount = nodeToConnect
        ? nodeToConnect.data.connectionCount
        : 0;
      //Find which handle was clicked

      const newNode: Node = {
        id: `${nodes.length + 1}-${Date.now()}`,
        type: "customNode",
        data: nodeData,
        position: {
          x: nodeToConnect
            ? nodeToConnect.position.x + 400
            : Math.random() * 300 + 200,
          y: nodeToConnect
            ? nodeToConnect.position.y +
              (-1) ** connectionCount * 200 * Math.ceil(connectionCount / 2)
            : Math.random() * 300 + 50,
        },
      };

      // Update connection count for the node being connected to
      connectionCount += 1;
      if (nodeToConnect) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeToConnect.id) {
              return { ...n, data: { ...n.data, connectionCount } };
            }
            return n;
          })
        );
      }

      setNodes((nds) => [...nds, newNode]);

      if (nodeToConnect) {
        const newEdge: Edge = {
          id: `e${nodeToConnect.id}-${newNode.id}`,
          source: nodeToConnect.id,
          target: newNode.id,
          animated: true,
          style: { strokeDasharray: "5, 5" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        };
        setEdges((eds) => [...eds, newEdge]);
      }

      setNodeToConnect(null);
    },
    [nodes, setNodes, nodeToConnect, setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setNodeToConnect(node);
    setOpen(true);
  }, []);

  const handleSaveStrategy = () => {
    // Ensure all nodes have a description (default to an empty string if missing)
    console.log("Nodes before sanitization:", nodes);
    console.log("Edges before sanitization:", edges);
    const sanitizedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        description: node.data.description || "Description", // Provide a default value for description
      },
    }));

    console.log("Nodes after sanitization:", sanitizedNodes);

    // Save the strategy to the database
    const strategy = {
      nodes: sanitizedNodes,
      edges: edges,
    };

    createStrategy(strategy)
      .then((response) => {
        console.log("Strategy saved successfully:", response);
        // Optionally, redirect or show a success message
        window.location.href = "/strategy-dashboard"; // Redirect to the strategy dashboard
      })
      .catch((error) => {
        console.error("Error saving strategy:", error);
      });
  };

  // const walletContext = useWallet();

  async function handleAgentKitTest() {
    // Implement your logic here
    const rpc_url =
      process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
    const walletContext = null;
    console.log("RUNNING AGENT KIT TEST");
    testAgentKit(rpc_url, walletContext);
  }

  // useEffect(() => {
  //   handleAgentKitTest()
  //     .then(() => {
  //       console.log("AgentKit test completed successfully.");
  //     })
  //     .catch((error) => {
  //       console.error("Error during AgentKit test:", error);
  //     });
  // }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/SVG/MirrorFi-Logo-Blue.svg"
              alt="MirrorFi Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold">Create Yield Strategy</h1>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/strategy-dashboard"
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  Strategy Dashboard
                </NavigationMenuLink>
              </NavigationMenuItem>
              {/* Add more NavigationMenuItems here if needed */}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      <main className="flex-1">
        <SaveStrategyDialog nodeList={nodes} edgeList={edges} isOpen={saveOpen} onClose={() => setSaveOpen(false)}/>
        <CreateNodeDialog onCreateNode={handleCreateNode} isOpen={open} onClose={() => setOpen(false)} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          defaultViewport={{
            zoom: 0.7,
            x: initialNodes[0]?.position.x * 2 || 0,
            y: initialNodes[0]?.position.y * 1.5 || 0,
          }} // Align viewport with the initial nodes
          className="bg-background"
        >
          {/* <Controls className="bg-card border border-border text-foreground" /> */}
          <Background color="#3b82f6" gap={16} size={1} />
        </ReactFlow>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button variant="ghost" onClick={() => {setSaveOpen(true)}}>
            <Save/>Save Strategy
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreateStrategyPage;
