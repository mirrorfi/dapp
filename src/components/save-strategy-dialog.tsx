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
import { nodeSamples } from "@/lib/txnUtils/treeUtils"
import { notEqual } from "assert"

interface StrategyProps {
    nodeList: Node[]
    edgeList: Edge[]
    userAddress: string

    isOpen: boolean
    onClose: () => void
}


export function SaveStrategyDialog({ nodeList, edgeList, userAddress, isOpen, onClose}: StrategyProps) {
    const [strategyName, setStrategyName] = useState("")
    const [description, setDescription] = useState("")

    const handleClose = () => {
        onClose()
    }

    const handleSave = () => {
        if (!strategyName) {
            alert("Please enter a strategy name")
            return
        }
        if (!description) {
            alert("Please enter a description")
            return
        }
            // Save the strategy to the database or perform any other action
            console.log("Saving strategy:", strategyName, nodeList, edgeList)
            connectToDatabase()

            const sanitizedNodes = nodeList.map((node) => ({
                ...node,
                data: {
                ...node.data,
                description: localStorage.getItem(`node-desc-${node.id}`) || "Description", // look into user's local storage for description
                },
            }));

            const categories:string[] = [];
            let isMeteora = false;
            let isLST = false;
            sanitizedNodes.forEach((node) => {
                console.log(node);
                if (node.data.label === "Meteora"){
                    isMeteora = true;
                }
                if (node.data.nodeType === "lst"){
                    isLST = true;
                }
            });
            if(isMeteora){categories.push("DLMM");}
            if(isLST){categories.push("LST");}
            console.log("Categories:", categories);

            const strategy = {
            nodes: sanitizedNodes,
            edges: edgeList,
            name: strategyName,
            user: userAddress, // Use the user address passed as a prop
            description: description, // Use the description from the input field
            categories: categories,
            };
            console.log("Strategy object:", strategy);

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
            <DialogDescription>
                <p className="text-sm text-gray-500">Enter a name for your strategy:</p>
            </DialogDescription>
            <DialogDescription className="mb-4">
                <Input
                    type="text"
                    placeholder="Enter strategy name"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    onChange={(e) => setStrategyName(e.target.value)}
                    value={strategyName}
                />
            </DialogDescription>

            <DialogDescription>
                <p className="text-sm text-gray-500">Enter a description for your strategy:</p>
            </DialogDescription>
            <DialogDescription className="mb-4">
                <Input
                    type="text"
                    placeholder="Enter description"
                    className="border border-gray-300 rounded-md p-2 w-full"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                />
            </DialogDescription>
            <DialogFooter>
            <DialogDescription className="">
                <p className="text-sm text-gray-500">This strategy will be saved to your account.</p>
            </DialogDescription>
                <Button onClick={handleSave} variant={"outline"}>Confirm</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}
