import { Bitcoin, Wallet, TrendingUp, BarChart3, DollarSign } from "lucide-react"

export function DefiIcons() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden opacity-5">
      <div className="absolute top-20 left-20 animate-float-slow">
        <Bitcoin size={80} />
      </div>
      <div className="absolute top-40 right-40 animate-float-medium">
        <Wallet size={60} />
      </div>
      <div className="absolute bottom-40 left-40 animate-float-fast">
        <TrendingUp size={70} />
      </div>
      <div className="absolute bottom-20 right-20 animate-float-medium">
        <BarChart3 size={90} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow">
        <DollarSign size={120} />
      </div>
    </div>
  )
}
