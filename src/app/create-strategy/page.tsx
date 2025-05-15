"use client";
import { useState, useCallback, useEffect } from "react";
import type React from "react";

import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import { CreateNodeDialog } from "@/components/create-node-dialog";
import { CustomNode } from "@/components/custom-node";
import { Button } from "@/components/ui/button";
import { SaveStrategyDialog } from "@/components/save-strategy-dialog";
import { useWallet } from "@solana/wallet-adapter-react";

import { NodeModal } from "@/components/node-dialog";
import { Menu, Save, Trash2, X } from "lucide-react";
import { CreatePageSidebar } from "@/components/create-page-sidebar";

// Define node types
const nodeTypes = {
  customNode: CustomNode,
};

// Initial nodes with custom styling
const initialNodes: Node[] = [
  {
    id: "1",
    type: "customNode",
    data: {
      label: "Wallet",
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
const initialEdges: Edge[] = [];

const CreateStrategyPage = (nodeList: Node[] = [], edgeList: Edge[] = []) => {
  const { publicKey } = useWallet();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    nodeList.length > 0 ? nodeList : initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    edgeList.length > 0 ? edgeList : initialEdges
  );
  const [open, setOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [nodeOpen, setNodeOpen] = useState(false);
  const [nodeToConnect, setNodeToConnect] = useState<Node | null>(null);
  const [isSidebarOpen] = useState(true);

  const { fitView } = useReactFlow(); // Access the fitView method

  // Automatically fit the view whenever nodes or edges change
  useEffect(() => {
    fitView({ padding: 0.2 }); // Add padding to ensure nodes and edges are not too close to the edges
  }, [nodes, edges, fitView]);

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
      nodeType: "protocol" | "token" | "lst";
    }) => {
      const positions = nodes.map((node) => node.position);
      const x = nodeToConnect
        ? nodeToConnect.position.x + 400
        : Math.random() * 300 + 200;
      let y = nodeToConnect
        ? nodeToConnect.position.y
        : Math.random() * 300 + 50;

      let factor = 0;

      while (
        nodeToConnect &&
        positions.some((pos) => pos.x === x && pos.y === y)
      ) {
        factor += 1;
        y =
          nodeToConnect.position.y +
          (-1) ** factor * 200 * Math.ceil(factor / 2);
      }

      let connectionCount = nodeToConnect
        ? nodeToConnect.data.connectionCount
        : 0;

      const newNode: Node = {
        id: `${nodes.length + 1}-${Date.now()}`,
        type: "customNode",
        data: nodeData,
        position: {
          x: x,
          y: y,
        },
      };

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

  const handleCreateMeteoraNode = useCallback(
    (
      nodeData: {
        label: string;
        description: string;
        nodeType: "protocol" | "token" | "lst";
      },
      otherNode: Node | null
    ) => {
      if (!nodeToConnect || !otherNode) return;

      const positions = nodes.map((node) => node.position);
      const x = nodeToConnect
        ? nodeToConnect.position.x + 400
        : Math.random() * 300 + 200;
      let y = nodeToConnect
        ? nodeToConnect.position.y
        : Math.random() * 300 + 50;

      let factor = 0;

      while (
        nodeToConnect &&
        positions.some((pos) => pos.x === x && pos.y === y)
      ) {
        factor += 1;
        y =
          nodeToConnect.position.y +
          (-1) ** factor * 200 * Math.ceil(factor / 2);
      }

      const newNode: Node = {
        id: `${nodes.length + 1}-${Date.now()}`,
        type: "customNode",
        data: nodeData,
        position: {
          x: x,
          y: y,
        },
      };

      // Add the new node
      setNodes((nds) => [...nds, newNode]);

      // Create edges connecting nodeToConnect and otherNode to the new node
      const newEdges: Edge[] = [
        {
          id: `e${nodeToConnect.id}-${newNode.id}`,
          source: nodeToConnect.id,
          target: newNode.id,
          animated: true,
          style: { strokeDasharray: "5, 5" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        },
        {
          id: `e${otherNode.id}-${newNode.id}`,
          source: otherNode.id,
          target: newNode.id,
          animated: true,
          style: { strokeDasharray: "5, 5" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        },
      ];

      // Add the new edges
      setEdges((eds) => [...eds, ...newEdges]);

      // Reset nodeToConnect
      setNodeToConnect(null);
    },
    [nodes, setNodes, setEdges, nodeToConnect]
  );

  const handleDeleteNode = (nodeId: string) => {
    // Helper function to recursively find all child nodes
    const findChildNodes = (
      parentId: string,
      edges: Edge[],
      nodes: Node[]
    ): string[] => {
      const childNodes = edges
        .filter((edge) => edge.source === parentId)
        .map((edge) => edge.target);

      return childNodes.reduce(
        (acc, childId): string[] => [
          ...acc,
          childId,
          ...findChildNodes(childId, edges, nodes),
        ],
        [] as string[]
      );
    };

    // Find all child nodes of the node to be deleted
    const childNodeIds = findChildNodes(nodeId, edges, nodes);

    // Remove the node, its children, and their associated edges
    setNodes((nds) =>
      nds.filter((node) => ![nodeId, ...childNodeIds].includes(node.id))
    );
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          ![nodeId, ...childNodeIds].includes(edge.source) &&
          ![nodeId, ...childNodeIds].includes(edge.target)
      )
    );
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setNodeToConnect(node);
    setNodeOpen(true);
  }, []);

  return (
    <div className="flex h-[90vh] bg-background text-foreground">
      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ width: "80%" }}>
        <main className="flex-1">
          <SaveStrategyDialog
            nodeList={nodes}
            edgeList={edges}
            isOpen={saveOpen}
            onClose={() => setSaveOpen(false)}
            userAddress={publicKey?.toBase58() || ""}
          />
          <CreateNodeDialog
            onCreateNode={handleCreateNode}
            onCreateMeteoraNode={handleCreateMeteoraNode}
            selectedNode={nodeToConnect}
            isOpen={open}
            onClose={() => setOpen(false)}
            nodes={nodes}
          />
          <NodeModal
            node={nodeToConnect}
            isOpen={nodeOpen}
            onClose={() => setNodeOpen(false)}
            onCreateHook={() => {
              setNodeOpen(false);
              setOpen(true);
            }}
            onDeleteNode={handleDeleteNode} // Pass the delete function
          />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodesDraggable={false}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            nodesConnectable={true}
            proOptions={{ hideAttribution: true }}
            panOnDrag={false}
            zoomOnDoubleClick={false}
            zoomOnPinch={false}
            fitView
            className="bg-background"
          >
            <Background color="#3b82f6" gap={16} size={1} />
          </ReactFlow>
        </main>
      </div>
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto p-4">
          {isSidebarOpen && (
            <ul className="space-y-4">
              {/* User guide on how to create node */}
              <li>
                <h3 className="text-sm font-semibold">
                  How to create strategy:
                </h3>
                <p className="text-xs text-gray-400">
                  Click a node and click "+" button to specify its next action.
                  <br />
                  <br />
                  1. Click wallet and select which tokens to use.
                  <br />
                  2. Specify next actions using the token
                  <br />
                  <br />
                  {
                    "*Supported Actions: (Swap (Jupiter), LST (Sanctum), Meteora"
                  }
                  <br />
                  <br />
                  {/*- Protocol nodes, can't create any new nodes.<br />*/}
                </p>
              </li>

              <li>
                <h3 className="text-sm font-semibold">Deleting a node:</h3>
                <p className="text-xs text-gray-400 flex">
                  Click on a node and click on 🗑️ button to remove it.
                  <br />
                  - Deleting a node will also delete the next actions from it.
                  <br />
                  - You can't delete the Wallet node.
                  <br />
                  <br />
                  <br />
                </p>
              </li>

              <li>
                <h3 className="text-sm font-semibold">
                  Now that you know the basics, good luck and have fun creating
                  your own strategies 😁!!
                </h3>
                <br />
                <br />
              </li>
              <li>
                <Button
                  variant="outline"
                  className="w-full text-left p-2 rounded-md hover:bg-accent"
                  onClick={() => setSaveOpen(true)}
                >
                  <Save className="mr-2" />
                  Save Strategy
                </Button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/*
      Wrong Function Calling cause error
      <CreatePageSidebar onSaveClick={() => setSaveOpen(true)} />
      */}
    </div>
  );
};

export default CreateStrategyPage;
