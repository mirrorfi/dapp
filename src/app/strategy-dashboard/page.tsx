import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

const StrategyDashboardPage = () => {
  const strategies = [
    {
      id: 1,
      name: "Aggressive Yield",
      creator: "0x123...",
      risk: "High",
      apy: "50%",
    },
    {
      id: 2,
      name: "Stable Yield",
      creator: "0x456...",
      risk: "Low",
      apy: "10%",
    },
    {
      id: 3,
      name: "Balanced Strategy",
      creator: "0x789...",
      risk: "Medium",
      apy: "25%",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-6 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <img src="/SVG/MirrorFi-Logo-Blue.svg" alt="MirrorFi Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-semibold">Strategy Dashboard</h1>
        </div>
        <Link href="/create-strategy">
          <Button>Create New Strategy</Button>
        </Link>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="bg-card border-border hover:shadow-md hover:shadow-primary/20 transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{strategy.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  Created by <span className="font-medium">{strategy.creator}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{strategy.risk} Risk</Badge>
                  <span className="text-primary">APY: {strategy.apy}</span>
                </div>
                <Button variant="outline" className="w-full">
                  Copy Strategy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default StrategyDashboardPage
