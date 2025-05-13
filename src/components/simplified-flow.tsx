"use client";

import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";
import { useEffect, useState } from "react";

interface SimplifiedFlowProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

export default function SimplifiedFlow({
  nodes,
  edges,
  className = "",
}: SimplifiedFlowProps) {
  const nodeTypes = {
    customNode: CustomNode,
  };
    const [updatedNodes, setUpdatedNodes] = useState<Node[]>([]);
  
    useEffect(() => {
      console.log("Giving parents");
      // Update the nodes in the strategy with their parent labels
      const nodesWithParents = nodes.map((node) => {
      if (node.data.label === "Meteora") {
        const parentLabels = edges
        .filter((edge) => edge.target === node.id)
        .map((edge) => {
          const parentNode = nodes.find(
          (n) => n.id === edge.source
          );
          return parentNode ? parentNode.data.label : null;
        })
        .filter((label): label is string => label !== null);
        return {
        ...node,
        data: {
          ...node.data,
          parentLabels,
        },
        };
      }
      return node;
      });
      setUpdatedNodes(nodesWithParents);
    }, []);
  return (
    <ReactFlowProvider>
      <div className={`${className} absolute inset-0 pointer-events-none`}>
        <ReactFlow
          nodes={updatedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </ReactFlowProvider>
  );
}
