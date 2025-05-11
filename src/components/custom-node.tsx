import { Handle, Position, type NodeProps } from "reactflow"
import Image from "next/image"
import { Wallet } from "lucide-react"

export type NodeData = {
  label: string
  description?: string
  nodeType?: "protocol" | "token"
  percentage?: string
  connectionCount: number
}

export function CustomNode({ data, isConnectable }: NodeProps<NodeData>) {
  const nodeClass = `custom-node node`

  return (
    <div className={nodeClass}>
      <div className="custom-node-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {data.label != "Wallet" ? (<Image
        src={`/PNG/${data.label.toLowerCase()}-logo.png`}
        alt={`${data.label} logo`}
        width={24}
        height={24}
      />) : (
        <Wallet/>)}
      {data.label}
      </div>
      {data.description && <div className="custom-node-content">{data.description}</div>}
      {data.percentage && <div className="custom-node-content">{data.percentage}</div>}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      {/* Render handle only if label of node isn't "SOL Wallet" */}
      {data.label !== "Wallet" && (
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      )}
    </div>
  )
}