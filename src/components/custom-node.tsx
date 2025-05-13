import { Handle, Position, type NodeProps } from "reactflow"
import Image from "next/image"
import { Wallet } from "lucide-react"
import { APYVals } from "@/lib/plugin/sanctum/tools/apyVals"
import { useState, useEffect } from "react"
import { allAddresses, LSTLogos, tokenLogos } from "@/constants/nodeOptions"
import { getMeteoraPoolAPY } from "@/lib/meteora"

export type NodeData = {
  label: string
  description?: string
  nodeType?: "protocol" | "token" | "lst"
  percentage?: string
  connectionCount: number
  parentLabels?: string[]
}

export function CustomNode({ data, isConnectable }: NodeProps<NodeData>) {
  const nodeClass = `custom-node node`

    // State to store APY values
    const [apyValues, setApyValues] = useState<Record<string, number>>({});
    const [meteoraAPY, setMeteoraAPY] = useState<number | null>(null);
  
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

      if (data.nodeType === "lst") {
        fetchAPYValues();
      }


      const fetchMeteoraAPY = async () => {
        try {
          console.log("Data:", data);
          // Anas pls modify your node processing somehow to also pass in the parent addresses, order doesnt matter
          if (data.parentLabels?.length !== 2) {
            console.error("Meteora node must have exactly 2 parent labels");
            return;
          } 
          const tokenX_label = data.parentLabels[0];
          const tokenX_address = allAddresses[tokenX_label];  
          const tokenY_label = data.parentLabels[1];
          const tokenY_address = allAddresses[tokenY_label];  

          console.log("Token X Address:", tokenX_address);
          console.log("Token Y Address:", tokenY_address);
          const apy = await getMeteoraPoolAPY(tokenX_address, tokenY_address);

          setMeteoraAPY(apy);
          console.log("Meteora APY:", apy);
        } catch (error) {
          console.error("Failed to fetch meteora APY values:", error);
        }
      };

      if (data.label.toLowerCase() === "meteora") {
        fetchMeteoraAPY();
      }

    }, []);

  return (
    <div className={nodeClass}>
      <div className="custom-node-header" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {data.label != "Wallet" ? (<Image
        src={
          data.nodeType === "lst"
            ? LSTLogos[data.label]
            : data.nodeType === "token"
            ? tokenLogos[data.label]
            : `/PNG/${data.label.toLowerCase()}-logo.png`
        }        alt={`${data.label} logo`}
        width={24}
        height={24}
      />) : (
        <Wallet/>)}
      {data.label}
      {(data.nodeType === "lst" || data.label.toLowerCase() === "meteora") && (
        (data.nodeType === "lst") ? (
          <div className="custom-node-content text-green-300 ml-4">
            {apyValues[data.label] ? Math.round((apyValues[data.label])*10000)/100 : "N/A"}% APY
          </div>
        ) : (
          <div className="custom-node-content text-green-300 ml-4">
            {meteoraAPY ? Math.round(meteoraAPY*100)/100 : 0}% APY
          </div>
        )
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