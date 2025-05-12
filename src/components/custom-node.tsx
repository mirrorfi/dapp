import { Handle, Position, type NodeProps } from "reactflow"
import Image from "next/image"
import { Wallet } from "lucide-react"
import { APYVals } from "@/lib/plugin/sanctum/tools/apyVals"
import { useState, useEffect } from "react"
import { LSTMintAddresses } from "@/constants/nodeOptions"

export type NodeData = {
  label: string
  description?: string
  nodeType?: "protocol" | "token" | "lst"
  percentage?: string
  connectionCount: number
}

export function CustomNode({ data, isConnectable }: NodeProps<NodeData>) {
  const nodeClass = `custom-node node`

    // State to store APY values
    const [apyValues, setApyValues] = useState<Record<string, number>>({});
  
    // Fetch APY values when the component mounts
    useEffect(() => {
      const fetchAPYValues = async () => {
        try {
          const values = await APYVals();
          setApyValues(values);
        } catch (error) {
          console.error("Failed to fetch APY values:", error);
        }
      };
      fetchAPYValues();
    }
    , []);

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
      {data.nodeType === "lst" && (
        <div className="custom-node-content text-green-300 ml-4">
          {apyValues[data.label] ? Math.round((apyValues[data.label])*10000)/100 : "N/A"}% APY
        </div>
      )}
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      {/* Render handle only if label of node isn't "SOL Wallet" */}
      {data.label !== "Wallet" && (
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      )}
    </div>
  )
}