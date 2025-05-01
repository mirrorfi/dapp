

import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import  Image  from "next/image";
import { MoreHorizontal } from "lucide-react"
import { connect } from "http2";
import { connectToDatabase } from "@/lib/database";
import { get } from "http";
import { getStrategies } from "@/lib/database/db_actions/test-actions";
const StrategyDashboardPage = () => {
  connectToDatabase()

  // Fetch strategies from the database
  const fetchStrategies = async () => {
    const response = await getStrategies()
    console.log("Fetched Strategies:", response)
    return response
  }

  const strategies = fetchStrategies()
  console.log("Strategies:", strategies)

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-6 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/SVG/MirrorFi-Logo-Blue.svg" alt="MirrorFi Logo" width={32} height={32} className="h-8 w-auto" />
            <h1 className="text-xl font-semibold">Strategy Dashboard</h1>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="/create-strategy?nodeList=[]&edgeList=[]" className="text-sm font-medium text-foreground hover:text-primary">
                  Create Strategy
                </NavigationMenuLink>
              </NavigationMenuItem>
              {/* Add more NavigationMenuItems here if needed */}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        </div>
      </main>
    </div>
  )
}

export default StrategyDashboardPage
