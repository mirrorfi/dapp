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
import { PlusCircle, Trash2, Wallet } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import type { Node } from "reactflow"

interface NodeModalProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateHook: () => void;
  onDeleteNode: (nodeId: string) => void; // Add a prop for deleting the node
}

export function NodeModal({
  node,
  isOpen,
  onClose,
  onCreateHook,
  onDeleteNode,
}: NodeModalProps) {
  const [desc, setDesc] = useState<string>("");

  // Load the description from localStorage when the dialog opens
  useEffect(() => {
    if (isOpen && node) {
      const savedDescription = localStorage.getItem(`node-desc-${node.id}`);
      if (savedDescription) {
        setDesc(savedDescription);
      }
    }
  }, [isOpen, node]);

  // Save the description to localStorage when the dialog closes
  const handleClose = () => {
    if (node) {
      localStorage.setItem(`node-desc-${node.id}`, desc);
    }
    setDesc("");
    onClose();
  };

  const handleDelete = () => {
    if (node) {
      localStorage.removeItem(`node-desc-${node.id}`); // Remove the description from localStorage
      onDeleteNode(node.id); // Call the delete function passed from the parent
      onClose(); // Close the dialog
    }
  };

  const handleCreate = () => {
    if (node) {
      localStorage.setItem(`node-desc-${node.id}`, desc);
    }
    setDesc("");
    onCreateHook();
  };

  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=" text-gray-200 sm:max-w-md sm:rounded-lg">
        <div className="">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl flex items-center font-semibold text-white">
              {node.data.label === "Wallet" ? (
                <Wallet className="mr-2" />
              ) : (
                <Image
                  src={`/PNG/${node.data.label.toLowerCase()}-logo.png`}
                  alt={`${node.data.label} logo`}
                  className="mr-2"
                  width={24}
                  height={24}
                />
              )}{" "}
              {node.data.label} Node
            </DialogTitle>
          </DialogHeader>

          {/* Divider */}
          <div className="border-t border-zinc-500 my-4"></div>

          <DialogDescription className="mb-4">
            <div className="items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">
                Node Description
              </h2>
              {/* Input from the user */}
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="mt-2 w-full rounded-md border-gray-600 bg-gray-800 p-2 text-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-500"
                placeholder="Enter node description"
              />
            </div>
          </DialogDescription>

          <DialogFooter className="mt-8 flex gap-3">
            {node.data?.label !== "Wallet" ? (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 />
              </Button>
            ) : null}
            {node.data?.nodeType !== "protocol" ? (
              <Button onClick={handleCreate} variant={"outline"} className="">
                <PlusCircle />
              </Button>
            ) : null}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
