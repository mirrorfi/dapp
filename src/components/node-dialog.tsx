"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Node } from "reactflow"

interface NodeModalProps {
  node: Node | null
  isOpen: boolean
  onClose: () => void
  onCreateHook: () => void
}

export function NodeModal({ node, isOpen, onClose, onCreateHook }: NodeModalProps) {
  if (!node) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" text-gray-200 sm:max-w-md sm:rounded-lg">
        <div className="">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-semibold text-white">Node Details</DialogTitle>
            <DialogDescription className="text-gray-400">View and manage details for this node.</DialogDescription>
          </DialogHeader>

          <DialogDescription className="mb-4">
            <div className="items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">Node Description</h2>
              <h1>random description thingy</h1>
            </div>
          </DialogDescription>

          <DialogFooter className="mt-8 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className=" bg-[#0a0b14] text-gray-300 hover:bg-[#1a1b29] hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button onClick={onCreateHook} variant={"outline"} className="">
              Create New Node
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
