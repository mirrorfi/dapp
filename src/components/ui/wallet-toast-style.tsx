import { Check, Loader2, X } from "lucide-react";

export function WaitingSignStyle() {
  return {
    title: "Waiting For Wallet To Sign Transaction",
    description: (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-blue-400">Pending wallet to sign</span>
      </div>
    ),
    variant: "wallet",
    className: "bg-[#121212] border-[#1e1e1e] text-white",
    duration: 10000, // Make the toast stay for 10 seconds
  };
}

export function WaitingTrasactionStyle() {
  return {
    title: "Waiting For Transaction Confirmation",
    description: (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-blue-400">Pending transaction confirmation</span>
      </div>
    ),
    variant: "wallet",
    className: "bg-[#121212] border-[#1e1e1e] text-white",
    duration: 60000, // Make the toast stay for 10 seconds
  };
}

export function SuccessStyle(txnHash: string) {
  return {
    title: "Transaction Successful",
    description: (
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-green-400" />
        <span className="text-green-400">
          <a
            href={`https://solscan.io/tx/${txnHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View on Solscan
          </a>
        </span>
      </div>
    ),
    variant: "wallet-success",
    className: "bg-[#121212] border-[#1e1e1e] text-white",
    duration: 10000, // Make the toast stay for 10 seconds
  };
}

export function TransactionFailedStyle(error: string) {
  return {
    title: "Transaction Failed",
    description: (
      <div className="flex items-center gap-2">
        <X className="h-4 w-4 text-red-400" />
        <span className="text-red-400">{error}</span>
      </div>
    ),
    variant: "wallet-error",
    className: "bg-[#121212] border-[#1e1e1e] text-white",
  };
}
