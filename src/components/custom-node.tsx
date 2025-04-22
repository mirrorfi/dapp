import { Handle, Position, type NodeProps } from "reactflow"

type NodeData = {
  label: string
  description?: string
  nodeType?: "deposit" | "stake" | "swap" | "apr" | "yield"
  percentage?: string
}

export function CustomNode({ data, isConnectable }: NodeProps<NodeData>) {
  const nodeClass = `custom-node node-${data.nodeType || "default"}`

  return (
    <div className={nodeClass}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div className="custom-node-header">{data.label}</div>
      {data.description && <div className="custom-node-content">{data.description}</div>}
      {data.percentage && <div className="custom-node-content">{data.percentage}</div>}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  )
}
