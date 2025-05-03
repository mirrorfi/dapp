"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import { connectToDatabase } from "@/lib/database"
import { createStrategy } from "@/lib/database/db_actions/test-actions"
import { Edge, Node } from "reactflow"

interface StrategyProps {
    nodeList: Node[]
    edgeList: Edge[]

    isOpen: boolean
    onClose: () => void
}


export function SaveStrategyDialog({ nodeList, edgeList, isOpen, onClose}: StrategyProps) {
    const [strategyName, setStrategyName] = useState("")

    const handleClose = () => {
        onClose()
    }

    const handleSave = () => {
            // Save the strategy to the database or perform any other action
            console.log("Saving strategy:", strategyName, nodeList, edgeList)
            connectToDatabase()

            const sanitizedNodes = nodeList.map((node) => ({
                ...node,
                data: {
                ...node.data,
                description: node.data.description || "Description", // Provide a default value for description
                },
            }));

            const strategy = {
            nodes: sanitizedNodes,
            edges: edgeList,
            name: strategyName,

            };

            createStrategy(strategy)
            .then((response) => {
                console.log("Strategy saved successfully:", response);
                // Optionally, redirect or show a success message
                window.location.href = "/strategy-dashboard"; // Redirect to the strategy dashboard
            })
            .catch((error) => {
                console.error("Error saving strategy:", error);
            });

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
            <DialogTitle>Save Strategy</DialogTitle>
            </DialogHeader>

            {/* Add input field to ask user for name of the strategy */}
            <DialogDescription className="py-4">
                <Input
                    type="text"
                    placeholder="Enter strategy name"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    onChange={(e) => setStrategyName(e.target.value)}
                    value={strategyName}
                />
            </DialogDescription>

            <DialogFooter>
                <Button onClick={handleSave} variant={"outline"}>Confirm</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
