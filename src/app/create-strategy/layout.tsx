"use client";
import { ReactFlowProvider } from "reactflow";

export default function CreateStrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactFlowProvider>
      {children}
    </ReactFlowProvider>
  );
}