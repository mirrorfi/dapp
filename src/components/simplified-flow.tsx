"use client";

import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";

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

  return (
    <ReactFlowProvider>
      <div
        className={`${className} absolute inset-0 opacity-20 pointer-events-none`}
      >
        <ReactFlow
          nodes={nodes}
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
