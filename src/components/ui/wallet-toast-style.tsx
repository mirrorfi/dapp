import { Check, Loader2, X } from "lucide-react"

export function WaitingSignStyle() {
  return {
    title: "Waiting For Wallet To Sign Transaction",
    description: (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-blue-500">Pending wallet to sign</span>
      </div>
    ),
    variant: "wallet",
    className: "bg-[#0D0D12] border border-[#1E2130] text-white rounded-lg shadow-lg",
    duration: 10000,
  }
}

export function WaitingTrasactionStyle() {
  return {
    title: "Waiting For Transaction Confirmation",
    description: (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-blue-500">Pending transaction confirmation</span>
      </div>
    ),
    variant: "wallet",
    className: "bg-[#0D0D12] border border-[#1E2130] text-white rounded-lg shadow-lg",
    duration: 60000,
  }
}

export function SuccessStyle(txnHash: string) {
  return {
    title: "Transaction Successful",
    description: (
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4 text-green-500" />
        <span>
          <a
            href={`https://solscan.io/tx/${txnHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 hover:underline transition-colors"
          >
            View on Solscan
          </a>
        </span>
      </div>
    ),
    variant: "wallet-success",
    className: "bg-[#0D0D12] border border-[#1E2130] text-white rounded-lg shadow-lg",
    duration: 10000,
  }
}

export function TransactionFailedStyle(error: string) {
  return {
    title: "Transaction Failed",
    description: (
      <div className="flex items-center gap-2">
        <X className="h-4 w-4 text-red-500" />
        <span className="text-red-500">{error}</span>
      </div>
    ),
    variant: "wallet-error",
    className: "bg-[#0D0D12] border border-[#1E2130] text-white rounded-lg shadow-lg",
    duration: 10000,
  }
}
