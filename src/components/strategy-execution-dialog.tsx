"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface StrategyExecutionDialogProps {
  strategyName: string
}

export function StrategyExecutionDialog({ strategyName }: StrategyExecutionDialogProps) {
  const [amount, setAmount] = useState("")

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="lg" className="px-8">
          Execute Strategy
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-border flex flex-col items-center justify-center">
        <AlertDialogHeader>
          <AlertDialogTitle>Execute {strategyName}</AlertDialogTitle>
          <AlertDialogDescription>Enter the amount you want to allocate to this strategy.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              onClick={() => setAmount("")}
              placeholder="Enter amount"
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3 bg-muted"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
          <AlertDialogAction>Execute</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
