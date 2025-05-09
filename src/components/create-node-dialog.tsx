"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { protocolOptions, tokenOptions, LSToptions } from "../constants/nodeOptions";
import { Node } from "reactflow"
import { TooltipArrow } from "@radix-ui/react-tooltip"
import { ComingSoonDialog } from "./coming-soon-dialog"

interface CreateNodeDialogProps {
  onCreateNode: (nodeData: {
    label: string
    description: string
    nodeType: "protocol" | "token"
    connectionCount: number
  }) => void

  selectedNode: Node | null
  isOpen: boolean
  onClose: () => void
  nodes: Node[]
}

export function CreateNodeDialog({ onCreateNode, selectedNode, isOpen, onClose, nodes }: CreateNodeDialogProps) {
  const selectedNodeType = selectedNode?.data?.nodeType
  console.log("Selected Node Type:", selectedNodeType)
  console.log("Selected Node Label:", selectedNode?.data?.label)
  const [nodeType, setNodeType] = useState<"protocol" | "token" | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Reset state when the dialog is closed
  const handleClose = () => {
    setNodeType(null)
    setSelectedOption(null)
    onClose()
  }
  const handleConfirm = () => {
    if (!nodeType || !selectedOption) return

    onCreateNode({
      label: selectedOption,
      description: nodeType === "protocol" ? `Protocol: ${selectedOption}` : `Token: ${selectedOption}`,
      nodeType,
      connectionCount: 0,
    })

    // Reset state and close dialog
    handleClose()
  }

  // Close the dialog when the user clicks outside of it
  const handleOverlayClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains("overlay")) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-border" onClick={handleOverlayClick}>
        <DialogHeader>
          <DialogTitle>Create Node</DialogTitle>
          <DialogDescription>Select the type of node you want to create.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Protocol Options */}
        {selectedNode?.data?.label != "SOL Wallet" && selectedNodeType == "token" && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Protocols</h3>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-4">
            {protocolOptions.map((protocol) => (
    protocol === "Lulo" ? (
      <TooltipProvider key={protocol}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={protocol === "Lulo" && selectedNode?.data?.label !== "USDC" ? null : "outline"}
              className={`${
                protocol === "Lulo" && selectedNode?.data?.label !== "USDC"
                  ? "opacity-25 cursor-not-allowed"
                  : ""
              } ${selectedOption === protocol ? "bg-accent text-accent-foreground" : ""}`}
              onClick={() => {
                if (protocol === selectedOption) {
                  setSelectedOption(null);
                  setNodeType(null);
                }

                if (protocol === "Lulo" && selectedNode?.data?.label !== "USDC") return;
                else {
                  setSelectedOption(protocol);
                  setNodeType("protocol");
                }
              }}
            >
              <Image
                src={`/PNG/${protocol.toLowerCase()}-logo.png`}
                alt={`${protocol} logo`}
                width={24}
                height={24}
              />
              {protocol}
            </Button>
          </TooltipTrigger>
          {protocol === "Lulo" && selectedNode?.data?.label !== "USDC" && (
            <TooltipContent>
              You need to select a USDC node first.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    ) : protocol !== "Meteora" ? (
      <ComingSoonDialog brokenAhhProtocol={protocol} />
    ) : (
      <Button
        key={protocol}
        variant={"outline"}
        className={`${
          selectedOption === protocol ? "bg-accent text-accent-foreground" : ""
        } ${selectedNode?.data?.label.toLowerCase() === protocol.toLowerCase() ? "hidden" : ""}`}
        onClick={() => {
          setSelectedOption((prev) => (prev === protocol ? null : protocol));
          setNodeType("protocol");
        }}
      >
        <Image
          src={`/PNG/${protocol.toLowerCase()}-logo.png`}
          alt={`${protocol} logo`}
          width={24}
          height={24}
        />
        {protocol}
      </Button>
    )
  ))}
</div>
            {/* Divider */}
            <div className="border-t border-border my-4"></div>
          </div>
        )}

          {/* Token Options */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">LSTs</h3>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-4">
              {LSToptions.map((token) => {

                return (
                  <Button
                    key={token}
                    variant={"outline"}
                    className={`flex items-center gap-2 p-2 justify-between ${
                      selectedOption === token ? "bg-accent text-accent-foreground" : ""
                    } ${selectedNode?.data?.label.toLowerCase() === token.toLowerCase() ? "hidden" : ""}`} 
                    onClick={() => {
                      setSelectedOption((prev) => (prev === token ? null : token));
                      setNodeType("token");
                    }}
                  >
                      <div className="flex items-center text-xs font-medium">
                    <Image
                      src={`/PNG/${token.toLowerCase()}-logo.png`}
                      alt={`${token} logo`}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                        {token}
                      </div>
                      <div className="ml-auto p-1 text-[10px] text-blue-300 outline outline-blue-400 bg-blue-950 px-2 py-1 rounded-md">7.25% APY</div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-4"></div>

          {/* Token Options */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tokens</h3>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-4">
              {tokenOptions.map((token) => (
                <Button
                  key={token}
                  variant={"outline"}
                  className={` ${selectedOption === token ? "bg-accent text-accent-foreground" : "" } ${selectedNode?.data?.label.toLowerCase() === token.toLowerCase() ? "hidden" : ""}`}
                  onClick={() => {
                    setSelectedOption((prev) => (prev === token ? null : token));
                    setNodeType("token");
                  }}
                >
                  <div className="flex items-center gap-2">
                  <Image src={`/PNG/${token.toLowerCase()}-logo.png`} alt={`${token} logo`} width={24} height={24} />{token}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
        {selectedOption && (
          <DialogFooter>
            <Button onClick={handleConfirm} variant={"outline"}>Confirm</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
