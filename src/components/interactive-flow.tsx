"use client";

import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";

interface InteractiveFlowProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

export default function InteractiveFlow({
  nodes,
  edges,
  className = "",
}: InteractiveFlowProps) {
  const nodeTypes = {
    customNode: CustomNode,
  };

  return (
    <ReactFlowProvider>
      <div className={`${className} absolute inset-0`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </ReactFlowProvider>
  );
}
