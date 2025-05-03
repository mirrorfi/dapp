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

interface CreateNodeDialogProps {
  onCreateNode: (nodeData: {
    label: string
    description: string
    nodeType: "protocol" | "token"
    connectionCount: number
  }) => void

  isOpen: boolean
  onClose: () => void
}

const protocolOptions = ["Raydium", "Orca", "Kamino", "Drift"]
const tokenOptions = [
  "SOL",
  "JupSOL",
  "JitoSOL",
  "BNSOL",
  "mSOL",
  "bbSOL",
  "USDC",
  "USDT",
  "PYUSD",
  "FDUSD",
  "USDS",
]

export function CreateNodeDialog({ onCreateNode, isOpen, onClose }: CreateNodeDialogProps) {
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
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Protocols</h3>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-4">
              {protocolOptions.map((protocol) => (
                <Button
                  key={protocol}
                  variant={selectedOption === protocol ? "default" : "outline"}
                  onClick={() => {
                    setSelectedOption(protocol);
                    setNodeType("protocol");
                  }}
                >
                    <Image src={`/PNG/${protocol.toLowerCase()}-logo.png`} alt={`${protocol} logo`} width={24} height={24} />{protocol}
                </Button>
              ))}
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
                  className={selectedOption === token ? "bg-accent text-accent-foreground" : ""}
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
