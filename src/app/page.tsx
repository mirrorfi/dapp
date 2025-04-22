import { Button } from "@/components/ui/button"
import { StrategyExecutionDialog } from "@/components/strategy-execution-dialog"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-foreground">
      <div className="max-w-3xl w-full text-center space-y-12">
        {/* Logo */}
        <img
          src="/SVG/MirrorFi-Logo-Blue.svg"
          alt="MirrorFi Logo"
          className="h-20 w-auto mx-auto animate-pulse"
        />

        {/* Title */}
        <h1 className="text-7xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
          MirrorFi
        </h1>

        {/* Subtitle */}
        <p className="text-2xl text-center text-gray-400 tracking-wide">
          Start earning yields on Solana in one click
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center space-x-6">
          <Link href="/create-strategy">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 hover:shadow-purple-600/50 hover:scale-105 transition-transform duration-300"
            >
              Create Strategy
            </Button>
          </Link>
          <Link href="/strategy-dashboard">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105 transition-transform duration-300"
            >
              Explore Strategies
            </Button>
          </Link>
          <StrategyExecutionDialog strategyName="Aggressive Yield" />
        </div>

        {/* Futuristic Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        </div>
      </div>
    </main>
  )
}