"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type NodeType = "deposit" | "stake" | "swap" | "apr" | "yield"

interface CreateNodeDialogProps {
  onCreateNode: (nodeData: {
    label: string
    description: string
    nodeType: NodeType
    percentage?: string
  }) => void

  isOpen: boolean
  onClose: () => void
}

export function CreateNodeDialog({ onCreateNode, isOpen, onClose }: CreateNodeDialogProps ) {
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [nodeType, setNodeType] = useState<NodeType>("stake")
  const [percentage, setPercentage] = useState("")

  const handleSubmit = () => {
    if (!label) return

    onCreateNode({
      label,
      description,
      nodeType,
      percentage: percentage ? `${percentage}% of funds` : undefined,
    })

    // Reset form
    setLabel("")
    setDescription("")
    setNodeType("stake")
    setPercentage("")
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-border">
        <DialogHeader>
          <DialogTitle>Create Protocol Node</DialogTitle>
          <DialogDescription>Create a custom protocol node for your yield strategy.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="col-span-3 bg-muted z-10"
              placeholder="e.g. Jupiter Swap"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 bg-muted z-10"
              placeholder="e.g. Swap tokens"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={nodeType} onValueChange={(value) => setNodeType(value as NodeType)}>
              <SelectTrigger className="col-span-3 bg-muted z-10">
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="stake">Stake</SelectItem>
                <SelectItem value="swap">Swap</SelectItem>
                <SelectItem value="apr">APR Check</SelectItem>
                <SelectItem value="yield">Yield Distribution</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percentage" className="text-right">
              Percentage
            </Label>
            <Input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="col-span-3 bg-muted"
              placeholder="e.g. 40"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Create Node</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
